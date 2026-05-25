import type { InterventionStatus, InvoicePaymentStatus } from './types';

export const INTERVENTION_STATUS_LABELS: Record<InterventionStatus, string> = {
  NEW: 'Nouă',
  SCHEDULED: 'Programată',
  EN_ROUTE: 'În deplasare',
  IN_PROGRESS: 'În lucru',
  COMPLETED: 'Finalizată',
  INVOICED: 'Facturată',
  PAID: 'Plătită',
  CANCELLED: 'Anulată',
};

export const PAYMENT_STATUS_LABELS: Record<InvoicePaymentStatus, string> = {
  UNPAID: 'Neplătită',
  PAID: 'Plătită',
  OVERDUE: 'Restantă',
};
