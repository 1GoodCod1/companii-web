import { env } from '@/shared/config/env';
import { markHttpOnlySessionHint } from '@/entities/user/model/persist';
import { useCompanyContextStore } from '@/entities/company/model/companyContextStore';
import { useAuthStore } from '@/entities/user/model/authStore';

export type AuthTokensResponse = {
  accessToken?: string;
  user?: unknown;
};

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
): void {
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
}

export function clearAuthSession(): void {
  useAuthStore.getState().clear();
  if (env.useHttpOnly) markHttpOnlySessionHint(false);
}
