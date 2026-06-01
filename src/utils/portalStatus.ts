import { INTERVENTION_STATUS } from '@/constants/interventionStatus.constants';
import { INVOICE_PAYMENT_STATUS } from '@/constants/invoicePaymentStatus.constants';
import { QUOTE_STATUS } from '@/constants/quoteStatus.constants';

export type PortalBadgeTone = 'violet' | 'emerald' | 'amber' | 'blue' | 'gray';

export function interventionStatusTone(status: string): PortalBadgeTone {
  switch (status) {
    case INTERVENTION_STATUS.SCHEDULED:
      return 'violet';
    case INTERVENTION_STATUS.EN_ROUTE:
    case INTERVENTION_STATUS.IN_PROGRESS:
      return 'amber';
    case INTERVENTION_STATUS.COMPLETED:
    case INTERVENTION_STATUS.PAID:
      return 'emerald';
    case INTERVENTION_STATUS.INVOICED:
      return 'blue';
    case INTERVENTION_STATUS.CANCELLED:
      return 'gray';
    default:
      return 'gray';
  }
}

export function quoteStatusTone(status: string): PortalBadgeTone {
  if (status === QUOTE_STATUS.SENT) return 'blue';
  if (status === QUOTE_STATUS.ACCEPTED) return 'emerald';
  if (status === QUOTE_STATUS.REJECTED) return 'gray';
  return 'violet';
}

export function invoiceStatusTone(status: string): PortalBadgeTone {
  if (status === INVOICE_PAYMENT_STATUS.PAID) return 'emerald';
  if (status === INVOICE_PAYMENT_STATUS.OVERDUE) return 'amber';
  if (status === INVOICE_PAYMENT_STATUS.PENDING_CONFIRMATION) return 'blue';
  return 'violet';
}
