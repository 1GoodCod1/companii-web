import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';

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
  return useMutation({
    mutationFn: (customerId: string) =>
      apiFetch<PortalInviteResponse>(`/companies/members/customers/${customerId}/portal-invite`, {
        method: 'POST',
        body: JSON.stringify({}),
      }),
  });
}

export function buildPortalInviteUrl(token: string): string {
  if (typeof window === 'undefined') return `/portal/invite?token=${encodeURIComponent(token)}`;
  return `${window.location.origin}/portal/invite?token=${encodeURIComponent(token)}`;
}
