import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { usePublicAuthCta } from '@/features/auth/usePublicAuthCta';
import { FaberLogo } from '@/components/brand/FaberLogo';
import { stripLocalePrefix } from '@/lib/i18n/localeRoutes';
import { cn } from '@/lib/utils';

const NAV_LINK_CLASS =
  'text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap';

const NAV_CTA_CLASS =
  'inline-flex h-8 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 text-[11px] font-semibold uppercase tracking-wide text-white transition-colors hover:from-violet-700 hover:to-indigo-700 whitespace-nowrap';

const PUBLIC_NAV_ITEMS = [
  { path: '/how-it-works', labelKey: 'nav.howItWorks' },
  { path: '/companies', labelKey: 'nav.companies' },
  { path: '/subscriptions', labelKey: 'nav.subscriptions', hideForEndClient: true },
  { path: '/faq', labelKey: 'nav.faq' },
  { path: '/contacts', labelKey: 'nav.contacts' },
] as const;

export function PublicLayout() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const location = useLocation();
  const { isAuthed, cabinetRoute, cabinetLabel, user } = usePublicAuthCta();
  const barePath = stripLocalePrefix(location.pathname);
  const isLanding = barePath === '/' || barePath === '/companii';

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <header className="public-site-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 lg:gap-6">
          <Link to={lp('/')} className="shrink-0">
            <FaberLogo size="sm" />
          </Link>

          <div className="flex min-w-0 items-center justify-center overflow-hidden">
            <nav
              className="flex max-w-full flex-nowrap items-center gap-4 lg:gap-5 text-[11px] font-bold uppercase tracking-wide"
              aria-label="Main"
            >
              {PUBLIC_NAV_ITEMS.map((item) => {
                if ('hideForEndClient' in item && item.hideForEndClient && user?.accountKind === 'END_CLIENT') {
                  return null;
                }
                return (
                  <Link key={item.path} to={lp(item.path)} className={NAV_LINK_CLASS}>
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 border-l border-gray-200 pl-3">
            {isAuthed ? (
              <Link to={cabinetRoute} className={NAV_CTA_CLASS}>
                {cabinetLabel}
              </Link>
            ) : (
              <>
                <Link to="/login" className={NAV_LINK_CLASS}>
                  {t('nav.login')}
                </Link>
                <Link to="/register" className={NAV_CTA_CLASS}>
                  {t('nav.register')}
                </Link>
              </>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="shrink-0" style={{ height: 'var(--public-header-height)' }} aria-hidden />

      <main
        className={cn(
          'page-content relative z-0 flex-1 w-full',
          isLanding ? 'px-0 py-0 overflow-x-hidden' : 'max-w-6xl mx-auto px-6 py-10',
        )}
      >
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div>
              <FaberLogo size="sm" />
            </div>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              {t('footer.tagline')}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} {t('footer.copyright')}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">
              {t('footer.platform.title')}
            </h4>
            <ul className="space-y-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <li>
                <Link to={lp('/how-it-works')} className="hover:text-violet-600 transition-colors">
                  {t('footer.platform.howItWorks')}
                </Link>
              </li>
              <li>
                <Link to={lp('/companies')} className="hover:text-violet-600 transition-colors">
                  {t('footer.platform.companies')}
                </Link>
              </li>
              {user?.accountKind !== 'END_CLIENT' && (
                <li>
                  <Link to={lp('/subscriptions')} className="hover:text-violet-600 transition-colors">
                    {t('footer.platform.subscriptions')}
                  </Link>
                </li>
              )}
              <li>
                <Link to={lp('/faq')} className="hover:text-violet-600 transition-colors">
                  {t('footer.platform.faq')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">
              {t('footer.legal.title')}
            </h4>
            <ul className="space-y-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <li>
                <Link to={lp('/privacy')} className="hover:text-violet-600 transition-colors">
                  {t('footer.legal.privacy')}
                </Link>
              </li>
              <li>
                <Link to={lp('/terms')} className="hover:text-violet-600 transition-colors">
                  {t('footer.legal.terms')}
                </Link>
              </li>
              <li>
                <Link to={lp('/contacts')} className="hover:text-violet-600 transition-colors">
                  {t('footer.legal.contacts')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-black text-violet-700 uppercase tracking-widest bg-violet-50 px-2 py-1 rounded-md border border-violet-100">
              {t('footer.madeInMoldova.badge')}
            </span>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              {t('footer.madeInMoldova.description')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
