import { useTranslation } from 'react-i18next';
import { useAdminCompaniesQuery, type AdminCompanyDto } from '@/features/admin/api/useAdmin';
import { useSubscriptionPlansQuery } from '@/features/subscriptions/api/useSubscriptions';
import type { CompanyPlanDto } from '@/types/subscriptions';
import { planPriceLabel } from '@/utils/subscriptions';

export function AdminSubscriptionsPage() {
  const { t } = useTranslation();
  const { data: plansData, isLoading: plansLoading } = useSubscriptionPlansQuery();
  const { data: companies, isLoading: companiesLoading } = useAdminCompaniesQuery();

  const plans = (plansData ?? []) as CompanyPlanDto[];
  const planCounts = plans.map((plan) => ({
    plan,
    count: companies?.filter((c: AdminCompanyDto) => c.subscription?.plan?.code === plan.code).length ?? 0,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('admin.subscriptionsPage.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('admin.subscriptionsPage.description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plansLoading || companiesLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="border border-gray-100 rounded-3xl p-6 glass-panel h-40"
              />
            ))
          : planCounts.map(({ plan, count }) => (
              <article
                key={plan.id}
                className="border border-gray-100 rounded-3xl p-6 glass-panel"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {plan.name}
                </p>
                <p className="text-3xl font-black text-gray-900 mt-2">{count}</p>
                <p className="text-xs text-gray-500 mt-1">{t('admin.subscriptionsPage.activeCompanies')}</p>
                <p className="text-sm font-bold text-violet-600 mt-4">{planPriceLabel(plan, t)}</p>
              </article>
            ))}
      </div>

      <section className="bg-violet-50/70 border border-violet-100 rounded-3xl p-6">
        <h2 className="text-sm font-black text-violet-900">{t('admin.subscriptionsPage.claimFreeTitle')}</h2>
        <p className="text-sm text-violet-800/80 mt-2">{t('admin.subscriptionsPage.claimFreeBody')}</p>
      </section>
    </div>
  );
}
