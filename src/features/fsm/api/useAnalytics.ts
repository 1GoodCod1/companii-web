import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetAnalyticsQueryOptions } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAuthStore } from '@/entities/user/model/authStore';
import type { AnalyticsPeriod, CompanyAnalyticsOverviewDto } from '@/entities/fsm/model/analytics';
import { FSM_BASE } from './fsmBase';

export function useCompanyAnalyticsOverviewQuery(
  period: AnalyticsPeriod,
  options?: { enabled?: boolean },
): UseQueryResult<CompanyAnalyticsOverviewDto, Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  const enabled = options?.enabled ?? true;
  return useQuery<CompanyAnalyticsOverviewDto, Error>({
    queryKey: queryKeys.fsm.analytics(period),
    queryFn: () =>
      apiFetch<CompanyAnalyticsOverviewDto>(`${FSM_BASE}/analytics/overview?period=${period}`),
    ...cabinetAnalyticsQueryOptions,
    enabled: !!activeCompanyId && enabled,
  });
}
