import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminPendingCompaniesQuery, useAdminStatsQuery, type AdminCompanyDto } from '@/features/admin';
import { AdminCompanyModerationModal } from '@/features/admin';
import { useLocale } from '@/shared/hooks/useLocale';
import { formatDateLocalized } from '@/shared/utils/date';

export function AdminHomePage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data: stats, isLoading: statsLoading } = useAdminStatsQuery();
  const { data: pending, isLoading: pendingLoading } = useAdminPendingCompaniesQuery();
  const [moderationCompanyId, setModerationCompanyId] = useState<string | null>(null);

  const statCards = [
    { label: t('admin.homePage.statsCompanies'), value: stats?.companies ?? 0 },
    { label: t('admin.homePage.statsUsers'), value: stats?.users ?? 0 },
    { label: t('admin.homePage.statsInterventions'), value: stats?.interventions ?? 0 },
    { label: t('admin.homePage.statsWaitlist'), value: stats?.waitlist ?? 0 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('admin.homePage.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('admin.homePage.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="border border-gray-100 rounded-3xl p-5 glass-panel"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {card.label}
            </p>
            <p className="text-3xl font-black text-gray-900 mt-2">
              {statsLoading ? '…' : card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="border border-gray-100 rounded-3xl glass-panel overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xs font-black uppercase tracking-widest text-amber-700">
            {t('admin.homePage.pendingTitle')}
          </h2>
        </div>

        {pendingLoading ? (
          <p className="p-6 text-sm text-gray-400">{t('admin.homePage.loading')}</p>
        ) : !pending?.length ? (
          <p className="p-6 text-sm text-gray-500">{t('admin.homePage.noPending')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left">{t('admin.homePage.colCompany')}</th>
                  <th className="px-6 py-3 text-left">{t('admin.homePage.colOwner')}</th>
                  <th className="px-6 py-3 text-left">{t('admin.homePage.colCity')}</th>
                  <th className="px-6 py-3 text-left">{t('admin.homePage.colCreated')}</th>
                  <th className="px-6 py-3 text-right">{t('admin.homePage.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pending.map((company: AdminCompanyDto) => (
                  <tr key={company.id}>
                    <td className="px-6 py-4 font-semibold text-gray-900">{company.name}</td>
                    <td className="px-6 py-4 text-gray-500">{company.owner?.email ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{company.city?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDateLocalized(company.createdAt, locale)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setModerationCompanyId(company.id)}
                        className="text-[10px] font-black uppercase tracking-wider bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl transition-colors"
                      >
                        {t('admin.homePage.verify')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AdminCompanyModerationModal
        companyId={moderationCompanyId}
        open={!!moderationCompanyId}
        onClose={() => setModerationCompanyId(null)}
      />
    </div>
  );
}
