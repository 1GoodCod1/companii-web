import {
  LS_HTTPONLY_SESSION_HINT_KEY,
  LS_REMEMBER_ME_KEY,
  AUTH_ACCESS_TOKEN_KEY,
  AUTH_ACCESS_USER_KEY,
  AUTH_LOGOUT_FLAG_KEY,
} from '@/constants/storage';
import { safeStorage } from '@/lib/safeStorage';
import { env } from '@/config/env';
import type { AuthUserSnapshot } from '@/types/auth';

export function markHttpOnlySessionHint(present: boolean): void {
  if (!env.useHttpOnly) {
    safeStorage.removeItem(LS_HTTPONLY_SESSION_HINT_KEY);
    return;
  }
  safeStorage.setItem(LS_HTTPONLY_SESSION_HINT_KEY, present ? '1' : '0');
}

export function isHttpOnlyGuestHint(): boolean {
  if (!env.useHttpOnly) return false;
  return safeStorage.getItem(LS_HTTPONLY_SESSION_HINT_KEY) === '0';
}

export function persistRememberMe(value: boolean): void {
  safeStorage.setItem(LS_REMEMBER_ME_KEY, value ? '1' : '0');
}

export function loadRememberMe(): boolean {
  return safeStorage.getItem(LS_REMEMBER_ME_KEY) === '1';
}

export function persistAccessSession(
  _accessToken: string,
  _user: AuthUserSnapshot | null,
): void {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(AUTH_ACCESS_USER_KEY);
    window.localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_ACCESS_USER_KEY);
  } catch {
    /* ignore */
  }
}
export function loadAccessSession(): {
  accessToken: string;
  user: AuthUserSnapshot;
} | null {
  return null;
}

export function clearAccessSession(): void {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(AUTH_ACCESS_USER_KEY);
    window.localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_ACCESS_USER_KEY);
  } catch {
    /* ignore */
  }
}

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
