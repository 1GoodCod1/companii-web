import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { DEFAULT_LOCALE, isAppLanguage } from '@/lib/i18n/localeRoutes';
import { useSyncLocaleFromRoute } from '@/shared/hooks/useLocale';

export function LocaleOutlet() {
  const { locale } = useParams<{ locale: string }>();
  const location = useLocation();
  useSyncLocaleFromRoute();

  if (!isAppLanguage(locale)) {
    const suffix = location.pathname.replace(/^\/[^/]+/, '') || '';
    return (
      <Navigate
        to={`/${DEFAULT_LOCALE}${suffix}${location.search}${location.hash}`}
        replace
      />
    );
  }

  return <Outlet />;
}
