import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n, { setLanguage } from '@/i18n';
import type { AppLanguage } from '@/i18n/utils';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  isAppLanguage,
} from '@/lib/i18n/localeRoutes';

export function useLocale(): AppLanguage {
  const { locale: localeParam } = useParams<{ locale?: string }>();
  const { i18n: i18nInstance } = useTranslation();

  if (isAppLanguage(localeParam)) return localeParam;

  const fromPath = getLocaleFromPathname(
    typeof window !== 'undefined' ? window.location.pathname : '/',
  );
  if (fromPath) return fromPath;

  const lng = i18nInstance.language?.split('-')[0];
  return isAppLanguage(lng) ? lng : DEFAULT_LOCALE;
}

export function useSyncLocaleFromRoute(): AppLanguage {
  const locale = useLocale();
  const { locale: localeParam } = useParams<{ locale?: string }>();

  useEffect(() => {
    if (isAppLanguage(localeParam) && i18n.language !== localeParam) {
      setLanguage(localeParam);
    }
  }, [localeParam]);

  return locale;
}
