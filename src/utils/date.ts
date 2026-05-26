import {
  DATE_FORMAT_PRESETS,
  DATETIME_FORMAT_PRESETS,
  DEFAULT_TIME_FORMAT_OPTIONS,
  RO_DATE_LOCALE,
} from '@/constants/date.constants';
import type { DateFormatPreset, DateTimeFormatPreset } from '@/types/date';

export function parseDateInput(
  value: string | Date | number | null | undefined,
): Date | null {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateRo(
  value: string | Date | number | null | undefined,
  preset: DateFormatPreset = 'numeric',
  fallback = '',
): string {
  const date = parseDateInput(value);
  if (!date) return fallback;
  return date.toLocaleDateString(RO_DATE_LOCALE, DATE_FORMAT_PRESETS[preset]);
}

export function formatDateRoOrNull(
  value: string | Date | number | null | undefined,
  preset: DateFormatPreset = 'medium',
): string | null {
  const formatted = formatDateRo(value, preset);
  return formatted || null;
}

export function formatDateTimeRo(
  value: string | Date | number | null | undefined,
  preset: DateTimeFormatPreset = 'datetime',
  fallback = '',
): string {
  const date = parseDateInput(value);
  if (!date) return fallback;
  const options = DATETIME_FORMAT_PRESETS[preset];
  return options
    ? date.toLocaleString(RO_DATE_LOCALE, options)
    : date.toLocaleString(RO_DATE_LOCALE);
}

export function formatTimeRo(
  value: string | Date | number | null | undefined,
  fallback = '',
  options: Intl.DateTimeFormatOptions = DEFAULT_TIME_FORMAT_OPTIONS,
): string {
  const date = parseDateInput(value);
  if (!date) return fallback;
  return date.toLocaleTimeString(RO_DATE_LOCALE, options);
}

export function formatWeekRangeLabel(from: string, to: string): string {
  return `${formatDateRo(from, 'short')} – ${formatDateRo(to, 'medium')}`;
}
