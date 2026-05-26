import type { TFunction } from 'i18next';
import type { CompanyPlanDto } from '@/types/subscriptions';

export function planFeatures(plan: CompanyPlanDto, t?: TFunction): string[] {
  if (t && plan.code) {
    const translated = t(`subscriptions.planCards.features.${plan.code}`, {
      returnObjects: true,
    });
    if (Array.isArray(translated) && translated.length > 0) {
      const items = translated.filter((item): item is string => typeof item === 'string');
      if (items.length > 0) return items;
    }
  }
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
