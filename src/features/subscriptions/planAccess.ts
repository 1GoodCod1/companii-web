import type { CompanyPlanDto, CompanySubscriptionPlanCode } from '@/features/subscriptions/types';

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

export const COMPANY_NAV_PLAN: Record<string, CompanySubscriptionPlanCode | null> = {
  '': null,
  '/profile': null,
  '/team': null,
  '/packages': null,
  '/servicii': 'PRO',
  '/cereri': 'PRO',
  '/clienti': 'PRO',
  '/lucrari': null,
  '/smete': 'BUSINESS',
  '/calendar': null,
  '/oferte': 'BUSINESS',
  '/facturi': 'BUSINESS',
  '/subscription': null,
};

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

export function isPaidPlan(code: CompanySubscriptionPlanCode | undefined): boolean {
  return code === 'PRO' || code === 'BUSINESS';
}

export function plansForDisplay(
  plans: CompanyPlanDto[],
  currentPlanCode?: CompanySubscriptionPlanCode,
): CompanyPlanDto[] {
  const sorted = [...plans].sort((a, b) => Number(a.price) - Number(b.price));
  if (!currentPlanCode || currentPlanCode === 'FREE') return sorted;
  return sorted.filter((plan) => plan.code === currentPlanCode);
}
