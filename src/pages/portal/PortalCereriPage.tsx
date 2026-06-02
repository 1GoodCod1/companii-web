import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
} from '@/widgets/cabinet/cabinet-ui';
import { usePortalLeadsQuery } from '@/features/portal';
import { formatDateLocalized } from '@/shared/utils/date';
import { useLocale } from '@/shared/hooks/useLocale';
import { LEAD_STATUS_TONES } from '@/entities/fsm/model/leads.constants';
import { leadStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import type { CompanyLeadDto } from '@/entities/fsm/model/types';

function leadSourceLabel(source: CompanyLeadDto['source'], t: (key: string) => string) {
  return t(`portal.cereriPage.source.${source}`);
}

export function PortalCereriPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data: leads, isLoading, isError } = usePortalLeadsQuery();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow={t('portal.common.eyebrow')}
        title={t('portal.cereriPage.title')}
        description={t('portal.cereriPage.description')}
        action={
          <Link
            to="/companies"
            className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 hover:bg-gray-800 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white transition-colors"
          >
            {t('portal.cereriPage.searchCompanies')}
          </Link>
        }
      />

      <Panel>
        <PanelHeader
          title={t('portal.cereriPage.historyTitle')}
          description={t('portal.cereriPage.historyDescription')}
        />

        {isLoading ? (
          <p className="text-sm text-gray-400 animate-pulse px-4 pb-6">{t('portal.cereriPage.loading')}</p>
        ) : isError ? (
          <EmptyState message={t('portal.cereriPage.loadError')} />
        ) : !leads?.length ? (
          <EmptyState
            message={t('portal.cereriPage.empty')}
            action={
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                {t('portal.cereriPage.emptyHint')}
              </p>
            }
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <article key={lead.id} className="px-4 py-5 sm:px-6 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {lead.serviceTitle || leadSourceLabel(lead.source, t)}
                    </p>
                    <Link
                      to={`/companies/${lead.company.slug}`}
                      className="text-xs font-semibold text-violet-600 hover:underline"
                    >
                      {lead.company.name}
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SoftBadge tone={LEAD_STATUS_TONES[lead.status]}>
                      {leadStatusLabel(lead.status, t)}
                    </SoftBadge>
                    <SoftBadge tone="gray">{leadSourceLabel(lead.source, t)}</SoftBadge>
                  </div>
                </div>

                {lead.message ? (
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                    {lead.message}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
                  {lead.category ? <span>{lead.category.name}</span> : null}
                  {lead.estimatedBudget != null && lead.estimatedBudget > 0 ? (
                    <span className="font-semibold text-violet-700">
                      {t('portal.cereriPage.budget', {
                        amount: Number(lead.estimatedBudget).toLocaleString('ro-MD'),
                      })}
                    </span>
                  ) : null}
                  {lead.address ? <span>{lead.address}</span> : null}
                  <span>
                    {formatDateLocalized(lead.createdAt, locale, 'medium')}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <div className="flex items-start gap-3 px-4 py-5 sm:px-6">
          <ClipboardList className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-gray-500 leading-relaxed">
            <p className="font-semibold text-gray-700">{t('portal.cereriPage.complexProjectsTitle')}</p>
            <p>{t('portal.cereriPage.complexProjectsBody')}</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
