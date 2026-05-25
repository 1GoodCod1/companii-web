import type { InterventionStatus, InvoicePaymentStatus } from './types';
import type { CompanyRole } from '@/features/companies/roleAccess';

const MANAGEMENT_TRANSITIONS: Record<InterventionStatus, InterventionStatus[]> = {
  NEW: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['EN_ROUTE', 'CANCELLED'],
  EN_ROUTE: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  INVOICED: [],
  PAID: [],
  CANCELLED: [],
};

const TECHNICIAN_TRANSITIONS: Record<InterventionStatus, InterventionStatus[]> = {
  NEW: ['SCHEDULED'],
  SCHEDULED: ['EN_ROUTE'],
  EN_ROUTE: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  INVOICED: [],
  PAID: [],
  CANCELLED: [],
};

const PAYMENT_TRANSITIONS: Record<InvoicePaymentStatus, InvoicePaymentStatus[]> = {
  UNPAID: ['PAID', 'OVERDUE'],
  OVERDUE: ['PAID'],
  PAID: [],
};

export function isTerminalInterventionStatus(status: InterventionStatus): boolean {
  return status === 'PAID' || status === 'CANCELLED';
}

export function isTerminalPaymentStatus(status: InvoicePaymentStatus): boolean {
  return status === 'PAID';
}

export function getAllowedInterventionTransitions(
  from: InterventionStatus,
  role?: CompanyRole,
): InterventionStatus[] {
  if (isTerminalInterventionStatus(from) || from === 'INVOICED') return [];
  if (role === 'MEMBER') return TECHNICIAN_TRANSITIONS[from] ?? [];
  return MANAGEMENT_TRANSITIONS[from] ?? [];
}

export function getAllowedPaymentTransitions(
  from: InvoicePaymentStatus,
): InvoicePaymentStatus[] {
  if (isTerminalPaymentStatus(from)) return [];
  return PAYMENT_TRANSITIONS[from] ?? [];
}

export function getInterventionStatusHint(status: InterventionStatus): string | null {
  switch (status) {
    case 'CANCELLED':
      return 'Lucrarea a fost anulată. Status final — nu mai poate fi modificată.';
    case 'PAID':
      return 'Lucrare plătită integral. Status final.';
    case 'INVOICED':
      return 'Facturată — confirmați plata din secțiunea Facturi pentru a finaliza.';
    case 'COMPLETED':
      return 'Lucrare finalizată — generați factura pentru a continua fluxul.';
    default:
      return null;
  }
}

export function getPaymentStatusHint(status: InvoicePaymentStatus): string | null {
  if (status === 'PAID') {
    return 'Factura este plătită. Status final — nu poate fi modificat.';
  }
  return null;
}
