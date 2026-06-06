import { SignOutIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { getCompanyRoleLabel } from '@/entities/company/model/companyRoleLabel';
import { personInitials } from '@/shared/utils/person';
import { cabinetPanelClass } from '@/widgets/cabinet/cabinet-ui';

export function CabinetProfileCard({
  displayName,
  email,
  role,
  planCode,
  avatarUrl,
  onLogout,
  isLoggingOut,
  collapsed,
}: {
  displayName: string;
  email: string;
  role?: string;
  planCode?: string;
  avatarUrl?: string | null;
  onLogout: () => void;
  isLoggingOut?: boolean;
  collapsed?: boolean;
}) {
  const { t } = useTranslation();
  const roleLabel = role ? getCompanyRoleLabel(t, role) : null;
  const initials = personInitials(displayName, email);
  const title = displayName || email;

  if (collapsed) {
    return (
      <div className="mt-4 border-t border-gray-200 pt-4 flex flex-col items-center gap-3">
        <div className="relative shrink-0" title={title}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={title}
              className="size-10 object-cover border border-slate-200 bg-slate-100"
            />
          ) : (
            <div className="flex size-10 items-center justify-center bg-gray-900 text-xs font-black text-white">
              {initials}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          title={t('auth.logout', 'Ieșire')}
          className={cn(
            'flex size-10 items-center justify-center border border-slate-200 bg-slate-50 text-gray-600 transition-all rounded-xl',
            'hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer',
          )}
        >
          <SignOutIcon className="size-4 shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className={cn(cabinetPanelClass, 'overflow-hidden bg-white p-0')}>
        <div className="flex items-start gap-3 p-3.5">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={title}
                className="size-12 object-cover border border-slate-200 bg-slate-100"
              />
            ) : (
              <div className="flex size-12 items-center justify-center bg-gray-900 text-sm font-black text-white">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-sm font-bold leading-tight text-gray-900" title={title}>
              {title}
            </p>

            {roleLabel || planCode ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {roleLabel ? (
                  <span className="inline-flex max-w-full items-center truncate bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                    {roleLabel}
                  </span>
                ) : null}
                {planCode ? (
                  <span className="inline-flex max-w-full items-center truncate bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    {planCode}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className={cn(
            'flex w-full items-center justify-center gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-2.5',
            'text-[11px] font-bold uppercase tracking-wider text-gray-600 transition-colors',
            'hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer',
          )}
        >
          <SignOutIcon className="size-3.5 shrink-0" />
          {t('auth.logout', 'Ieșire')}
        </button>
      </div>
    </div>
  );
}
