import { LS_HTTPONLY_SESSION_HINT_KEY, LS_REMEMBER_ME_KEY } from '@/constants/storage';
import { safeStorage } from '@/lib/safeStorage';
import type { AuthUserSnapshot } from '@/features/auth/types';

const ACCESS_TOKEN_KEY = 'companii.accessToken';
const ACCESS_USER_KEY = 'companii.authUser';
const LOGOUT_FLAG_KEY = 'companii.logout';

/** httpOnly mode: '0' = no session, skip /auth/refresh on bootstrap; '1' / missing = try cookie refresh */
export function markHttpOnlySessionHint(present: boolean): void {
  safeStorage.setItem(LS_HTTPONLY_SESSION_HINT_KEY, present ? '1' : '0');
}

export function isHttpOnlyGuestHint(): boolean {
  return safeStorage.getItem(LS_HTTPONLY_SESSION_HINT_KEY) === '0';
}

export function persistRememberMe(value: boolean): void {
  safeStorage.setItem(LS_REMEMBER_ME_KEY, value ? '1' : '0');
}

export function loadRememberMe(): boolean {
  return safeStorage.getItem(LS_REMEMBER_ME_KEY) === '1';
}

export function persistAccessSession(
  accessToken: string,
  user: AuthUserSnapshot | null,
): void {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (user) {
      window.sessionStorage.setItem(ACCESS_USER_KEY, JSON.stringify(user));
    } else {
      window.sessionStorage.removeItem(ACCESS_USER_KEY);
    }
  } catch {
    /* private mode / quota */
  }
}

export function loadAccessSession(): {
  accessToken: string;
  user: AuthUserSnapshot;
} | null {
  try {
    if (typeof window === 'undefined') return null;
    const accessToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
    const rawUser = window.sessionStorage.getItem(ACCESS_USER_KEY);
    if (!accessToken?.trim() || !rawUser) return null;
    const user = JSON.parse(rawUser) as AuthUserSnapshot;
    if (!user?.sub || !user?.email) return null;
    return { accessToken, user };
  } catch {
    return null;
  }
}

export function clearAccessSession(): void {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(ACCESS_USER_KEY);
  } catch {
    /* ignore */
  }
}

/** Set after explicit logout so bootstrap does not call /auth/refresh on next load. */
export function setLogoutFlag(): void {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(LOGOUT_FLAG_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function takeLogoutFlag(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const value = window.sessionStorage.getItem(LOGOUT_FLAG_KEY);
    window.sessionStorage.removeItem(LOGOUT_FLAG_KEY);
    return value === '1';
  } catch {
    return false;
  }
}
