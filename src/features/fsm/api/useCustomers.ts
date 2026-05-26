import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import type { CustomerDto, CustomerTimelineDto } from '@/types/fsm';
import { FSM_BASE } from './fsmBase';

export function useCustomersQuery(options?: { enabled?: boolean }): UseQueryResult<CustomerDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  const enabled = options?.enabled ?? true;
  return useQuery<CustomerDto[], Error>({
    queryKey: queryKeys.fsm.customers,
    queryFn: () => apiFetch<CustomerDto[]>(`${FSM_BASE}/customers`),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId && enabled,
  });
}

export function useCreateCustomerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { fullName: string; phone: string; email?: string; address: string; notes?: string }) =>
      apiFetch<CustomerDto>(`${FSM_BASE}/customers`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customers });
    },
  });
}

export function useUpdateCustomerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; fullName?: string; phone?: string; email?: string; address?: string; notes?: string }) =>
      apiFetch<CustomerDto>(`${FSM_BASE}/customers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
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
      apiFetch<{ success: boolean }>(`${FSM_BASE}/customers/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customers });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customer(id) });
    },
  });
}

export function useCustomerTimelineQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.fsm.customerTimeline(id),
    queryFn: () => apiFetch<CustomerTimelineDto>(`${FSM_BASE}/customers/${id}/timeline`),
    ...cabinetQueryDefaults,
    enabled: !!id && enabled,
  });
}
