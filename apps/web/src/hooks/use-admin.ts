import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const adminKeys = {
  stats: ['admin', 'stats'] as const,
  tenants: (filters?: Record<string, unknown>) => ['admin', 'tenants', filters] as const,
  tenant: (id: string) => ['admin', 'tenant', id] as const,
  planStats: ['admin', 'plans'] as const,
  revenue: ['admin', 'revenue'] as const,
  activity: ['admin', 'activity'] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data;
    },
    refetchInterval: 30_000,
  });
}

export function useAdminTenants(search?: string, status?: string, page = 1) {
  return useQuery({
    queryKey: adminKeys.tenants({ search, status, page }),
    queryFn: async () => {
      const { data } = await api.get('/admin/tenants', {
        params: { search, status, page, pageSize: 20 },
      });
      return data;
    },
  });
}

export function useAdminTenant(id: string) {
  return useQuery({
    queryKey: adminKeys.tenant(id),
    queryFn: async () => {
      const { data } = await api.get(`/admin/tenants/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useAdminPlanStats() {
  return useQuery({
    queryKey: adminKeys.planStats,
    queryFn: async () => {
      const { data } = await api.get('/admin/plans/stats');
      return data;
    },
  });
}

export function useAdminRevenue() {
  return useQuery({
    queryKey: adminKeys.revenue,
    queryFn: async () => {
      const { data } = await api.get('/admin/revenue/timeline');
      return data;
    },
  });
}

export function useAdminActivity() {
  return useQuery({
    queryKey: adminKeys.activity,
    queryFn: async () => {
      const { data } = await api.get('/admin/activity');
      return data;
    },
    refetchInterval: 60_000,
  });
}

export function useSetTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, plan, reason }: { id: string; status: string; plan?: string; reason?: string }) =>
      api.patch(`/admin/tenants/${id}/status`, { status, plan, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useBlockTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, block }: { id: string; block: boolean }) =>
      api.patch(`/admin/tenants/${id}/${block ? 'block' : 'unblock'}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  });
}

export function useDeleteTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/tenants/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  });
}
