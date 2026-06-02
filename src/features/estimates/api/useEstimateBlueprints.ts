import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAuthStore } from '@/entities/user/model/authStore';
import type { EstimateBlueprintDto } from '@/entities/estimate/model/estimates';
import { ESTIMATES_API_BASE } from './constants';

export function useEstimateBlueprintsQuery(): UseQueryResult<EstimateBlueprintDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery({
    queryKey: queryKeys.estimates.blueprints,
    queryFn: () => apiFetch<EstimateBlueprintDto[]>(`${ESTIMATES_API_BASE}/blueprints`),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId,
  });
}
