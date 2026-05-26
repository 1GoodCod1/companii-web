import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { setLanguage, type AppLanguage } from '@/i18n';
import {
  isPublicPathLocalizable,
  localizePath,
  stripLocalePrefix,
} from '@/lib/i18n/localeRoutes';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  compact?: boolean;
};

export function LanguageSwitcher({ className, compact = false }: Props) {
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
    <div className={cn('inline-flex items-center gap-1', className)}>
      {!compact && (
        <Globe className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden />
      )}
      {(['ro', 'ru'] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => handleChange(lang)}
          aria-label={`${t('nav.language')}: ${lang === 'ro' ? 'Română' : 'Русский'}`}
          className={cn(
            'px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors',
            i18n.language === lang
              ? 'bg-violet-100 text-violet-700'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
