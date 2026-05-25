import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import type { CustomerDto, QuoteDto, InvoiceDto } from '@/features/fsm/types';
import type { EstimateProjectListDto, EstimateProjectDto } from '@/features/estimates/types';
import type { CompanyReviewDto, PortalInterventionDto } from '@/features/reviews/types';

export interface PortalDashboardDto {
  customer: CustomerDto;
  interventions: PortalInterventionDto[];
  quotes: QuoteDto[];
  invoices: InvoiceDto[];
  reviews: CompanyReviewDto[];
  estimates: EstimateProjectListDto[];
}

export function usePortalDashboardQuery(): UseQueryResult<PortalDashboardDto, Error> {
  return useQuery<PortalDashboardDto, Error>({
    queryKey: queryKeys.portal.dashboard,
    queryFn: () => apiFetch<PortalDashboardDto>('/portal/dashboard'),
    ...cabinetQueryDefaults,
  });
}

export function usePortalEstimateQuery(id: string, enabled = true): UseQueryResult<EstimateProjectDto, Error> {
  return useQuery({
    queryKey: queryKeys.portal.estimate(id),
    queryFn: () => apiFetch<EstimateProjectDto>(`/portal/estimates/${id}`),
    ...cabinetQueryDefaults,
    enabled: !!id && enabled,
  });
}

export function useUpdatePortalQuoteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACCEPTED' | 'REJECTED' }) =>
      apiFetch(`/portal/quotes/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.portal.dashboard });
    },
  });
}

export function useUpdatePortalEstimateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACCEPTED' | 'REJECTED' }) =>
      apiFetch(`/portal/estimates/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.portal.dashboard });
    },
  });
}

export function useAcceptPortalInvitationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      apiFetch('/portal/invitations/accept', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.portal.dashboard });
      void qc.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export interface PortalInvitePreviewDto {
  token: string;
  expiresAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  firstName?: string;
  lastName?: string;
  companyName: string;
  companySlug: string;
  alreadyLinked: boolean;
}

export function usePortalInvitePreviewQuery(token: string) {
  return useQuery<PortalInvitePreviewDto, Error>({
    queryKey: ['portal', 'invite-preview', token],
    queryFn: () =>
      apiFetch<PortalInvitePreviewDto>(`/portal/invitations/preview?token=${encodeURIComponent(token)}`),
    enabled: !!token,
    retry: false,
  });
}
