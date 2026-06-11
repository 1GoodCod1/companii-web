import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckIcon } from '@phosphor-icons/react';
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

const PLAN_BTN_CLASS =
  'text-center text-xs font-black uppercase tracking-wider py-3 transition-colors';

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
      <p className="text-3xl font-black text-gray-900 tracking-tight">
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
          <p className="text-3xl font-black text-gray-900 tracking-tight leading-none">
            0 {currency}
          </p>
          <p className="text-base text-gray-400 line-through decoration-gray-300 pb-0.5">
            {amount} {currency}
          </p>
        </div>
        <p className="text-sm text-gray-500">
          {t('subscriptions.planCards.thenPricePerMonth', { amount, currency })}
        </p>
      </div>
    );
  }

  return (
    <p className="text-3xl font-black text-gray-900 tracking-tight">
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
        'grid gap-5 items-stretch',
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
              'flex flex-col border bg-white',
              isPopular ? 'border-violet-300' : 'border-gray-200',
              isCurrent && 'border-gray-400',
            )}
          >
            {/* Status band: invisible placeholder keeps all cards vertically aligned */}
            {isCurrent ? (
              <div className="bg-gray-900 px-4 py-2 text-center text-[10px] font-black uppercase tracking-widest text-white">
                {t('subscriptions.planCards.activePlan')}
              </div>
            ) : isPopular ? (
              <div className="bg-violet-600 px-4 py-2 text-center text-[10px] font-black uppercase tracking-widest text-white">
                {t('subscriptions.planCards.recommended')}
              </div>
            ) : (
              <div className="invisible px-4 py-2 text-[10px]" aria-hidden>
                &nbsp;
              </div>
            )}

            <div className="p-6 pt-2 border-b border-gray-100">
              <span
                className={cn(
                  'inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1',
                  accent.badge,
                )}
              >
                {plan.name}
              </span>

              <div className="mt-5 flex flex-col justify-end min-h-[96px]">
                <PlanPricing plan={plan} showPromo={showPromo} t={t} />
              </div>

              <p className="text-sm text-gray-500 mt-2 min-h-[1.25rem]">
                {teamCaption ?? ' '}
              </p>
            </div>

            <ul className="p-6 space-y-2.5 flex-1">
              {planFeatures(plan, t).map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckIcon className="size-4 text-violet-600 mt-0.5 shrink-0" weight="bold" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="p-6 pt-0">
              {isCurrent ? (
                <div className="space-y-2.5">
                  <div className="text-center text-xs font-black uppercase tracking-wider text-gray-700 bg-gray-100 border border-gray-200 py-3">
                    {t('subscriptions.planCards.currentPlan')}
                  </div>
                  {isProPlan(currentPlanCode) && onClaimFree ? (
                    <button
                      type="button"
                      disabled={!!claimingPlanCode}
                      onClick={() => onClaimFree(SUBSCRIPTION_PLAN.BUSINESS)}
                      className={cn(
                        'w-full disabled:opacity-50',
                        PLAN_BTN_CLASS,
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
                  className={cn('w-full disabled:opacity-50', PLAN_BTN_CLASS, accent.btn)}
                >
                  {isClaiming
                    ? t('subscriptions.planCards.activating')
                    : t('subscriptions.planCards.activateFreeTrial')}
                </button>
              ) : ctaMode === 'public' && authCta ? (
                <Link to={authCta.to} className={cn('block', PLAN_BTN_CLASS, accent.btn)}>
                  {showPromo
                    ? t('subscriptions.planCards.startFreeMonth')
                    : authCta.label}
                </Link>
              ) : ctaMode === 'public' ? (
                <Link to="/register" className={cn('block', PLAN_BTN_CLASS, accent.btn)}>
                  {showPromo
                    ? t('subscriptions.planCards.startFreeMonth')
                    : t('subscriptions.planCards.startNow')}
                </Link>
              ) : isFreePlan(plan.code) ? (
                <div className="text-center text-sm text-gray-500 bg-slate-50 border border-slate-100 py-3">
                  {t('subscriptions.planCards.basePlanIncluded')}
                </div>
              ) : (
                <Link to="/contacts" className={cn('block', PLAN_BTN_CLASS, accent.btn)}>
                  {t('subscriptions.planCards.contactUs')}
                </Link>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
