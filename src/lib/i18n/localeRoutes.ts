import type { AppLanguage } from '@/shared/config/i18n/utils';

export const LOCALES: readonly AppLanguage[] = ['ro', 'ru'];
export const DEFAULT_LOCALE: AppLanguage = 'ro';

const LOCALE_SEGMENT = /^\/(ro|ru)(?=\/|$)/;

export function isAppLanguage(value: string | undefined): value is AppLanguage {
  return value === 'ro' || value === 'ru';
}

export function getLocaleFromPathname(pathname: string): AppLanguage | null {
  const match = pathname.match(LOCALE_SEGMENT);
  return match && isAppLanguage(match[1]) ? match[1] : null;
}

export function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/(ro|ru)(\/.*)?$/);
  if (!match) return pathname || '/';
  const rest = match[2];
  return rest ?? '/';
}

export function localizePath(path: string, locale: AppLanguage): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const bare = stripLocalePrefix(normalized);
  if (bare === '/') return `/${locale}`;
  return `/${locale}${bare}`;
}

const LOCALIZED_PUBLIC_PREFIXES = [
  '/',
  '/companii',
  '/companies',
  '/how-it-works',
  '/faq',
  '/contacts',
  '/privacy',
  '/terms',
  '/preturi',
] as const;

export function isPublicPathLocalizable(pathname: string): boolean {
  const bare = stripLocalePrefix(pathname);
  return LOCALIZED_PUBLIC_PREFIXES.some(
    (prefix) => bare === prefix || (prefix !== '/' && bare.startsWith(`${prefix}/`)),
  );
}

export function getOgLocale(locale: AppLanguage): string {
  return locale === 'ru' ? 'ru_RU' : 'ro_MD';
}

export function getOgLocaleAlternates(locale: AppLanguage): string[] {
  const all = ['ro_MD', 'ru_RU'];
  const current = getOgLocale(locale);
  return all.filter((l) => l !== current);
}
