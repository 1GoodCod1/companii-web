import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch, downloadApiBlob } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAuthStore } from '@/entities/user/model/authStore';
import type { CursorPage } from '@/shared/api/pagination';
import type { QuoteDto, QuoteLineDto, QuoteStatus, InterventionDto } from '@/entities/fsm/model/types';
import { FSM_BASE } from './fsmBase';

export function useQuotesQuery(): UseQueryResult<QuoteDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery<QuoteDto[], Error>({
    queryKey: queryKeys.fsm.quotes,
    queryFn: async () => (await apiFetch<CursorPage<QuoteDto>>(`${FSM_BASE}/quotes`)).items,
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId,
  });
}

export function useQuoteQuery(id: string): UseQueryResult<QuoteDto, Error> {
  return useQuery<QuoteDto, Error>({
    queryKey: queryKeys.fsm.quote(id),
    queryFn: () => apiFetch<QuoteDto>(`${FSM_BASE}/quotes/${id}`),
    ...cabinetQueryDefaults,
    enabled: !!id,
  });
}

export function useCreateQuoteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      customerId: string;
      interventionId?: string;
      validUntil?: string;
      lines: { description: string; qty: number; unitPrice: number; vatRate?: number; companyServiceId?: string }[];
    }) =>
      apiFetch<QuoteDto>(`${FSM_BASE}/quotes`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quotes });
    },
  });
}

export function useUpdateQuoteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; status?: QuoteStatus; validUntil?: string | null; lines?: QuoteLineDto[] }) =>
      apiFetch<QuoteDto>(`${FSM_BASE}/quotes/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quotes });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quote(id) });
    },
  });
}

export function useDeleteQuoteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`${FSM_BASE}/quotes/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quotes });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quote(id) });
    },
  });
}

export function useConvertQuoteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<InterventionDto>(`${FSM_BASE}/quotes/${id}/convert`, { method: 'POST' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quotes });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quote(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}

export function useSendQuoteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`${FSM_BASE}/quotes/${id}/send`, { method: 'POST' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quotes });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quote(id) });
    },
  });
}

export async function downloadCompanyQuotePdf(quoteId: string, filename: string) {
  return downloadApiBlob(`${FSM_BASE}/quotes/${quoteId}/pdf`, filename);
}

export async function downloadPortalQuotePdf(quoteId: string, filename: string) {
  return downloadApiBlob(`/portal/quotes/${quoteId}/pdf`, filename);
}
