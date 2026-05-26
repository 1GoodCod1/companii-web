import { ApiError } from '@/api/client';
import i18n from '@/i18n';

export function getAuthErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return i18n.t('auth.errors.emailTaken');
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
