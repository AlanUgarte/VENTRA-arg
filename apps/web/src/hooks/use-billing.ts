import { useQuery } from '@tanstack/react-query';
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
      return (data as Plan[]).filter((p) => p.id === 'BASIC' || p.id === 'PRO');
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
