import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Sale } from '@/types';

export const saleKeys = {
  all: ['sales'] as const,
  list: (filters?: Record<string, unknown>) => [...saleKeys.all, 'list', filters] as const,
};

export function useSales(from?: string, to?: string) {
  return useQuery<Sale[]>({
    queryKey: saleKeys.list({ from, to }),
    queryFn: async () => {
      const { data } = await api.get('/sales', { params: { from, to } });
      return data;
    },
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => api.post('/sales', payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: saleKeys.all });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useVoidSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/sales/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: saleKeys.all });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
