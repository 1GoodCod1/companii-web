import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import type { CursorPage } from '@/shared/api/pagination';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import type { CustomerDto, QuoteDto, InvoiceDto } from '@/entities/fsm/model/types';
import type { EstimateProjectListDto, EstimateProjectDto } from '@/entities/estimate/model/estimates';
import type { CompanyReviewDto, PortalInterventionDto } from '@/entities/review/model/reviews.types';

import type { PortalEstimateActionStatus } from '@/entities/estimate/model/estimateStatus.constants';
import type { PortalQuoteActionStatus } from '@/entities/fsm/model/quoteStatus.constants';
import type { CompanyLeadDto } from '@/entities/fsm/model/types';

export type PortalLeadDto = Pick<
  CompanyLeadDto,
  | 'id'
  | 'status'
  | 'source'
  | 'serviceTitle'
  | 'message'
  | 'address'
  | 'estimatedBudget'
  | 'createdAt'
  | 'updatedAt'
  | 'category'
> & {
  company: { id: string; name: string; slug: string };
};

export type PortalCompanyRef = { id: string; name: string; slug: string | null };

export interface PortalDashboardDto {
  customer: CustomerDto;
  interventions: PortalInterventionDto[];
  quotes: (QuoteDto & { company?: PortalCompanyRef })[];
  invoices: (InvoiceDto & { company?: PortalCompanyRef })[];
  reviews: CompanyReviewDto[];
  estimates: EstimateProjectListDto[];
}

export function usePortalLeadsQuery(): UseQueryResult<PortalLeadDto[], Error> {
  return useQuery<PortalLeadDto[], Error>({
    queryKey: queryKeys.portal.leads,
    queryFn: async () => (await apiFetch<CursorPage<PortalLeadDto>>('/portal/leads')).items,
    ...cabinetQueryDefaults,
  });
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
    mutationFn: ({ id, status }: { id: string; status: PortalQuoteActionStatus }) =>
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
    mutationFn: ({ id, status }: { id: string; status: PortalEstimateActionStatus }) =>
      apiFetch(`/portal/estimates/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.portal.dashboard });
    },
  });
}

export function useRequestPortalEstimateChangesMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      apiFetch(`/portal/estimates/${id}/request-changes`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
      }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.portal.dashboard });
      void qc.invalidateQueries({ queryKey: queryKeys.portal.estimate(id) });
    },
  });
}

export function useSubmitPortalInvoicePaymentProofMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, fileId }: { invoiceId: string; fileId: string }) =>
      apiFetch<InvoiceDto>(`/portal/invoices/${invoiceId}/payment-proof`, {
        method: 'POST',
        body: JSON.stringify({ fileId }),
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
    queryKey: queryKeys.portal.invitePreview(token),
    queryFn: () =>
      apiFetch<PortalInvitePreviewDto>(`/portal/invitations/preview?token=${encodeURIComponent(token)}`),
    enabled: !!token,
    retry: false,
  });
}
