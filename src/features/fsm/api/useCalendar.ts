import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import type { CalendarBoardDto } from '@/types/fsm';
import { FSM_BASE } from './fsmBase';

export function useCalendarBoardQuery(from: string, to: string) {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery({
    queryKey: queryKeys.fsm.calendarBoard(from, to),
    queryFn: () => apiFetch<CalendarBoardDto>(`${FSM_BASE}/calendar?from=${from}&to=${to}&board=1`),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId && !!from && !!to,
  });
}
