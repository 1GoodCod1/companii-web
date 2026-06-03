import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/client';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60_000,
        gcTime: 30 * 60_000,
        refetchOnWindowFocus: true,
        retry: (count, err) => {
          if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
            return false;
          }
          return count < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
