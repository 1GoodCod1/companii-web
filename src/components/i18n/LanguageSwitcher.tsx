import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { setLanguage, type AppLanguage } from '@/i18n';
import {
  isPublicPathLocalizable,
  localizePath,
  stripLocalePrefix,
} from '@/lib/i18n/localeRoutes';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export function LanguageSwitcher({ className }: Props) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (lang: AppLanguage) => {
    if (isPublicPathLocalizable(location.pathname)) {
      const target = `${localizePath(stripLocalePrefix(location.pathname), lang)}${location.search}${location.hash}`;
      navigate(target, { replace: true });
    }
    setLanguage(lang);
  };

  return (
    <div
      className={cn(
        'inline-flex h-8 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50/80 p-0.5 shrink-0',
        className,
      )}
    >
      {(['ro', 'ru'] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => handleChange(lang)}
          aria-label={`${t('nav.language')}: ${lang === 'ro' ? 'Română' : 'Русский'}`}
          className={cn(
            'min-w-[1.75rem] rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors',
            i18n.language === lang
              ? 'bg-white text-violet-700 shadow-xs'
              : 'text-gray-500 hover:text-gray-800',
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
