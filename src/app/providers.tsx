import { useEffect, useState, type ReactNode } from 'react';
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { HelmetProvider } from 'react-helmet-async';
import { AppToaster } from '@/shared/ui/AppToaster';
import { AuthBootstrap } from '@/features/auth';
import { createQueryClient } from '@/shared/api/queryClient';
import { queryPersistOptions } from '@/shared/api/persistQuery';
import { QUERY_CACHE_PERSIST_KEY } from '@/shared/constants/storage';
import { safeStorage } from '@/lib/safeStorage';
import { bindLogoutCleanup } from '@/entities/user/model/logout-cleanup';
import { configureApiClient } from '@/shared/api/client/config';
import { getRequestAuthContext } from '@/entities/user/api/authContext';
import { refreshAccessToken } from '@/entities/user/api/refreshAccessToken';

configureApiClient({
  getAuthContext: getRequestAuthContext,
  onUnauthorized: refreshAccessToken,
});

const persister = createAsyncStoragePersister({
  storage: safeStorage,
  key: QUERY_CACHE_PERSIST_KEY,
});

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  useEffect(() => {
    const unregister = bindLogoutCleanup(queryClient, persister);
    return () => {
      unregister();
    };
  }, [queryClient]);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <HelmetProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ ...queryPersistOptions, persister }}
        >
          <AuthBootstrap>{children}</AuthBootstrap>
          <AppToaster />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </PersistQueryClientProvider>
      </HelmetProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
