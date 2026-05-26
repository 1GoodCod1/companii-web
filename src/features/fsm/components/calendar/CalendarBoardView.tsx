import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  EmptyState,
  SoftBadge,
  Panel,
  PanelHeader,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import type { CalendarBoardDto, CompanyLeadDto, CompanyMemberDto, InterventionDto } from '@/types/fsm';
import { leadStatusLabel } from '@/utils/i18nStatusLabels';
import { InterventionCard } from './InterventionCard';
import { ScheduledColumn } from './ScheduledColumn';

export function CalendarBoardView({
  board,
  isManagement,
  technicians,
  schedulingId,
  scheduleAt,
  scheduleTechnicianId,
  onScheduleIdChange,
  onScheduleAtChange,
  onScheduleTechnicianChange,
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
  onScheduleIdChange: (id: string) => void;
  onScheduleAtChange: (value: string) => void;
  onScheduleTechnicianChange: (value: string) => void;
  onSubmitSchedule: () => void;
  onCancelSchedule: () => void;
  onConvertLead: (leadId: string, mode: 'intervention' | 'estimate') => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <Panel className="xl:col-span-5 p-5">
        <PanelHeader
          title={t('company.fsm.calendar.board.scheduled.title')}
          meta={<span className="text-xs text-gray-400">{board?.scheduled.length ?? 0}</span>}
        />
        <ScheduledColumn scheduled={board?.scheduled ?? []} />
      </Panel>

      <Panel className="xl:col-span-4 p-5">
        <PanelHeader
          title={t('company.fsm.calendar.board.backlog.title')}
          meta={<span className="text-xs text-gray-400">{board?.unscheduled.length ?? 0}</span>}
        />
        {!board?.unscheduled.length ? (
          <EmptyState message={t('company.fsm.calendar.board.backlog.empty')} />
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
                onScheduleAtChange={onScheduleAtChange}
                onScheduleTechnicianChange={onScheduleTechnicianChange}
                onSubmitSchedule={onSubmitSchedule}
                onCancelSchedule={onCancelSchedule}
                technicians={technicians}
              />
            ))}
          </div>
        )}
      </Panel>

      <Panel className="xl:col-span-3 p-5">
        <PanelHeader
          title={t('company.fsm.calendar.board.leads.title')}
          meta={
            <Link to="/company/cereri" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
              {t('company.fsm.calendar.board.leads.inboxLink')}
            </Link>
          }
        />
        {!board?.openLeads.length ? (
          <EmptyState message={t('company.fsm.calendar.board.leads.empty')} />
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
