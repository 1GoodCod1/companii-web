import { useEffect } from 'react';
import {
  isRouteErrorResponse,
  useRouteError,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';
import { StatusPage } from '@/components/errors/StatusPage';
import { StandaloneErrorLayout } from '@/components/errors/StandaloneErrorLayout';

const RELOAD_KEY = 'faber-chunk-reload-ts';
const RELOAD_COOLDOWN_MS = 10_000;

function isChunkError(message: string): boolean {
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('ChunkLoadError')
  );
}

async function purgeAndReload(): Promise<void> {
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    // best-effort cache purge
  }
  window.location.reload();
}

export function RouteErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation();

  let errorMessage = t('routeError.description');

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  const chunkError = isChunkError(errorMessage);

  useEffect(() => {
    if (!chunkError) return;
    const lastReload = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - lastReload > RELOAD_COOLDOWN_MS) {
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      void purgeAndReload();
    }
  }, [chunkError]);

  const handleReload = () => {
    void purgeAndReload();
  };

  return (
    <StandaloneErrorLayout>
      <SEOHead title={t('routeError.seoTitle')} noindex />
      <StatusPage variant="error" onReload={handleReload} />
      {!chunkError && (
        <p className="mx-auto mt-2 max-w-md text-center text-xs italic text-gray-400">
          {errorMessage}
        </p>
      )}
    </StandaloneErrorLayout>
  );
}
