import type { InterventionStatus, InvoicePaymentStatus } from './types';

export const ANALYTICS_PERIODS = ['30d', '90d', '12m'] as const;
export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

export interface RevenueTrendPointDto {
  bucketStart: string;
  invoiced: number;
  collected: number;
}

export interface InvoiceStatusSliceDto {
  status: InvoicePaymentStatus;
  count: number;
  amount: number;
}

export interface InterventionStatusSliceDto {
  status: InterventionStatus;
  count: number;
}

export interface SalesPipelineDto {
  leads: number;
  quotes: number;
  accepted: number;
  completed: number;
  paid: number;
}

/** Mirrors the `/fsm/analytics/overview` response (companii-api). */
export interface CompanyAnalyticsOverviewDto {
  period: AnalyticsPeriod;
  generatedAt: string;
  revenueTrend: RevenueTrendPointDto[];
  invoiceStatus: InvoiceStatusSliceDto[];
  interventionStatus: InterventionStatusSliceDto[];
  pipeline: SalesPipelineDto;
}
