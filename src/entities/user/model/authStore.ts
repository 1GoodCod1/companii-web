import { create } from 'zustand';
import {
  clearAccessSession,
  markHttpOnlySessionHint,
  persistAccessSession,
} from './persist';
import type { AuthUserSnapshot } from '@/entities/user/model/auth.types';
import { useCompanyContextStore } from '@/entities/company/model/companyContextStore';
import { env } from '@/shared/config/env';
import { runLogoutCleanup } from './logout-cleanup';

export type { AccountKind, AuthUserSnapshot } from '@/entities/user/model/auth.types';

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
