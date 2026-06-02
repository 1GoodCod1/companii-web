import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { publicListQueryOptions } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import type { CatalogOptionDto } from '@/entities/company/model/companies.types';

export function useCitiesQuery(): UseQueryResult<CatalogOptionDto[], Error> {
  return useQuery<CatalogOptionDto[], Error>({
    queryKey: queryKeys.companies.cities,
    queryFn: () => apiFetch<CatalogOptionDto[]>('/companies/cities'),
    ...publicListQueryOptions,
  });
}

export function useCategoriesQuery(): UseQueryResult<CatalogOptionDto[], Error> {
  return useQuery<CatalogOptionDto[], Error>({
    queryKey: queryKeys.companies.categories,
    queryFn: () => apiFetch<CatalogOptionDto[]>('/companies/categories'),
    ...publicListQueryOptions,
  });
}
