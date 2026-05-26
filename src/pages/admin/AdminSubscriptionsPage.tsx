import { useAdminCompaniesQuery, type AdminCompanyDto } from '@/features/admin/api/useAdmin';
import { useSubscriptionPlansQuery } from '@/features/subscriptions/api/useSubscriptions';
import type { CompanyPlanDto } from '@/types/subscriptions';
import { planPriceLabel } from '@/utils/subscriptions';

export function AdminSubscriptionsPage() {
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
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Abonamente</h1>
        <p className="text-gray-500 text-sm mt-1">
          Planurile disponibile și distribuția companiilor pe tier-uri.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plansLoading || companiesLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl p-6 shadow-premium h-40"
              />
            ))
          : planCounts.map(({ plan, count }) => (
              <article
                key={plan.id}
                className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl p-6 shadow-premium"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {plan.name}
                </p>
                <p className="text-3xl font-black text-gray-900 mt-2">{count}</p>
                <p className="text-xs text-gray-500 mt-1">companii active</p>
                <p className="text-sm font-bold text-violet-600 mt-4">{planPriceLabel(plan)}</p>
              </article>
            ))}
      </div>

      <section className="bg-violet-50/70 border border-violet-100 rounded-3xl p-6">
        <h2 className="text-sm font-black text-violet-900">Claim Free (cabinet companie)</h2>
        <p className="text-sm text-violet-800/80 mt-2">
          Proprietarii companiilor pot activa gratuit planul Pro sau Business timp de 30 de zile
          direct din pagina Abonament, dacă sunt pe planul Free. După activare, meniul FSM se
          actualizează automat conform permisiunilor planului.
        </p>
      </section>
    </div>
  );
}
