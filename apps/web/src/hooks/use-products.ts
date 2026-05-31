import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Product, Rubro } from '@/types';

export const productKeys = {
  all: ['products'] as const,
  list: (filters?: Record<string, unknown>) => [...productKeys.all, 'list', filters] as const,
  rubros: ['rubros'] as const,
};

export function useProducts(rubroId?: string, all = false) {
  return useQuery<Product[]>({
    queryKey: productKeys.list({ rubroId, all }),
    queryFn: async () => {
      const { data } = await api.get('/products', {
        params: { ...(rubroId && { rubroId }), ...(all && { all: true }) },
      });
      return data;
    },
  });
}

export function useRubros() {
  return useQuery<Rubro[]>({
    queryKey: productKeys.rubros,
    queryFn: async () => {
      const { data } = await api.get('/products/rubros');
      return data;
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => api.post('/products', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.patch(`/products/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useAddStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      api.patch(`/products/${id}/stock`, { quantity }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useCreateRubro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; color?: string }) =>
      api.post('/products/rubros', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.rubros }),
  });
}
