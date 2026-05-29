import {
  INVOICE_PAYMENT_STATUS,
  INVOICE_PAYMENT_STATUS_BORDER_CLASSES,
  INVOICE_PAYMENT_STATUS_DEFAULT_BORDER_CLASS,
  INVOICE_PAYMENT_STATUS_CODES,
  PAYMENT_STATUS_BADGE_CLASSES,
} from '@/constants/invoicePaymentStatus.constants';
import { INVOICE_PAYMENT_TRANSITIONS } from '@/constants/fsmStatusTransitions.constants';
import { paymentStatusHint as i18nPaymentStatusHint } from '@/utils/i18nStatusLabels';
import type { InvoicePaymentStatus } from '@/types/fsm';

const INVOICE_PAYMENT_STATUS_SET = new Set<string>(INVOICE_PAYMENT_STATUS_CODES);

export function isInvoicePaymentStatus(value: unknown): value is InvoicePaymentStatus {
  return typeof value === 'string' && INVOICE_PAYMENT_STATUS_SET.has(value);
}

export function isPaidPaymentStatus(status: InvoicePaymentStatus): boolean {
  return status === INVOICE_PAYMENT_STATUS.PAID;
}

/**
 * PAID is no longer terminal — it can be reversed to UNPAID with a reason.
 * Kept as a helper for UI affordances around "final" workflow states.
 */
export function isTerminalPaymentStatus(_status: InvoicePaymentStatus): boolean {
  return false;
}

export function paymentStatusBadgeClass(status: string): string {
  return PAYMENT_STATUS_BADGE_CLASSES[status] ?? PAYMENT_STATUS_BADGE_CLASSES.UNPAID;
}

export function getInvoicePaymentStatusStyle(status: string): string {
  return (
    INVOICE_PAYMENT_STATUS_BORDER_CLASSES[status] ??
    INVOICE_PAYMENT_STATUS_DEFAULT_BORDER_CLASS
  );
}

export function getAllowedPaymentTransitions(
  from: InvoicePaymentStatus,
): InvoicePaymentStatus[] {
  if (isTerminalPaymentStatus(from)) return [];
  return INVOICE_PAYMENT_TRANSITIONS[from] ?? [];
}

export function getPaymentStatusHint(status: InvoicePaymentStatus): string | null {
  return i18nPaymentStatusHint(status);
}
