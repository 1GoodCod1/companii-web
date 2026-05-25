import { create } from 'zustand';
import {
  clearAccessSession,
  persistAccessSession,
} from '@/features/auth/persist';
import type { AuthUserSnapshot } from '@/features/auth/types';
import { useCompanyContextStore } from '@/stores/companyContextStore';

export type { AccountKind, AuthUserSnapshot } from '@/features/auth/types';

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
    clearAccessSession();
    useCompanyContextStore.getState().setActiveCompanyId(null);
    set({
      accessToken: null,
      user: null,
      status: 'anonymous',
    });
  },
}));
