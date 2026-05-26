import {
  DATE_FORMAT_PRESETS,
  DATETIME_FORMAT_PRESETS,
  DEFAULT_TIME_FORMAT_OPTIONS,
  RO_DATE_LOCALE,
} from '@/constants/date.constants';
import type { AppLanguage } from '@/i18n/utils';
import type { DateFormatPreset, DateTimeFormatPreset } from '@/types/date';

const DATE_LOCALE_BY_LANG: Record<AppLanguage, string> = {
  ro: RO_DATE_LOCALE,
  ru: 'ru-RU',
};

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
  return formatDateLocalized(value, 'ro', preset, fallback);
}

export function formatDateLocalized(
  value: string | Date | number | null | undefined,
  locale: AppLanguage,
  preset: DateFormatPreset = 'numeric',
  fallback = '',
): string {
  const date = parseDateInput(value);
  if (!date) return fallback;
  return date.toLocaleDateString(DATE_LOCALE_BY_LANG[locale], DATE_FORMAT_PRESETS[preset]);
}

export function formatDateRoOrNull(
  value: string | Date | number | null | undefined,
  preset: DateFormatPreset = 'medium',
  locale: AppLanguage = 'ro',
): string | null {
  const formatted = formatDateLocalized(value, locale, preset);
  return formatted || null;
}

export function formatDateTimeRo(
  value: string | Date | number | null | undefined,
  preset: DateTimeFormatPreset = 'datetime',
  fallback = '',
): string {
  return formatDateTimeLocalized(value, 'ro', preset, fallback);
}

export function formatDateTimeLocalized(
  value: string | Date | number | null | undefined,
  locale: AppLanguage,
  preset: DateTimeFormatPreset = 'datetime',
  fallback = '',
): string {
  const date = parseDateInput(value);
  if (!date) return fallback;
  const options = DATETIME_FORMAT_PRESETS[preset];
  const dateLocale = DATE_LOCALE_BY_LANG[locale];
  return options
    ? date.toLocaleString(dateLocale, options)
    : date.toLocaleString(dateLocale);
}

export function formatTimeRo(
  value: string | Date | number | null | undefined,
  fallback = '',
  options: Intl.DateTimeFormatOptions = DEFAULT_TIME_FORMAT_OPTIONS,
): string {
  return formatTimeLocalized(value, 'ro', fallback, options);
}

export function formatTimeLocalized(
  value: string | Date | number | null | undefined,
  locale: AppLanguage,
  fallback = '',
  options: Intl.DateTimeFormatOptions = DEFAULT_TIME_FORMAT_OPTIONS,
): string {
  const date = parseDateInput(value);
  if (!date) return fallback;
  return date.toLocaleTimeString(DATE_LOCALE_BY_LANG[locale], options);
}

export function formatWeekRangeLabel(
  from: string,
  to: string,
  locale: AppLanguage = 'ro',
): string {
  return `${formatDateLocalized(from, locale, 'short')} – ${formatDateLocalized(to, locale, 'medium')}`;
}
