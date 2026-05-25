import { shouldBustHttpCacheForPublicGetPath } from '@/config/publicCache';
import { env } from '@/config/env';
import { markHttpOnlySessionHint } from '@/features/auth/persist';
import { useCompanyContextStore } from '@/stores/companyContextStore';
import { useAuthStore } from '@/stores/authStore';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type AuthTokensResponse = {
  accessToken?: string;
  user?: unknown;
};

function pathOnly(apiPath: string): string {
  return apiPath.split('?')[0] ?? apiPath;
}

function parseAuthTokens(json: unknown): AuthTokensResponse {
  if (!json || typeof json !== 'object') return {};
  const d = json as Record<string, unknown>;
  return {
    accessToken:
      typeof d.accessToken === 'string'
        ? d.accessToken
        : typeof d.access_token === 'string'
          ? d.access_token
          : undefined,
    user: d.user,
  };
}

let pendingRefresh: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!pendingRefresh) {
    pendingRefresh = (async () => {
      try {
        const res = await fetch(`${env.apiUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            useAuthStore.getState().clear();
            if (env.useHttpOnly) markHttpOnlySessionHint(false);
          }
          return false;
        }
        const envelope = (await res.json()) as {
          success?: boolean;
          data?: unknown;
        };
        const raw =
          envelope?.success === true && envelope.data !== undefined
            ? envelope.data
            : envelope;
        const tokens = parseAuthTokens(raw);
        if (!tokens.accessToken) {
          if (res.status === 401 || res.status === 403) {
            useAuthStore.getState().clear();
            if (env.useHttpOnly) markHttpOnlySessionHint(false);
          }
          return false;
        }
        const prev = useAuthStore.getState().user;
        useAuthStore
          .getState()
          .setTokens(tokens.accessToken, (tokens.user as typeof prev) ?? prev);
        if (env.useHttpOnly) markHttpOnlySessionHint(true);
        return true;
      } catch {
        return false;
      } finally {
        pendingRefresh = null;
      }
    })();
  }
  return pendingRefresh;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  retried = false,
): Promise<T> {
  const { accessToken, user } = useAuthStore.getState();
  const companyId =
    useCompanyContextStore.getState().activeCompanyId ?? user?.activeCompanyId ?? null;
  const headers = new Headers(init.headers);
  if (
    !headers.has('Content-Type') &&
    init.body &&
    !(init.body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (companyId) headers.set('x-company-id', companyId);

  const method = (init.method ?? 'GET').toUpperCase();
  if (
    method === 'GET' &&
    shouldBustHttpCacheForPublicGetPath(pathOnly(path)) &&
    !headers.has('Cache-Control')
  ) {
    headers.set('Cache-Control', 'no-cache');
    headers.set('Pragma', 'no-cache');
  }

  const res = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (res.status === 401 && !retried) {
    const isAuthRoute =
      path.includes('/auth/refresh') || path.includes('/auth/logout');
    if (!isAuthRoute && (env.useHttpOnly || accessToken)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) return apiFetch<T>(path, init, true);
    }
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    const raw =
      typeof body === 'object' && body && 'message' in body
        ? (body as { message: string | string[] }).message
        : undefined;
    const msg = Array.isArray(raw) ? raw.join(', ') : raw ? String(raw) : res.statusText;
    throw new ApiError(msg, res.status, body);
  }

  if (res.status === 204) return undefined as T;

  const json = (await res.json()) as {
    success?: boolean;
    data?: T;
    message?: string | string[];
  };

  if (json && typeof json === 'object' && json.success === true && 'data' in json) {
    return json.data as T;
  }

  return json as T;
}

export async function downloadApiBlob(path: string, filename: string, retried = false): Promise<void> {
  const { accessToken, user } = useAuthStore.getState();
  const companyId =
    useCompanyContextStore.getState().activeCompanyId ?? user?.activeCompanyId ?? null;
  const headers = new Headers();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (companyId) headers.set('x-company-id', companyId);

  const res = await fetch(`${env.apiUrl}${path}`, {
    credentials: 'include',
    headers,
  });

  if (res.status === 401 && !retried) {
    if (env.useHttpOnly || accessToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) return downloadApiBlob(path, filename, true);
    }
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    const raw =
      typeof body === 'object' && body && 'message' in body
        ? (body as { message: string | string[] }).message
        : undefined;
    const msg = Array.isArray(raw) ? raw.join(', ') : raw ? String(raw) : res.statusText;
    throw new ApiError(msg, res.status, body);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
