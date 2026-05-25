import { Link } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
  cabinetBtnPrimary,
} from '@/components/cabinet/cabinet-ui';
import {
  useMySubscriptionQuery,
  useSubscriptionPlansQuery,
  useClaimFreePlanMutation,
} from '@/features/subscriptions/api/useSubscriptions';
import { PlanCards } from '@/features/subscriptions/components/PlanCards';
import type { CompanyPlanDto, CompanySubscriptionDto, CompanySubscriptionPlanCode } from '@/features/subscriptions/types';
import { planPriceLabel } from '@/features/subscriptions/types';
import { useAuthStore } from '@/stores/authStore';
import { CompanyOwnerGate } from '@/features/companies/CompanyManagementGate';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ro-MD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function CompanySubscriptionPage() {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  const { data: plansData, isLoading: plansLoading } = useSubscriptionPlansQuery();
  const { data: subData, isLoading: subLoading } = useMySubscriptionQuery();
  const claimFree = useClaimFreePlanMutation();
  const [claimingPlanCode, setClaimingPlanCode] = useState<CompanySubscriptionPlanCode | null>(null);

  const plans = (plansData ?? []) as CompanyPlanDto[];
  const subscription = subData as CompanySubscriptionDto | null | undefined;
  const currentPlanCode = subscription?.plan?.code;
  const onFreePlan = !currentPlanCode || currentPlanCode === 'FREE';

  const handleClaimFree = async (planCode: Extract<CompanySubscriptionPlanCode, 'PRO' | 'BUSINESS'>) => {
    setClaimingPlanCode(planCode);
    try {
      await claimFree.mutateAsync(planCode);
      const message =
        currentPlanCode === 'PRO' && planCode === 'BUSINESS'
          ? 'Planul Business a fost activat. Pro a fost înlocuit automat.'
          : `Planul ${planCode} a fost activat gratuit pentru 30 de zile!`;
      toast.success(message);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Nu s-a putut activa planul.');
    } finally {
      setClaimingPlanCode(null);
    }
  };

  if (!activeCompanyId) {
    return (
      <div className="max-w-xl space-y-6 animate-fade-in">
        <PageHero
          title="Abonament"
          description="Pentru a gestiona abonamentul, mai întâi trebuie să înregistrezi compania ta."
        />
        <Panel className="max-w-xl">
          <Link to="/company/profile" className={cabinetBtnPrimary}>
            Creează profil companie
          </Link>
        </Panel>
      </div>
    );
  }

  return (
    <CompanyOwnerGate>
    <div className="space-y-6 animate-fade-in">
      <PageHero
        title="Abonament"
        description="Planul tău determină câte module FSM poți folosi: clienți, lucrări, oferte și facturi."
      />

      {subLoading ? (
        <p className="text-sm text-gray-400">Se încarcă abonamentul curent...</p>
      ) : subscription ? (
        <Panel className="max-w-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Plan activ</p>
              <p className="text-xl font-black text-gray-900">{subscription.plan.name}</p>
              <p className="text-sm font-semibold text-violet-600 mt-1">
                {planPriceLabel(subscription.plan)}
              </p>
            </div>
            <SoftBadge tone={subscription.status === 'ACTIVE' || subscription.status === 'TRIAL' ? 'emerald' : 'gray'}>
              {subscription.status === 'TRIAL' ? 'Perioadă probă' : subscription.status}
            </SoftBadge>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Valabil până la:{' '}
            <strong className="text-gray-700">{formatDate(subscription.currentPeriodEnd)}</strong>
          </p>
          {subscription.usage ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                <p className="text-gray-400 font-semibold uppercase tracking-wider">Tehnicieni</p>
                <p className="text-lg font-black text-gray-900 mt-1">
                  {subscription.usage.activeTechnicians + subscription.usage.pendingTechnicianInvites}
                  {subscription.usage.maxTechnicians != null
                    ? ` / ${subscription.usage.maxTechnicians}`
                    : ' · nelimitat'}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                <p className="text-gray-400 font-semibold uppercase tracking-wider">Lucrări luna aceasta</p>
                <p className="text-lg font-black text-gray-900 mt-1">
                  {subscription.usage.interventionsThisMonth}
                  {subscription.usage.maxInterventionsPerMonth != null
                    ? ` / ${subscription.usage.maxInterventionsPerMonth}`
                    : ' · nelimitat'}
                </p>
              </div>
            </div>
          ) : null}
          {onFreePlan ? (
            <p className="text-xs text-violet-700 font-medium mt-3 bg-violet-50 rounded-xl px-4 py-3">
              Sunteți pe planul Free — activați Pro sau Business gratuit pentru 30 de zile.
            </p>
          ) : currentPlanCode === 'PRO' ? (
            <p className="text-xs text-indigo-700 font-medium mt-3 bg-indigo-50 rounded-xl px-4 py-3">
              Puteți trece oricând la Business — planul Pro se anulează automat la upgrade.
            </p>
          ) : null}
        </Panel>
      ) : (
        <EmptyState message="Nu există un abonament activ pentru compania ta." />
      )}

      <Panel>
        <PanelHeader title={onFreePlan ? 'Toate planurile' : 'Planul tău'} />
        {plansLoading ? (
          <p className="text-sm text-gray-400">Se încarcă planurile...</p>
        ) : (
          <PlanCards
            plans={plans}
            currentPlanCode={currentPlanCode}
            ctaMode="cabinet"
            claimingPlanCode={claimingPlanCode}
            onClaimFree={handleClaimFree}
          />
        )}
      </Panel>
    </div>
    </CompanyOwnerGate>
  );
}
