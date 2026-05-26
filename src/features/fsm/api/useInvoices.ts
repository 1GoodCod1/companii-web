import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch, downloadApiBlob } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import type { InvoiceDto, InvoicePaymentStatus } from '@/types/fsm';
import { FSM_BASE } from './fsmBase';

export function useInvoicesQuery(options?: { enabled?: boolean }): UseQueryResult<InvoiceDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  const enabled = options?.enabled ?? true;
  return useQuery<InvoiceDto[], Error>({
    queryKey: queryKeys.fsm.invoices,
    queryFn: () => apiFetch<InvoiceDto[]>(`${FSM_BASE}/invoices`),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId && enabled,
  });
}

export function useInvoiceQuery(id: string): UseQueryResult<InvoiceDto, Error> {
  return useQuery<InvoiceDto, Error>({
    queryKey: queryKeys.fsm.invoice(id),
    queryFn: () => apiFetch<InvoiceDto>(`${FSM_BASE}/invoices/${id}`),
    ...cabinetQueryDefaults,
    enabled: !!id,
  });
}

export function useCreateInvoiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { interventionId: string; tvaRate?: number; dueDate?: string }) =>
      apiFetch<InvoiceDto>(`${FSM_BASE}/invoices`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoices });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}

export function useUpdateInvoiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; paymentStatus?: InvoicePaymentStatus; dueDate?: string | null }) =>
      apiFetch<InvoiceDto>(`${FSM_BASE}/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoices });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoice(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}

export function useDeleteInvoiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`${FSM_BASE}/invoices/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoices });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoice(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}

export async function downloadCompanyInvoicePdf(invoiceId: string, filename: string) {
  return downloadApiBlob(`${FSM_BASE}/invoices/${invoiceId}/pdf`, filename);
}

export async function downloadPortalInvoicePdf(invoiceId: string, filename: string) {
  return downloadApiBlob(`/portal/invoices/${invoiceId}/pdf`, filename);
}

export async function downloadInvoicesCsv() {
  return downloadApiBlob(`${FSM_BASE}/export/invoices.csv`, 'facturi-export.csv');
}
