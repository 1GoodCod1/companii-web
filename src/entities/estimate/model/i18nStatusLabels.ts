import type { TFunction } from 'i18next';
import i18n from '@/shared/config/i18n';

function translate(t: TFunction, key: string, fallback: string): string {
  const value = t(key, { defaultValue: '' });
  return value || fallback;
}

export function estimateStatusLabel(status: string, t: TFunction = i18n.t.bind(i18n)): string {
  return translate(t, `status.estimate.${status}`, status);
}

export function wizardStepLabel(step: string, t: TFunction = i18n.t.bind(i18n)): string {
  return translate(t, `status.wizard.${step}`, step);
}
