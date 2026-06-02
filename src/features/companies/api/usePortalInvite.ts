import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/queryKeys';

export interface PortalInviteResponse {
  id: string;
  token: string;
  expiresAt: string;
  customer: {
    fullName: string;
    phone: string;
    email: string | null;
    company: { name: string };
  };
}

export function useCreatePortalInviteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (customerId: string) =>
      apiFetch<PortalInviteResponse>(`/companies/members/customers/${customerId}/portal-invite`, {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    onSuccess: (_data, customerId) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customer(customerId) });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customerTimeline(customerId) });
    },
  });
}

export function buildPortalInviteUrl(token: string): string {
  if (typeof window === 'undefined') return `/portal/invite?token=${encodeURIComponent(token)}`;
  return `${window.location.origin}/portal/invite?token=${encodeURIComponent(token)}`;
}
