import { INTERVENTION_STATUS } from '@/entities/fsm/model/interventionStatus.constants';
import { INVOICE_PAYMENT_STATUS } from '@/entities/fsm/model/invoicePaymentStatus.constants';
import type { InterventionStatus, InvoicePaymentStatus } from '@/entities/fsm/model/types';

export const MANAGEMENT_INTERVENTION_TRANSITIONS: Record<
  InterventionStatus,
  InterventionStatus[]
> = {
  [INTERVENTION_STATUS.NEW]: [INTERVENTION_STATUS.SCHEDULED, INTERVENTION_STATUS.CANCELLED],
  [INTERVENTION_STATUS.SCHEDULED]: [INTERVENTION_STATUS.EN_ROUTE, INTERVENTION_STATUS.CANCELLED],
  [INTERVENTION_STATUS.EN_ROUTE]: [INTERVENTION_STATUS.IN_PROGRESS, INTERVENTION_STATUS.CANCELLED],
  [INTERVENTION_STATUS.IN_PROGRESS]: [INTERVENTION_STATUS.COMPLETED, INTERVENTION_STATUS.CANCELLED],
  [INTERVENTION_STATUS.COMPLETED]: [],
  [INTERVENTION_STATUS.INVOICED]: [],
  [INTERVENTION_STATUS.PAID]: [],
  [INTERVENTION_STATUS.CANCELLED]: [],
};

export const TECHNICIAN_INTERVENTION_TRANSITIONS: Record<
  InterventionStatus,
  InterventionStatus[]
> = {
  [INTERVENTION_STATUS.NEW]: [INTERVENTION_STATUS.SCHEDULED],
  [INTERVENTION_STATUS.SCHEDULED]: [INTERVENTION_STATUS.EN_ROUTE],
  [INTERVENTION_STATUS.EN_ROUTE]: [INTERVENTION_STATUS.IN_PROGRESS],
  [INTERVENTION_STATUS.IN_PROGRESS]: [INTERVENTION_STATUS.COMPLETED],
  [INTERVENTION_STATUS.COMPLETED]: [],
  [INTERVENTION_STATUS.INVOICED]: [],
  [INTERVENTION_STATUS.PAID]: [],
  [INTERVENTION_STATUS.CANCELLED]: [],
};

export const INVOICE_PAYMENT_TRANSITIONS: Record<
  InvoicePaymentStatus,
  InvoicePaymentStatus[]
> = {
  [INVOICE_PAYMENT_STATUS.UNPAID]: [
    INVOICE_PAYMENT_STATUS.PAID,
    INVOICE_PAYMENT_STATUS.OVERDUE,
    INVOICE_PAYMENT_STATUS.CANCELLED,
  ],
  [INVOICE_PAYMENT_STATUS.OVERDUE]: [
    INVOICE_PAYMENT_STATUS.PAID,
    INVOICE_PAYMENT_STATUS.CANCELLED,
  ],
  [INVOICE_PAYMENT_STATUS.PENDING_CONFIRMATION]: [],
  [INVOICE_PAYMENT_STATUS.PAID]: [],
  [INVOICE_PAYMENT_STATUS.CANCELLED]: [],
};

export const INTERVENTION_STATUS_HINTS: Partial<Record<InterventionStatus, string>> = {
  [INTERVENTION_STATUS.CANCELLED]:
    'Lucrarea a fost anulată. Status final — nu mai poate fi modificată.',
  [INTERVENTION_STATUS.PAID]: 'Lucrare plătită integral. Status final.',
  [INTERVENTION_STATUS.INVOICED]:
    'Facturată — confirmați plata din secțiunea Facturi pentru a continua fluxul.',
  [INTERVENTION_STATUS.COMPLETED]:
    'Lucrare finalizată — generați factura pentru a continua fluxul.',
};

export const PAYMENT_STATUS_HINTS: Partial<Record<InvoicePaymentStatus, string>> = {
  [INVOICE_PAYMENT_STATUS.PAID]:
    'Factura este plătită. Status final — nu poate fi modificat.',
  [INVOICE_PAYMENT_STATUS.PENDING_CONFIRMATION]:
    'Clientul a încărcat dovada plății — confirmați sau respingeți.',
};
