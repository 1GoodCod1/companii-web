import type { CompanyPlanDto } from '@/types/subscriptions';

export function planFeatures(plan: CompanyPlanDto): string[] {
  if (Array.isArray(plan.features)) return plan.features;
  return [];
}

export function planPriceLabel(plan: CompanyPlanDto): string {
  const amount = Number(plan.price);
  if (amount === 0) return 'Gratuit';
  return `${amount} ${plan.currency || 'MDL'} / lună`;
}
