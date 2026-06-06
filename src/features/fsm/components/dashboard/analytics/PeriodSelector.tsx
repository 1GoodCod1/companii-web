import { cn } from '@/lib/utils';
import { ANALYTICS_PERIODS, type AnalyticsPeriod } from '@/entities/fsm/model/analytics';

export function PeriodSelector({
  value,
  onChange,
  labels,
}: {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
  labels: Record<AnalyticsPeriod, string>;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1" role="tablist">
      {ANALYTICS_PERIODS.map((period) => {
        const active = period === value;
        return (
          <button
            key={period}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(period)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-bold transition-colors',
              active
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {labels[period]}
          </button>
        );
      })}
    </div>
  );
}
