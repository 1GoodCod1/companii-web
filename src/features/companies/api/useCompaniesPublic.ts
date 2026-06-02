import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import {
  publicDetailQueryOptions,
  publicListQueryOptions,
} from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  CompaniesListResponse,
  PublicCompanyDetailDto,
} from '@/entities/company/model/companies.types';

export function useCompaniesListQuery(
  filters: Record<string, string | undefined> = {},
): UseQueryResult<CompaniesListResponse, Error> {
  const qs = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v && qs.set(k, v));
  const suffix = qs.toString() ? `?${qs}` : '';
  return useQuery<CompaniesListResponse, Error>({
    queryKey: queryKeys.companies.list(filters),
    queryFn: () => apiFetch<CompaniesListResponse>(`/companies${suffix}`),
    ...publicListQueryOptions,
  });
}

export function useCompanyBySlugQuery(
  slug: string,
): UseQueryResult<PublicCompanyDetailDto, Error> {
  return useQuery<PublicCompanyDetailDto, Error>({
    queryKey: queryKeys.companies.detail(slug),
    queryFn: () => apiFetch<PublicCompanyDetailDto>(`/companies/${slug}`),
    enabled: !!slug,
    ...publicDetailQueryOptions,
  });
}

export function useRequestPublicServiceMutation(companySlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      serviceId: string;
      message?: string;
      scheduledAt?: string;
    }) =>
      apiFetch<{ leadId: string; customerId: string; customerCreated: boolean }>(
        `/companies/${companySlug}/services/${body.serviceId}/request`,
        {
          method: 'POST',
          body: JSON.stringify({
            message: body.message,
            scheduledAt: body.scheduledAt,
          }),
        },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.detail(companySlug) });
      void qc.invalidateQueries({ queryKey: queryKeys.portal.leads });
    },
  });
}

export function useRequestPublicProjectMutation(companySlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      message: string;
      address?: string;
      categoryId?: string;
      projectTitle?: string;
      estimatedBudget?: number;
    }) =>
      apiFetch<{ leadId: string; customerId: string; customerCreated: boolean }>(
        `/companies/${companySlug}/request-project`,
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.detail(companySlug) });
      void qc.invalidateQueries({ queryKey: queryKeys.portal.leads });
    },
  });
}
