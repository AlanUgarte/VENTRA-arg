import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Customer } from '@/types';

export const customerKeys = {
  all: ['customers'] as const,
  list: (search?: string) => [...customerKeys.all, 'list', search] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
};

export function useCustomers(search?: string) {
  return useQuery<Customer[]>({
    queryKey: customerKeys.list(search),
    queryFn: async () => {
      const { data } = await api.get('/customers', { params: { search } });
      return data;
    },
  });
}

export function useCustomer(id: string) {
  return useQuery<Customer>({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/customers/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; phone?: string }) =>
      api.post('/customers', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.all }),
  });
}

export function useCreateCredit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      api.post(`/customers/${id}/credits`, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.all }),
  });
}

export function useCreateCustomerPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: string; amount: number; method: string; reference?: string }) =>
      api.post(`/customers/${id}/payments`, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.all }),
  });
}
