import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Panel,
  PanelHeader,
  EmptyState,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/widgets/cabinet/cabinet-ui';
import type { CompanyLeadDto } from '@/entities/fsm/model/types';

export function DashboardNewLeadsPanel({
  leads,
  convertPending,
  onConvert,
}: {
  leads: CompanyLeadDto[] | undefined;
  convertPending: boolean;
  onConvert: (leadId: string, mode: 'intervention' | 'estimate') => void;
}) {
  const { t } = useTranslation();

  return (
    <Panel className="h-full">
      <PanelHeader
        title={t('company.dashboard.panels.newLeads.title')}
        action={
          <Link to="/company/cereri" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
            {t('company.dashboard.panels.newLeads.viewAll')}
          </Link>
        }
      />

      {!leads?.length ? (
        <EmptyState message={t('company.dashboard.panels.newLeads.empty')} />
      ) : (
        <div className="space-y-3">
          {leads.slice(0, 5).map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl bg-white/70 px-4 py-3.5 space-y-2.5 transition-colors hover:bg-violet-50/40"
            >
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{lead.contactName}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lead.contactPhone}
                  {lead.contactEmail ? ` · ${lead.contactEmail}` : ''}
                </p>
                {lead.serviceTitle ? (
                  <p className="text-xs font-semibold text-violet-600 mt-1">{lead.serviceTitle}</p>
                ) : null}
                {lead.message ? (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{lead.message}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onConvert(lead.id, 'intervention')}
                  disabled={convertPending}
                  className={cabinetBtnPrimary}
                >
                  {t('company.dashboard.panels.newLeads.convertToIntervention')}
                </button>
                <button
                  type="button"
                  onClick={() => onConvert(lead.id, 'estimate')}
                  disabled={convertPending}
                  className={cabinetBtnSecondary}
                >
                  {t('company.dashboard.panels.newLeads.convertToEstimate')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
