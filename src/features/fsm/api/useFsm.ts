import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch, downloadApiBlob } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import type {
  CustomerDto,
  InterventionDto,
  InterventionNoteDto,
  QuoteDto,
  QuoteLineDto,
  InvoiceDto,
  InterventionStatus,
  QuoteStatus,
  InvoicePaymentStatus,
  CompanyLeadStatus,
  CompanyLeadDto,
  CompanyServiceDto,
  CustomerTimelineDto,
  CalendarBoardDto,
} from '../types';

const fsm = '/fsm';

// --- CUSTOMERS ---

export function useCustomersQuery(options?: { enabled?: boolean }): UseQueryResult<CustomerDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  const enabled = options?.enabled ?? true;
  return useQuery<CustomerDto[], Error>({
    queryKey: queryKeys.fsm.customers,
    queryFn: () => apiFetch<CustomerDto[]>(`${fsm}/customers`),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId && enabled,
  });
}

export function useCreateCustomerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { fullName: string; phone: string; email?: string; address: string; notes?: string }) =>
      apiFetch<CustomerDto>(`${fsm}/customers`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customers });
    },
  });
}

export function useUpdateCustomerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; fullName?: string; phone?: string; email?: string; address?: string; notes?: string }) =>
      apiFetch<CustomerDto>(`${fsm}/customers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customers });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customer(id) });
    },
  });
}

export function useDeleteCustomerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`${fsm}/customers/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customers });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customer(id) });
    },
  });
}

// --- INTERVENTIONS ---

export function useInterventionsQuery(
  status?: InterventionStatus,
  customerId?: string,
  technicianId?: string,
): UseQueryResult<InterventionDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery<InterventionDto[], Error>({
    queryKey: [...queryKeys.fsm.interventions(status), customerId, technicianId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (customerId) params.append('customerId', customerId);
      if (technicianId) params.append('technicianId', technicianId);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      return apiFetch<InterventionDto[]>(`${fsm}/interventions${queryStr}`);
    },
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId,
  });
}

export function useInterventionQuery(id: string): UseQueryResult<InterventionDto, Error> {
  return useQuery<InterventionDto, Error>({
    queryKey: queryKeys.fsm.intervention(id),
    queryFn: () => apiFetch<InterventionDto>(`${fsm}/interventions/${id}`),
    ...cabinetQueryDefaults,
    enabled: !!id,
  });
}

export function useCreateInterventionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      customerId: string;
      type: string;
      description: string;
      address: string;
      technicianId?: string;
      scheduledAt?: string;
      estimatedPrice?: number;
      internalNotes?: string;
    }) =>
      apiFetch<InterventionDto>(`${fsm}/interventions`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}

export function useUpdateInterventionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      type?: string;
      description?: string;
      address?: string;
      technicianId?: string | null;
      scheduledAt?: string | null;
      estimatedPrice?: number | null;
      finalPrice?: number | null;
      internalNotes?: string | null;
    }) =>
      apiFetch<InterventionDto>(`${fsm}/interventions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.intervention(id) });
    },
  });
}

export function useUpdateInterventionStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: InterventionStatus; note?: string }) =>
      apiFetch<InterventionDto>(`${fsm}/interventions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.intervention(id) });
    },
  });
}

export function useDeleteInterventionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`${fsm}/interventions/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.intervention(id) });
    },
  });
}

// --- INTERVENTION NOTES ---

export function useCreateInterventionNoteMutation(interventionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { body: string; isInternal?: boolean }) =>
      apiFetch<InterventionNoteDto>(`${fsm}/interventions/${interventionId}/notes`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.intervention(interventionId) });
    },
  });
}

export function useDeleteInterventionNoteMutation(interventionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) =>
      apiFetch<{ success: boolean }>(`${fsm}/interventions/${interventionId}/notes/${noteId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.intervention(interventionId) });
    },
  });
}

// --- QUOTES ---

export function useQuotesQuery(): UseQueryResult<QuoteDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery<QuoteDto[], Error>({
    queryKey: queryKeys.fsm.quotes,
    queryFn: () => apiFetch<QuoteDto[]>(`${fsm}/quotes`),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId,
  });
}

export function useQuoteQuery(id: string): UseQueryResult<QuoteDto, Error> {
  return useQuery<QuoteDto, Error>({
    queryKey: queryKeys.fsm.quote(id),
    queryFn: () => apiFetch<QuoteDto>(`${fsm}/quotes/${id}`),
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
      apiFetch<QuoteDto>(`${fsm}/quotes`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quotes });
    },
  });
}

export function useUpdateQuoteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; status?: QuoteStatus; validUntil?: string | null; lines?: QuoteLineDto[] }) =>
      apiFetch<QuoteDto>(`${fsm}/quotes/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
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
      apiFetch<{ success: boolean }>(`${fsm}/quotes/${id}`, { method: 'DELETE' }),
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
      apiFetch<InterventionDto>(`${fsm}/quotes/${id}/convert`, { method: 'POST' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quotes });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quote(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}

// --- INVOICES ---

export function useInvoicesQuery(options?: { enabled?: boolean }): UseQueryResult<InvoiceDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  const enabled = options?.enabled ?? true;
  return useQuery<InvoiceDto[], Error>({
    queryKey: queryKeys.fsm.invoices,
    queryFn: () => apiFetch<InvoiceDto[]>(`${fsm}/invoices`),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId && enabled,
  });
}

export function useInvoiceQuery(id: string): UseQueryResult<InvoiceDto, Error> {
  return useQuery<InvoiceDto, Error>({
    queryKey: queryKeys.fsm.invoice(id),
    queryFn: () => apiFetch<InvoiceDto>(`${fsm}/invoices/${id}`),
    ...cabinetQueryDefaults,
    enabled: !!id,
  });
}

export function useCreateInvoiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { interventionId: string; tvaRate?: number; dueDate?: string }) =>
      apiFetch<InvoiceDto>(`${fsm}/invoices`, { method: 'POST', body: JSON.stringify(body) }),
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
      apiFetch<InvoiceDto>(`${fsm}/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
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
      apiFetch<{ success: boolean }>(`${fsm}/invoices/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoices });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoice(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}

export async function downloadCompanyInvoicePdf(invoiceId: string, filename: string) {
  return downloadApiBlob(`/fsm/invoices/${invoiceId}/pdf`, filename);
}

export async function downloadPortalInvoicePdf(invoiceId: string, filename: string) {
  return downloadApiBlob(`/portal/invoices/${invoiceId}/pdf`, filename);
}

export async function downloadCompanyQuotePdf(quoteId: string, filename: string) {
  return downloadApiBlob(`/fsm/quotes/${quoteId}/pdf`, filename);
}

export async function downloadInvoicesCsv() {
  return downloadApiBlob('/fsm/export/invoices.csv', 'facturi-export.csv');
}

// --- LEADS ---

export function useLeadsQuery(
  status?: CompanyLeadStatus,
  options?: { enabled?: boolean },
): UseQueryResult<CompanyLeadDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery({
    queryKey: queryKeys.fsm.leads(status),
    queryFn: () => {
      const q = status ? `?status=${status}` : '';
      return apiFetch<CompanyLeadDto[]>(`${fsm}/leads${q}`);
    },
    ...cabinetQueryDefaults,
    enabled: (options?.enabled ?? true) && !!activeCompanyId,
  });
}

export function useUpdateLeadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; status?: CompanyLeadStatus; notes?: string | null }) =>
      apiFetch<CompanyLeadDto>(`${fsm}/leads/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['fsm', 'leads'] });
    },
  });
}

export function useConvertLeadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      mode,
      categoryId,
      title,
    }: {
      id: string;
      mode: 'customer' | 'intervention' | 'estimate';
      categoryId?: string;
      title?: string;
    }) =>
      apiFetch(`${fsm}/leads/${id}/convert`, {
        method: 'POST',
        body: JSON.stringify({ mode, categoryId, title }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['fsm', 'leads'] });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customers });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
    },
  });
}

export function useCompleteLeadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<CompanyLeadDto>(`${fsm}/leads/${id}/complete`, { method: 'POST' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['fsm', 'leads'] });
    },
  });
}

// --- CUSTOMER TIMELINE ---

export function useCustomerTimelineQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.fsm.customerTimeline(id),
    queryFn: () => apiFetch<CustomerTimelineDto>(`${fsm}/customers/${id}/timeline`),
    ...cabinetQueryDefaults,
    enabled: !!id && enabled,
  });
}

// --- CALENDAR BOARD ---

export function useCalendarBoardQuery(from: string, to: string) {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery({
    queryKey: queryKeys.fsm.calendarBoard(from, to),
    queryFn: () => apiFetch<CalendarBoardDto>(`${fsm}/calendar?from=${from}&to=${to}&board=1`),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId && !!from && !!to,
  });
}

// --- COMPANY SERVICES ---

export function useCompanyServicesQuery(): UseQueryResult<CompanyServiceDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery<CompanyServiceDto[], Error>({
    queryKey: queryKeys.fsm.services,
    queryFn: () => apiFetch<CompanyServiceDto[]>(`${fsm}/services`),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId,
  });
}

export function useCreateCompanyServiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      defaultPrice: number;
      description?: string;
      categoryId?: string;
      durationMinutes?: number;
      isPublished?: boolean;
      materialsCost?: number;
      vatRate?: number;
      sortOrder?: number;
    }) =>
      apiFetch<CompanyServiceDto>(`${fsm}/services`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.fsm.services }),
  });
}

export function useUpdateCompanyServiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      defaultPrice?: number;
      description?: string;
      categoryId?: string | null;
      durationMinutes?: number | null;
      isPublished?: boolean;
      materialsCost?: number | null;
      vatRate?: number | null;
      sortOrder?: number;
    }) =>
      apiFetch<CompanyServiceDto>(`${fsm}/services/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.fsm.services }),
  });
}

export function useDeleteCompanyServiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`${fsm}/services/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.fsm.services }),
  });
}

// --- INTERVENTION PHOTOS & CHECKLIST ---

export function useAddInterventionPhotosMutation(interventionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileKeys: string[]) =>
      apiFetch(`${fsm}/interventions/${interventionId}/photos`, {
        method: 'POST',
        body: JSON.stringify({ fileKeys }),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.fsm.intervention(interventionId) }),
  });
}

export function useUpdateChecklistMutation(interventionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (progress: Record<string, boolean>) =>
      apiFetch(`${fsm}/interventions/${interventionId}/checklist`, {
        method: 'PATCH',
        body: JSON.stringify({ progress }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.intervention(interventionId) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.worksheetIntervention(interventionId) });
    },
  });
}

export function useSendQuoteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`${fsm}/quotes/${id}/send`, { method: 'POST' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quotes });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quote(id) });
    },
  });
}
