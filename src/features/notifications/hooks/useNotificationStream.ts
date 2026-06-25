import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { env } from '@/shared/config/env';
import i18n from '@/shared/config/i18n';
import { useAuthStore } from '@/entities/user/model/authStore';
import { playNotificationSound } from '@/shared/utils/audio';

const MAX_BACKOFF_MS = 30_000;

export function useNotificationStream(enabled: boolean = true) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!enabled) return;
    if (!accessToken) return;

    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      const url = new URL(`${env.apiUrl}/notifications/stream`, window.location.origin);
      const token = useAuthStore.getState().accessToken;
      if (!token) return; 
      url.searchParams.set('access_token', token);

      source = new EventSource(url.toString(), { withCredentials: true });

      source.onopen = () => {
        attempts = 0;
      };

      source.onmessage = () => {
        playNotificationSound();
        void queryClient.invalidateQueries({ queryKey: ['notifications'] });
        toast(i18n.t('notifications.newToast', 'Новое уведомление'), { icon: '🔔' });
      };

      source.onerror = () => {
        const es = source;
        source?.close();
        source = null;
        if (stopped) return;
        if (es && 'status' in es && ((es as EventSource & { status: number }).status === 401 || (es as EventSource & { status: number }).status === 403)) {
          return;
        }

        attempts += 1;
        const delay = Math.min(MAX_BACKOFF_MS, 1_000 * 2 ** Math.min(attempts, 5));
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      source?.close();
    };
  }, [queryClient, enabled, accessToken]);
}
