import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useMySubscriptionQuery,
  useSubscriptionPlansQuery,
  useClaimFreePlanMutation,
} from '@/entities/subscription/api/useSubscriptions';
import { PlanCards } from '@/features/subscriptions';
import type { CompanyPlanDto, CompanySubscriptionDto, ClaimableSubscriptionPlanCode, CompanySubscriptionPlanCode } from '@/entities/subscription/model/types';
import {
  isOnFreePlan,
  isProToBusinessUpgrade,
} from '@/entities/subscription/model/subscriptionPlan';
import { useLocalizedPath } from '@/shared/hooks/useLocalizedPath';
import { usePublicAuthCta } from '@/features/auth';
import { SEOHead } from '@/shared/ui/seo/SEOHead';
import { LoadingStatus } from '@/shared/ui/LoadingStatus';
import { PublicPageHeader } from '@/shared/ui/PublicPageHeader';
import { SkeletonPlanCards } from '@/widgets/cabinet/cabinet-ui';
import toast from 'react-hot-toast';
import { useState } from 'react';

export function SubscriptionsPage() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const { data, isLoading, isError } = useSubscriptionPlansQuery();
  const { isAuthed, user, cabinetRoute, planCardCta } = usePublicAuthCta();
  const isEndClient = user?.accountKind === 'END_CLIENT';
  const hasCompany = user?.accountKind === 'COMPANY_STAFF' && !!user.activeCompanyId;
  const { data: subData, isLoading: isSubscriptionLoading } = useMySubscriptionQuery();
  const claimFree = useClaimFreePlanMutation();
  const [claimingPlanCode, setClaimingPlanCode] = useState<CompanySubscriptionPlanCode | null>(null);

  if (isAuthed && isEndClient) {
    return <Navigate to="/portal" replace />;
  }

  const subscriptionLinkRoute = hasCompany ? '/company/subscription' : cabinetRoute;

  const plans = (data ?? []) as CompanyPlanDto[];
  const subscription = subData as CompanySubscriptionDto | null | undefined;
  const currentPlanCode = hasCompany ? subscription?.plan?.code : undefined;
  const onFreePlan = isOnFreePlan(currentPlanCode);
  const awaitingSubscription = hasCompany && isSubscriptionLoading;

  const handleClaimFree = async (planCode: ClaimableSubscriptionPlanCode) => {
    setClaimingPlanCode(planCode);
    try {
      await claimFree.mutateAsync(planCode);
      toast.success(
        isProToBusinessUpgrade(currentPlanCode, planCode)
          ? t('subscriptions.toast.businessActivated')
          : t('subscriptions.toast.planActivated', { planCode }),
      );
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || t('subscriptions.toast.activateError'));
    } finally {
      setClaimingPlanCode(null);
    }
  };

  const seoTitle = `${t('subscriptions.title')} ${t('subscriptions.titleHighlight')}`;

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={t('subscriptions.description')}
        hreflang
      />

      <div className="max-w-5xl mx-auto space-y-12 py-10 animate-fade-in">
        <PublicPageHeader
          badge={t('subscriptions.badge')}
          title={
            <>
              {t('subscriptions.title')}{' '}
              <span className="text-violet-600">{t('subscriptions.titleHighlight')}</span>
            </>
          }
          description={t('subscriptions.description')}
        />
        {isAuthed ? (
          <p className="text-center -mt-8">
            <Link
              to={subscriptionLinkRoute}
              className="text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              {t('subscriptions.activeSubscriptionLink')}
            </Link>
          </p>
        ) : null}

        {(isLoading || awaitingSubscription) && (
          <LoadingStatus label={t('subscriptions.loading')}>
            <SkeletonPlanCards />
          </LoadingStatus>
        )}

        {isError && (
          <div className="text-center bg-red-50 border border-red-100 p-6 text-sm text-red-600 font-semibold">
            {t('subscriptions.loadError')}
          </div>
        )}

        {!isLoading && !awaitingSubscription && !isError && plans.length > 0 && (
          <div className="space-y-4">
            {hasCompany && !onFreePlan ? (
              <p className="text-center text-sm font-semibold text-gray-700">
                {t('subscriptions.activePlanPrefix')}{' '}
                <strong>{subscription?.plan.name}</strong>
              </p>
            ) : null}
            <PlanCards
              plans={plans}
              currentPlanCode={currentPlanCode}
              ctaMode={hasCompany ? 'cabinet' : 'public'}
              authCta={!hasCompany && isAuthed ? planCardCta : null}
              claimingPlanCode={claimingPlanCode}
              onClaimFree={hasCompany ? handleClaimFree : undefined}
            />
          </div>
        )}

        <section className="border border-gray-100 p-8 glass-panel text-center space-y-3">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">
            {t('subscriptions.customPlan.title')}
          </h2>
          <p className="text-sm text-gray-500 font-medium max-w-xl mx-auto">
            {t('subscriptions.customPlan.description')}
          </p>
          <Link
            to={lp('/contacts')}
            className="inline-block mt-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-6 py-3"
          >
            {t('subscriptions.customPlan.cta')}
          </Link>
        </section>
      </div>
    </>
  );
}
