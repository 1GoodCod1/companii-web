import { Link } from 'react-router-dom';
import { Panel, PanelHeader, EmptyState, SoftBadge } from '@/components/cabinet/cabinet-ui';
import type { InterventionDto } from '@/types/fsm';
import { formatDateRo } from '@/utils/date';

export function DashboardActiveInterventionsPanel({
  interventions,
  isManagement,
}: {
  interventions: InterventionDto[];
  isManagement: boolean;
}) {
  return (
    <Panel>
      <PanelHeader
        title="Lucrări recente active"
        action={
          <Link to="/company/lucrari" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
            Vezi toate
          </Link>
        }
      />

      {interventions.length === 0 ? (
        <EmptyState
          message="Nicio lucrare activă în acest moment."
          action={
            <Link to="/company/lucrari" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
              {isManagement ? '+ Creează lucrare' : 'Vezi lucrările mele'}
            </Link>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {interventions.slice(0, 5).map((inter) => (
            <div
              key={inter.id}
              className="flex justify-between items-center gap-4 rounded-2xl bg-white/70 px-4 py-3.5 transition-colors hover:bg-violet-50/40"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{inter.number}</span>
                <h3 className="font-semibold text-gray-800 text-sm mt-0.5 truncate">{inter.type}</h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{inter.customer?.fullName}</p>
              </div>
              <div className="text-right shrink-0">
                <SoftBadge tone="blue">{inter.status}</SoftBadge>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  {inter.scheduledAt
                    ? formatDateRo(inter.scheduledAt)
                    : 'Nespecificat'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
