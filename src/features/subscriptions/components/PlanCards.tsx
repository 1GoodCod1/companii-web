import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { CompanyPlanDto, CompanySubscriptionPlanCode } from '../types';
import type { PublicAuthCta } from '@/features/auth/usePublicAuthCta';
import { canActivatePlan, plansForDisplay } from '../planAccess';
import { planFeatures, planPriceLabel } from '../types';

const PLAN_ACCENTS: Record<
  CompanySubscriptionPlanCode,
  { ring: string; badge: string; btn: string }
> = {
  FREE: {
    ring: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
    btn: 'bg-gray-900 hover:bg-gray-800 text-white',
  },
  PRO: {
    ring: 'border-violet-300 ring-2 ring-violet-100',
    badge: 'bg-violet-100 text-violet-700',
    btn: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white',
  },
  BUSINESS: {
    ring: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
};

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
  onClaimFree?: (planCode: Extract<CompanySubscriptionPlanCode, 'PRO' | 'BUSINESS'>) => void;
  claimingPlanCode?: CompanySubscriptionPlanCode | null;
  authCta?: PublicAuthCta | null;
}) {
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
        const isPopular = plan.code === 'PRO' && !isCurrent;
        const isClaimable =
          ctaMode === 'cabinet' &&
          !!onClaimFree &&
          canActivatePlan(currentPlanCode, plan.code) &&
          !isCurrent;
        const isClaiming = claimingPlanCode === plan.code;

        return (
          <article
            key={plan.id}
            className={cn(
              'relative bg-white/80 backdrop-blur-md rounded-3xl border p-6 shadow-premium flex flex-col',
              accent.ring,
              isCurrent && 'ring-2 ring-emerald-200 border-emerald-200',
            )}
          >
            {isCurrent && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white px-3 py-1 rounded-full shadow-xs">
                Plan activ
              </span>
            )}

            {isPopular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3 py-1 rounded-full shadow-xs">
                Recomandat
              </span>
            )}

            <div className="mb-4">
              <span
                className={`inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${accent.badge}`}
              >
                {plan.name}
              </span>
              <p className="mt-4 text-3xl font-black text-gray-900 tracking-tight">
                {planPriceLabel(plan)}
              </p>
              {plan.maxTechnicians != null && (
                <p className="text-xs text-gray-400 font-semibold mt-1">
                  Până la {plan.maxTechnicians} tehnicieni
                </p>
              )}
              {plan.maxTechnicians == null && plan.code === 'BUSINESS' && (
                <p className="text-xs text-gray-400 font-semibold mt-1">Tehnicieni nelimitați</p>
              )}
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {planFeatures(plan).map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs font-medium text-gray-600">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {isCurrent ? (
              <div className="space-y-3">
                <div className="text-center text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl py-3">
                  Planul tău curent
                </div>
                {currentPlanCode === 'PRO' && onClaimFree ? (
                  <button
                    type="button"
                    disabled={!!claimingPlanCode}
                    onClick={() => onClaimFree('BUSINESS')}
                    className={`w-full text-center text-xs font-black uppercase tracking-wider rounded-xl py-3 transition-all shadow-xs hover:shadow-sm disabled:opacity-50 ${PLAN_ACCENTS.BUSINESS.btn}`}
                  >
                    {claimingPlanCode === 'BUSINESS'
                      ? 'Se activează Business...'
                      : 'Treci la Business — Pro se înlocuiește'}
                  </button>
                ) : null}
              </div>
            ) : isClaimable && onClaimFree ? (
              <button
                type="button"
                disabled={!!claimingPlanCode}
                onClick={() =>
                  onClaimFree(plan.code as Extract<CompanySubscriptionPlanCode, 'PRO' | 'BUSINESS'>)
                }
                className={`w-full text-center text-xs font-black uppercase tracking-wider rounded-xl py-3 transition-all shadow-xs hover:shadow-sm disabled:opacity-50 ${accent.btn}`}
              >
                {isClaiming ? 'Se activează...' : 'Activează 30 zile gratuit'}
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
                Începe acum
              </Link>
            ) : plan.code === 'FREE' ? (
              <div className="text-center text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 rounded-xl py-3">
                Plan de bază inclus
              </div>
            ) : (
              <Link
                to="/contacts"
                className={`block text-center text-xs font-black uppercase tracking-wider rounded-xl py-3 transition-all shadow-xs hover:shadow-sm ${accent.btn}`}
              >
                Contactează-ne
              </Link>
            )}
          </article>
        );
      })}
    </div>
  );
}
