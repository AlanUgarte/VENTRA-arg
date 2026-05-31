import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Supplier, SupplierInvoice } from '@/types';

export const supplierKeys = {
  all: ['suppliers'] as const,
  invoices: ['invoices'] as const,
};

export function useSuppliers() {
  return useQuery<Supplier[]>({
    queryKey: supplierKeys.all,
    queryFn: async () => {
      const { data } = await api.get('/suppliers');
      return data;
    },
  });
}

export function useInvoices(supplierId?: string) {
  return useQuery<SupplierInvoice[]>({
    queryKey: [...supplierKeys.invoices, supplierId],
    queryFn: async () => {
      const { data } = await api.get('/suppliers/invoices', {
        params: { supplierId },
      });
      return data;
    },
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) =>
      api.post('/suppliers', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: supplierKeys.all }),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ supplierId, ...payload }: { supplierId: string } & Record<string, unknown>) =>
      api.post(`/suppliers/${supplierId}/invoices`, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: supplierKeys.invoices }),
  });
}

export function useCreateSupplierPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      invoiceId,
      ...payload
    }: { invoiceId: string } & Record<string, unknown>) =>
      api.post(`/suppliers/invoices/${invoiceId}/payments`, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: supplierKeys.invoices }),
  });
}
