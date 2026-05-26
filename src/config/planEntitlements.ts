import type { CompanyPlanDto, CompanySubscriptionPlanCode } from '@/types/subscriptions';
import {
  isOnFreePlan,
  isProPlan,
  isClaimablePlanCode,
} from '@/utils/subscriptionPlan';
import {
  PLAN_RANK,
  SUBSCRIPTION_PLAN,
} from '@/constants/subscriptions.constants';
import { COMPANY_CABINET_PATH } from '@/constants/routes.constants';
export {
  PLAN_LABELS,
  PLAN_RANK,
  SUBSCRIPTION_PLAN,
} from '@/constants/subscriptions.constants';

export function hasMinPlan(
  current: CompanySubscriptionPlanCode | undefined,
  required: CompanySubscriptionPlanCode,
): boolean {
  if (!current) return required === SUBSCRIPTION_PLAN.FREE;
  return PLAN_RANK[current] >= PLAN_RANK[required];
};

/** Cabinet routes → minimum plan (null = any active plan). */
export const COMPANY_ROUTE_MIN_PLAN: Record<string, CompanySubscriptionPlanCode | null> = {
  [COMPANY_CABINET_PATH.DASHBOARD]: null,
  [COMPANY_CABINET_PATH.PROFILE]: null,
  [COMPANY_CABINET_PATH.TEAM]: null,
  [COMPANY_CABINET_PATH.SERVICII]: SUBSCRIPTION_PLAN.FREE,
  [COMPANY_CABINET_PATH.LUCRARI]: SUBSCRIPTION_PLAN.FREE,
  [COMPANY_CABINET_PATH.LUCRARI_FISA]: SUBSCRIPTION_PLAN.PRO,
  [COMPANY_CABINET_PATH.CALENDAR]: SUBSCRIPTION_PLAN.FREE,
  [COMPANY_CABINET_PATH.RECENZII]: SUBSCRIPTION_PLAN.FREE,
  [COMPANY_CABINET_PATH.CERERI]: SUBSCRIPTION_PLAN.PRO,
  [COMPANY_CABINET_PATH.CLIENTI]: SUBSCRIPTION_PLAN.PRO,
  [COMPANY_CABINET_PATH.SMETE]: SUBSCRIPTION_PLAN.BUSINESS,
  [COMPANY_CABINET_PATH.OFERTE]: SUBSCRIPTION_PLAN.BUSINESS,
  [COMPANY_CABINET_PATH.FACTURI]: SUBSCRIPTION_PLAN.BUSINESS,
  [COMPANY_CABINET_PATH.SUBSCRIPTION]: null,
};

export function requiredPlanForRoute(routePath: string): CompanySubscriptionPlanCode | null {
  return COMPANY_ROUTE_MIN_PLAN[routePath] ?? null;
}

export function canActivatePlan(
  current: CompanySubscriptionPlanCode | undefined,
  target: CompanySubscriptionPlanCode,
): boolean {
  if (target === SUBSCRIPTION_PLAN.FREE) return false;
  if (isOnFreePlan(current)) return isClaimablePlanCode(target);
  if (isProPlan(current)) return target === SUBSCRIPTION_PLAN.BUSINESS;
  return false;
};

export function plansForDisplay(
  plans: CompanyPlanDto[],
  currentPlanCode?: CompanySubscriptionPlanCode,
): CompanyPlanDto[] {
  const sorted = [...plans].sort((a, b) => Number(a.price) - Number(b.price));
  if (isOnFreePlan(currentPlanCode)) return sorted;
  return sorted.filter((plan) => plan.code === currentPlanCode);
};


