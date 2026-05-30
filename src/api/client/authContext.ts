import { env } from '@/config/env';
import { markHttpOnlySessionHint } from '@/features/auth/persist';
import { useCompanyContextStore } from '@/stores/companyContextStore';
import { useAuthStore } from '@/stores/authStore';

import type { AuthTokensResponse } from './types';

export function parseAuthTokens(json: unknown): AuthTokensResponse {
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

export function getRequestAuthContext(): {
  accessToken: string | null;
  companyId: string | null;
} {
  const { accessToken, user } = useAuthStore.getState();
  const companyId =
    useCompanyContextStore.getState().activeCompanyId ?? user?.activeCompanyId ?? null;
  return { accessToken, companyId };
}

export function applyAuthHeaders(
  headers: Headers,
  accessToken: string | null,
  companyId: string | null,
): void {
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (companyId) headers.set('x-company-id', companyId);
}

export function clearAuthSession(): void {
  useAuthStore.getState().clear();
  if (env.useHttpOnly) markHttpOnlySessionHint(false);
}
