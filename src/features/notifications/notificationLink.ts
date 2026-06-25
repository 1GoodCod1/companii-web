import type { NotificationItem } from './types';

export type NotificationAudience = 'company' | 'portal';

/** Company cabinet (FSM CRM) deep links. */
const COMPANY_LINKS: Record<string, string> = {
  NEW_LEAD: '/company/cereri',
  LEAD_STATUS_UPDATED: '/company/cereri',
  NEW_REVIEW: '/company/recenzii',
  QUOTE_SENT: '/company/oferte',
  QUOTE_ACCEPTED: '/company/oferte',
  PAYMENT_SUCCESS: '/company/facturi',
  INVOICE_ISSUED: '/company/facturi',
  INTERVENTION_SCHEDULED: '/company/calendar',
  INTERVENTION_COMPLETED: '/company/lucrari',
  NEW_PORTAL_CUSTOMER: '/company/clienti',
  SUBSCRIPTION_EXPIRING: '/company/subscription',
};

/** Client portal deep links (end-client cabinet). */
const PORTAL_LINKS: Record<string, string> = {
  NEW_LEAD: '/portal/cereri',
  LEAD_STATUS_UPDATED: '/portal/cereri',
  QUOTE_SENT: '/portal/oferte',
  QUOTE_ACCEPTED: '/portal/oferte',
  PAYMENT_SUCCESS: '/portal/facturi',
  INVOICE_ISSUED: '/portal/facturi',
  INTERVENTION_SCHEDULED: '/portal/lucrari',
  INTERVENTION_COMPLETED: '/portal/lucrari',
};

/**
 * Resolve where a notification should navigate. Prefers an explicit relative
 * `metadata.link` (set by the backend), otherwise falls back to a per-audience
 * category map. Returns `null` when there is no meaningful destination.
 */
export function getNotificationLink(
  notif: NotificationItem,
  audience: NotificationAudience = 'company',
): string | null {
  const meta = notif.metadata as Record<string, unknown> | undefined;
  const explicit = meta?.link ?? meta?.url;
  if (typeof explicit === 'string' && explicit.startsWith('/')) return explicit;

  const map = audience === 'portal' ? PORTAL_LINKS : COMPANY_LINKS;
  if (notif.category && map[notif.category]) return map[notif.category];
  return null;
}
