import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { cabinetQueryDefaults, publicDetailQueryOptions } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import type {
  CompanyReviewDto,
  CompanyReviewsPageDto,
  CreateReviewPayload,
} from '@/types/reviews';

export function useCompanyReviewsBySlugQuery(
  slug: string,
): UseQueryResult<CompanyReviewsPageDto, Error> {
  return useQuery<CompanyReviewsPageDto, Error>({
    queryKey: queryKeys.reviews.bySlug(slug),
    queryFn: () => apiFetch<CompanyReviewsPageDto>(`/reviews/company/slug/${slug}?limit=20`),
    enabled: !!slug,
    ...publicDetailQueryOptions,
  });
}

export function useCompanyReviewsMeQuery(): UseQueryResult<CompanyReviewsPageDto, Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);

  return useQuery<CompanyReviewsPageDto, Error>({
    queryKey: queryKeys.reviews.companyMe,
    queryFn: () => apiFetch<CompanyReviewsPageDto>('/reviews/company/me/list?limit=50'),
    enabled: !!activeCompanyId,
    ...cabinetQueryDefaults,
  });
}

export function useCreateReviewMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) =>
      apiFetch<CompanyReviewDto>('/reviews', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.reviews.all });
      void qc.invalidateQueries({ queryKey: queryKeys.portal.dashboard });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}
