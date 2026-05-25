import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { downloadApiBlob } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import type {
  EstimateBlueprintDto,
  EstimateProjectDto,
  EstimateProjectListDto,
  Plan2dData,
  WorkSheetDto,
} from '../types';

const base = '/estimates';

export function useEstimateBlueprintsQuery(): UseQueryResult<EstimateBlueprintDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery({
    queryKey: queryKeys.estimates.blueprints,
    queryFn: () => apiFetch<EstimateBlueprintDto[]>(`${base}/blueprints`),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId,
  });
}

export function useEstimateProjectsQuery(): UseQueryResult<EstimateProjectListDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery({
    queryKey: queryKeys.estimates.projects,
    queryFn: () => apiFetch<EstimateProjectListDto[]>(`${base}/projects`),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId,
  });
}

export function useEstimateProjectQuery(id: string): UseQueryResult<EstimateProjectDto, Error> {
  return useQuery({
    queryKey: queryKeys.estimates.project(id),
    queryFn: () => apiFetch<EstimateProjectDto>(`${base}/projects/${id}`),
    ...cabinetQueryDefaults,
    enabled: !!id,
  });
}

export function useWorksheetByInterventionQuery(
  interventionId: string,
  enabled = true,
): UseQueryResult<WorkSheetDto, Error> {
  return useQuery({
    queryKey: queryKeys.estimates.worksheetIntervention(interventionId),
    queryFn: () => apiFetch<WorkSheetDto>(`${base}/worksheet/intervention/${interventionId}`),
    ...cabinetQueryDefaults,
    enabled: !!interventionId && enabled,
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
    }) => apiFetch<EstimateProjectDto>(`${base}/projects`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
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
      diagnosticAnswers?: Record<string, unknown>;
      notes?: string | null;
    }) =>
      apiFetch<EstimateProjectDto>(`${base}/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(id) });
    },
  });
}

export function useSaveSitePlanMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, plan2d }: { id: string; plan2d: Plan2dData }) =>
      apiFetch<EstimateProjectDto>(`${base}/projects/${id}/site-plan`, {
        method: 'PUT',
        body: JSON.stringify({ plan2d }),
      }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(id) });
    },
  });
}

export function useCalculateEstimateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<EstimateProjectDto>(`${base}/projects/${id}/calculate`, { method: 'POST' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
    },
  });
}

export function useGenerateEstimateQuoteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<EstimateProjectDto>(`${base}/projects/${id}/generate-quote`, { method: 'POST' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quotes });
    },
  });
}

export function useConvertEstimateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, mode }: { id: string; mode?: 'single' | 'by-stage' }) =>
      apiFetch<{ intervention?: unknown; interventions?: unknown[] }>(`${base}/projects/${id}/convert`, {
        method: 'POST',
        body: JSON.stringify({ mode: mode ?? 'single' }),
      }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}

export function useSendEstimateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ project: EstimateProjectDto; emailSent: boolean }>(`${base}/projects/${id}/send`, {
        method: 'POST',
      }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
    },
  });
}

export async function downloadPortalEstimatePdf(projectId: string, filename: string) {
  return downloadApiBlob(`/portal/estimates/${projectId}/pdf`, filename);
}

export function useUpdateEstimateLineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      stageId,
      lineId,
      ...body
    }: {
      projectId: string;
      stageId: string;
      lineId: string;
      description?: string;
      qty?: number;
      unit?: string;
      unitPrice?: number;
      materialStore?: string | null;
      receiptFileKey?: string | null;
    }) =>
      apiFetch<EstimateProjectDto>(
        `${base}/projects/${projectId}/stages/${stageId}/lines/${lineId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(body),
        },
      ),
    onSuccess: (_, { projectId }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(projectId) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
    },
  });
}

export function useAddEstimateLineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      stageId,
      ...body
    }: {
      projectId: string;
      stageId: string;
      description: string;
      qty: number;
      unit: string;
      unitPrice: number;
    }) =>
      apiFetch<EstimateProjectDto>(
        `${base}/projects/${projectId}/stages/${stageId}/lines`,
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
      ),
    onSuccess: (_, { projectId }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(projectId) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
    },
  });
}

export function useDeleteEstimateLineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      stageId,
      lineId,
    }: {
      projectId: string;
      stageId: string;
      lineId: string;
    }) =>
      apiFetch<EstimateProjectDto>(
        `${base}/projects/${projectId}/stages/${stageId}/lines/${lineId}`,
        {
          method: 'DELETE',
        },
      ),
    onSuccess: (_, { projectId }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(projectId) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
    },
  });
}
