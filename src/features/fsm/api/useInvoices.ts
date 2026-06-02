import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch, downloadApiBlob } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAuthStore } from '@/entities/user/model/authStore';
import type { InvoiceDto, InvoicePaymentStatus } from '@/entities/fsm/model/types';
import { FSM_BASE } from './fsmBase';

export function useInvoicesQuery(
  options?: { enabled?: boolean; status?: InvoicePaymentStatus },
): UseQueryResult<InvoiceDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  const enabled = options?.enabled ?? true;
  const status = options?.status;
  return useQuery<InvoiceDto[], Error>({
    queryKey: status
      ? [...queryKeys.fsm.invoices, { status }]
      : queryKeys.fsm.invoices,
    queryFn: () => {
      const qs = status ? `?status=${status}` : '';
      return apiFetch<InvoiceDto[]>(`${FSM_BASE}/invoices${qs}`);
    },
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
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      paymentStatus?: InvoicePaymentStatus;
      dueDate?: string | null;
      /** Required when reversing a PAID invoice back to UNPAID. */
      paymentReversalReason?: string;
    }) =>
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

/** P2.#3 — Cancel an invoice with a mandatory reason. */
export function useCancelInvoiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch<InvoiceDto>(`${FSM_BASE}/invoices/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoices });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoice(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}

/** P2.#16 — Record a partial (or final) payment. */
export function useRecordInvoicePaymentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount, note }: { id: string; amount: number; note?: string }) =>
      apiFetch<InvoiceDto>(`${FSM_BASE}/invoices/${id}/payments`, {
        method: 'POST',
        body: JSON.stringify({ amount, note }),
      }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoices });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoice(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}

/** P2.#17 — Send the invoice (with PDF attachment) to the customer by email. */
export function useSendInvoiceEmailMutation() {
  return useMutation({
    mutationFn: ({ id, customMessage }: { id: string; customMessage?: string }) =>
      apiFetch<{ sent: boolean; recipient: string }>(
        `${FSM_BASE}/invoices/${id}/send-email`,
        { method: 'POST', body: JSON.stringify({ customMessage }) },
      ),
  });
}

export function useConfirmInvoicePaymentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<InvoiceDto>(`${FSM_BASE}/invoices/${id}/confirm-payment`, { method: 'POST' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoices });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoice(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}

export function useRejectInvoicePaymentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch<InvoiceDto>(`${FSM_BASE}/invoices/${id}/reject-payment`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: (_, { id }) => {
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
