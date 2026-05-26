import type { LeadSoftBadgeTone } from '@/types/lead';

/** Canonical lead (cerere) status codes. */
export const LEAD_STATUS = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  IN_PROGRESS: 'IN_PROGRESS',
  CONVERTED: 'CONVERTED',
  LOST: 'LOST',
} as const;

export const LEAD_STATUS_CODES = Object.values(LEAD_STATUS);

export const CLOSED_LEAD_STATUSES = [LEAD_STATUS.CONVERTED, LEAD_STATUS.LOST] as const;

export const LEAD_STATUS_FILTERS: Array<{
  value?: (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];
  label: string;
}> = [
  { label: 'Toate' },
  { label: 'Noi', value: LEAD_STATUS.NEW },
  { label: 'Contactate', value: LEAD_STATUS.CONTACTED },
  { label: 'Calificate', value: LEAD_STATUS.QUALIFIED },
  { label: 'În lucru', value: LEAD_STATUS.IN_PROGRESS },
  { label: 'Finalizate', value: LEAD_STATUS.CONVERTED },
  { label: 'Pierdute', value: LEAD_STATUS.LOST },
];

export const LEAD_STATUS_LABELS: Record<
  (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS],
  string
> = {
  [LEAD_STATUS.NEW]: 'Nouă',
  [LEAD_STATUS.CONTACTED]: 'Contactată',
  [LEAD_STATUS.QUALIFIED]: 'Calificată',
  [LEAD_STATUS.IN_PROGRESS]: 'În lucru',
  [LEAD_STATUS.CONVERTED]: 'Finalizată',
  [LEAD_STATUS.LOST]: 'Pierdută',
};

export const LEAD_STATUS_TONES: Record<
  (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS],
  LeadSoftBadgeTone
> = {
  [LEAD_STATUS.NEW]: 'amber',
  [LEAD_STATUS.CONTACTED]: 'blue',
  [LEAD_STATUS.QUALIFIED]: 'violet',
  [LEAD_STATUS.IN_PROGRESS]: 'blue',
  [LEAD_STATUS.CONVERTED]: 'emerald',
  [LEAD_STATUS.LOST]: 'gray',
};

/** Statuses available when editing a lead in the inbox. */
export const LEAD_STATUS_OPTIONS: (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS][] = [
  LEAD_STATUS.NEW,
  LEAD_STATUS.CONTACTED,
  LEAD_STATUS.QUALIFIED,
  LEAD_STATUS.IN_PROGRESS,
  LEAD_STATUS.LOST,
];
