import { useMemo, useState } from 'react';
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
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
import { filterAssignableTechnicians } from '@/utils/teamMembers';
import { CalendarBoardView } from '@/features/fsm/components/calendar/CalendarBoardView';
import { formatWeekLabel, getWeekRange } from '@/utils/calendar';
import { INTERVENTION_STATUS } from '@/constants/interventionStatus.constants';
import { getErrorMessage } from '@/utils/errors';

export function CompanyCalendarPage() {
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

  const technicians = useMemo(() => filterAssignableTechnicians(members), [members]);
  const weekLabel = useMemo(() => formatWeekLabel(from, to), [from, to]);

  const refreshBoard = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.fsm.calendarBoard(from, to) });
  };

  const handleSchedule = async () => {
    if (!schedulingId || !scheduleAt) {
      toast.error('Selectați data și ora.');
      return;
    }
    try {
      await updateIntervention.mutateAsync({
        id: schedulingId,
        scheduledAt: new Date(scheduleAt).toISOString(),
        technicianId: scheduleTechnicianId || null,
      });
      await updateStatus.mutateAsync({ id: schedulingId, status: INTERVENTION_STATUS.SCHEDULED });
      toast.success('Lucrare programată.');
      setSchedulingId(null);
      setScheduleAt('');
      setScheduleTechnicianId('');
      refreshBoard();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut programa lucrarea.'));
    }
  };

  const handleConvertLead = async (leadId: string, mode: 'intervention' | 'estimate') => {
    try {
      await convertLead.mutateAsync({ id: leadId, mode });
      toast.success(mode === 'intervention' ? 'Cerere preluată ca lucrare.' : 'Deschideți pagina Cereri pentru smetă.');
      refreshBoard();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut converti cererea.'));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        title="Calendar programări"
        description={`Săptămâna ${weekLabel} — programate, backlog și cereri deschise.`}
      />

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-8">Se încarcă calendarul...</p>
      ) : (
        <CalendarBoardView
          board={board}
          isManagement={isManagement}
          technicians={technicians}
          schedulingId={schedulingId}
          scheduleAt={scheduleAt}
          scheduleTechnicianId={scheduleTechnicianId}
          onScheduleIdChange={setSchedulingId}
          onScheduleAtChange={setScheduleAt}
          onScheduleTechnicianChange={setScheduleTechnicianId}
          onSubmitSchedule={handleSchedule}
          onCancelSchedule={() => {
            setSchedulingId(null);
            setScheduleAt('');
            setScheduleTechnicianId('');
          }}
          onConvertLead={handleConvertLead}
        />
      )}
    </div>
  );
}
