import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { personInitials } from '@/shared/utils/person';
import type { AuthUserSnapshot } from '@/entities/user/model/auth.types';

type PublicHeaderAuthProps = {
  isAuthed: boolean;
  user: AuthUserSnapshot | null;
  cabinetRoute: string;
  cabinetLabel: string;
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
};

export function PublicHeaderAuth({
  isAuthed,
  user,
  cabinetRoute,
  cabinetLabel,
  variant = 'desktop',
  onNavigate,
}: PublicHeaderAuthProps) {
  const { t } = useTranslation();
  const isMobile = variant === 'mobile';

  if (isAuthed) {
    const displayEmail = user?.email ?? '';
    const initials = personInitials(displayEmail, displayEmail);

    if (isMobile) {
      return (
        <Link
          to={cabinetRoute}
          onClick={onNavigate}
          className="flex w-full items-center gap-3 border border-gray-200 bg-white px-3 py-2.5 transition-colors hover:border-gray-300 hover:bg-gray-50"
        >
          <span className="flex size-8 shrink-0 items-center justify-center bg-gray-900 text-[10px] font-bold text-white">
            {initials}
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-semibold text-gray-900">{cabinetLabel}</span>
            {displayEmail ? (
              <span className="block truncate text-xs text-gray-500">{displayEmail}</span>
            ) : null}
          </span>
          <ChevronRight className="size-4 shrink-0 text-gray-400" />
        </Link>
      );
    }

    return (
      <Link
        to={cabinetRoute}
        className="inline-flex h-8 max-w-[200px] items-center gap-2 border border-gray-200 bg-white px-2 transition-colors hover:border-violet-300 hover:bg-violet-50/40"
      >
        <span className="flex size-6 shrink-0 items-center justify-center bg-gray-900 text-[9px] font-bold text-white">
          {initials}
        </span>
        <span className="min-w-0 truncate text-[11px] font-semibold text-gray-800">{cabinetLabel}</span>
        <ChevronRight className="size-3.5 shrink-0 text-violet-600" />
      </Link>
    );
  }

  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Link
          to="/login"
          onClick={onNavigate}
          className="flex items-center justify-center border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
        >
          {t('nav.login')}
        </Link>
        <Link
          to="/register"
          onClick={onNavigate}
          className="flex items-center justify-center bg-gray-900 px-3 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gray-800"
        >
          {t('nav.register')}
        </Link>
      </div>
    );
  }

  return (
    <div className="inline-flex h-8 items-center gap-2">
      <Link
        to="/login"
        className="text-[11px] font-semibold text-gray-500 transition-colors hover:text-violet-700"
      >
        {t('nav.login')}
      </Link>
      <Link
        to="/register"
        className="inline-flex h-8 items-center bg-gray-900 px-3 text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-gray-800"
      >
        {t('nav.register')}
      </Link>
    </div>
  );
}
