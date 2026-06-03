import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { setLanguage, type AppLanguage } from '@/shared/config/i18n';
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
        'inline-flex h-8 shrink-0 border border-gray-200 bg-white',
        className,
      )}
    >
      {(['ro', 'ru'] as const).map((lang, index) => (
        <button
          key={lang}
          type="button"
          onClick={() => handleChange(lang)}
          aria-label={`${t('nav.language')}: ${lang === 'ro' ? 'Română' : 'Русский'}`}
          className={cn(
            'min-w-[2rem] px-2 text-[10px] font-bold uppercase tracking-wide transition-colors',
            index > 0 && 'border-l border-gray-200',
            i18n.language === lang
              ? 'bg-violet-600 text-white'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
