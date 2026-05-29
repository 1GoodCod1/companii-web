import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import type { WorkSheetDto, AssignedWorksheetDto } from '@/types/estimates';
import { ESTIMATES_API_BASE } from './constants';

export function useWorksheetByInterventionQuery(
  interventionId: string,
  enabled = true,
): UseQueryResult<WorkSheetDto, Error> {
  return useQuery({
    queryKey: queryKeys.estimates.worksheetIntervention(interventionId),
    queryFn: () => apiFetch<WorkSheetDto>(`${ESTIMATES_API_BASE}/worksheet/intervention/${interventionId}`),
    ...cabinetQueryDefaults,
    enabled: !!interventionId && enabled,
  });
}

export function useMyAssignedWorksheetsQuery(
  enabled = true,
): UseQueryResult<AssignedWorksheetDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery({
    queryKey: queryKeys.estimates.myWorksheets,
    queryFn: () => apiFetch<AssignedWorksheetDto[]>(`${ESTIMATES_API_BASE}/worksheets/my`),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId && enabled,
  });
}
