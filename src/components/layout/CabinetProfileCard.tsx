import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { getCompanyRoleLabel } from '@/utils/companyRoleLabel';
import { personInitials } from '@/utils/person';

export function CabinetProfileCard({
  displayName,
  email,
  role,
  planCode,
  avatarUrl,
  onLogout,
  isLoggingOut,
}: {
  displayName: string;
  email: string;
  role?: string;
  planCode?: string;
  avatarUrl?: string | null;
  onLogout: () => void;
  isLoggingOut?: boolean;
}) {
  const { t } = useTranslation();
  const roleLabel = role ? getCompanyRoleLabel(t, role) : null;
  const initials = personInitials(displayName, email);

  return (
    <div className="border-t border-gray-100 pt-4 mt-4">
      <div className="flex items-center gap-3 rounded-2xl bg-gray-50/80 px-3 py-3">
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName || email}
              className="size-11 rounded-xl object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-black text-white shadow-sm">
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900" title={displayName || email}>
            {displayName || email}
          </p>
          {roleLabel ? (
            <p className="mt-0.5 truncate text-[11px] font-semibold uppercase tracking-wide text-violet-600">
              {roleLabel}
            </p>
          ) : null}
          <p className="mt-0.5 truncate text-[11px] text-gray-400" title={email}>
            {email}
          </p>
          {planCode ? (
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
              {t('cabinet.common.planPrefix', { code: planCode })}
            </p>
          ) : null}
        </div>
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className={cn(
          'mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5',
          'text-xs font-bold uppercase tracking-wider text-gray-600 transition-colors',
          'hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60 cursor-pointer',
        )}
      >
        <LogOut className="size-4 shrink-0" />
        {t('auth.logout', 'Ieșire')}
      </button>
    </div>
  );
}