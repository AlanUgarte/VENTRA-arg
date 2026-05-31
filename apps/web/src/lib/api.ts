import axios, { type InternalAxiosRequestConfig } from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const api = axios.create({ baseURL: BASE, withCredentials: false });

// ── Request: attach access token ──────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('almacen-auth');
    if (raw) {
      try {
        const { state } = JSON.parse(raw);
        if (state?.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
      } catch {}
    }
  }
  return config;
});

// ── Response: silent refresh on 401 ───────────────────────────────────
let refreshing = false;
let queue: { resolve: (t: string) => void; reject: (e: unknown) => void }[] = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (refreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    refreshing = true;
    try {
      const raw = localStorage.getItem('almacen-auth');
      const { state } = JSON.parse(raw ?? '{}');
      const { data } = await axios.post(`${BASE}/auth/refresh`, {
        refreshToken: state?.refreshToken,
      });

      // Update zustand persisted state
      const newRaw = localStorage.getItem('almacen-auth');
      if (newRaw) {
        const obj = JSON.parse(newRaw);
        obj.state.accessToken = data.accessToken;
        obj.state.refreshToken = data.refreshToken;
        localStorage.setItem('almacen-auth', JSON.stringify(obj));
      }

      queue.forEach((p) => p.resolve(data.accessToken));
      queue = [];
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (e) {
      queue.forEach((p) => p.reject(e));
      queue = [];
      localStorage.removeItem('almacen-auth');
      window.location.href = '/login';
      return Promise.reject(e);
    } finally {
      refreshing = false;
    }
  },
);

export default api;
