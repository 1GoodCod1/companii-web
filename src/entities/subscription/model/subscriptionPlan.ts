import { SUBSCRIPTION_PLAN, SUBSCRIPTION_PLAN_CODES } from '@/entities/subscription/model/subscriptions.constants';
import type { CompanyMeResponse } from '@/entities/company/model/companies.types';
import type {
  ClaimableSubscriptionPlanCode,
  CompanySubscriptionPlanCode,
} from '@/entities/subscription/model/types';
const SUBSCRIPTION_PLAN_CODE_SET = new Set<string>(SUBSCRIPTION_PLAN_CODES);

export function isSubscriptionPlanCode(
  value: unknown,
): value is CompanySubscriptionPlanCode {
  return typeof value === 'string' && SUBSCRIPTION_PLAN_CODE_SET.has(value);
}

export function isFreePlan(
  code: CompanySubscriptionPlanCode | undefined | null,
): code is typeof SUBSCRIPTION_PLAN.FREE {
  return code === SUBSCRIPTION_PLAN.FREE;
}

export function isProPlan(
  code: CompanySubscriptionPlanCode | undefined | null,
): code is typeof SUBSCRIPTION_PLAN.PRO {
  return code === SUBSCRIPTION_PLAN.PRO;
}

export function isBusinessPlan(
  code: CompanySubscriptionPlanCode | undefined | null,
): code is typeof SUBSCRIPTION_PLAN.BUSINESS {
  return code === SUBSCRIPTION_PLAN.BUSINESS;
}

export function isClaimablePlanCode(
  code: CompanySubscriptionPlanCode,
): code is ClaimableSubscriptionPlanCode {
  return code === SUBSCRIPTION_PLAN.PRO || code === SUBSCRIPTION_PLAN.BUSINESS;
}

export function isOnFreePlan(
  code: CompanySubscriptionPlanCode | undefined | null,
): boolean {
  return !code || isFreePlan(code);
}

export function isProToBusinessUpgrade(
  current: CompanySubscriptionPlanCode | undefined | null,
  target: CompanySubscriptionPlanCode,
): boolean {
  return isProPlan(current) && target === SUBSCRIPTION_PLAN.BUSINESS;
}

export function resolveSubscriptionPlanCode(
  subscriptionPlanCode: CompanySubscriptionPlanCode | undefined,
  companyMe: CompanyMeResponse | undefined,
  activeCompanyId: string | undefined,
): CompanySubscriptionPlanCode | undefined {
  if (isSubscriptionPlanCode(subscriptionPlanCode)) return subscriptionPlanCode;

  if (!activeCompanyId || !companyMe) return undefined;

  const owned = companyMe.owned?.find((item) => item.id === activeCompanyId);
  const ownedCode = owned?.subscription?.plan?.code;
  if (isSubscriptionPlanCode(ownedCode)) return ownedCode;

  const membership = companyMe.memberships?.find(
    (item) => item.companyId === activeCompanyId,
  );
  const memberCode = membership?.company?.subscription?.plan?.code;
  if (isSubscriptionPlanCode(memberCode)) return memberCode;

  return undefined;
}