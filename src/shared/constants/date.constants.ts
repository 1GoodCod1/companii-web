import type { DateFormatPreset, DateTimeFormatPreset } from '@/shared/types/date';

export const RO_DATE_LOCALE = 'ro-MD';

export const DATE_FORMAT_PRESETS: Record<DateFormatPreset, Intl.DateTimeFormatOptions> = {
  numeric: {},
  short: { day: 'numeric', month: 'short' },
  medium: { day: 'numeric', month: 'short', year: 'numeric' },
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  weekdayLong: { weekday: 'long', day: 'numeric', month: 'long' },
};

export const DATETIME_FORMAT_PRESETS: Record<
  DateTimeFormatPreset,
  Intl.DateTimeFormatOptions | undefined
> = {
  datetime: undefined,
  datetimeShort: { dateStyle: 'short', timeStyle: 'short' },
};

export const DEFAULT_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};
