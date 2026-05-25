import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useCalendarBoardQuery,
  useUpdateInterventionMutation,
  useUpdateInterventionStatusMutation,
  useConvertLeadMutation,
} from '@/features/fsm/api/useFsm';
import { useCompanyMembersQuery } from '@/features/companies/api/useCompanies';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
import type { CalendarBoardDto, CompanyLeadDto, InterventionDto, CompanyMemberDto } from '@/features/fsm/types';
import {
  PageHero,
  EmptyState,
  SoftBadge,
  Panel,
  PanelHeader,
  cabinetPanelClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetSelectClass,
} from '@/components/cabinet/cabinet-ui';
import { cn } from '@/lib/utils';
import { memberDisplayName, technicianDisplayName, filterAssignableTechnicians } from '@/features/companies/teamRoles';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';

type ScheduledIntervention = InterventionDto & { scheduledAt: string };

function getWeekRange(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

function statusTone(status: string): 'gray' | 'violet' | 'blue' | 'amber' | 'emerald' {
  switch (status) {
    case 'SCHEDULED':
      return 'violet';
    case 'EN_ROUTE':
    case 'IN_PROGRESS':
      return 'amber';
    case 'COMPLETED':
    case 'PAID':
      return 'emerald';
    case 'INVOICED':
      return 'blue';
    default:
      return 'gray';
  }
}

function InterventionCard({
  item,
  onSchedule,
  scheduling,
  scheduleAt,
  scheduleTechnicianId,
  onScheduleAtChange,
  onScheduleTechnicianChange,
  onSubmitSchedule,
  onCancelSchedule,
  technicians,
  canDispatch,
}: {
  item: InterventionDto;
  onSchedule?: (id: string) => void;
  scheduling?: boolean;
  scheduleAt?: string;
  scheduleTechnicianId?: string;
  onScheduleAtChange?: (value: string) => void;
  onScheduleTechnicianChange?: (value: string) => void;
  onSubmitSchedule?: () => void;
  onCancelSchedule?: () => void;
  technicians?: CompanyMemberDto[];
  canDispatch?: boolean;
}) {
  return (
    <article className={cn(cabinetPanelClass, 'p-4 space-y-3 hover:shadow-md transition-shadow')}>
      <div className="flex justify-between items-start gap-2">
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
          {item.number}
        </span>
        <SoftBadge tone={statusTone(item.status)}>{item.status}</SoftBadge>
      </div>
      <p className="font-semibold text-gray-900 text-sm">{item.type}</p>
      <p className="text-xs text-gray-500">📍 {item.address}</p>
      <div className="bg-slate-50/80 p-3 rounded-xl text-xs text-gray-700 space-y-1.5">
        <div>
          <span className="text-gray-400 text-[10px] uppercase tracking-wide block mb-0.5">
            Beneficiar
          </span>
          {item.customer?.fullName}
        </div>
        <div>
          <span className="text-gray-400 text-[10px] uppercase tracking-wide block mb-0.5">
            Tehnician
          </span>
          {technicianDisplayName(item.technician)}
        </div>
      </div>
      {item.scheduledAt ? (
        <div className="pt-2 flex justify-between items-center text-xs text-gray-400 border-t border-gray-100/80">
          <span className="font-medium">Ora programată</span>
          <span className="font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
            {new Date(item.scheduledAt).toLocaleTimeString('ro-MD', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      ) : null}
      {canDispatch && onSchedule && !item.scheduledAt ? (
        scheduling ? (
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <input
              type="datetime-local"
              value={scheduleAt ?? ''}
              onChange={(e) => onScheduleAtChange?.(e.target.value)}
              className={cabinetFieldClass}
            />
            <select
              value={scheduleTechnicianId ?? ''}
              onChange={(e) => onScheduleTechnicianChange?.(e.target.value)}
              className={cabinetSelectClass}
            >
              <option value="">Fără tehnician</option>
              {technicians?.map((member) => (
                <option key={member.id} value={member.id}>
                  {memberDisplayName(member)}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={onSubmitSchedule} className={cabinetBtnPrimary}>
                Salvează
              </button>
              <button type="button" onClick={onCancelSchedule} className={cabinetBtnSecondary}>
                Anulează
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => onSchedule(item.id)} className={cabinetBtnSecondary}>
            Programează
          </button>
        )
      ) : null}
    </article>
  );
}

function ScheduledColumn({ scheduled }: { scheduled: CalendarBoardDto['scheduled'] }) {
  const grouped = useMemo(() => {
    const items = scheduled.filter((item): item is ScheduledIntervention => !!item.scheduledAt);
    return items.reduce<Record<string, ScheduledIntervention[]>>((acc, item) => {
      const dateStr = new Date(item.scheduledAt).toLocaleDateString('ro-MD', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(item);
      return acc;
    }, {});
  }, [scheduled]);

  if (scheduled.length === 0) {
    return <EmptyState message="Nicio lucrare programată în această săptămână." />;
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([dateStr, items]) => (
        <section key={dateStr} className="space-y-3">
          <SoftBadge tone="violet">📅 {dateStr}</SoftBadge>
          <div className="space-y-3">
            {items.map((item) => (
              <InterventionCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

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

  const weekLabel = useMemo(() => {
    const start = new Date(from);
    const end = new Date(to);
    return `${start.toLocaleDateString('ro-MD', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('ro-MD', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }, [from, to]);

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
      await updateStatus.mutateAsync({ id: schedulingId, status: 'SCHEDULED' });
      toast.success('Lucrare programată.');
      setSchedulingId(null);
      setScheduleAt('');
      setScheduleTechnicianId('');
      refreshBoard();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Nu s-a putut programa lucrarea.');
    }
  };

  const handleConvertLead = async (leadId: string, mode: 'intervention' | 'estimate') => {
    try {
      await convertLead.mutateAsync({ id: leadId, mode });
      toast.success(mode === 'intervention' ? 'Cerere preluată ca lucrare.' : 'Deschideți pagina Cereri pentru smetă.');
      refreshBoard();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Nu s-a putut converti cererea.');
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <Panel className="xl:col-span-5 p-5">
            <PanelHeader title="Programate" meta={<span className="text-xs text-gray-400">{board?.scheduled.length ?? 0}</span>} />
            <ScheduledColumn scheduled={board?.scheduled ?? []} />
          </Panel>

          <Panel className="xl:col-span-4 p-5">
            <PanelHeader
              title="Backlog (neprogramate)"
              meta={<span className="text-xs text-gray-400">{board?.unscheduled.length ?? 0}</span>}
            />
            {!board?.unscheduled.length ? (
              <EmptyState message="Toate lucrările active au dată setată." />
            ) : (
              <div className="space-y-3">
                {board.unscheduled.map((item: InterventionDto) => (
                  <InterventionCard
                    key={item.id}
                    item={item}
                    canDispatch={isManagement}
                    onSchedule={setSchedulingId}
                    scheduling={schedulingId === item.id}
                    scheduleAt={scheduleAt}
                    scheduleTechnicianId={scheduleTechnicianId}
                    onScheduleAtChange={setScheduleAt}
                    onScheduleTechnicianChange={setScheduleTechnicianId}
                    onSubmitSchedule={handleSchedule}
                    onCancelSchedule={() => {
                      setSchedulingId(null);
                      setScheduleAt('');
                      setScheduleTechnicianId('');
                    }}
                    technicians={technicians}
                  />
                ))}
              </div>
            )}
          </Panel>

          <Panel className="xl:col-span-3 p-5">
            <PanelHeader
              title="Cereri deschise"
              meta={
                <Link to="/company/cereri" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                  Inbox →
                </Link>
              }
            />
            {!board?.openLeads.length ? (
              <EmptyState message="Nicio cerere deschisă." />
            ) : (
              <ul className="space-y-3">
                {board.openLeads.map((lead: CompanyLeadDto) => (
                  <li key={lead.id} className="rounded-2xl bg-white/70 px-4 py-3 space-y-2">
                    <p className="font-semibold text-sm text-gray-900">{lead.contactName}</p>
                    <p className="text-xs text-gray-500">{lead.contactPhone}</p>
                    {lead.packageTitle ? (
                      <p className="text-xs font-semibold text-violet-600">{lead.packageTitle}</p>
                    ) : null}
                    <SoftBadge tone="amber">{lead.status}</SoftBadge>
                    {isManagement ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleConvertLead(lead.id, 'intervention')}
                          className={cabinetBtnPrimary}
                        >
                          → Lucrare
                        </button>
                        <Link to="/company/cereri" className={cabinetBtnSecondary}>
                          → Smetă
                        </Link>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
