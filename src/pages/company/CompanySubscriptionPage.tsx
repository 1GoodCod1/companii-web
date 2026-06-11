import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { LoadingStatus } from '@/shared/ui/LoadingStatus';
import {
  Panel,
  EmptyState,
  SoftBadge,
  cabinetBtnPrimary,
  SkeletonPlanCards,
} from '@/widgets/cabinet/cabinet-ui';
import {
  useMySubscriptionQuery,
  useSubscriptionPlansQuery,
  useClaimFreePlanMutation,
} from '@/entities/subscription/api/useSubscriptions';
import { PlanCards } from '@/features/subscriptions';
import type {
  ClaimableSubscriptionPlanCode,
  CompanyPlanDto,
  CompanySubscriptionDto,
  CompanySubscriptionPlanCode,
} from '@/entities/subscription/model/types';
import {
  isOnFreePlan,
  isProPlan,
  isProToBusinessUpgrade,
} from '@/entities/subscription/model/subscriptionPlan';
import { planPriceLabel } from '@/entities/subscription/model/subscriptions';
import { useAuthStore } from '@/entities/user/model/authStore';
import { CompanyOwnerGate } from '@/features/companies';
import { formatDateLocalized } from '@/shared/utils/date';
import { useLocale } from '@/shared/hooks/useLocale';

export function CompanySubscriptionPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  const { data: plansData, isLoading: plansLoading } = useSubscriptionPlansQuery();
  const { data: subData, isLoading: subLoading } = useMySubscriptionQuery();
  const claimFree = useClaimFreePlanMutation();
  const [claimingPlanCode, setClaimingPlanCode] = useState<CompanySubscriptionPlanCode | null>(null);

  const plans = (plansData ?? []) as CompanyPlanDto[];
  const subscription = subData as CompanySubscriptionDto | null | undefined;
  const currentPlanCode = subscription?.plan?.code;
  const onFreePlan = isOnFreePlan(currentPlanCode);

  const handleClaimFree = async (planCode: ClaimableSubscriptionPlanCode) => {
    setClaimingPlanCode(planCode);
    try {
      await claimFree.mutateAsync(planCode);
      const message = isProToBusinessUpgrade(currentPlanCode, planCode)
        ? t('company.subscriptionPage.toastBusinessActivated')
        : t('company.subscriptionPage.toastPlanActivated', { plan: planCode });
      toast.success(message);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || t('company.subscriptionPage.toastActivateFailed'));
    } finally {
      setClaimingPlanCode(null);
    }
  };

  if (!activeCompanyId) {
    return (
      <div className="max-w-xl space-y-6 animate-fade-in">
        <Panel className="max-w-xl p-6 space-y-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-gray-900">
              {t('company.subscriptionPage.title')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('company.subscriptionPage.descriptionNoCompany')}
            </p>
          </div>
          <Link to="/company/profile" className={cabinetBtnPrimary}>
            {t('company.subscriptionPage.createProfileBtn')}
          </Link>
        </Panel>
      </div>
    );
  }

  return (
    <CompanyOwnerGate>
    <div className="space-y-6 animate-fade-in">
      {subLoading ? (
        <p className="text-sm text-gray-400">{t('company.subscriptionPage.loading')}</p>
      ) : subscription ? (
        <Panel className="relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {t('company.subscriptionPage.activePlan')}
                </p>
                <SoftBadge tone={subscription.status === 'ACTIVE' || subscription.status === 'TRIAL' ? 'violet' : 'gray'}>
                  {subscription.status === 'TRIAL' ? t('company.subscriptionPage.statusTrial') : subscription.status}
                </SoftBadge>
              </div>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-2xl font-black tracking-tight text-gray-900">{subscription.plan.name}</p>
                <p className="text-sm font-bold text-violet-600">{planPriceLabel(subscription.plan, t)}</p>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {t('company.subscriptionPage.validUntil')}{' '}
                <strong className="text-gray-700">
                  {formatDateLocalized(subscription.currentPeriodEnd, locale, 'long')}
                </strong>
              </p>
            </div>

            {subscription.usage ? (
              <div className="flex flex-wrap gap-3">
                <div className="min-w-[160px] rounded-2xl bg-slate-50 px-5 py-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {t('company.subscriptionPage.technicians')}
                  </p>
                  <p className="mt-1 text-lg font-black text-gray-900">
                    {subscription.usage.activeTechnicians + subscription.usage.pendingTechnicianInvites}
                    {subscription.usage.maxTechnicians != null
                      ? ` / ${subscription.usage.maxTechnicians}`
                      : ` · ${t('company.subscriptionPage.unlimited')}`}
                  </p>
                </div>
                <div className="min-w-[160px] rounded-2xl bg-slate-50 px-5 py-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {t('company.subscriptionPage.jobsThisMonth')}
                  </p>
                  <p className="mt-1 text-lg font-black text-gray-900">
                    {subscription.usage.interventionsThisMonth}
                    {subscription.usage.maxInterventionsPerMonth != null
                      ? ` / ${subscription.usage.maxInterventionsPerMonth}`
                      : ` · ${t('company.subscriptionPage.unlimited')}`}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {onFreePlan ? (
            <p className="relative mt-4 rounded-xl bg-violet-50 px-4 py-3 text-xs font-medium text-violet-700">
              {t('company.subscriptionPage.freePlanHint')}
            </p>
          ) : isProPlan(currentPlanCode) ? (
            <p className="relative mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-xs font-medium text-indigo-700">
              {t('company.subscriptionPage.proUpgradeHint')}
            </p>
          ) : null}
        </Panel>
      ) : (
        <EmptyState message={t('company.subscriptionPage.noSubscription')} />
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-black tracking-tight text-gray-900">
          {onFreePlan ? t('company.subscriptionPage.plansTitleAll') : t('company.subscriptionPage.plansTitle')}
        </h2>
        {plansLoading ? (
          <LoadingStatus label={t('company.subscriptionPage.loadingPlans')}>
            <SkeletonPlanCards />
          </LoadingStatus>
        ) : (
          <PlanCards
            plans={plans}
            currentPlanCode={currentPlanCode}
            ctaMode="cabinet"
            claimingPlanCode={claimingPlanCode}
            onClaimFree={handleClaimFree}
          />
        )}
      </section>
    </div>
    </CompanyOwnerGate>
  );
}
