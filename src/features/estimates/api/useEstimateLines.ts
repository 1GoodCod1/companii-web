import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/queryKeys';
import type { EstimateProjectDto, EstimateLineDto } from '@/entities/estimate/model/estimates';
import { ESTIMATES_API_BASE } from './constants';

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
        `${ESTIMATES_API_BASE}/projects/${projectId}/stages/${stageId}/lines/${lineId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(body),
        },
      ),
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
                  lines: s.lines?.map((l) => {
                    if (l.id !== lineId) return l;
                    const next = { ...l, ...body };
                    if (body.qty !== undefined || body.unitPrice !== undefined) {
                      const qty = body.qty ?? Number(l.qty);
                      const unitPrice = body.unitPrice ?? Number(l.unitPrice);
                      next.lineTotal = Math.round(qty * unitPrice * 100) / 100;
                    }
                    return next;
                  }),
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
        `${ESTIMATES_API_BASE}/projects/${projectId}/stages/${stageId}/lines`,
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
      ),
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
        `${ESTIMATES_API_BASE}/projects/${projectId}/stages/${stageId}/lines/${lineId}`,
        {
          method: 'DELETE',
        },
      ),
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
