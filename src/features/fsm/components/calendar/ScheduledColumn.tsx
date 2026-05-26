import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState, SoftBadge } from '@/components/cabinet/cabinet-ui';
import type { CalendarBoardDto, InterventionDto } from '@/types/fsm';
import { useLocale } from '@/hooks/useLocale';
import { InterventionCard } from './InterventionCard';
import { formatDateLocalized } from '@/utils/date';

type ScheduledIntervention = InterventionDto & { scheduledAt: string };

export function ScheduledColumn({ scheduled }: { scheduled: CalendarBoardDto['scheduled'] }) {
  const { t } = useTranslation();
  const locale = useLocale();

  const grouped = useMemo(() => {
    const items = scheduled.filter((item): item is ScheduledIntervention => !!item.scheduledAt);
    return items.reduce<Record<string, ScheduledIntervention[]>>((acc, item) => {
      const dateStr = formatDateLocalized(item.scheduledAt, locale, 'weekdayLong');
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(item);
      return acc;
    }, {});
  }, [scheduled, locale]);

  if (scheduled.length === 0) {
    return <EmptyState message={t('company.fsm.calendar.scheduled.empty')} />;
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([dateStr, items]) => (
        <section key={dateStr} className="space-y-3">
          <SoftBadge tone="violet">📅 {dateStr}</SoftBadge>
          <div className="space-y-3">
            {items.map((item) => (
              <InterventionCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
