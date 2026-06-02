import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const returnKeys = {
  all:   ['returns'] as const,
  stats: ['returns', 'stats'] as const,
  list:  (f?: Record<string, unknown>) => ['returns', 'list', f] as const,
};

export function useReturnStats() {
  return useQuery({
    queryKey: returnKeys.stats,
    queryFn: async () => { const { data } = await api.get('/returns/stats'); return data; },
  });
}

export function useReturns(supplierId?: string, status?: string) {
  return useQuery({
    queryKey: returnKeys.list({ supplierId, status }),
    queryFn: async () => {
      const { data } = await api.get('/returns', { params: { supplierId, status } });
      return data;
    },
  });
}

export function useCreateReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { supplierId: string } & Record<string, unknown>) => {
      const { supplierId, ...body } = payload;
      return api.post(`/returns/supplier/${supplierId}`, body).then(r => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: returnKeys.all }),
  });
}

export function useUpdateReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      api.patch(`/returns/${id}`, payload).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: returnKeys.all }),
  });
}

export function useDeleteReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/returns/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: returnKeys.all }),
  });
}
