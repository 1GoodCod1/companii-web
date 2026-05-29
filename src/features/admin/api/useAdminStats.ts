import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';

export interface AdminStatsDto {
  companies: number;
  users: number;
  interventions: number;
  waitlist: number;
}

export function useAdminStatsQuery(): UseQueryResult<AdminStatsDto, Error> {
  return useQuery<AdminStatsDto, Error>({
    queryKey: queryKeys.admin.stats,
    queryFn: () => apiFetch<AdminStatsDto>('/admin/stats'),
    ...cabinetQueryDefaults,
  });
}
