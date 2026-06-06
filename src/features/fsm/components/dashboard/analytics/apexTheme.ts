import { INVOICE_PAYMENT_STATUS } from '@/entities/fsm/model/invoicePaymentStatus.constants';
import { INTERVENTION_STATUS } from '@/entities/fsm/model/interventionStatus.constants';
import type { InterventionStatus, InvoicePaymentStatus } from '@/entities/fsm/model/types';

export const CHART_TEXT_COLOR = '#64748b';
export const CHART_GRID_COLOR = '#eef2f7'; 

export const INVOICE_STATUS_COLORS: Record<InvoicePaymentStatus, string> = {
  [INVOICE_PAYMENT_STATUS.PAID]: '#10b981', 
  [INVOICE_PAYMENT_STATUS.UNPAID]: '#f59e0b', 
  [INVOICE_PAYMENT_STATUS.OVERDUE]: '#ef4444',
  [INVOICE_PAYMENT_STATUS.PENDING_CONFIRMATION]: '#3b82f6', 
  [INVOICE_PAYMENT_STATUS.CANCELLED]: '#94a3b8', 
};

export const INTERVENTION_STATUS_COLORS: Record<InterventionStatus, string> = {
  [INTERVENTION_STATUS.NEW]: '#9ca3af',
  [INTERVENTION_STATUS.SCHEDULED]: '#8b5cf6',
  [INTERVENTION_STATUS.EN_ROUTE]: '#6366f1',
  [INTERVENTION_STATUS.IN_PROGRESS]: '#f59e0b', 
  [INTERVENTION_STATUS.COMPLETED]: '#22c55e', 
  [INTERVENTION_STATUS.INVOICED]: '#3b82f6',
  [INTERVENTION_STATUS.PAID]: '#10b981', 
  [INTERVENTION_STATUS.CANCELLED]: '#ef4444', 
};

export const REVENUE_SERIES_COLORS = {
  invoiced: '#8b5cf6',
  collected: '#10b981', 
};

export const PIPELINE_COLORS = ['#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9'];
