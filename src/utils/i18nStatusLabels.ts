import type { TFunction } from 'i18next';
import i18n from '@/i18n';
import { INTERVENTION_STATUS } from '@/constants/interventionStatus.constants';
import type { InterventionStatus } from '@/types/fsm';
import type { InvoicePaymentStatus } from '@/types/fsm';

function translate(t: TFunction, key: string, fallback: string): string {
  const value = t(key, { defaultValue: '' });
  return value || fallback;
}

export function leadStatusLabel(status: string, t: TFunction = i18n.t.bind(i18n)): string {
  return translate(t, `status.lead.${status}`, status);
}

export function interventionStatusLabel(
  status: string,
  t: TFunction = i18n.t.bind(i18n),
): string {
  return translate(t, `status.intervention.${status}`, status);
}

export function quoteStatusLabel(status: string, t: TFunction = i18n.t.bind(i18n)): string {
  return translate(t, `status.quote.${status}`, status);
}

export function estimateStatusLabel(status: string, t: TFunction = i18n.t.bind(i18n)): string {
  return translate(t, `status.estimate.${status}`, status);
}

export function paymentStatusLabel(
  status: string,
  t: TFunction = i18n.t.bind(i18n),
): string {
  return translate(t, `status.payment.${status}`, status);
}

export function interventionStatusHint(
  status: InterventionStatus,
  t: TFunction = i18n.t.bind(i18n),
): string | null {
  if (status === INTERVENTION_STATUS.CANCELLED) {
    return t('status.intervention.hintCancelled');
  }
  if (status === INTERVENTION_STATUS.PAID) {
    return t('status.intervention.hintPaid');
  }
  if (status === INTERVENTION_STATUS.INVOICED) {
    return t('status.intervention.hintInvoiced');
  }
  if (status === INTERVENTION_STATUS.COMPLETED) {
    return t('status.intervention.hintCompleted');
  }
  return null;
}

export function paymentStatusHint(
  status: InvoicePaymentStatus,
  t: TFunction = i18n.t.bind(i18n),
): string | null {
  if (status === 'PAID') {
    return t('status.payment.hintPaid');
  }
  return null;
}

export function wizardStepLabel(step: string, t: TFunction = i18n.t.bind(i18n)): string {
  return translate(t, `status.wizard.${step}`, step);
}

const LEAD_FILTER_KEYS: Record<string, string> = {
  NEW: 'filterNew',
  CONTACTED: 'filterContacted',
  QUALIFIED: 'filterQualified',
  IN_PROGRESS: 'filterInProgress',
  CONVERTED: 'filterConverted',
  LOST: 'filterLost',
};

export function leadFilterLabel(
  filterValue: string | undefined,
  t: TFunction = i18n.t.bind(i18n),
): string {
  if (!filterValue) {
    return translate(t, 'status.lead.filterAll', 'Toate');
  }
  const key = LEAD_FILTER_KEYS[filterValue];
  return key ? translate(t, `status.lead.${key}`, filterValue) : filterValue;
}

const INTERVENTION_TAB_KEYS: Record<string, string> = {
  '': 'tabAll',
  NEW: 'tabNew',
  SCHEDULED: 'tabScheduled',
  EN_ROUTE: 'tabEnRoute',
  IN_PROGRESS: 'tabInProgress',
  COMPLETED: 'tabCompleted',
  INVOICED: 'tabInvoiced',
  PAID: 'tabPaid',
  CANCELLED: 'tabCancelled',
};

export function interventionTabLabel(
  tabValue: string,
  t: TFunction = i18n.t.bind(i18n),
): string {
  const key = INTERVENTION_TAB_KEYS[tabValue] ?? tabValue;
  return translate(t, `status.intervention.${key}`, tabValue);
}
