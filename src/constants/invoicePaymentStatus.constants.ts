/** Canonical invoice payment status codes. */
export const INVOICE_PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
} as const;

export const INVOICE_PAYMENT_STATUS_CODES = Object.values(INVOICE_PAYMENT_STATUS);

export const PAYMENT_STATUS_LABELS: Record<
  (typeof INVOICE_PAYMENT_STATUS)[keyof typeof INVOICE_PAYMENT_STATUS],
  string
> = {
  [INVOICE_PAYMENT_STATUS.UNPAID]: 'Neplătită',
  [INVOICE_PAYMENT_STATUS.PAID]: 'Plătită',
  [INVOICE_PAYMENT_STATUS.OVERDUE]: 'Restantă',
};

export const PAYMENT_STATUS_BADGE_CLASSES: Record<string, string> = {
  [INVOICE_PAYMENT_STATUS.PAID]: 'bg-emerald-50 text-emerald-700',
  [INVOICE_PAYMENT_STATUS.OVERDUE]: 'bg-red-50 text-red-700',
  [INVOICE_PAYMENT_STATUS.UNPAID]: 'bg-amber-50 text-amber-700',
};

export const INVOICE_PAYMENT_STATUS_BORDER_CLASSES: Record<string, string> = {
  [INVOICE_PAYMENT_STATUS.UNPAID]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  [INVOICE_PAYMENT_STATUS.PAID]: 'bg-green-50 text-green-700 border-green-200',
  [INVOICE_PAYMENT_STATUS.OVERDUE]: 'bg-red-50 text-red-700 border-red-200',
};

export const INVOICE_PAYMENT_STATUS_DEFAULT_BORDER_CLASS =
  'bg-gray-50 text-gray-600 border-gray-100';
