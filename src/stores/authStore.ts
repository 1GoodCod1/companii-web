import { create } from 'zustand';
import {
  clearAccessSession,
  markHttpOnlySessionHint,
  persistAccessSession,
} from '@/features/auth/persist';
import type { AuthUserSnapshot } from '@/types/auth';
import { useCompanyContextStore } from '@/stores/companyContextStore';
import { env } from '@/config/env';
import { runLogoutCleanup } from '@/features/auth/logout-cleanup';

export type { AccountKind, AuthUserSnapshot } from '@/types/auth';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous';

interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  user: AuthUserSnapshot | null;
  setLoading: () => void;
  setTokens: (accessToken: string, user: AuthUserSnapshot | null) => void;
  setUser: (user: AuthUserSnapshot | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'idle',
  accessToken: null,
  user: null,
  setLoading: () => set({ status: 'loading' }),
  setTokens: (accessToken, user) => {
    persistAccessSession(accessToken, user);
    useCompanyContextStore.getState().setActiveCompanyId(user?.activeCompanyId ?? null);
    set({
      accessToken,
      user,
      status: user ? 'authenticated' : 'anonymous',
    });
  },
  setUser: (user) => {
    useCompanyContextStore.getState().setActiveCompanyId(user?.activeCompanyId ?? null);
    set({
      user,
      status: user ? 'authenticated' : 'anonymous',
    });
  },
  clear: () => {
    const { accessToken } = useAuthStore.getState();
    void fireLogoutRequest(accessToken);

    clearAccessSession();
    useCompanyContextStore.getState().setActiveCompanyId(null);
    if (env.useHttpOnly) markHttpOnlySessionHint(false);
    void runLogoutCleanup();

    set({
      accessToken: null,
      user: null,
      status: 'anonymous',
    });
  },
}));

function fireLogoutRequest(accessToken: string | null): void {
  if (typeof fetch !== 'function') return;
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  void fetch(`${env.apiUrl}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({}),
    keepalive: true,
  }).catch(() => {
    /* ignore */
  });
}
