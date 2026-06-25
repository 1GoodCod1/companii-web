import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BellIcon, CaretRightIcon, CheckIcon, TrashIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteAllNotifications,
} from '@/features/notifications/api';
import { getNotificationLink, type NotificationAudience } from '@/features/notifications/notificationLink';
import { resolveNotificationText } from '@/features/notifications/notificationText';
import type { NotificationItem } from '@/features/notifications/types';

export function NotificationsScreen({ audience }: { audience: NotificationAudience }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useUnreadCountQuery();
  const { data: notifications = [] as NotificationItem[], isLoading } = useNotificationsQuery(100, false);
  const markAsRead = useMarkNotificationAsRead();
  const markAllRead = useMarkAllNotificationsAsRead();
  const deleteAll = useDeleteAllNotifications();

  const handleOpen = (notif: NotificationItem) => {
    if (!notif.read) markAsRead.mutate(notif.id);
    const link = getNotificationLink(notif, audience);
    if (link) navigate(link);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {t('notifications.title', 'Уведомления')}
          </h1>
          {unreadCount > 0 ? (
            <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 text-xs font-bold text-white bg-violet-600 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="inline-flex items-center gap-1.5 border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-violet-300 hover:text-violet-700 transition-colors disabled:opacity-50"
            >
              <CheckIcon className="size-4" weight="bold" />
              {t('notifications.markAllRead', 'Прочитать все')}
            </button>
          ) : null}
          {notifications.length > 0 ? (
            <button
              type="button"
              onClick={() => deleteAll.mutate()}
              disabled={deleteAll.isPending}
              className="inline-flex items-center gap-1.5 border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-500 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              <TrashIcon className="size-4" weight="bold" />
              {t('notifications.deleteAll', 'Удалить все')}
            </button>
          ) : null}
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="size-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="border border-gray-200 bg-white px-6 py-16 text-center">
          <BellIcon className="size-10 text-gray-200 mx-auto mb-3" weight="light" />
          <p className="text-sm font-semibold text-gray-500">
            {t('notifications.emptyTitle', 'Нет уведомлений')}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((notif: NotificationItem) => {
            const link = getNotificationLink(notif, audience);
            const { title, message } = resolveNotificationText(notif, t);
            return (
              <li key={notif.id}>
                <button
                  type="button"
                  onClick={() => handleOpen(notif)}
                  className={cn(
                    'group flex w-full gap-3 border px-4 py-3 text-left transition-colors',
                    notif.read
                      ? 'border-gray-200 bg-white hover:bg-gray-50'
                      : 'border-violet-200 bg-violet-50/40 hover:bg-violet-50',
                  )}
                >
                  <span
                    className={cn(
                      'mt-1.5 size-2 shrink-0 rounded-full',
                      notif.read ? 'bg-transparent' : 'bg-violet-600',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          'truncate text-sm',
                          notif.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900',
                        )}
                      >
                        {title}
                      </p>
                      {!notif.read ? (
                        <span className="shrink-0 inline-flex items-center rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          {t('notifications.newBadge', 'Новое')}
                        </span>
                      ) : null}
                    </div>
                    <p
                      className={cn(
                        'mt-0.5 text-sm leading-snug',
                        notif.read ? 'text-gray-500' : 'text-gray-700',
                      )}
                    >
                      {message}
                    </p>
                    <p className="mt-1.5 text-xs text-gray-400">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {link ? (
                    <CaretRightIcon className="size-4 shrink-0 self-center text-gray-300 transition-colors group-hover:text-violet-500" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
