import { getLocaleFromPathname } from '@/lib/i18n/localeRoutes';
import { safeStorage } from '@/lib/safeStorage';

export type AppLanguage = 'ru' | 'ro';

export const STORAGE_KEY = 'companii_lang';

export function getInitialLanguage(): AppLanguage {
  if (typeof window !== 'undefined') {
    const fromPath = getLocaleFromPathname(window.location.pathname);
    if (fromPath) return fromPath;
  }
  const stored = safeStorage.getItem(STORAGE_KEY) as AppLanguage | null;
  if (stored && ['ru', 'ro'].includes(stored)) {
    return stored;
  }
  return 'ro';
}

export function persistLanguage(lang: AppLanguage): void {
  if (!['ru', 'ro'].includes(lang)) return;
  safeStorage.setItem(STORAGE_KEY, lang);
}
