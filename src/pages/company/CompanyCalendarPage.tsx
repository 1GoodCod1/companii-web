import { useEffect, useMemo, useReducer } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarBlankIcon } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import {
  useCalendarBoardQuery,
  useUpdateInterventionMutation,
  useConvertLeadMutation,
} from '@/features/fsm';
import { useCompanyMembersQuery } from '@/features/companies/api/useCompanies';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { filterAssignableTechnicians } from '@/entities/company/model/teamMembers';
import { CalendarBoardView } from '@/features/fsm';
import { getWeekRange } from '@/entities/fsm/model/calendar';
import { formatWeekRangeLabel } from '@/shared/utils/date';
import { useLocale } from '@/shared/hooks/useLocale';
import { getErrorMessage } from '@/shared/utils/errors';
import { calendarWeekBadgeClass } from '@/features/fsm/components/calendar/calendarPanelUi';

interface CalendarScheduleState {
  schedulingId: string | null;
  scheduleAt: string;
  scheduleTechnicianId: string;
  assignMode: 'single' | 'multiple' | 'crew';
  scheduleMemberIds: string[];
  scheduleCrewId: string;
}

const initialScheduleState: CalendarScheduleState = {
  schedulingId: null,
  scheduleAt: '',
  scheduleTechnicianId: '',
  assignMode: 'single',
  scheduleMemberIds: [],
  scheduleCrewId: '',
};

type CalendarScheduleAction =
  | { type: 'SET_SCHEDULING_ID'; payload: string | null }
  | { type: 'SET_SCHEDULE_AT'; payload: string }
  | { type: 'SET_SCHEDULE_TECHNICIAN_ID'; payload: string }
  | { type: 'SET_ASSIGN_MODE'; payload: 'single' | 'multiple' | 'crew' }
  | { type: 'SET_SCHEDULE_MEMBER_IDS'; payload: string[] }
  | { type: 'SET_SCHEDULE_CREW_ID'; payload: string }
  | { type: 'RESET' };

function calendarScheduleReducer(
  state: CalendarScheduleState,
  action: CalendarScheduleAction,
): CalendarScheduleState {
  switch (action.type) {
    case 'SET_SCHEDULING_ID':
      return { ...state, schedulingId: action.payload };
    case 'SET_SCHEDULE_AT':
      return { ...state, scheduleAt: action.payload };
    case 'SET_SCHEDULE_TECHNICIAN_ID':
      return { ...state, scheduleTechnicianId: action.payload };
    case 'SET_ASSIGN_MODE':
      return { ...state, assignMode: action.payload };
    case 'SET_SCHEDULE_MEMBER_IDS':
      return { ...state, scheduleMemberIds: action.payload };
    case 'SET_SCHEDULE_CREW_ID':
      return { ...state, scheduleCrewId: action.payload };
    case 'RESET':
      return initialScheduleState;
    default:
      return state;
  }
}

export function CompanyCalendarPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { from, to } = useMemo(() => getWeekRange(), []);
  const { data: board, isLoading } = useCalendarBoardQuery(from, to);
  const { isManagement } = useCompanyPermissions();
  const { data: members } = useCompanyMembersQuery({ enabled: isManagement });
  const updateIntervention = useUpdateInterventionMutation();
  const convertLead = useConvertLeadMutation();
  const qc = useQueryClient();

  const [scheduleState, scheduleDispatch] = useReducer(calendarScheduleReducer, initialScheduleState);
  const {
    schedulingId,
    scheduleAt,
    scheduleTechnicianId,
    assignMode,
    scheduleMemberIds,
    scheduleCrewId,
  } = scheduleState;

  const technicians = useMemo(() => filterAssignableTechnicians(members), [members]);
  const weekLabel = useMemo(() => formatWeekRangeLabel(from, to, locale), [from, to, locale]);

  // Deep link from the pipeline / work detail ("Programează"): auto-open the
  // scheduler for the requested work in the backlog, then drop the query param.
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const scheduleId = searchParams.get('schedule');
    if (!scheduleId || !board) return;
    if (board.unscheduled.some((item) => item.id === scheduleId)) {
      scheduleDispatch({ type: 'SET_SCHEDULING_ID', payload: scheduleId });
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('schedule');
        return next;
      },
      { replace: true },
    );
  }, [searchParams, board, setSearchParams]);

  const refreshBoard = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.fsm.calendarBoard(from, to) });
  };

  const handleSchedule = async () => {
    if (!schedulingId || !scheduleAt) {
      toast.error(t('company.calendarPage.selectDateTime'));
      return;
    }
    try {
      const assignFields: {
        technicianId: string | null;
        assigneeMemberIds: string[];
        crewId: string | null;
      } = {
        technicianId: null,
        assigneeMemberIds: [],
        crewId: null,
      };

      if (assignMode === 'crew') {
        assignFields.crewId = scheduleCrewId || null;
      } else if (assignMode === 'multiple') {
        assignFields.assigneeMemberIds = scheduleMemberIds;
      } else {
        assignFields.technicianId = scheduleTechnicianId || null;
      }

      await updateIntervention.mutateAsync({
        id: schedulingId,
        scheduledAt: new Date(scheduleAt).toISOString(),
        ...assignFields,
      });
      toast.success(t('company.calendarPage.toastScheduled'));
      scheduleDispatch({ type: 'RESET' });
      refreshBoard();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.calendarPage.toastScheduleFailed')));
    }
  };

  const handleConvertLead = async (leadId: string, mode: 'intervention' | 'estimate') => {
    try {
      await convertLead.mutateAsync({ id: leadId, mode });
      toast.success(
        mode === 'intervention'
          ? t('company.dashboard.toasts.leadConvertedIntervention')
          : t('company.calendarPage.toastLeadEstimateHint'),
      );
      refreshBoard();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.calendarPage.toastConvertFailed')));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--dashboard-divider)] pb-5">
        <div>
          <h1 className="text-lg font-black tracking-tight text-gray-900">
            {t('company.calendarPage.title')}
          </h1>
          <p className="mt-1 text-xs text-gray-500">{t('company.calendarPage.description', { week: weekLabel })}</p>
        </div>
        <span className={calendarWeekBadgeClass}>
          <CalendarBlankIcon className="size-4 text-[var(--dashboard-accent)]" weight="fill" />
          {weekLabel}
        </span>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-8">{t('company.calendarPage.loading')}</p>
      ) : (
        <CalendarBoardView
          board={board}
          isManagement={isManagement}
          technicians={technicians}
          schedulingId={schedulingId}
          scheduleAt={scheduleAt}
          scheduleTechnicianId={scheduleTechnicianId}
          assignMode={assignMode}
          scheduleMemberIds={scheduleMemberIds}
          scheduleCrewId={scheduleCrewId}
          onScheduleIdChange={(val) => scheduleDispatch({ type: 'SET_SCHEDULING_ID', payload: val })}
          onScheduleAtChange={(val) => scheduleDispatch({ type: 'SET_SCHEDULE_AT', payload: val })}
          onScheduleTechnicianChange={(val) => scheduleDispatch({ type: 'SET_SCHEDULE_TECHNICIAN_ID', payload: val })}
          onAssignModeChange={(val) => scheduleDispatch({ type: 'SET_ASSIGN_MODE', payload: val })}
          onScheduleMemberIdsChange={(val) => scheduleDispatch({ type: 'SET_SCHEDULE_MEMBER_IDS', payload: val })}
          onScheduleCrewIdChange={(val) => scheduleDispatch({ type: 'SET_SCHEDULE_CREW_ID', payload: val })}
          onSubmitSchedule={handleSchedule}
          onCancelSchedule={() => scheduleDispatch({ type: 'RESET' })}
          onConvertLead={handleConvertLead}
        />
      )}
    </div>
  );
}
