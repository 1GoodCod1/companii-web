import type { DashboardKpi } from '@/utils/dashboard';

export function DashboardKpiGrid({ kpis }: { kpis: DashboardKpi[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {kpis.map((kpi) => (
        <article
          key={kpi.label}
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${kpi.accent.tone} p-5 shadow-premium`}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{kpi.label}</span>
            <span className={`flex h-10 w-10 items-center justify-center rounded-2xl text-lg ${kpi.accent.iconBg}`}>
              {kpi.accent.icon}
            </span>
          </div>
          <p className={`mt-5 text-2xl sm:text-3xl font-black tracking-tight text-gray-900 ${kpi.valueClass ?? ''}`}>
            {kpi.value}
          </p>
          <p className={`text-[10px] font-bold mt-2 ${kpi.hintClass}`}>{kpi.hint}</p>
        </article>
      ))}
    </div>
  );
}
