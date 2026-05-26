export const KPI_ACCENTS = [
  { icon: '👥', tone: 'from-blue-500/10 to-cyan-500/5', iconBg: 'bg-blue-500/10 text-blue-600' },
  { icon: '🔧', tone: 'from-amber-500/10 to-orange-500/5', iconBg: 'bg-amber-500/10 text-amber-600' },
  { icon: '📊', tone: 'from-violet-500/10 to-indigo-500/5', iconBg: 'bg-violet-500/10 text-violet-600' },
  { icon: '💰', tone: 'from-emerald-500/10 to-teal-500/5', iconBg: 'bg-emerald-500/10 text-emerald-600' },
] as const;

export type DashboardKpi = {
  label: string;
  value: string;
  hint: string;
  hintClass: string;
  accent: (typeof KPI_ACCENTS)[number];
  valueClass?: string;
};
