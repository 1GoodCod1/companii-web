import { cn } from '@/lib/utils';
import type { DashboardKpi } from '@/entities/fsm/model/dashboard.constants';

export function DashboardKpiGrid({
  kpis,
  layout = 'row',
}: {
  kpis: DashboardKpi[];
  layout?: 'row' | 'square';
}) {
  return (
    <div
      className={cn(
        'grid gap-4 sm:gap-5',
        layout === 'square'
          ? 'grid-cols-1 sm:grid-cols-2 h-full [grid-auto-rows:1fr]'
          : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
      )}
    >
      {kpis.map((kpi) => (
        <article
          key={kpi.label}
          className={`relative overflow-hidden rounded-none ${kpi.accent.tone} p-5 glass-panel flex flex-col justify-center`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{kpi.label}</span>
          <p className={`mt-5 text-2xl sm:text-3xl font-black tracking-tight text-gray-900 ${kpi.valueClass ?? ''}`}>
            {kpi.value}
          </p>
          <p className={`text-[10px] font-bold mt-2 ${kpi.hintClass}`}>{kpi.hint}</p>
        </article>
      ))}
    </div>
  );
}
