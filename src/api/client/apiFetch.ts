import { shouldBustHttpCacheForPublicGetPath } from '@/config/publicCache';
import { env } from '@/config/env';

import { applyAuthHeaders, getRequestAuthContext } from './authContext';
import { DEFAULT_REQUEST_TIMEOUT_MS } from './constants';
import { ApiError } from './apiError';
import { refreshAccessToken } from './refreshAccessToken';
import { composeAbortSignal, pathOnly, throwIfNotOk, unwrapEnvelope } from './requestHelpers';

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  retried = false,
): Promise<T> {
  const { accessToken, companyId } = getRequestAuthContext();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  applyAuthHeaders(headers, accessToken, companyId);

  const method = (init.method ?? 'GET').toUpperCase();
  if (
    method === 'GET' &&
    shouldBustHttpCacheForPublicGetPath(pathOnly(path)) &&
    !headers.has('Cache-Control')
  ) {
    headers.set('Cache-Control', 'no-cache');
    headers.set('Pragma', 'no-cache');
  }

  const { signal, cancelTimer } = composeAbortSignal(
    init.signal ?? null,
    DEFAULT_REQUEST_TIMEOUT_MS,
  );

  let res: Response;
  try {
    res = await fetch(`${env.apiUrl}${path}`, {
      ...init,
      credentials: 'include',
      headers,
      signal,
    });
  } catch (err) {
    cancelTimer();
    if (err instanceof DOMException && err.name === 'AbortError') {
      if (init.signal?.aborted) throw err;
      throw new ApiError('Request timeout', 408);
    }
    throw err;
  } finally {
    cancelTimer();
  }

  if (res.status === 401 && !retried) {
    const isAuthRoute = path.includes('/auth/refresh') || path.includes('/auth/logout');
    if (!isAuthRoute && (env.useHttpOnly || accessToken)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) return apiFetch<T>(path, init, true);
    }
  }

  await throwIfNotOk(res);
  if (res.status === 204) return undefined as T;

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    json = undefined;
  }
  return unwrapEnvelope<T>(json);
}
