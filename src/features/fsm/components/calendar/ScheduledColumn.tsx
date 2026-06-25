import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarBlankIcon } from '@phosphor-icons/react';
import { EmptyState } from '@/widgets/cabinet/cabinet-ui';
import type { CalendarBoardDto, InterventionDto } from '@/entities/fsm/model/types';
import { useLocale } from '@/shared/hooks/useLocale';
import { InterventionCard } from './InterventionCard';
import { formatDateLocalized } from '@/shared/utils/date';
import { calendarDayHeaderClass, calendarDayLabelClass } from './calendarPanelUi';

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
    return <EmptyState message={t('company.fsm.calendar.scheduled.empty')} compact />;
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([dateStr, items]) => (
        <section key={dateStr} className="space-y-3">
          <div className={calendarDayHeaderClass}>
            <CalendarBlankIcon className="size-3.5 text-[var(--dashboard-accent)]" weight="fill" />
            <span className={calendarDayLabelClass}>{dateStr}</span>
          </div>
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
