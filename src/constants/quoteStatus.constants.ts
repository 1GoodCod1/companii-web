/** Canonical quote (ofertă) status codes. */
export const QUOTE_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CONVERTED: 'CONVERTED',
} as const;

export const QUOTE_STATUS_CODES = Object.values(QUOTE_STATUS);

/** Portal client can accept or reject when quote is sent. */
export const PORTAL_QUOTE_ACTION_STATUSES = [
  QUOTE_STATUS.ACCEPTED,
  QUOTE_STATUS.REJECTED,
] as const;

export type PortalQuoteActionStatus = (typeof PORTAL_QUOTE_ACTION_STATUSES)[number];

export const QUOTE_STATUS_BADGE_CLASSES: Record<string, string> = {
  [QUOTE_STATUS.DRAFT]: 'bg-gray-100 text-gray-700 border-gray-200',
  [QUOTE_STATUS.SENT]: 'bg-blue-50 text-blue-700 border-blue-200',
  [QUOTE_STATUS.ACCEPTED]: 'bg-green-50 text-green-700 border-green-200',
  [QUOTE_STATUS.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
  [QUOTE_STATUS.CONVERTED]: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

export const QUOTE_STATUS_DEFAULT_BADGE_CLASS =
  'bg-gray-50 text-gray-600 border-gray-100';
