import type { TFunction } from 'i18next';
import type { DurationUnit } from '@/constants/services.constants';

export function minutesToDurationForm(minutes: number | null | undefined): {
  value: string;
  unit: DurationUnit;
} {
  if (minutes == null || minutes <= 0) {
    return { value: '', unit: 'hours' };
  }
  if (minutes % 1440 === 0) {
    return { value: String(minutes / 1440), unit: 'days' };
  }
  if (minutes % 60 === 0) {
    return { value: String(minutes / 60), unit: 'hours' };
  }
  return { value: String(minutes), unit: 'minutes' };
}

export function durationFormToMinutes(value: string, unit: DurationUnit): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num <= 0) return null;
  const factor = unit === 'days' ? 1440 : unit === 'hours' ? 60 : 1;
  return Math.round(num * factor);
}

export function formatServiceDuration(minutes: number | null | undefined): string | null {
  if (minutes == null || minutes <= 0) return null;
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return `${days} ${days === 1 ? 'zi' : 'zile'}`;
  }
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} ${hours === 1 ? 'oră' : 'ore'}`;
  }
  return `${minutes} min`;
}

export function formatServiceDurationI18n(
  t: TFunction,
  minutes: number | null | undefined,
): string | null {
  if (minutes == null || minutes <= 0) return null;
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return t(days === 1 ? 'serviceDuration.day' : 'serviceDuration.days', { count: days });
  }
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return t(hours === 1 ? 'serviceDuration.hour' : 'serviceDuration.hours', { count: hours });
  }
  return t('serviceDuration.minutes', { count: minutes });
}
