import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Panel, PanelHeader, EmptyState, SoftBadge } from '@/widgets/cabinet/cabinet-ui';
import type { InterventionDto } from '@/entities/fsm/model/types';
import { formatDateLocalized } from '@/shared/utils/date';
import { useLocale } from '@/shared/hooks/useLocale';
import { interventionStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';

export function DashboardActiveInterventionsPanel({
  interventions,
  isManagement,
}: {
  interventions: InterventionDto[];
  isManagement: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <Panel>
      <PanelHeader
        title={t('company.dashboard.panels.activeInterventions.title')}
        action={
          <Link to="/company/lucrari" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
            {t('company.dashboard.panels.activeInterventions.viewAll')}
          </Link>
        }
      />

      {interventions.length === 0 ? (
        <EmptyState
          message={t('company.dashboard.panels.activeInterventions.empty')}
          action={
            <Link to="/company/lucrari" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
              {isManagement
                ? t('company.dashboard.panels.activeInterventions.createIntervention')
                : t('company.dashboard.panels.activeInterventions.viewMyJobs')}
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
                <SoftBadge tone="blue">{interventionStatusLabel(inter.status, t)}</SoftBadge>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  {inter.scheduledAt
                    ? formatDateLocalized(inter.scheduledAt, locale)
                    : t('company.dashboard.panels.activeInterventions.unspecified')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
