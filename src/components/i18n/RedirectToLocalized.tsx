import { Navigate, useLocation } from 'react-router-dom';
import { getInitialLanguage } from '@/i18n';
import { localizePath } from '@/lib/i18n/localeRoutes';

export function RedirectToLocalized() {
  const { pathname, search, hash } = useLocation();
  const locale = getInitialLanguage();
  const target = `${localizePath(pathname, locale)}${search}${hash}`;
  return <Navigate to={target} replace />;
}
