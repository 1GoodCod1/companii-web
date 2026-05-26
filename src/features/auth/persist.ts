import {
  LS_HTTPONLY_SESSION_HINT_KEY,
  LS_REMEMBER_ME_KEY,
  AUTH_ACCESS_TOKEN_KEY,
  AUTH_ACCESS_USER_KEY,
  AUTH_LOGOUT_FLAG_KEY,
} from '@/constants/storage';
import { safeStorage } from '@/lib/safeStorage';
import type { AuthUserSnapshot } from '@/types/auth';

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
    window.sessionStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken);
    if (user) {
      window.sessionStorage.setItem(AUTH_ACCESS_USER_KEY, JSON.stringify(user));
    } else {
      window.sessionStorage.removeItem(AUTH_ACCESS_USER_KEY);
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
    const accessToken = window.sessionStorage.getItem(AUTH_ACCESS_TOKEN_KEY);
    const rawUser = window.sessionStorage.getItem(AUTH_ACCESS_USER_KEY);
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
    window.sessionStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(AUTH_ACCESS_USER_KEY);
  } catch {
    /* ignore */
  }
}

/** Set after explicit logout so bootstrap does not call /auth/refresh on next load. */
export function setLogoutFlag(): void {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(AUTH_LOGOUT_FLAG_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function takeLogoutFlag(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const value = window.sessionStorage.getItem(AUTH_LOGOUT_FLAG_KEY);
    window.sessionStorage.removeItem(AUTH_LOGOUT_FLAG_KEY);
    return value === '1';
  } catch {
    return false;
  }
}
