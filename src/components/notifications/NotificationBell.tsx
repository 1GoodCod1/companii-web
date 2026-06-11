import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { BellIcon, CheckIcon, TrashIcon } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteAllNotifications,
} from '@/features/notifications/api';

export function NotificationBell() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0, isRightAligned: false, placement: 'right' });

  const { data: unreadCount = 0 } = useUnreadCountQuery();
  const { data: notifications = [], isLoading } = useNotificationsQuery(50, false);
  const markAsRead = useMarkNotificationAsRead();
  const markAllRead = useMarkAllNotificationsAsRead();
  const deleteAll = useDeleteAllNotifications();

  // Close on outside click or resize
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current && !containerRef.current.contains(event.target as Node) &&
        popupRef.current && !popupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleResize() {
      if (isOpen) setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleResize);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popupWidth = window.innerWidth < 640 ? 280 : 320;
      
      let left = rect.right + 14;
      let top = rect.top - 4; // Slightly higher than the bell
      let placement = 'right';
      let isRightAligned = false;

      // If it would overflow the screen to the right, fall back to drop-down
      if (left + popupWidth > window.innerWidth - 16) {
        placement = 'bottom';
        top = rect.bottom + 12;
        left = rect.right - popupWidth + 4;
        isRightAligned = true;
      }

      setPopupPos({ top, left, isRightAligned, placement });
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = (id: string, read: boolean) => {
    if (!read) {
      markAsRead.mutate(id);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative flex items-center justify-center size-10 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        aria-label="Notifications"
      >
        <BellIcon className="size-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full px-1 border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={popupRef}
              initial={popupPos.placement === 'right' ? { opacity: 0, x: -10, scale: 0.98 } : { opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={popupPos.placement === 'right' ? { opacity: 0, x: -10, scale: 0.98 } : { opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{ position: 'fixed', top: popupPos.top, left: popupPos.left }}
              className={cn(
                "w-[280px] sm:w-[320px] bg-white border border-gray-100 shadow-[0_4px_24px_rgb(0,0,0,0.08)] rounded-2xl z-[9999] flex flex-col",
                popupPos.placement === 'right' ? "origin-top-left" : (popupPos.isRightAligned ? "origin-top-right" : "origin-top-left")
              )}
            >
              {/* Pointer triangle */}
              {popupPos.placement === 'right' ? (
                <div className="absolute -left-1.5 top-[18px] w-3 h-3 bg-white border-l border-b border-gray-100 rotate-45 z-[-1]" />
              ) : (
                <div 
                  className={cn(
                    "absolute -top-1.5 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45 z-[-1]",
                    popupPos.isRightAligned ? "right-6" : "left-6"
                  )} 
                />
              )}
              
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-white rounded-t-2xl z-10">
                <h3 className="text-sm font-bold text-gray-800">
                  {t('notifications.title', 'Уведомления')}
                </h3>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead.mutate()}
                      className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50/50 rounded-lg transition-colors"
                      title={t('notifications.markAllRead', 'Прочитать все')}
                    >
                      <CheckIcon className="size-4" weight="bold" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={() => deleteAll.mutate()}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-colors"
                      title={t('notifications.deleteAll', 'Удалить все')}
                    >
                      <TrashIcon className="size-4" weight="bold" />
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-1.5 flex flex-col gap-0.5 bg-white rounded-b-2xl z-10">
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="size-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                    <BellIcon className="size-8 text-gray-200 mb-2" weight="light" />
                    <p className="text-[13px] font-semibold text-gray-500">
                      {t('notifications.emptyTitle', 'Нет уведомлений')}
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'px-3 py-2.5 rounded-xl transition-all cursor-pointer group hover:bg-gray-50 flex gap-3',
                        !notif.read ? 'bg-violet-50/30' : ''
                      )}
                      onClick={() => handleMarkAsRead(notif.id, notif.read)}
                    >
                      <div className="mt-1 flex-shrink-0">
                        <div className={cn(
                          "size-2 rounded-full",
                          !notif.read ? "bg-violet-500" : "bg-transparent"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {notif.title && (
                          <p className={cn(
                            "text-[13px] truncate",
                            !notif.read ? "font-bold text-gray-900" : "font-medium text-gray-600"
                          )}>
                            {notif.title}
                          </p>
                        )}
                        <p className={cn(
                          "text-[12px] leading-snug line-clamp-2 mt-0.5",
                          !notif.read ? "text-gray-700" : "text-gray-500"
                        )}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
