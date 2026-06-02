import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';

export interface AdminCategoryDto {
  id: string;
  name: string;
  slug: string;
  translations?: Record<string, { name?: string }> | null;
  _count?: { companies: number; companyServices: number };
}

export function useAdminCategoriesQuery(): UseQueryResult<AdminCategoryDto[], Error> {
  return useQuery<AdminCategoryDto[], Error>({
    queryKey: queryKeys.admin.categories,
    queryFn: () => apiFetch<AdminCategoryDto[]>('/admin/categories'),
    ...cabinetQueryDefaults,
  });
}

export function useCreateAdminCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      slug?: string;
      translations?: Record<string, { name?: string }>;
    }) =>
      apiFetch<AdminCategoryDto>('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.categories });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useUpdateAdminCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: {
      id: string;
      name?: string;
      slug?: string;
      translations?: Record<string, { name?: string }>;
    }) =>
      apiFetch<AdminCategoryDto>(`/admin/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.categories });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useDeleteAdminCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.categories });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}
