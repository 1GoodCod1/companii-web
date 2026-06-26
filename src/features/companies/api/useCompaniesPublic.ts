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

export interface BookingSlotsDay {
  date: string;
  weekday: string;
  slots: { start: string }[];
}

export interface BookingSlotsResponse {
  enabled: boolean;
  timezone: string;
  slotMinutes: number;
  durationMinutes?: number;
  days: BookingSlotsDay[];
}

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

export function useCompanyBookingSlotsQuery(
  slug: string,
  from: string,
  durationMinutes?: number,
  enabled = true,
): UseQueryResult<BookingSlotsResponse, Error> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (durationMinutes) params.set('durationMinutes', String(durationMinutes));
  const qs = params.toString() ? `?${params.toString()}` : '';
  return useQuery<BookingSlotsResponse, Error>({
    queryKey: [...queryKeys.companies.bookingSlots(slug, from), durationMinutes ?? 0],
    queryFn: () => apiFetch<BookingSlotsResponse>(`/companies/${slug}/booking-slots${qs}`),
    enabled: !!slug && enabled,
    staleTime: 30_000,
  });
}

export function useRequestPublicServiceMutation(companySlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      serviceId: string;
      message?: string;
      scheduledAt?: string;
      durationMinutes?: number;
    }) =>
      apiFetch<{
        leadId: string;
        customerId: string;
        customerCreated: boolean;
        scheduled: boolean;
        interventionId: string | null;
      }>(`/companies/${companySlug}/services/${body.serviceId}/request`, {
        method: 'POST',
        body: JSON.stringify({
          message: body.message,
          scheduledAt: body.scheduledAt,
          durationMinutes: body.durationMinutes,
        }),
      }),
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
      scheduledAt?: string;
      durationMinutes?: number;
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
