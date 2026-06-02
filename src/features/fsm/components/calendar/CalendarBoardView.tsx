import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  EmptyState,
  SoftBadge,
  Panel,
  PanelHeader,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/widgets/cabinet/cabinet-ui';
import type { CalendarBoardDto, CompanyLeadDto, CompanyMemberDto, InterventionDto } from '@/entities/fsm/model/types';
import { leadStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { InterventionCard } from './InterventionCard';
import { ScheduledColumn } from './ScheduledColumn';

export function CalendarBoardView({
  board,
  isManagement,
  technicians,
  schedulingId,
  scheduleAt,
  scheduleTechnicianId,
  assignMode,
  scheduleMemberIds,
  scheduleCrewId,
  onScheduleIdChange,
  onScheduleAtChange,
  onScheduleTechnicianChange,
  onAssignModeChange,
  onScheduleMemberIdsChange,
  onScheduleCrewIdChange,
  onSubmitSchedule,
  onCancelSchedule,
  onConvertLead,
}: {
  board: CalendarBoardDto | undefined;
  isManagement: boolean;
  technicians: CompanyMemberDto[];
  schedulingId: string | null;
  scheduleAt: string;
  scheduleTechnicianId: string;
  assignMode: 'single' | 'multiple' | 'crew';
  scheduleMemberIds: string[];
  scheduleCrewId: string;
  onScheduleIdChange: (id: string) => void;
  onScheduleAtChange: (value: string) => void;
  onScheduleTechnicianChange: (value: string) => void;
  onAssignModeChange: (value: 'single' | 'multiple' | 'crew') => void;
  onScheduleMemberIdsChange: (value: string[]) => void;
  onScheduleCrewIdChange: (value: string) => void;
  onSubmitSchedule: () => void;
  onCancelSchedule: () => void;
  onConvertLead: (leadId: string, mode: 'intervention' | 'estimate') => void;
}) {
  const { t } = useTranslation();

  const scheduledMeta = useMemo(
    () => <span className="text-xs text-gray-400">{board?.scheduled.length ?? 0}</span>,
    [board?.scheduled.length],
  );
  const backlogMeta = useMemo(
    () => <span className="text-xs text-gray-400">{board?.unscheduled.length ?? 0}</span>,
    [board?.unscheduled.length],
  );
  const leadsMeta = useMemo(
    () => (
      <Link to="/company/cereri" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
        {t('company.fsm.calendar.board.leads.inboxLink')}
      </Link>
    ),
    [t],
  );

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
      <Panel>
        <PanelHeader
          title={t('company.fsm.calendar.board.scheduled.title')}
          meta={scheduledMeta}
        />
        <ScheduledColumn scheduled={board?.scheduled ?? []} />
      </Panel>

      <Panel>
        <PanelHeader
          title={t('company.fsm.calendar.board.backlog.title')}
          meta={backlogMeta}
        />
        {!board?.unscheduled.length ? (
          <EmptyState message={t('company.fsm.calendar.board.backlog.empty')} compact />
        ) : (
          <div className="space-y-3">
            {board.unscheduled.map((item: InterventionDto) => (
              <InterventionCard
                key={item.id}
                item={item}
                canDispatch={isManagement}
                onSchedule={onScheduleIdChange}
                scheduling={schedulingId === item.id}
                scheduleAt={scheduleAt}
                scheduleTechnicianId={scheduleTechnicianId}
                assignMode={assignMode}
                scheduleMemberIds={scheduleMemberIds}
                scheduleCrewId={scheduleCrewId}
                onScheduleAtChange={onScheduleAtChange}
                onScheduleTechnicianChange={onScheduleTechnicianChange}
                onAssignModeChange={onAssignModeChange}
                onScheduleMemberIdsChange={onScheduleMemberIdsChange}
                onScheduleCrewIdChange={onScheduleCrewIdChange}
                onSubmitSchedule={onSubmitSchedule}
                onCancelSchedule={onCancelSchedule}
                technicians={technicians}
              />
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title={t('company.fsm.calendar.board.leads.title')}
          meta={leadsMeta}
        />
        {!board?.openLeads.length ? (
          <EmptyState message={t('company.fsm.calendar.board.leads.empty')} compact />
        ) : (
          <ul className="space-y-3">
            {board.openLeads.map((lead: CompanyLeadDto) => (
              <li key={lead.id} className="rounded-2xl bg-white/70 px-4 py-3 space-y-2">
                <p className="font-semibold text-sm text-gray-900">{lead.contactName}</p>
                <p className="text-xs text-gray-500">{lead.contactPhone}</p>
                {lead.serviceTitle ? (
                  <p className="text-xs font-semibold text-violet-600">{lead.serviceTitle}</p>
                ) : null}
                <SoftBadge tone="amber">{leadStatusLabel(lead.status, t)}</SoftBadge>
                {isManagement ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onConvertLead(lead.id, 'intervention')}
                      className={cabinetBtnPrimary}
                    >
                      {t('company.fsm.calendar.board.leads.convertIntervention')}
                    </button>
                    <Link to="/company/cereri" className={cabinetBtnSecondary}>
                      {t('company.fsm.calendar.board.leads.convertEstimate')}
                    </Link>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
