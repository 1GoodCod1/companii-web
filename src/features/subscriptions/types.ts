export type CompanySubscriptionPlanCode = 'FREE' | 'PRO' | 'BUSINESS';

export interface CompanyPlanDto {
  id: string;
  code: CompanySubscriptionPlanCode;
  name: string;
  price: string | number;
  currency: string;
  maxTechnicians: number | null;
  maxInterventionsPerMonth: number | null;
  features: string[] | Record<string, unknown>;
}

export interface CompanySubscriptionDto {
  id: string;
  companyId: string;
  planId: string;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  currentPeriodEnd: string;
  plan: CompanyPlanDto;
}

export function planFeatures(plan: CompanyPlanDto): string[] {
  if (Array.isArray(plan.features)) return plan.features;
  return [];
}

export function planPriceLabel(plan: CompanyPlanDto): string {
  const amount = Number(plan.price);
  if (amount === 0) return 'Gratuit';
  return `${amount} ${plan.currency || 'MDL'} / lună`;
}
