import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { MobileSheet } from '@/components/layout/MobileSheet';
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const navLinks = PUBLIC_NAV_ITEMS.filter(
    (item) => !('hideForEndClient' in item && item.hideForEndClient && user?.accountKind === 'END_CLIENT'),
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <header className="public-site-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 lg:gap-6">
          {/* Logo */}
          <Link to={lp('/')} className="shrink-0">
            <FaberLogo size="sm" />
          </Link>

          {/* Desktop nav: hidden on mobile */}
          <nav
            className="hidden lg:flex items-center gap-4 lg:gap-5 text-[11px] font-bold uppercase tracking-wide"
            aria-label="Main"
          >
            {navLinks.map((item) => (
              <Link key={item.path} to={lp(item.path)} className={NAV_LINK_CLASS}>
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          {/* Right side: auth + language + hamburger */}
          <div className="flex shrink-0 items-center gap-2 border-l border-gray-200 pl-3">
            {/* Desktop auth */}
            <div className="hidden lg:contents">
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
            </div>
            <div className="hidden lg:contents">
              <LanguageSwitcher />
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={openMobileMenu}
              className="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <MobileSheet open={mobileMenuOpen} onClose={closeMobileMenu}>
        <div className="flex flex-col h-full p-5">
          {/* Top row: logo + close */}
          <div className="flex items-center justify-between mb-6">
            <Link to={lp('/')} onClick={closeMobileMenu}>
              <FaberLogo size="sm" />
            </Link>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1 mb-6">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={lp(item.path)}
                onClick={closeMobileMenu}
                className="flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          {/* Auth section */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            {isAuthed ? (
              <Link
                to={cabinetRoute}
                onClick={closeMobileMenu}
                className="flex items-center justify-center w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white"
              >
                {cabinetLabel}
              </Link>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            <div className="pt-2 flex justify-center">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />
        </div>
      </MobileSheet>

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