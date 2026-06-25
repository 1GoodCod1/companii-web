import { Link } from 'react-router-dom';
import { BellIcon } from '@phosphor-icons/react';
import { useUnreadCountQuery } from '@/features/notifications/api';

/**
 * Bell entry point in the sidebar. Navigates to the dedicated notifications
 * page and shows a count badge ("circle with N") while there are unread items.
 * `to` lets the company cabinet and the client portal point at their own page.
 */
export function NotificationBell({ to = '/company/notifications' }: { to?: string }) {
  const { data: unreadCount = 0 } = useUnreadCountQuery();

  return (
    <Link
      to={to}
      className="relative flex items-center justify-center size-10 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      aria-label="Notifications"
    >
      <BellIcon className="size-5 text-gray-600" />
      {unreadCount > 0 ? (
        <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full px-1 border-2 border-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
