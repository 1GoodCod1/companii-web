export type PortalBadgeTone = 'violet' | 'emerald' | 'amber' | 'blue' | 'gray';

export function interventionStatusTone(status: string): PortalBadgeTone {
  switch (status) {
    case 'SCHEDULED':
      return 'violet';
    case 'EN_ROUTE':
    case 'IN_PROGRESS':
      return 'amber';
    case 'COMPLETED':
    case 'PAID':
      return 'emerald';
    case 'INVOICED':
      return 'blue';
    case 'CANCELLED':
      return 'gray';
    default:
      return 'gray';
  }
}

export function quoteStatusTone(status: string): PortalBadgeTone {
  if (status === 'SENT') return 'blue';
  if (status === 'ACCEPTED') return 'emerald';
  if (status === 'REJECTED') return 'gray';
  return 'violet';
}

export function invoiceStatusTone(status: string): PortalBadgeTone {
  if (status === 'PAID') return 'emerald';
  if (status === 'OVERDUE') return 'amber';
  return 'blue';
}
