import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { EstimateProjectPhotoDto } from '@/types/estimates';
import { ESTIMATES_API_BASE } from './constants';

export function useAddEstimateProjectPhotosMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      fileKeys,
      caption,
    }: {
      projectId: string;
      fileKeys: string[];
      caption?: string;
    }) =>
      apiFetch<EstimateProjectPhotoDto[]>(`${ESTIMATES_API_BASE}/projects/${projectId}/photos`, {
        method: 'POST',
        body: JSON.stringify({ fileKeys, caption }),
      }),
    onSuccess: (_, { projectId }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(projectId) });
    },
  });
}

export function useUpdateEstimateProjectPhotoCaptionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      photoId,
      caption,
    }: {
      projectId: string;
      photoId: string;
      caption: string | null;
    }) =>
      apiFetch<EstimateProjectPhotoDto>(`${ESTIMATES_API_BASE}/projects/${projectId}/photos/${photoId}`, {
        method: 'PATCH',
        body: JSON.stringify({ caption }),
      }),
    onSuccess: (_, { projectId }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(projectId) });
    },
  });
}

export function useDeleteEstimateProjectPhotoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, photoId }: { projectId: string; photoId: string }) =>
      apiFetch<{ success: boolean }>(`${ESTIMATES_API_BASE}/projects/${projectId}/photos/${photoId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, { projectId }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(projectId) });
    },
  });
}
