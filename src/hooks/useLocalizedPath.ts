import { useCallback } from 'react';
import { localizePath } from '@/lib/i18n/localeRoutes';
import { useLocale } from '@/hooks/useLocale';

export function useLocalizedPath() {
  const locale = useLocale();
  return useCallback((path: string) => localizePath(path, locale), [locale]);
}
