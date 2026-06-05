import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import type { EstimateCommentDto } from '@/entities/estimate/model/estimates';

export function useEstimateComments(projectId: string | undefined, isPortal = false) {
  const path = isPortal
    ? `/portal/estimates/${projectId}/comments`
    : `/estimates/projects/${projectId}/comments`;
  return useQuery<EstimateCommentDto[]>({
    queryKey: ['estimate-comments', projectId, isPortal],
    queryFn: async () => {
      return apiFetch(path);
    },
    enabled: Boolean(projectId),
  });
}

export function useAddComment(
  projectId: string | undefined,
  isPortal = false,
) {
  const qc = useQueryClient();
  const path = isPortal
    ? `/portal/estimates/${projectId}/comments`
    : `/estimates/projects/${projectId}/comments`;
  return useMutation<EstimateCommentDto, Error, string>({
    mutationFn: async (body) => {
      return apiFetch(path, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['estimate-comments', projectId, isPortal] });
    },
  });
}