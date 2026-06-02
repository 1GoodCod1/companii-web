import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAuthStore } from '@/entities/user/model/authStore';
import type { WorkSheetDto, AssignedWorksheetDto } from '@/entities/estimate/model/estimates';
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
