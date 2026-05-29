import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { ClaimableSubscriptionPlanCode, CompanyPlanDto, CompanySubscriptionPlanCode } from '@/types/subscriptions';
import type { PublicAuthCta } from '@/features/auth/hooks/usePublicAuthCta';
import { canActivatePlan, plansForDisplay } from '@/config/planEntitlements';
import { planFeatures } from '@/utils/subscriptions';
import {
  isBusinessPlan,
  isClaimablePlanCode,
  isFreePlan,
  isProPlan,
} from '@/utils/subscriptionPlan';
import {
  PLAN_ACCENTS,
  SUBSCRIPTION_PLAN,
} from '@/constants/subscriptions.constants';

function planPriceLabelI18n(
  t: (key: string, options?: Record<string, unknown>) => string,
  plan: CompanyPlanDto,
): string {
  const amount = Number(plan.price);
  if (amount === 0) return t('subscriptions.planCards.priceFree');
  return t('subscriptions.planCards.pricePerMonth', {
    amount,
    currency: plan.currency || 'MDL',
  });
}

export function PlanCards({
  plans,
  currentPlanCode,
  ctaMode = 'public',
  onClaimFree,
  claimingPlanCode,
  authCta = null,
}: {
  plans: CompanyPlanDto[];
  currentPlanCode?: CompanySubscriptionPlanCode;
  ctaMode?: 'public' | 'cabinet';
  onClaimFree?: (planCode: ClaimableSubscriptionPlanCode) => void;
  claimingPlanCode?: CompanySubscriptionPlanCode | null;
  authCta?: PublicAuthCta | null;
}) {
  const { t } = useTranslation();
  const visiblePlans = plansForDisplay(plans, currentPlanCode);
  const singlePlan = visiblePlans.length === 1;

  return (
    <div
      className={cn(
        'grid gap-6',
        singlePlan ? 'grid-cols-1 max-w-lg mx-auto' : 'grid-cols-1 md:grid-cols-3',
      )}
    >
      {visiblePlans.map((plan) => {
        const accent = PLAN_ACCENTS[plan.code];
        const isCurrent = currentPlanCode === plan.code;
        const isPopular = plan.code === SUBSCRIPTION_PLAN.PRO && !isCurrent;
        const isClaimable =
          ctaMode === 'cabinet' &&
          !!onClaimFree &&
          canActivatePlan(currentPlanCode, plan.code) &&
          !isCurrent;
        const isClaiming = claimingPlanCode === plan.code;

        const claimableTarget = isClaimablePlanCode(plan.code) ? plan.code : null;

        return (
          <article
            key={plan.id}
            className={cn(
              'relative rounded-3xl border p-6 glass-panel flex flex-col',
              accent.ring,
              isCurrent && 'ring-2 ring-emerald-200 border-emerald-200',
            )}
          >
            {isCurrent && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white px-3 py-1 rounded-full shadow-xs">
                {t('subscriptions.planCards.activePlan')}
              </span>
            )}

            {isPopular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3 py-1 rounded-full shadow-xs">
                {t('subscriptions.planCards.recommended')}
              </span>
            )}

            <div className="mb-4">
              <span
                className={`inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${accent.badge}`}
              >
                {plan.name}
              </span>
              <p className="mt-4 text-3xl font-black text-gray-900 tracking-tight">
                {planPriceLabelI18n(t, plan)}
              </p>
              {plan.maxTechnicians != null && (
                <p className="text-xs text-gray-400 font-semibold mt-1">
                  {t('subscriptions.planCards.upToTechnicians', { count: plan.maxTechnicians })}
                </p>
              )}
              {plan.maxTechnicians == null && isBusinessPlan(plan.code) && (
                <p className="text-xs text-gray-400 font-semibold mt-1">
                  {t('subscriptions.planCards.unlimitedTechnicians')}
                </p>
              )}
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {planFeatures(plan, t).map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs font-medium text-gray-600">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {isCurrent ? (
              <div className="space-y-3">
                <div className="text-center text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl py-3">
                  {t('subscriptions.planCards.currentPlan')}
                </div>
                {isProPlan(currentPlanCode) && onClaimFree ? (
                  <button
                    type="button"
                    disabled={!!claimingPlanCode}
                    onClick={() => onClaimFree(SUBSCRIPTION_PLAN.BUSINESS)}
                    className={`w-full text-center text-xs font-black uppercase tracking-wider rounded-xl py-3 transition-all shadow-xs hover:shadow-sm disabled:opacity-50 ${PLAN_ACCENTS[SUBSCRIPTION_PLAN.BUSINESS].btn}`}
                  >
                    {claimingPlanCode === SUBSCRIPTION_PLAN.BUSINESS
                      ? t('subscriptions.planCards.upgradingBusiness')
                      : t('subscriptions.planCards.switchToBusiness')}
                  </button>
                ) : null}
              </div>
            ) : isClaimable && claimableTarget ? (
              <button
                type="button"
                disabled={!!claimingPlanCode}
                onClick={() => onClaimFree!(claimableTarget)}
                className={`w-full text-center text-xs font-black uppercase tracking-wider rounded-xl py-3 transition-all shadow-xs hover:shadow-sm disabled:opacity-50 ${accent.btn}`}
              >
                {isClaiming
                  ? t('subscriptions.planCards.activating')
                  : t('subscriptions.planCards.activateFreeTrial')}
              </button>
            ) : ctaMode === 'public' && authCta ? (
              <Link
                to={authCta.to}
                className={`block text-center text-xs font-black uppercase tracking-wider rounded-xl py-3 transition-all shadow-xs hover:shadow-sm ${accent.btn}`}
              >
                {authCta.label}
              </Link>
            ) : ctaMode === 'public' ? (
              <Link
                to="/register"
                className={`block text-center text-xs font-black uppercase tracking-wider rounded-xl py-3 transition-all shadow-xs hover:shadow-sm ${accent.btn}`}
              >
                {t('subscriptions.planCards.startNow')}
              </Link>
            ) : isFreePlan(plan.code) ? (
              <div className="text-center text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 rounded-xl py-3">
                {t('subscriptions.planCards.basePlanIncluded')}
              </div>
            ) : (
              <Link
                to="/contacts"
                className={`block text-center text-xs font-black uppercase tracking-wider rounded-xl py-3 transition-all shadow-xs hover:shadow-sm ${accent.btn}`}
              >
                {t('subscriptions.planCards.contactUs')}
              </Link>
            )}
          </article>
        );
      })}
    </div>
  );
}
