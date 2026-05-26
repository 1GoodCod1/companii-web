import type { TFunction } from 'i18next';
import type { CompanyPlanDto } from '@/types/subscriptions';

export function planFeatures(plan: CompanyPlanDto): string[] {
  if (Array.isArray(plan.features)) return plan.features;
  return [];
}

export function planPriceLabel(plan: CompanyPlanDto, t?: TFunction): string {
  const amount = Number(plan.price);
  if (t) {
    if (amount === 0) return t('subscriptions.planCards.priceFree');
    return t('subscriptions.planCards.pricePerMonth', {
      amount,
      currency: plan.currency || 'MDL',
    });
  }
  if (amount === 0) return 'Gratuit';
  return `${amount} ${plan.currency || 'MDL'} / lună`;
}
