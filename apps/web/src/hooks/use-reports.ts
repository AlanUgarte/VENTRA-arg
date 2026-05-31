import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ReportOverview } from '@/types';

export function useReportOverview(from?: string, to?: string) {
  return useQuery<ReportOverview>({
    queryKey: ['reports', 'overview', from, to],
    queryFn: async () => {
      const { data } = await api.get('/reports/overview', { params: { from, to } });
      return data;
    },
  });
}

export function useProductRotation(from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', 'products', from, to],
    queryFn: async () => {
      const { data } = await api.get('/reports/products', { params: { from, to } });
      return data;
    },
  });
}

export function useRubroBreakdown(from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', 'rubros', from, to],
    queryFn: async () => {
      const { data } = await api.get('/reports/rubros', { params: { from, to } });
      return data;
    },
  });
}

export function useSaleHistory(page = 1, from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', 'sales', page, from, to],
    queryFn: async () => {
      const { data } = await api.get('/reports/sales', { params: { page, from, to } });
      return data;
    },
  });
}
