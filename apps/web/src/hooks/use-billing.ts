import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Subscription } from '@/types';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  maxUsers: number | null;
  features: string[];
}

export const billingKeys = {
  plans: ['billing', 'plans'] as const,
  subscription: ['billing', 'subscription'] as const,
};

export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: billingKeys.plans,
    queryFn: async () => {
      const { data } = await api.get('/billing/plans');
      return data;
    },
    staleTime: Infinity,
  });
}

export function useBillingSubscription() {
  return useQuery<Subscription>({
    queryKey: billingKeys.subscription,
    queryFn: async () => {
      const { data } = await api.get('/billing/subscription');
      return data;
    },
  });
}

export function useSubscribe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan: string) => {
      const { data } = await api.post('/billing/subscribe', { plan });
      return data as { initPoint: string; preapprovalId: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.subscription }),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/billing/cancel'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: billingKeys.subscription });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
