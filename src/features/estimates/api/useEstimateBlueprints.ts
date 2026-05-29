import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import type { EstimateBlueprintDto } from '@/types/estimates';
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
