import type { EstimateSoftBadgeTone } from '@/entities/estimate/model/estimates';

export const ESTIMATE_STATUS = {
  DRAFT: 'DRAFT',
  MEASURED: 'MEASURED',
  CALCULATED: 'CALCULATED',
  APPROVED: 'APPROVED',
  SENT: 'SENT',
  ACCEPTED: 'ACCEPTED',
  IN_EXECUTION: 'IN_EXECUTION',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
} as const;

export const ESTIMATE_STATUS_CODES = Object.values(ESTIMATE_STATUS);

export const PORTAL_ESTIMATE_ACTION = {
  ACCEPT: ESTIMATE_STATUS.ACCEPTED,
  REJECT: 'REJECTED',
} as const;

export type PortalEstimateActionStatus =
  (typeof PORTAL_ESTIMATE_ACTION)[keyof typeof PORTAL_ESTIMATE_ACTION];

export const ESTIMATE_STATUS_LABELS: Record<
  (typeof ESTIMATE_STATUS)[keyof typeof ESTIMATE_STATUS],
  string
> = {
  [ESTIMATE_STATUS.DRAFT]: 'Ciornă',
  [ESTIMATE_STATUS.MEASURED]: 'Măsurători',
  [ESTIMATE_STATUS.CALCULATED]: 'Calculată',
  [ESTIMATE_STATUS.APPROVED]: 'Aprobată',
  [ESTIMATE_STATUS.SENT]: 'Trimisă',
  [ESTIMATE_STATUS.ACCEPTED]: 'Acceptată',
  [ESTIMATE_STATUS.IN_EXECUTION]: 'În execuție',
  [ESTIMATE_STATUS.DONE]: 'Finalizată',
  [ESTIMATE_STATUS.CANCELLED]: 'Anulată',
};

export const ESTIMATE_STATUS_TONES: Record<
  (typeof ESTIMATE_STATUS)[keyof typeof ESTIMATE_STATUS],
  EstimateSoftBadgeTone
> = {
  [ESTIMATE_STATUS.DRAFT]: 'gray',
  [ESTIMATE_STATUS.MEASURED]: 'blue',
  [ESTIMATE_STATUS.CALCULATED]: 'violet',
  [ESTIMATE_STATUS.APPROVED]: 'violet',
  [ESTIMATE_STATUS.SENT]: 'amber',
  [ESTIMATE_STATUS.ACCEPTED]: 'emerald',
  [ESTIMATE_STATUS.IN_EXECUTION]: 'amber',
  [ESTIMATE_STATUS.DONE]: 'emerald',
  [ESTIMATE_STATUS.CANCELLED]: 'gray',
};
