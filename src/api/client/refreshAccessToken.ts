import { env } from '@/config/env';
import { markHttpOnlySessionHint } from '@/features/auth/persist';
import { useAuthStore } from '@/stores/authStore';

import { clearAuthSession, parseAuthTokens } from './authContext';

let pendingRefresh: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
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
          if (res.status === 401 || res.status === 403) clearAuthSession();
          return false;
        }

        const envelope = (await res.json()) as { success?: boolean; data?: unknown };
        const raw =
          envelope?.success === true && envelope.data !== undefined ? envelope.data : envelope;
        const tokens = parseAuthTokens(raw);
        if (!tokens.accessToken) {
          if (res.status === 401 || res.status === 403) clearAuthSession();
          return false;
        }

        const state = useAuthStore.getState();
        const nextUser = (tokens.user as typeof state.user) ?? state.user;
        if (state.accessToken !== tokens.accessToken || state.user !== nextUser) {
          state.setTokens(tokens.accessToken, nextUser);
        }
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
