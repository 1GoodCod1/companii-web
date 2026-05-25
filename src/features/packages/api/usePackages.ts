import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { cabinetQueryDefaults, publicListQueryOptions } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';

export interface ServicePackageDto {
  id: string;
  title: string;
  description: string;
  price: string | number;
  currency: string;
  durationMinutes: number;
  isPublished: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  paymentMode: 'PREPAID' | 'ON_SITE';
  category?: { id: string; name: string };
}

export function usePackagesListQuery(
  companySlug?: string,
): UseQueryResult<ServicePackageDto[], Error> {
  const qs = companySlug ? `?companySlug=${encodeURIComponent(companySlug)}` : '';
  return useQuery<ServicePackageDto[], Error>({
    queryKey: queryKeys.packages.list(companySlug),
    queryFn: () => apiFetch<ServicePackageDto[]>(`/packages${qs}`),
    ...publicListQueryOptions,
  });
}

export function useCompanyPackagesQuery(): UseQueryResult<ServicePackageDto[], Error> {
  return useQuery<ServicePackageDto[], Error>({
    queryKey: queryKeys.packages.me,
    queryFn: () => apiFetch<ServicePackageDto[]>('/packages/me'),
    ...cabinetQueryDefaults,
  });
}

export function useBookPackageMutation() {
  return useMutation({
    mutationFn: ({
      packageId,
      body,
    }: {
      packageId: string;
      body: Record<string, string | undefined>;
    }) =>
      apiFetch(`/packages/${packageId}/book`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  });
}

export function useCreatePackageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<ServicePackageDto>('/packages', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.packages.me });
      void qc.invalidateQueries({ queryKey: ['packages'] });
    },
  });
}

export function useUpdatePackageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [key: string]: unknown }) =>
      apiFetch<ServicePackageDto>(`/packages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.packages.me });
      void qc.invalidateQueries({ queryKey: ['packages'] });
    },
  });
}

export function useDeletePackageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/packages/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.packages.me });
      void qc.invalidateQueries({ queryKey: ['packages'] });
    },
  });
}
