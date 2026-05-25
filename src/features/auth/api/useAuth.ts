import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { shouldPersistQuery } from '@/api/persistQuery';
import { queryKeys } from '@/api/queryKeys';
import { env } from '@/config/env';
import {
  isHttpOnlyGuestHint,
  markHttpOnlySessionHint,
  persistRememberMe,
  loadAccessSession,
  setLogoutFlag,
  takeLogoutFlag,
} from '@/features/auth/persist';
import { useAuthStore, type AuthUserSnapshot } from '@/stores/authStore';

type AuthSession = {
  accessToken: string;
  user: AuthUserSnapshot;
};

function toUserSnapshot(raw: unknown): AuthUserSnapshot {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid auth user payload');
  }
  const u = raw as Record<string, unknown>;
  return {
    sub: String(u.sub ?? u.id ?? ''),
    email: String(u.email ?? ''),
    accountKind: u.accountKind as AuthUserSnapshot['accountKind'],
    activeCompanyId: u.activeCompanyId as string | undefined,
    memberId: u.memberId as string | undefined,
    customerId: u.customerId as string | undefined,
    companyRole: u.companyRole as string | undefined,
  };
}

export interface AuthMeResponse {
  id: string;
  email: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  accountKind?: AuthUserSnapshot['accountKind'];
}

export function useMeQuery(enabled = true): UseQueryResult<AuthMeResponse, Error> {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery<AuthMeResponse, Error>({
    queryKey: queryKeys.auth.me,
    enabled: enabled && !!accessToken,
    queryFn: () => apiFetch<AuthMeResponse>('/auth/me'),
    ...cabinetQueryDefaults,
  });
}

export function useLoginMutation() {
  const qc = useQueryClient();
  const setTokens = useAuthStore((s) => s.setTokens);
  return useMutation({
    mutationFn: async (body: {
      login: string;
      password: string;
      rememberMe?: boolean;
    }) => {
      const data = await apiFetch<AuthSession>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return {
        accessToken: data.accessToken,
        user: toUserSnapshot(data.user),
        rememberMe: !!body.rememberMe,
      };
    },
    onSuccess: (data) => {
      persistRememberMe(data.rememberMe);
      if (env.useHttpOnly) markHttpOnlySessionHint(true);
      setTokens(data.accessToken, data.user);
      void qc.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useRegisterMutation() {
  const qc = useQueryClient();
  const setTokens = useAuthStore((s) => s.setTokens);
  return useMutation({
    mutationFn: async (body: {
      email: string;
      password: string;
      accountKind: 'COMPANY_STAFF' | 'END_CLIENT';
      firstName?: string;
      lastName?: string;
      phone?: string;
      acceptTerms: boolean;
      portalInviteToken?: string;
      teamInviteToken?: string;
    }) => {
      const data = await apiFetch<AuthSession>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return {
        accessToken: data.accessToken,
        user: toUserSnapshot(data.user),
      };
    },
    onSuccess: (data) => {
      if (env.useHttpOnly) markHttpOnlySessionHint(true);
      setTokens(data.accessToken, data.user);
      void qc.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  const clear = useAuthStore((s) => s.clear);
  return useMutation({
    mutationFn: () =>
      apiFetch<{ message: string }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    onSettled: () => {
      setLogoutFlag();
      clear();
      if (env.useHttpOnly) markHttpOnlySessionHint(false);
      void qc.removeQueries({
        predicate: (q) => !shouldPersistQuery(q),
      });
      void qc.removeQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

let bootstrapPromise: Promise<void> | null = null;

async function bootstrapAuthSessionInternal(): Promise<void> {
  const { accessToken, setLoading, setTokens, clear } = useAuthStore.getState();
  if (accessToken) return;

  if (takeLogoutFlag()) {
    clear();
    return;
  }

  if (env.useHttpOnly && isHttpOnlyGuestHint()) {
    clear();
    return;
  }

  const saved = loadAccessSession();
  if (saved) {
    setTokens(saved.accessToken, saved.user);
    try {
      await apiFetch<AuthMeResponse>('/auth/me');
      return;
    } catch (err) {
      if (err instanceof ApiError && err.status !== 401 && err.status !== 403) {
        return;
      }
      clear();
    }
  }

  setLoading();
  try {
    const data = await apiFetch<AuthSession>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    if (data.accessToken) {
      if (env.useHttpOnly) markHttpOnlySessionHint(true);
      setTokens(data.accessToken, toUserSnapshot(data.user));
      try {
        const me = await apiFetch<AuthMeResponse>('/auth/me');
        setTokens(data.accessToken, {
          ...toUserSnapshot(data.user),
          sub: String(me.id ?? data.user.sub),
          email: String(me.email ?? data.user.email),
          accountKind: (me.accountKind ??
            data.user.accountKind) as AuthUserSnapshot['accountKind'],
        });
      } catch {
        /* keep JWT snapshot */
      }
    } else {
      clear();
      if (env.useHttpOnly) markHttpOnlySessionHint(false);
    }
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      clear();
      if (env.useHttpOnly) markHttpOnlySessionHint(false);
    }
  }
}

export function bootstrapAuthSession(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapAuthSessionInternal();
  }
  return bootstrapPromise;
}

/** Re-fetch JWT after company creation so activeCompanyId is populated in the token. */
export async function refreshAuthSession(): Promise<void> {
  const { accessToken, setTokens, clear } = useAuthStore.getState();
  try {
    const data = await apiFetch<AuthSession>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    if (data.accessToken) {
      setTokens(data.accessToken, toUserSnapshot(data.user));
    } else if (!accessToken) {
      clear();
    }
  } catch {
    if (!accessToken) clear();
  }
}
