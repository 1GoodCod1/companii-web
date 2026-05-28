import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import type { EstimateVersionSummary, EstimateVersionDiff } from '@/types/estimates';

export function useEstimateVersions(projectId: string | undefined) {
  return useQuery<EstimateVersionSummary[]>({
    queryKey: ['estimate-versions', projectId],
    queryFn: async () => {
      return apiFetch(`/estimates/projects/${projectId}/versions`);
    },
    enabled: Boolean(projectId),
  });
}

export function useEstimateVersionDiff(
  projectId: string | undefined,
  fromVersion: number | undefined,
  toVersion: number | undefined,
) {
  return useQuery<EstimateVersionDiff>({
    queryKey: ['estimate-versions-diff', projectId, fromVersion, toVersion],
    queryFn: async () => {
      return apiFetch(
        `/estimates/projects/${projectId}/versions/diff?from=${fromVersion}&to=${toVersion}`,
      );
    },
    enabled: Boolean(projectId) && fromVersion != null && toVersion != null,
  });
}