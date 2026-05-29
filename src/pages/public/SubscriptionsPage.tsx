import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useMySubscriptionQuery,
  useSubscriptionPlansQuery,
  useClaimFreePlanMutation,
} from '@/features/subscriptions/api/useSubscriptions';
import { PlanCards } from '@/features/subscriptions/components/PlanCards';
import type { CompanyPlanDto, CompanySubscriptionDto, ClaimableSubscriptionPlanCode, CompanySubscriptionPlanCode } from '@/types/subscriptions';
import {
  isOnFreePlan,
  isProToBusinessUpgrade,
} from '@/utils/subscriptionPlan';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { usePublicAuthCta } from '@/features/auth/hooks/usePublicAuthCta';
import { SEOHead } from '@/components/seo/SEOHead';
import toast from 'react-hot-toast';
import { useState } from 'react';

export function SubscriptionsPage() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const { data, isLoading, isError } = useSubscriptionPlansQuery();
  const { isAuthed, user, cabinetRoute, planCardCta } = usePublicAuthCta();
  const isEndClient = user?.accountKind === 'END_CLIENT';
  const hasCompany = user?.accountKind === 'COMPANY_STAFF' && !!user.activeCompanyId;
  const { data: subData } = useMySubscriptionQuery();
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
        <section className="text-center space-y-4">
          <span className="inline-block text-xs font-black uppercase tracking-widest text-violet-700 bg-violet-50 border border-violet-100 px-3.5 py-1.5 rounded-full shadow-xs">
            {t('subscriptions.badge')}
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-gray-900">
            {t('subscriptions.title')}{' '}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              {t('subscriptions.titleHighlight')}
            </span>
          </h1>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
            {t('subscriptions.description')}
          </p>
          {isAuthed && (
            <Link
              to={subscriptionLinkRoute}
              className="inline-block mt-2 text-xs font-black uppercase tracking-wider text-violet-600 hover:text-violet-700"
            >
              {t('subscriptions.activeSubscriptionLink')}
            </Link>
          )}
        </section>

        {isLoading && (
          <p className="text-center text-sm text-gray-400 font-medium">{t('subscriptions.loading')}</p>
        )}

        {isError && (
          <div className="text-center bg-red-50 border border-red-100 rounded-2xl p-6 text-sm text-red-600 font-semibold">
            {t('subscriptions.loadError')}
          </div>
        )}

        {!isLoading && !isError && plans.length > 0 && (
          <div className="space-y-4">
            {hasCompany && !onFreePlan ? (
              <p className="text-center text-sm font-semibold text-emerald-700">
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

        <section className="border border-gray-100 rounded-3xl p-8 glass-panel text-center space-y-3">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">
            {t('subscriptions.customPlan.title')}
          </h2>
          <p className="text-sm text-gray-500 font-medium max-w-xl mx-auto">
            {t('subscriptions.customPlan.description')}
          </p>
          <Link
            to={lp('/contacts')}
            className="inline-block mt-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl transition-all"
          >
            {t('subscriptions.customPlan.cta')}
          </Link>
        </section>
      </div>
    </>
  );
}
