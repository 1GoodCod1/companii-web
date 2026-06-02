import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAuthStore } from '@/entities/user/model/authStore';
import type { EstimateProjectDto, EstimateStageKind } from '@/entities/estimate/model/estimates';

const base = '/estimates/templates';

export interface EstimateTemplateStageLine {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  materialStore?: string | null;
  vatRate?: number | null;
}

export interface EstimateTemplateStage {
  name: string;
  code: string;
  kind: EstimateStageKind;
  description?: string | null;
  laborHours?: number | null;
  laborRate?: number | null;
  checklist?: string[] | null;
  durationDays?: number | null;
  lines?: EstimateTemplateStageLine[];
}

export interface EstimateTemplateDto {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  stages: EstimateTemplateStage[];
  createdAt: string;
  updatedAt: string;
}

export function useEstimateTemplatesQuery(): UseQueryResult<EstimateTemplateDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery({
    queryKey: queryKeys.estimates.templates,
    queryFn: () => apiFetch<EstimateTemplateDto[]>(base),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId,
  });
}

export function useEstimateTemplateQuery(id: string): UseQueryResult<EstimateTemplateDto, Error> {
  return useQuery({
    queryKey: queryKeys.estimates.template(id),
    queryFn: () => apiFetch<EstimateTemplateDto>(`${base}/${id}`),
    ...cabinetQueryDefaults,
    enabled: !!id,
  });
}

export function useCreateEstimateTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      description?: string;
      projectId?: string;
      stages?: EstimateTemplateStage[];
    }) =>
      apiFetch<EstimateTemplateDto>(base, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.templates });
    },
  });
}

export function useUpdateEstimateTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      description?: string;
      stages?: EstimateTemplateStage[];
    }) =>
      apiFetch<EstimateTemplateDto>(`${base}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.templates });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.template(id) });
    },
  });
}

export function useDeleteEstimateTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`${base}/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.templates });
    },
  });
}

export type ApplyEstimateTemplateMode = 'overwrite' | 'append' | 'pricing';

/** Pricing-mode response carries an extra `pricingMatchedCount` field. */
export type ApplyEstimateTemplateResponse = EstimateProjectDto & {
  pricingMatchedCount?: number;
};

export function useApplyEstimateTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      projectId,
      mode,
    }: {
      id: string;
      projectId: string;
      mode: ApplyEstimateTemplateMode;
    }) =>
      apiFetch<ApplyEstimateTemplateResponse>(`${base}/${id}/apply/${projectId}`, {
        method: 'POST',
        body: JSON.stringify({ mode }),
      }),
    onSuccess: (_, { projectId }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(projectId) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
    },
  });
}
