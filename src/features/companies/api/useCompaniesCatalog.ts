import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { publicListQueryOptions } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import type { CatalogOptionDto } from '@/types/companies';

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
