import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WrenchIcon } from '@phosphor-icons/react';
import {
  Panel,
  PanelHeader,
  EmptyState,
  cabinetBtnPrimary,
} from '@/widgets/cabinet/cabinet-ui';
import type { CompanyLeadDto } from '@/entities/fsm/model/types';
import { useLocale } from '@/shared/hooks/useLocale';
import { formatRelativeTimeLocalized } from '@/shared/utils/date';
import {
  dashboardPanelHeaderClass,
  dashboardPanelListClass,
  dashboardPanelRowClass,
  dashboardPanelShellClass,
  dashboardSourceTagClass,
} from './dashboardPanelList';

const SOURCE_SHORT_KEYS: Record<CompanyLeadDto['source'], string> = {
  SERVICE_REQUEST: 'SITE',
  PROJECT_REQUEST: 'PROIECT',
  MANUAL: 'MANUAL',
  PHONE: 'TELEFON',
  WEBSITE: 'SITE',
  BOOKING: 'PROGRAMARE',
};

function LeadRowSkeleton() {
  return (
    <div className={dashboardPanelRowClass}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3.5 w-1/3 rounded bg-gray-200" />
          <div className="h-2.5 w-1/2 rounded bg-gray-100" />
        </div>
        <div className="h-8 w-14 shrink-0 rounded bg-gray-100" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-9 w-32 rounded bg-gray-100" />
        <div className="h-9 w-24 rounded bg-gray-100" />
      </div>
    </div>
  );
}

export function DashboardNewLeadsPanel({
  leads,
  convertPending,
  onConvert,
  isLoading = false,
}: {
  leads: CompanyLeadDto[] | undefined;
  convertPending: boolean;
  onConvert: (leadId: string, mode: 'intervention' | 'estimate') => void;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocale();
  const pendingCount = leads?.length ?? 0;

  return (
    <Panel className={dashboardPanelShellClass}>
      <div className={dashboardPanelHeaderClass}>
        <PanelHeader
          className="mb-0"
          title={t('company.dashboard.panels.newLeads.title')}
          meta={
            pendingCount > 0 ? (
              <span className="text-xs font-semibold text-gray-500">
                {t('company.dashboard.panels.newLeads.pending', { count: pendingCount })}
              </span>
            ) : null
          }
          action={
            <Link
              to="/company/cereri"
              className="text-xs font-semibold text-[var(--dashboard-accent)] hover:opacity-80"
            >
              {t('company.dashboard.panels.newLeads.viewAll')}
            </Link>
          }
        />
      </div>

      {isLoading && !leads?.length ? (
        <div className={`animate-pulse ${dashboardPanelListClass}`}>
          {Array.from({ length: 3 }).map((_, index) => (
            <LeadRowSkeleton key={index} />
          ))}
        </div>
      ) : !leads?.length ? (
        <div className={dashboardPanelRowClass}>
          <EmptyState message={t('company.dashboard.panels.newLeads.empty')} />
        </div>
      ) : (
        <div className={dashboardPanelListClass}>
          {leads.slice(0, 5).map((lead) => (
            <div key={lead.id} className={dashboardPanelRowClass}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-gray-900">{lead.contactName}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {lead.contactPhone}
                    {lead.contactEmail ? ` · ${lead.contactEmail}` : ''}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={dashboardSourceTagClass}>{SOURCE_SHORT_KEYS[lead.source]}</span>
                  <p className="mt-1 text-[11px] text-gray-400">
                    {formatRelativeTimeLocalized(lead.createdAt, locale)}
                  </p>
                </div>
              </div>

              {lead.serviceTitle ? (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[var(--dashboard-accent)]">
                  <WrenchIcon className="size-3.5 shrink-0" />
                  {lead.serviceTitle}
                </p>
              ) : null}

              {lead.message ? (
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500 line-clamp-2">
                  {lead.message}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
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
                  className="inline-flex cursor-pointer items-center justify-center border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-50"
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
