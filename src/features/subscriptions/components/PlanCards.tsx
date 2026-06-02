import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ClaimableSubscriptionPlanCode, CompanyPlanDto, CompanySubscriptionPlanCode } from '@/entities/subscription/model/types';
import type { PublicAuthCta } from '@/features/auth';
import { canActivatePlan, plansForDisplay } from '@/entities/subscription/model/planEntitlements';
import { planFeatures } from '@/entities/subscription/model/subscriptions';
import {
  isBusinessPlan,
  isClaimablePlanCode,
  isFreePlan,
  isProPlan,
} from '@/entities/subscription/model/subscriptionPlan';
import {
  PLAN_ACCENTS,
  SUBSCRIPTION_PLAN,
} from '@/entities/subscription/model/subscriptions.constants';

function PlanPricing({
  plan,
  showPromo,
  t,
}: {
  plan: CompanyPlanDto;
  showPromo: boolean;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const amount = Number(plan.price);
  const currency = plan.currency || 'MDL';

  if (amount === 0) {
    return (
      <p className="text-3xl font-semibold text-slate-900 tracking-tight">
        {t('subscriptions.planCards.priceFree')}
      </p>
    );
  }

  if (showPromo) {
    return (
      <div className="space-y-2">
        <span className="inline-flex items-center bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
          {t('subscriptions.planCards.firstMonthFree')}
        </span>
        <div className="flex items-end gap-2.5 flex-wrap">
          <p className="text-3xl font-semibold text-slate-900 tracking-tight leading-none">
            0 {currency}
          </p>
          <p className="text-base text-slate-400 line-through decoration-slate-300 pb-0.5">
            {amount} {currency}
          </p>
        </div>
        <p className="text-sm text-slate-500">
          {t('subscriptions.planCards.thenPricePerMonth', { amount, currency })}
        </p>
      </div>
    );
  }

  return (
    <p className="text-3xl font-semibold text-slate-900 tracking-tight">
      {t('subscriptions.planCards.pricePerMonth', { amount, currency })}
    </p>
  );
}

function technicianCaption(
  plan: CompanyPlanDto,
  t: (key: string, options?: Record<string, unknown>) => string,
): string | null {
  if (plan.maxTechnicians != null) {
    return t('subscriptions.planCards.upToTechnicians', { count: plan.maxTechnicians });
  }
  if (isBusinessPlan(plan.code)) {
    return t('subscriptions.planCards.unlimitedTechnicians');
  }
  return null;
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
        'grid gap-5',
        singlePlan ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-3',
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
        const showPromo = !isCurrent && !isFreePlan(plan.code);
        const claimableTarget = isClaimablePlanCode(plan.code) ? plan.code : null;
        const teamCaption = technicianCaption(plan, t);

        return (
          <article
            key={plan.id}
            className={cn(
              'relative border bg-white p-6 flex flex-col',
              isPopular ? 'border-violet-200 ring-1 ring-violet-100' : 'border-slate-200',
              isCurrent && 'ring-2 ring-emerald-200 border-emerald-200',
            )}
          >
            {isCurrent ? (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold bg-emerald-600 text-white px-3 py-1">
                {t('subscriptions.planCards.activePlan')}
              </span>
            ) : null}

            {isPopular ? (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold bg-violet-600 text-white px-3 py-1">
                {t('subscriptions.planCards.recommended')}
              </span>
            ) : null}

            <div className="mb-5">
              <span className={cn('inline-block text-xs font-semibold px-2.5 py-1', accent.badge)}>
                {plan.name}
              </span>

              <div className="mt-4">
                <PlanPricing plan={plan} showPromo={showPromo} t={t} />
              </div>

              {teamCaption ? (
                <p className="text-sm text-slate-500 mt-2">{teamCaption}</p>
              ) : null}
            </div>

            <ul className="space-y-2.5 flex-1 mb-6 border-t border-slate-100 pt-5">
              {planFeatures(plan, t).map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <Check className="size-4 text-emerald-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {isCurrent ? (
              <div className="space-y-2.5">
                <div className="text-center text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 py-2.5">
                  {t('subscriptions.planCards.currentPlan')}
                </div>
                {isProPlan(currentPlanCode) && onClaimFree ? (
                  <button
                    type="button"
                    disabled={!!claimingPlanCode}
                    onClick={() => onClaimFree(SUBSCRIPTION_PLAN.BUSINESS)}
                    className={cn(
                      'w-full text-center text-sm font-semibold py-2.5 disabled:opacity-50',
                      PLAN_ACCENTS[SUBSCRIPTION_PLAN.BUSINESS].btn,
                    )}
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
                className={cn(
                  'w-full text-center text-sm font-semibold py-2.5 disabled:opacity-50',
                  accent.btn,
                )}
              >
                {isClaiming
                  ? t('subscriptions.planCards.activating')
                  : t('subscriptions.planCards.activateFreeTrial')}
              </button>
            ) : ctaMode === 'public' && authCta ? (
              <Link
                to={authCta.to}
                className={cn(
                  'block text-center text-sm font-semibold py-2.5',
                  accent.btn,
                )}
              >
                {showPromo
                  ? t('subscriptions.planCards.startFreeMonth')
                  : authCta.label}
              </Link>
            ) : ctaMode === 'public' ? (
              <Link
                to="/register"
                className={cn(
                  'block text-center text-sm font-semibold py-2.5',
                  accent.btn,
                )}
              >
                {showPromo
                  ? t('subscriptions.planCards.startFreeMonth')
                  : t('subscriptions.planCards.startNow')}
              </Link>
            ) : isFreePlan(plan.code) ? (
              <div className="text-center text-sm text-slate-500 bg-slate-50 border border-slate-100 py-2.5">
                {t('subscriptions.planCards.basePlanIncluded')}
              </div>
            ) : (
              <Link
                to="/contacts"
                className={cn(
                  'block text-center text-sm font-semibold py-2.5',
                  accent.btn,
                )}
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
