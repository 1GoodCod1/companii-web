import { useMemo } from 'react';
import { EmptyState, SoftBadge } from '@/components/cabinet/cabinet-ui';
import type { CalendarBoardDto, InterventionDto } from '@/types/fsm';
import { InterventionCard } from './InterventionCard';
import { formatDateRo } from '@/utils/date';

type ScheduledIntervention = InterventionDto & { scheduledAt: string };

export function ScheduledColumn({ scheduled }: { scheduled: CalendarBoardDto['scheduled'] }) {
  const grouped = useMemo(() => {
    const items = scheduled.filter((item): item is ScheduledIntervention => !!item.scheduledAt);
    return items.reduce<Record<string, ScheduledIntervention[]>>((acc, item) => {
      const dateStr = formatDateRo(item.scheduledAt, 'weekdayLong');
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(item);
      return acc;
    }, {});
  }, [scheduled]);

  if (scheduled.length === 0) {
    return <EmptyState message="Nicio lucrare programată în această săptămână." />;
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
