import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAuthStore } from '@/entities/user/model/authStore';
import type { EstimateProjectListDto, EstimateProjectDto, Plan2dData } from '@/entities/estimate/model/estimates';
import { ESTIMATES_API_BASE } from './constants';

export function useEstimateProjectsQuery(): UseQueryResult<EstimateProjectListDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery({
    queryKey: queryKeys.estimates.projects,
    queryFn: () => apiFetch<EstimateProjectListDto[]>(`${ESTIMATES_API_BASE}/projects`),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId,
  });
}

export function useEstimateProjectQuery(id: string): UseQueryResult<EstimateProjectDto, Error> {
  return useQuery({
    queryKey: queryKeys.estimates.project(id),
    queryFn: () => apiFetch<EstimateProjectDto>(`${ESTIMATES_API_BASE}/projects/${id}`),
    ...cabinetQueryDefaults,
    refetchOnMount: 'always',
    enabled: !!id,
  });
}

export function useCreateEstimateProjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      customerId: string;
      categoryId: string;
      title?: string;
      siteType?: string;
      address?: string;
      validUntil?: string;
      groupId?: string;
    }) => apiFetch<EstimateProjectDto>(`${ESTIMATES_API_BASE}/projects`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
    },
  });
}

export function useCreateRelatedEstimateProjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sourceProjectId,
      categoryId,
      title,
    }: {
      sourceProjectId: string;
      categoryId: string;
      title?: string;
    }) =>
      apiFetch<EstimateProjectDto>(`${ESTIMATES_API_BASE}/projects/${sourceProjectId}/related`, {
        method: 'POST',
        body: JSON.stringify({ categoryId, title }),
      }),
    onSuccess: (project, { sourceProjectId }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(sourceProjectId) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(project.id) });
      if (project.customer?.id) {
        void qc.invalidateQueries({
          queryKey: queryKeys.fsm.customerTimeline(project.customer.id),
        });
      }
    },
  });
}

export function useUpdateEstimateProjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      title?: string;
      siteType?: string;
      address?: string;
      validUntil?: string | null;
      marginPct?: number;
      riskReservePct?: number;
      siteFloor?: number | null;
      accessDifficulty?: string | null;
      urgency?: string | null;
      diagnosticAnswers?: Record<string, unknown>;
      notes?: string | null;
    }) =>
      apiFetch<EstimateProjectDto>(`${ESTIMATES_API_BASE}/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(id) });
    },
  });
}

export function useDeleteEstimateProjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`${ESTIMATES_API_BASE}/projects/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
    },
  });
}

export function useSaveSitePlanMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, plan2d }: { id: string; plan2d: Plan2dData }) =>
      apiFetch<EstimateProjectDto>(`${ESTIMATES_API_BASE}/projects/${id}/site-plan`, {
        method: 'PUT',
        body: JSON.stringify({ plan2d }),
      }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(id) });
    },
  });
}

export type EstimateCalculateResponse = EstimateProjectDto & {
  sanityWarnings?: Array<{ key: string; severity: 'info' | 'warning'; message: string }>;
};

export function useCalculateEstimateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<EstimateCalculateResponse>(`${ESTIMATES_API_BASE}/projects/${id}/calculate`, { method: 'POST' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
    },
  });
}
