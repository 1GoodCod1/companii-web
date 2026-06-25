import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetCustomersQueryOptions } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAuthStore } from '@/entities/user/model/authStore';
import type { CursorPage } from '@/shared/api/pagination';
import type { CustomerDto, CustomerTimelineDto, CustomerTimelineItemDto } from '@/entities/fsm/model/types';
import { normalizeCustomerTimeline } from '@/entities/fsm/model/customerTimeline';
import { FSM_BASE } from './fsmBase';

const CUSTOMERS_PAGE_SIZE = 100;

async function fetchAllCustomers(): Promise<CustomerDto[]> {
  const all: CustomerDto[] = [];
  let cursor: string | undefined;
  do {
    const qs = cursor ? `&cursor=${encodeURIComponent(cursor)}` : '';
    const page = await apiFetch<CursorPage<CustomerDto>>(
      `${FSM_BASE}/customers?limit=${CUSTOMERS_PAGE_SIZE}${qs}`,
    );
    all.push(...page.items);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);

  return all;
}

export function useCustomersQuery(options?: { enabled?: boolean }): UseQueryResult<CustomerDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  const qc = useQueryClient();
  const enabled = options?.enabled ?? true;

  return useQuery<CustomerDto[], Error>({
    queryKey: queryKeys.fsm.customers(activeCompanyId),
    queryFn: async () => {
      const all = await fetchAllCustomers();
      qc.setQueryData(queryKeys.fsm.customersCount(activeCompanyId), all.length);
      return all;
    },
    ...cabinetCustomersQueryOptions,
    enabled: !!activeCompanyId && enabled,
  });
}

export function useCustomersCountQuery(options?: { enabled?: boolean }): UseQueryResult<number, Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  const enabled = options?.enabled ?? true;

  return useQuery<number, Error>({
    queryKey: queryKeys.fsm.customersCount(activeCompanyId),
    queryFn: async () => {
      const result = await apiFetch<{ total: number }>(`${FSM_BASE}/customers/count`);
      return result.total;
    },
    ...cabinetCustomersQueryOptions,
    placeholderData: (previous: number | undefined) => previous,
    enabled: !!activeCompanyId && enabled,
  });
}

export function useCreateCustomerMutation() {
  const qc = useQueryClient();
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);

  return useMutation({
    mutationFn: (body: { fullName: string; phone: string; email?: string; address: string; notes?: string }) =>
      apiFetch<CustomerDto>(`${FSM_BASE}/customers`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: (created) => {
      qc.setQueryData<number | undefined>(
        queryKeys.fsm.customersCount(activeCompanyId),
        (current: number | undefined) => (current ?? 0) + 1,
      );
      qc.setQueryData<CustomerDto[] | undefined>(
        queryKeys.fsm.customers(activeCompanyId),
        (current: CustomerDto[] | undefined) => (current ? [created, ...current] : [created]),
      );
    },
  });
}

export function useUpdateCustomerMutation() {
  const qc = useQueryClient();
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);

  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; fullName?: string; phone?: string; email?: string; address?: string; notes?: string }) =>
      apiFetch<CustomerDto>(`${FSM_BASE}/customers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: (updated, { id }) => {
      qc.setQueryData<CustomerDto[] | undefined>(
        queryKeys.fsm.customers(activeCompanyId),
        (current: CustomerDto[] | undefined) =>
          current?.map((customer) => (customer.id === id ? updated : customer)),
      );
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customer(id) });
    },
  });
}

export function useDeleteCustomerMutation() {
  const qc = useQueryClient();
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`${FSM_BASE}/customers/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      qc.setQueryData<number | undefined>(
        queryKeys.fsm.customersCount(activeCompanyId),
        (current: number | undefined) => Math.max(0, (current ?? 1) - 1),
      );
      qc.setQueryData<CustomerDto[] | undefined>(
        queryKeys.fsm.customers(activeCompanyId),
        (current: CustomerDto[] | undefined) => current?.filter((customer) => customer.id !== id),
      );
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customer(id) });
    },
  });
}

export function useCustomerTimelineQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.fsm.customerTimeline(id),
    queryFn: async () => {
      const data = await apiFetch<CustomerTimelineDto & { items?: CustomerTimelineItemDto[] }>(
        `${FSM_BASE}/customers/${id}/timeline`,
      );
      return normalizeCustomerTimeline(data);
    },
    ...cabinetCustomersQueryOptions,
    enabled: !!id && enabled,
  });
}
