export const KPI_ACCENTS = [
  { tone: 'bg-white' },
  { tone: 'bg-white' },
  { tone: 'bg-white' },
  { tone: 'bg-white' },
] as const;

export type DashboardKpi = {
  label: string;
  value: string;
  valueSuffix?: string;
  hint: string;
  hintClass: string;
  accent: (typeof KPI_ACCENTS)[number];
  valueClass?: string;
  trend?: string;
  sparklinePoints?: number[];
  sparklineVariant?: 'default' | 'success';
  cardStyle?: 'accent-left' | 'accent-top' | 'default';
  showSparklineDot?: boolean;
  iconVariant?: 'default' | 'accent';
};
