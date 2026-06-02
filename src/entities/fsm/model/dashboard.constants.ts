export const KPI_ACCENTS = [
  { icon: '👥', tone: 'bg-blue-50', iconBg: 'bg-blue-500/10 text-blue-600' },
  { icon: '🔧', tone: 'bg-amber-50', iconBg: 'bg-amber-500/10 text-amber-600' },
  { icon: '📊', tone: 'bg-violet-50', iconBg: 'bg-violet-500/10 text-violet-600' },
  { icon: '💰', tone: 'bg-emerald-50', iconBg: 'bg-emerald-500/10 text-emerald-600' },
] as const;

export type DashboardKpi = {
  label: string;
  value: string;
  hint: string;
  hintClass: string;
  accent: (typeof KPI_ACCENTS)[number];
  valueClass?: string;
};
