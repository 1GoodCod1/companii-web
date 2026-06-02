import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';

export interface AdminCityDto {
  id: string;
  name: string;
  slug: string;
  translations?: Record<string, { name?: string }> | null;
  _count?: { companies: number };
}

export function useAdminCitiesQuery(): UseQueryResult<AdminCityDto[], Error> {
  return useQuery<AdminCityDto[], Error>({
    queryKey: queryKeys.admin.cities,
    queryFn: () => apiFetch<AdminCityDto[]>('/admin/cities'),
    ...cabinetQueryDefaults,
  });
}

export function useCreateAdminCityMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      slug?: string;
      translations?: Record<string, { name?: string }>;
    }) =>
      apiFetch<AdminCityDto>('/admin/cities', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.cities });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useUpdateAdminCityMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: {
      id: string;
      name?: string;
      slug?: string;
      translations?: Record<string, { name?: string }>;
    }) =>
      apiFetch<AdminCityDto>(`/admin/cities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.cities });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useDeleteAdminCityMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/cities/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.cities });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}
