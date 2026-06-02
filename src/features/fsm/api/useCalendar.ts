import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAuthStore } from '@/entities/user/model/authStore';
import type { CalendarBoardDto } from '@/entities/fsm/model/types';
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
