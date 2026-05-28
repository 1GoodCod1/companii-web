import { useCallback, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { downloadApiBlob } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import type {
  AssignedWorksheetDto,
  EstimateBlueprintDto,
  EstimateLineDto,
  EstimateProjectDto,
  EstimateProjectListDto,
  Plan2dData,
  WorkSheetDto,
} from '@/types/estimates';

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

export function useMyAssignedWorksheetsQuery(
  enabled = true,
): UseQueryResult<AssignedWorksheetDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery({
    queryKey: queryKeys.estimates.myWorksheets,
    queryFn: () => apiFetch<AssignedWorksheetDto[]>(`${base}/worksheets/my`),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId && enabled,
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

// U-08: Hook for cancellable estimate PDF download.
export function useDownloadEstimatePdf() {
  const abortRef = useRef<AbortController | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(async (projectId: string, filename: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsDownloading(true);
    try {
      await downloadApiBlob(
        `${base}/projects/${projectId}/pdf`,
        filename,
        false,
        { signal: controller.signal },
      );
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') throw err;
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setIsDownloading(false);
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsDownloading(false);
  }, []);

  return { download, cancel, isDownloading };
}

// U-08: Hook for cancellable portal estimate PDF download.
export function useDownloadPortalEstimatePdf() {
  const abortRef = useRef<AbortController | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(async (projectId: string, filename: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsDownloading(true);
    try {
      await downloadApiBlob(
        `/portal/estimates/${projectId}/pdf`,
        filename,
        false,
        { signal: controller.signal },
      );
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') throw err;
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setIsDownloading(false);
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsDownloading(false);
  }, []);

  return { download, cancel, isDownloading };
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
    // U-06: Optimistic update — immediately apply the change to cached data.
    onMutate: async ({ projectId, stageId, lineId, ...body }) => {
      await qc.cancelQueries({ queryKey: queryKeys.estimates.project(projectId) });
      const previous = qc.getQueryData<EstimateProjectDto>(queryKeys.estimates.project(projectId));
      if (previous) {
        qc.setQueryData<EstimateProjectDto>(queryKeys.estimates.project(projectId), {
          ...previous,
          stages: previous.stages?.map((s) =>
            s.id === stageId
              ? {
                  ...s,
                  lines: s.lines?.map((l) =>
                    l.id === lineId ? { ...l, ...body } : l,
                  ),
                }
              : s,
          ),
        });
      }
      return { previous };
    },
    onError: (_err, { projectId }, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.estimates.project(projectId), context.previous);
      }
    },
    onSettled: (_, __, { projectId }) => {
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
    // U-06: Optimistic — prepend a temp line with an optimistic id.
    onMutate: async ({ projectId, stageId, ...body }) => {
      await qc.cancelQueries({ queryKey: queryKeys.estimates.project(projectId) });
      const previous = qc.getQueryData<EstimateProjectDto>(queryKeys.estimates.project(projectId));
      if (previous) {
        const optimisticLine: EstimateLineDto = {
          id: `optimistic-${Date.now()}`,
          source: 'manual',
          ...body,
        };
        qc.setQueryData<EstimateProjectDto>(queryKeys.estimates.project(projectId), {
          ...previous,
          stages: previous.stages?.map((s) =>
            s.id === stageId
              ? { ...s, lines: [...(s.lines ?? []), optimisticLine] }
              : s,
          ),
        });
      }
      return { previous };
    },
    onError: (_err, { projectId }, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.estimates.project(projectId), context.previous);
      }
    },
    onSettled: (_, __, { projectId }) => {
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
    // U-06: Optimistic — remove the line immediately.
    onMutate: async ({ projectId, stageId, lineId }) => {
      await qc.cancelQueries({ queryKey: queryKeys.estimates.project(projectId) });
      const previous = qc.getQueryData<EstimateProjectDto>(queryKeys.estimates.project(projectId));
      if (previous) {
        qc.setQueryData<EstimateProjectDto>(queryKeys.estimates.project(projectId), {
          ...previous,
          stages: previous.stages?.map((s) =>
            s.id === stageId
              ? { ...s, lines: s.lines?.filter((l) => l.id !== lineId) }
              : s,
          ),
        });
      }
      return { previous };
    },
    onError: (_err, { projectId }, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.estimates.project(projectId), context.previous);
      }
    },
    onSettled: (_, __, { projectId }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(projectId) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
    },
  });
}
