import { ApiError } from '@/api/client';
import i18n from '@/i18n';

export function isAuthPhoneTakenError(err: unknown): boolean {
  if (!(err instanceof ApiError) || err.status !== 409) return false;
  const msg = err.message.toLowerCase();
  return msg.includes('phone');
}

export function isAuthEmailTakenError(err: unknown): boolean {
  if (!(err instanceof ApiError) || err.status !== 409) return false;
  const msg = err.message.toLowerCase();
  return msg.includes('email already');
}

export function isAuthRegistrationConflictError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409;
}

export function getAuthErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      const msg = err.message.toLowerCase();
      if (msg.includes('phone')) {
        return i18n.t('auth.errors.phoneTaken');
      }
      if (msg.includes('email already')) {
        return i18n.t('auth.errors.emailTaken');
      }
      return i18n.t('auth.errors.registrationConflict');
    }
    if (err.status === 401) {
      return i18n.t('auth.errors.invalidCredentials');
    }
    if (err.status === 429) {
      return i18n.t('auth.errors.tooManyAttempts');
    }
    return err.message || i18n.t('auth.errors.authFailed');
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return i18n.t('auth.errors.unexpected');
}
