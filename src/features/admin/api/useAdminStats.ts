import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';

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
