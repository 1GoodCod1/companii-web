import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { PageHero } from '@/components/cabinet/cabinet-ui';
import {
  useCalendarBoardQuery,
  useUpdateInterventionMutation,
  useUpdateInterventionStatusMutation,
  useConvertLeadMutation,
} from '@/features/fsm/api/useFsm';
import { useCompanyMembersQuery } from '@/features/companies/api/useCompanies';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { filterAssignableTechnicians } from '@/utils/teamMembers';
import { CalendarBoardView } from '@/features/fsm/components/calendar/CalendarBoardView';
import { getWeekRange } from '@/utils/calendar';
import { formatWeekRangeLabel } from '@/utils/date';
import { useLocale } from '@/hooks/useLocale';
import { INTERVENTION_STATUS } from '@/constants/interventionStatus.constants';
import { getErrorMessage } from '@/utils/errors';

export function CompanyCalendarPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { from, to } = useMemo(() => getWeekRange(), []);
  const { data: board, isLoading } = useCalendarBoardQuery(from, to);
  const { isManagement } = useCompanyPermissions();
  const { data: members } = useCompanyMembersQuery({ enabled: isManagement });
  const updateIntervention = useUpdateInterventionMutation();
  const updateStatus = useUpdateInterventionStatusMutation();
  const convertLead = useConvertLeadMutation();
  const qc = useQueryClient();

  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleAt, setScheduleAt] = useState('');
  const [scheduleTechnicianId, setScheduleTechnicianId] = useState('');
  const [assignMode, setAssignMode] = useState<'single' | 'multiple' | 'crew'>('single');
  const [scheduleMemberIds, setScheduleMemberIds] = useState<string[]>([]);
  const [scheduleCrewId, setScheduleCrewId] = useState<string>('');

  const technicians = useMemo(() => filterAssignableTechnicians(members), [members]);
  const weekLabel = useMemo(() => formatWeekRangeLabel(from, to, locale), [from, to, locale]);

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
      await updateStatus.mutateAsync({ id: schedulingId, status: INTERVENTION_STATUS.SCHEDULED });
      toast.success(t('company.calendarPage.toastScheduled'));
      setSchedulingId(null);
      setScheduleAt('');
      setScheduleTechnicianId('');
      setAssignMode('single');
      setScheduleMemberIds([]);
      setScheduleCrewId('');
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
      <PageHero
        title={t('company.calendarPage.title')}
        description={t('company.calendarPage.description', { week: weekLabel })}
      />

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
          onScheduleIdChange={setSchedulingId}
          onScheduleAtChange={setScheduleAt}
          onScheduleTechnicianChange={setScheduleTechnicianId}
          onAssignModeChange={setAssignMode}
          onScheduleMemberIdsChange={setScheduleMemberIds}
          onScheduleCrewIdChange={setScheduleCrewId}
          onSubmitSchedule={handleSchedule}
          onCancelSchedule={() => {
            setSchedulingId(null);
            setScheduleAt('');
            setScheduleTechnicianId('');
            setAssignMode('single');
            setScheduleMemberIds([]);
            setScheduleCrewId('');
          }}
          onConvertLead={handleConvertLead}
        />
      )}
    </div>
  );
}
