import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAuthStore } from '@/entities/user/model/authStore';
import type { CompanyLeadDto, CompanyLeadStatus } from '@/entities/fsm/model/types';
import { FSM_BASE } from './fsmBase';

export function useLeadsQuery(
  status?: CompanyLeadStatus,
  options?: { enabled?: boolean },
): UseQueryResult<CompanyLeadDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery({
    queryKey: queryKeys.fsm.leads(status),
    queryFn: () => {
      const q = status ? `?status=${status}` : '';
      return apiFetch<CompanyLeadDto[]>(`${FSM_BASE}/leads${q}`);
    },
    ...cabinetQueryDefaults,
    enabled: (options?.enabled ?? true) && !!activeCompanyId,
  });
}

export function useUpdateLeadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; status?: CompanyLeadStatus; notes?: string | null }) =>
      apiFetch<CompanyLeadDto>(`${FSM_BASE}/leads/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.leadsAll });
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
      apiFetch(`${FSM_BASE}/leads/${id}/convert`, {
        method: 'POST',
        body: JSON.stringify({ mode, categoryId, title }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.leadsAll });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customersRoot });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
    },
  });
}

export function useCompleteLeadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<CompanyLeadDto>(`${FSM_BASE}/leads/${id}/complete`, { method: 'POST' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.leadsAll });
    },
  });
}
