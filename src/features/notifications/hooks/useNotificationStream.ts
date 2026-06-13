import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { playNotificationSound } from '@/shared/utils/audio';

export function useNotificationStream(enabled: boolean = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const eventSource = new EventSource('/api/v1/notifications/stream', {
      withCredentials: true,
    });

    eventSource.onmessage = () => {
      playNotificationSound();
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error', err);
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient, enabled]);
}
