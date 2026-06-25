import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PhoneIcon } from '@phosphor-icons/react';
import {
  EmptyState,
  SoftBadge,
  Panel,
  PanelHeader,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/widgets/cabinet/cabinet-ui';
import type { CalendarBoardDto, CompanyLeadDto, CompanyMemberDto, InterventionDto } from '@/entities/fsm/model/types';
import { LEAD_STATUS_TONES } from '@/entities/fsm/model/leads.constants';
import { leadStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { InterventionCard } from './InterventionCard';
import { ScheduledColumn } from './ScheduledColumn';
import {
  calendarCountBadgeClass,
  calendarInboxLinkClass,
  calendarLeadCardClass,
  calendarPanelBodyClass,
  calendarPanelHeaderClass,
  calendarPanelShellClass,
} from './calendarPanelUi';

function ColumnCount({ count }: { count: number }) {
  return <span className={calendarCountBadgeClass}>{count}</span>;
}

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
    () => <ColumnCount count={board?.scheduled.length ?? 0} />,
    [board?.scheduled.length],
  );
  const backlogMeta = useMemo(
    () => <ColumnCount count={board?.unscheduled.length ?? 0} />,
    [board?.unscheduled.length],
  );
  const leadsMeta = useMemo(
    () => (
      <Link to="/company/cereri" className={calendarInboxLinkClass}>
        {t('company.fsm.calendar.board.leads.inboxLink')}
      </Link>
    ),
    [t],
  );

  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
      <Panel className={calendarPanelShellClass}>
        <div className={calendarPanelHeaderClass}>
          <PanelHeader
            className="mb-0"
            title={t('company.fsm.calendar.board.scheduled.title')}
            meta={scheduledMeta}
          />
        </div>
        <div className={calendarPanelBodyClass}>
          <ScheduledColumn scheduled={board?.scheduled ?? []} />
        </div>
      </Panel>

      <Panel className={calendarPanelShellClass}>
        <div className={calendarPanelHeaderClass}>
          <PanelHeader
            className="mb-0"
            title={t('company.fsm.calendar.board.backlog.title')}
            meta={backlogMeta}
          />
        </div>
        <div className={calendarPanelBodyClass}>
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
        </div>
      </Panel>

      <Panel className={calendarPanelShellClass}>
        <div className={calendarPanelHeaderClass}>
          <PanelHeader
            className="mb-0"
            title={t('company.fsm.calendar.board.leads.title')}
            meta={leadsMeta}
          />
        </div>
        <div className={calendarPanelBodyClass}>
          {!board?.openLeads.length ? (
            <EmptyState message={t('company.fsm.calendar.board.leads.empty')} compact />
          ) : (
            <ul className="space-y-3">
              {board.openLeads.map((lead: CompanyLeadDto) => (
                <li key={lead.id} className={calendarLeadCardClass}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-black tracking-tight text-gray-900">{lead.contactName}</p>
                    <SoftBadge tone={LEAD_STATUS_TONES[lead.status]}>
                      {leadStatusLabel(lead.status, t)}
                    </SoftBadge>
                  </div>

                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <PhoneIcon className="size-3.5 shrink-0 text-gray-400" />
                    {lead.contactPhone}
                  </p>

                  {lead.serviceTitle ? (
                    <p className="text-xs font-semibold text-[var(--dashboard-accent)]">
                      {lead.serviceTitle}
                    </p>
                  ) : null}

                  {lead.interventions && lead.interventions.length > 0 ? (
                    <div className="space-y-1 pt-1">
                      {lead.interventions.map((intv) => (
                        <p key={intv.id} className="text-xs">
                          <Link
                            to={`/company/lucrari?selectedId=${intv.id}`}
                            className="font-semibold text-[var(--dashboard-accent)] hover:opacity-80"
                          >
                            {t('company.fsm.leads.inbox.interventionLink', {
                              number: intv.number,
                              type: intv.type,
                            })}
                          </Link>
                        </p>
                      ))}
                    </div>
                  ) : isManagement ? (
                    <div className="flex flex-wrap gap-2 border-t border-[var(--dashboard-divider)] pt-3">
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
        </div>
      </Panel>
    </div>
  );
}
