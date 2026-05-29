import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';

export interface AdminBlueprintDto {
  id: string;
  categoryId: string;
  name: string;
  version: number;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string; slug: string };
  _count?: { projects: number };
}

export function useAdminBlueprintsQuery(): UseQueryResult<AdminBlueprintDto[], Error> {
  return useQuery<AdminBlueprintDto[], Error>({
    queryKey: queryKeys.admin.blueprints,
    queryFn: () => apiFetch<AdminBlueprintDto[]>('/admin/blueprints'),
    ...cabinetQueryDefaults,
  });
}

export function useCreateAdminBlueprintMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      categoryId: string;
      name: string;
      version?: number;
      config: Record<string, unknown>;
      isActive?: boolean;
    }) =>
      apiFetch<AdminBlueprintDto>('/admin/blueprints', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.blueprints });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.blueprints });
    },
  });
}

export function useUpdateAdminBlueprintMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      version?: number;
      config?: Record<string, unknown>;
      isActive?: boolean;
    }) =>
      apiFetch<AdminBlueprintDto>(`/admin/blueprints/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.blueprints });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.blueprints });
    },
  });
}

export function useDeleteAdminBlueprintMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/blueprints/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.blueprints });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.blueprints });
    },
  });
}
