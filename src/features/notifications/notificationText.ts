import type { TFunction } from 'i18next';
import i18n from '@/shared/config/i18n';
import type { NotificationItem } from './types';

/**
 * Resolve the display title/body for a notification.
 *
 * The API stores a Romanian title/message (used by Telegram and as a fallback)
 * and, for known events, a stable `metadata.i18nKey` plus `metadata.params`.
 * When a key is present we render it through i18next so the text follows the
 * user's current language and re-renders on language switch; otherwise we fall
 * back to the stored text.
 */
export function resolveNotificationText(
  notif: NotificationItem,
  t: TFunction,
): { title: string; message: string } {
  const meta = notif.metadata as Record<string, unknown> | undefined;
  const key = typeof meta?.i18nKey === 'string' ? meta.i18nKey : null;
  const fallbackTitle = notif.title ?? '';
  const fallbackMessage = notif.message ?? '';

  if (!key) return { title: fallbackTitle, message: fallbackMessage };

  const params =
    meta?.params && typeof meta.params === 'object'
      ? (meta.params as Record<string, unknown>)
      : {};
  const base = `notifications.messages.${key}`;
  const title = t(`${base}.title`, { defaultValue: fallbackTitle, ...params });

  let message: string;
  if (key === 'newLead') {
    const lines = [t(`${base}.client`, params)];
    if (params.serviceTitle) lines.push(t(`${base}.service`, params));
    if (params.estimatedBudget) {
      lines.push(t(`${base}.budget`, { budget: params.estimatedBudget }));
    }
    message = lines.join('\n');
  } else if (key === 'interventionScheduled' && params.scheduledAt) {
    const date = new Date(String(params.scheduledAt)).toLocaleString(i18n.language);
    message = t(`${base}.bodyDated`, { defaultValue: fallbackMessage, date, ...params });
  } else {
    message = t(`${base}.body`, { defaultValue: fallbackMessage, ...params });
  }

  return { title, message };
}
