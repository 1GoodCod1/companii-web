import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Calendar, Hammer, MapPin, Phone, User } from 'lucide-react';
import { EmptyState, PageHero, Panel, SoftBadge } from '@/widgets/cabinet/cabinet-ui';
import { useMyAssignedWorksheetsQuery } from '@/features/estimates';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { interventionStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';

/**
 * N-04: shortcut list for field technicians (MEMBER role).
 * Renders the assigned worksheets returned by F-04 endpoint
 * `GET /estimates/worksheets/my`. Stripped of all financial data.
 */
export function MyWorksheetsPage() {
  const { t } = useTranslation();
  const { role } = useCompanyPermissions();
  const isMember = role === 'MEMBER';

  const { data, isLoading, isError } = useMyAssignedWorksheetsQuery(isMember);

  if (!isMember) {
    return (
      <EmptyState
        message={t('company.myWorksheets.notForRole')}
        action={
          <Link to="/company/lucrari" className="text-violet-600 font-semibold">
            {t('company.workSheetPage.backToJobs')}
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        title={t('company.myWorksheets.title')}
        description={t('company.myWorksheets.description')}
      />

      {isLoading ? (
        <p className="p-8 text-sm text-gray-400">{t('company.workSheetPage.loading')}</p>
      ) : isError ? (
        <EmptyState message={t('company.myWorksheets.loadError')} />
      ) : !data?.length ? (
        <EmptyState message={t('company.myWorksheets.empty')} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {data.map((item) => {
            const scheduled = item.intervention.scheduledAt
              ? new Date(item.intervention.scheduledAt).toLocaleString('ro-MD', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })
              : null;

            return (
              <Link
                key={item.intervention.id}
                to={`/company/lucrari/${item.intervention.id}/fisa`}
                className="block"
              >
                <Panel className="p-5 hover:shadow-md transition-shadow space-y-3 border border-transparent hover:border-violet-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {item.intervention.number}
                      </p>
                      <p className="font-bold text-gray-900 mt-0.5 truncate">
                        {item.project?.title ?? item.intervention.type}
                      </p>
                      {item.project?.category && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.project.category.name}
                        </p>
                      )}
                    </div>
                    <SoftBadge tone="violet">
                      {interventionStatusLabel(item.intervention.status, t)}
                    </SoftBadge>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600">
                    {item.customer && (
                      <>
                        <div className="flex items-center gap-1.5">
                          <User className="size-3.5 text-gray-400" />
                          {item.customer.fullName}
                        </div>
                        <a
                          href={`tel:${item.customer.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-violet-700 hover:underline"
                        >
                          <Phone className="size-3.5 text-violet-500" />
                          {item.customer.phone}
                        </a>
                      </>
                    )}
                    {item.intervention.address && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="size-3.5 text-gray-400 mt-0.5 shrink-0" />
                        <span>{item.intervention.address}</span>
                      </div>
                    )}
                    {scheduled && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-gray-400" />
                        {scheduled}
                      </div>
                    )}
                    {item.stage && (
                      <div className="flex items-center gap-1.5 text-violet-700">
                        <Hammer className="size-3.5" />
                        {item.stage.name}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end text-[11px] font-bold text-violet-700">
                    {t('company.myWorksheets.open')}
                    <ArrowRight className="size-3.5 ml-1" />
                  </div>
                </Panel>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
