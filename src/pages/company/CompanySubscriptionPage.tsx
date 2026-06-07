import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { LoadingStatus } from '@/shared/ui/LoadingStatus';
import {
  PageHero,
  Panel,
  PanelHeader,
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
        <PageHero
          title={t('company.subscriptionPage.title')}
          description={t('company.subscriptionPage.descriptionNoCompany')}
        />
        <Panel className="max-w-xl">
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
      <PageHero
        title={t('company.subscriptionPage.title')}
        description={t('company.subscriptionPage.description')}
      />

      {subLoading ? (
        <p className="text-sm text-gray-400">{t('company.subscriptionPage.loading')}</p>
      ) : subscription ? (
        <Panel className="max-w-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">{t('company.subscriptionPage.activePlan')}</p>
              <p className="text-xl font-black text-gray-900">{subscription.plan.name}</p>
              <p className="text-sm font-semibold text-violet-600 mt-1">
                {planPriceLabel(subscription.plan, t)}
              </p>
            </div>
            <SoftBadge tone={subscription.status === 'ACTIVE' || subscription.status === 'TRIAL' ? 'violet' : 'gray'}>
              {subscription.status === 'TRIAL' ? t('company.subscriptionPage.statusTrial') : subscription.status}
            </SoftBadge>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            {t('company.subscriptionPage.validUntil')}{' '}
            <strong className="text-gray-700">
              {formatDateLocalized(subscription.currentPeriodEnd, locale, 'long')}
            </strong>
          </p>
          {subscription.usage ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                <p className="text-gray-400 font-semibold uppercase tracking-wider">
                  {t('company.subscriptionPage.technicians')}
                </p>
                <p className="text-lg font-black text-gray-900 mt-1">
                  {subscription.usage.activeTechnicians + subscription.usage.pendingTechnicianInvites}
                  {subscription.usage.maxTechnicians != null
                    ? ` / ${subscription.usage.maxTechnicians}`
                    : ` · ${t('company.subscriptionPage.unlimited')}`}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                <p className="text-gray-400 font-semibold uppercase tracking-wider">
                  {t('company.subscriptionPage.jobsThisMonth')}
                </p>
                <p className="text-lg font-black text-gray-900 mt-1">
                  {subscription.usage.interventionsThisMonth}
                  {subscription.usage.maxInterventionsPerMonth != null
                    ? ` / ${subscription.usage.maxInterventionsPerMonth}`
                    : ` · ${t('company.subscriptionPage.unlimited')}`}
                </p>
              </div>
            </div>
          ) : null}
          {onFreePlan ? (
            <p className="text-xs text-violet-700 font-medium mt-3 bg-violet-50 rounded-xl px-4 py-3">
              {t('company.subscriptionPage.freePlanHint')}
            </p>
          ) : isProPlan(currentPlanCode) ? (
            <p className="text-xs text-indigo-700 font-medium mt-3 bg-indigo-50 rounded-xl px-4 py-3">
              {t('company.subscriptionPage.proUpgradeHint')}
            </p>
          ) : null}
        </Panel>
      ) : (
        <EmptyState message={t('company.subscriptionPage.noSubscription')} />
      )}

      <Panel>
        <PanelHeader title={onFreePlan ? t('company.subscriptionPage.plansTitleAll') : t('company.subscriptionPage.plansTitle')} />
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
      </Panel>
    </div>
    </CompanyOwnerGate>
  );
}
