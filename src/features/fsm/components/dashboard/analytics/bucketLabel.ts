import type { AnalyticsPeriod } from '@/entities/fsm/model/analytics';

export function formatBucketLabel(
  bucketStart: string,
  period: AnalyticsPeriod,
  lang: string,
): string {
  const date = new Date(bucketStart);
  const locale = lang?.startsWith('ru') ? 'ru-RU' : 'ro-RO';
  const options: Intl.DateTimeFormatOptions =
    period === '12m'
      ? { month: 'short', year: '2-digit', timeZone: 'UTC' }
      : { day: 'numeric', month: 'short', timeZone: 'UTC' };
  return new Intl.DateTimeFormat(locale, options).format(date);
}
