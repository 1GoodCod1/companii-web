import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import type { EstimateProjectDto } from '@/types/estimates';

const base = '/estimates/templates';

export interface EstimateTemplateDto {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  stages: any[];
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
      stages?: any[];
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
      stages?: any[];
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
