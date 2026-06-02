import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAuthStore } from '@/entities/user/model/authStore';
import type { CompanyServiceDto } from '@/entities/fsm/model/types';
import { FSM_BASE } from './fsmBase';

export function useCompanyServicesQuery(): UseQueryResult<CompanyServiceDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery<CompanyServiceDto[], Error>({
    queryKey: queryKeys.fsm.services,
    queryFn: () => apiFetch<CompanyServiceDto[]>(`${FSM_BASE}/services`),
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
      apiFetch<CompanyServiceDto>(`${FSM_BASE}/services`, { method: 'POST', body: JSON.stringify(body) }),
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
      apiFetch<CompanyServiceDto>(`${FSM_BASE}/services/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.fsm.services }),
  });
}

export function useDeleteCompanyServiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`${FSM_BASE}/services/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.fsm.services }),
  });
}
