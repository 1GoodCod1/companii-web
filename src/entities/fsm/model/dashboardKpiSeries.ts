import type { CustomerDto, InterventionDto, InvoiceDto } from '@/entities/fsm/model/types';
import { isPaidPaymentStatus } from '@/entities/fsm/model/invoicePaymentStatus';

const SPARKLINE_MONTHS = 10;

type MonthBucket = {
  key: string;
  year: number;
  month: number;
};

function getRecentMonthBuckets(count: number): MonthBucket[] {
  const now = new Date();
  const buckets: MonthBucket[] = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      year: date.getFullYear(),
      month: date.getMonth(),
    });
  }

  return buckets;
}

function monthKeyFromDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function countInMonth(
  items: { createdAt?: string }[],
  year: number,
  month: number,
): number {
  return items.filter((item) => {
    if (!item.createdAt) return false;
    const date = new Date(item.createdAt);
    return date.getFullYear() === year && date.getMonth() === month;
  }).length;
}

function sumInMonth<T>(
  items: T[],
  year: number,
  month: number,
  dateFn: (item: T) => string,
  amountFn: (item: T) => number,
): number {
  return items.reduce((acc, item) => {
    const date = new Date(dateFn(item));
    if (date.getFullYear() !== year || date.getMonth() !== month) return acc;
    return acc + amountFn(item);
  }, 0);
}

function toCumulative(values: number[]): number[] {
  let total = 0;
  return values.map((value) => {
    total += value;
    return total;
  });
}

function endOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

export function formatKpiTrendCount(delta: number): string | undefined {
  if (delta === 0) return undefined;
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta}`;
}

export function formatKpiTrendPercent(change: number): string | undefined {
  if (!Number.isFinite(change) || Math.abs(change) < 0.05) return undefined;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

export function monthOverMonthPercent(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

export function formatMdlKpiAmount(value: number): string {
  return Math.round(Number(value ?? 0)).toLocaleString('ro-MD');
}

export function buildCustomerKpiSeries(customers: CustomerDto[] | undefined) {
  const buckets = getRecentMonthBuckets(SPARKLINE_MONTHS);
  const sparklinePoints = buckets.map((bucket) => {
    const cutoff = endOfMonth(bucket.year, bucket.month);
    return (
      customers?.filter((customer) => customer.createdAt && new Date(customer.createdAt) <= cutoff)
        .length ?? 0
    );
  });

  const now = new Date();
  const currentMonth = countInMonth(customers ?? [], now.getFullYear(), now.getMonth());
  const previousMonth = countInMonth(
    customers ?? [],
    now.getFullYear(),
    now.getMonth() - 1,
  );

  return {
    sparklinePoints,
    trend: formatKpiTrendCount(currentMonth - previousMonth),
  };
}

export function buildInterventionKpiSeries(interventions: InterventionDto[] | undefined) {
  const buckets = getRecentMonthBuckets(SPARKLINE_MONTHS);
  const monthlyNew = buckets.map((bucket) =>
    countInMonth(interventions ?? [], bucket.year, bucket.month),
  );
  const sparklinePoints = toCumulative(monthlyNew);

  const now = new Date();
  const currentMonth = countInMonth(interventions ?? [], now.getFullYear(), now.getMonth());
  const previousMonth = countInMonth(
    interventions ?? [],
    now.getFullYear(),
    now.getMonth() - 1,
  );

  return {
    sparklinePoints,
    trend: formatKpiTrendCount(currentMonth - previousMonth),
  };
}

export function buildInvoicedKpiSeries(invoices: InvoiceDto[] | undefined) {
  const buckets = getRecentMonthBuckets(SPARKLINE_MONTHS);
  const monthly = buckets.map((bucket) =>
    sumInMonth(
      invoices ?? [],
      bucket.year,
      bucket.month,
      (invoice) => invoice.issuedAt,
      (invoice) => Number(invoice.amount),
    ),
  );
  const sparklinePoints = toCumulative(monthly);

  const now = new Date();
  const currentKey = monthKeyFromDate(now);
  const previousKey = monthKeyFromDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const currentMonth = monthly[buckets.findIndex((b) => b.key === currentKey)] ?? 0;
  const previousMonth = monthly[buckets.findIndex((b) => b.key === previousKey)] ?? 0;

  return {
    sparklinePoints,
    trend: formatKpiTrendPercent(monthOverMonthPercent(currentMonth, previousMonth) ?? 0),
  };
}

export function buildPaidKpiSeries(invoices: InvoiceDto[] | undefined) {
  const paid = (invoices ?? []).filter((invoice) => isPaidPaymentStatus(invoice.paymentStatus));
  const buckets = getRecentMonthBuckets(SPARKLINE_MONTHS);
  const monthly = buckets.map((bucket) =>
    sumInMonth(
      paid,
      bucket.year,
      bucket.month,
      (invoice) => invoice.paymentProofConfirmedAt ?? invoice.issuedAt,
      (invoice) => Number(invoice.amount),
    ),
  );
  const sparklinePoints = toCumulative(monthly);

  const now = new Date();
  const currentKey = monthKeyFromDate(now);
  const previousKey = monthKeyFromDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const currentMonth = monthly[buckets.findIndex((b) => b.key === currentKey)] ?? 0;
  const previousMonth = monthly[buckets.findIndex((b) => b.key === previousKey)] ?? 0;

  return {
    sparklinePoints,
    trend: formatKpiTrendPercent(monthOverMonthPercent(currentMonth, previousMonth) ?? 0),
  };
}

export function buildSparklinePaths(
  points: number[],
  width = 108,
  height = 36,
  padding = 3,
): { line: string; area: string; lastX: number; lastY: number } | null {
  if (points.length === 0) return null;

  const normalized =
    points.length === 1 ? [points[0], points[0]] : points;

  const min = Math.min(...normalized);
  const max = Math.max(...normalized);
  const range = max - min || Math.max(max, 1);

  const coords = normalized.map((value, index) => {
    const x = (index / (normalized.length - 1)) * width;
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const line = coords
    .map((coord, index) => `${index === 0 ? 'M' : 'L'}${coord.x.toFixed(2)},${coord.y.toFixed(2)}`)
    .join(' ');
  const last = coords[coords.length - 1];
  const area = `${line} L${last.x.toFixed(2)},${height} L0,${height} Z`;

  return { line, area, lastX: last.x, lastY: last.y };
}
