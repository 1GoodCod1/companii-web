import type { CompanyPlanDto, CompanySubscriptionPlanCode } from '@/features/subscriptions/types';

/** Keep route gates in sync with companii-api plan-entitlements.constants.ts */
export const PLAN_RANK: Record<CompanySubscriptionPlanCode, number> = {
  FREE: 0,
  PRO: 1,
  BUSINESS: 2,
};

export function hasMinPlan(
  current: CompanySubscriptionPlanCode | undefined,
  required: CompanySubscriptionPlanCode,
): boolean {
  if (!current) return required === 'FREE';
  return PLAN_RANK[current] >= PLAN_RANK[required];
}

/** Cabinet routes → minimum plan (null = any active plan). */
export const COMPANY_ROUTE_MIN_PLAN: Record<string, CompanySubscriptionPlanCode | null> = {
  '': null,
  '/profile': null,
  '/team': null,
  '/servicii': 'FREE',
  '/lucrari': 'FREE',
  '/lucrari/fisa': 'PRO',
  '/calendar': 'FREE',
  '/recenzii': 'FREE',
  '/cereri': 'PRO',
  '/clienti': 'PRO',
  '/smete': 'BUSINESS',
  '/oferte': 'BUSINESS',
  '/facturi': 'BUSINESS',
  '/subscription': null,
};

export function requiredPlanForRoute(routePath: string): CompanySubscriptionPlanCode | null {
  return COMPANY_ROUTE_MIN_PLAN[routePath] ?? null;
}

export const PLAN_LABELS: Record<CompanySubscriptionPlanCode, string> = {
  FREE: 'Free',
  PRO: 'Pro',
  BUSINESS: 'Business',
};

export function canActivatePlan(
  current: CompanySubscriptionPlanCode | undefined,
  target: CompanySubscriptionPlanCode,
): boolean {
  if (target === 'FREE') return false;
  if (!current || current === 'FREE') return target === 'PRO' || target === 'BUSINESS';
  if (current === 'PRO') return target === 'BUSINESS';
  return false;
}

export function plansForDisplay(
  plans: CompanyPlanDto[],
  currentPlanCode?: CompanySubscriptionPlanCode,
): CompanyPlanDto[] {
  const sorted = [...plans].sort((a, b) => Number(a.price) - Number(b.price));
  if (!currentPlanCode || currentPlanCode === 'FREE') return sorted;
  return sorted.filter((plan) => plan.code === currentPlanCode);
}
