import { Link } from 'react-router-dom';
import {
  EmptyState,
  SoftBadge,
  Panel,
  PanelHeader,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import type { CalendarBoardDto, CompanyLeadDto, CompanyMemberDto, InterventionDto } from '@/types/fsm';
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
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <Panel className="xl:col-span-5 p-5">
        <PanelHeader
          title="Programate"
          meta={<span className="text-xs text-gray-400">{board?.scheduled.length ?? 0}</span>}
        />
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
                {lead.serviceTitle ? (
                  <p className="text-xs font-semibold text-violet-600">{lead.serviceTitle}</p>
                ) : null}
                <SoftBadge tone="amber">{lead.status}</SoftBadge>
                {isManagement ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onConvertLead(lead.id, 'intervention')}
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
  );
}
