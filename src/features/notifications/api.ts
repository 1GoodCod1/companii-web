import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client/apiFetch';
import type { NotificationItem } from './types';

interface RawNotificationItem {
  id: string;
  type: string;
  category?: string;
  title?: string;
  message: string;
  createdAt: string | Date;
  readAt?: string | Date | null;
  metadata?: Record<string, unknown>;
}

function mapApiToItem(raw: RawNotificationItem): NotificationItem {
  return {
    id: raw.id,
    type: raw.type,
    category: raw.category,
    title: raw.title ?? 'Notificare',
    message: raw.message,
    createdAt: new Date(raw.createdAt).getTime(),
    read: raw.readAt != null,
    metadata: raw.metadata,
  };
}

export function useNotificationsQuery(limit = 50, unreadOnly = false) {
  return useQuery<NotificationItem[]>({
    queryKey: ['notifications', { limit, unreadOnly }],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (limit) qs.set('limit', String(limit));
      if (unreadOnly) qs.set('unreadOnly', 'true');
      
      const res = await apiFetch(`/notifications?${qs.toString()}`);
      const responseData = res as { data?: RawNotificationItem[] };
      const rawItems = responseData.data || (res as RawNotificationItem[]);
      return (rawItems as RawNotificationItem[]).map(mapApiToItem);
    },
    refetchInterval: 60000,
  });
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async () => {
      const res = await apiFetch('/notifications/unread-count');
      return (res as { count: number }).count;
    },
    refetchInterval: 30000,
  });
}

export function useMarkNotificationAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch('/notifications/mark-all-read', { method: 'PATCH' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteAllNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch('/notifications', { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useGenerateTelegramToken() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiFetch('/notifications/telegram/token', { method: 'POST' });
      return res as { token: string; botUrl: string };
    },
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { inApp?: boolean; telegram?: boolean }) => {
      return apiFetch('/notifications/preferences', { 
        method: 'PATCH', 
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
