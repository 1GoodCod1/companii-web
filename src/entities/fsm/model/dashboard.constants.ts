export const KPI_ACCENTS = [
  { tone: 'bg-blue-50' },
  { tone: 'bg-amber-50' },
  { tone: 'bg-violet-50' },
  { tone: 'bg-emerald-50' },
] as const;

export type DashboardKpi = {
  label: string;
  value: string;
  hint: string;
  hintClass: string;
  accent: (typeof KPI_ACCENTS)[number];
  valueClass?: string;
};
