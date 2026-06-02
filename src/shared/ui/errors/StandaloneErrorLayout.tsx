import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { LanguageSwitcher } from '@/shared/ui/i18n/LanguageSwitcher';
import { FaberLogo } from '@/shared/ui/brand/FaberLogo';
import { useLocalizedPath } from '@/shared/hooks/useLocalizedPath';

const CURRENT_YEAR = new Date().getFullYear();

export function StandaloneErrorLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const lp = useLocalizedPath();

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <header className="public-site-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link to={lp('/')} className="shrink-0">
            <FaberLogo size="sm" />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="shrink-0" style={{ height: 'var(--public-header-height)' }} aria-hidden />

      <main className="page-content relative z-0 flex-1 w-full max-w-6xl mx-auto px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            © {CURRENT_YEAR} {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
