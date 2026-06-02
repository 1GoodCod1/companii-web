export const INTERVENTION_STATUS = {
  NEW: 'NEW',
  SCHEDULED: 'SCHEDULED',
  EN_ROUTE: 'EN_ROUTE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  INVOICED: 'INVOICED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

export const INTERVENTION_STATUS_CODES = Object.values(INTERVENTION_STATUS);

export const TERMINAL_INTERVENTION_STATUSES = [
  INTERVENTION_STATUS.PAID,
  INTERVENTION_STATUS.CANCELLED,
] as const;

export const INACTIVE_INTERVENTION_STATUSES = [
  INTERVENTION_STATUS.COMPLETED,
  INTERVENTION_STATUS.CANCELLED,
  INTERVENTION_STATUS.PAID,
] as const;

export const INTERVENTION_STATUS_LABELS: Record<
  (typeof INTERVENTION_STATUS)[keyof typeof INTERVENTION_STATUS],
  string
> = {
  [INTERVENTION_STATUS.NEW]: 'Nouă',
  [INTERVENTION_STATUS.SCHEDULED]: 'Programată',
  [INTERVENTION_STATUS.EN_ROUTE]: 'În deplasare',
  [INTERVENTION_STATUS.IN_PROGRESS]: 'În lucru',
  [INTERVENTION_STATUS.COMPLETED]: 'Finalizată',
  [INTERVENTION_STATUS.INVOICED]: 'Facturată',
  [INTERVENTION_STATUS.PAID]: 'Plătită',
  [INTERVENTION_STATUS.CANCELLED]: 'Anulată',
};

export const INTERVENTION_STATUS_TABS = [
  { label: 'Toate', value: '' },
  { label: 'Noi', value: INTERVENTION_STATUS.NEW },
  { label: 'Programate', value: INTERVENTION_STATUS.SCHEDULED },
  { label: 'În deplasare', value: INTERVENTION_STATUS.EN_ROUTE },
  { label: 'În lucru', value: INTERVENTION_STATUS.IN_PROGRESS },
  { label: 'Finalizate', value: INTERVENTION_STATUS.COMPLETED },
  { label: 'Facturate', value: INTERVENTION_STATUS.INVOICED },
  { label: 'Plătite', value: INTERVENTION_STATUS.PAID },
  { label: 'Anulate', value: INTERVENTION_STATUS.CANCELLED },
] as const;

export const INTERVENTION_STATUS_BADGE_CLASSES: Record<string, string> = {
  [INTERVENTION_STATUS.NEW]: 'bg-gray-100 text-gray-800 border-gray-200',
  [INTERVENTION_STATUS.SCHEDULED]: 'bg-purple-50 text-purple-700 border-purple-200',
  [INTERVENTION_STATUS.EN_ROUTE]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  [INTERVENTION_STATUS.IN_PROGRESS]: 'bg-amber-50 text-orange-700 border-amber-200',
  [INTERVENTION_STATUS.COMPLETED]: 'bg-green-50 text-green-700 border-green-200',
  [INTERVENTION_STATUS.INVOICED]: 'bg-blue-50 text-blue-700 border-blue-200',
  [INTERVENTION_STATUS.PAID]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [INTERVENTION_STATUS.CANCELLED]: 'bg-red-50 text-red-700 border-red-200',
};

export const INTERVENTION_STATUS_DEFAULT_BADGE_CLASS =
  'bg-gray-50 text-gray-600 border-gray-100';

export type InterventionCalendarTone = 'gray' | 'amber' | 'blue' | 'emerald' | 'violet';

export const INTERVENTION_CALENDAR_STATUS_TONES: Record<string, InterventionCalendarTone> = {
  [INTERVENTION_STATUS.SCHEDULED]: 'violet',
  [INTERVENTION_STATUS.EN_ROUTE]: 'amber',
  [INTERVENTION_STATUS.IN_PROGRESS]: 'amber',
  [INTERVENTION_STATUS.COMPLETED]: 'emerald',
  [INTERVENTION_STATUS.PAID]: 'emerald',
  [INTERVENTION_STATUS.INVOICED]: 'blue',
};

export const INTERVENTION_TIMELINE_STATUS_TONES: Partial<
  Record<(typeof INTERVENTION_STATUS)[keyof typeof INTERVENTION_STATUS], InterventionCalendarTone>
> = {
  [INTERVENTION_STATUS.COMPLETED]: 'emerald',
  [INTERVENTION_STATUS.PAID]: 'emerald',
  [INTERVENTION_STATUS.SCHEDULED]: 'amber',
  [INTERVENTION_STATUS.IN_PROGRESS]: 'amber',
};
