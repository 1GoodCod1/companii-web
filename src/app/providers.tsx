import { useState, type ReactNode } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthBootstrap } from '@/features/auth/AuthBootstrap';
import { createQueryClient } from '@/api/queryClient';
import { queryPersistOptions } from '@/api/persistQuery';
import { QUERY_CACHE_PERSIST_KEY } from '@/constants/storage';
import { safeStorage } from '@/lib/safeStorage';

const persister = createAsyncStoragePersister({
  storage: safeStorage,
  key: QUERY_CACHE_PERSIST_KEY,
});

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <HelmetProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ ...queryPersistOptions, persister }}
      >
        <AuthBootstrap>{children}</AuthBootstrap>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              color: '#111827',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              borderRadius: '1rem',
              boxShadow: '0 10px 30px rgba(99, 102, 241, 0.08)',
              fontSize: '0.8125rem',
              fontWeight: '700',
              padding: '0.75rem 1rem',
            },
          }}
        />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </PersistQueryClientProvider>
    </HelmetProvider>
  );
}
