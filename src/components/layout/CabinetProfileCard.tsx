import { useState } from 'react';
import { LogOut, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { getCompanyRoleLabel } from '@/utils/companyRoleLabel';
import { AppModal } from '@/components/ui/AppModal';
import { useChangePasswordMutation } from '@/features/auth/api/useAuth';
import { getAuthErrorMessage } from '@/features/auth/authErrors';

import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
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

  // Password change modal state
  const changePasswordMutation = useChangePasswordMutation();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (newPassword.length < 8) {
      setModalError(t('cabinet.shell.passwordMinLength'));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setModalError(t('cabinet.shell.passwordMismatch'));
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      toast.success(t('cabinet.shell.passwordChanged'));
      setIsChangePasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setModalError(message);
      toast.error(message);
    }
  };

  return (
    <div className="border-t border-gray-100 pt-4 mt-4 relative z-50">
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

      <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {t('nav.language', 'Limbă')}
        </span>
        <LanguageSwitcher compact />
      </div>

      {/* Change Password Trigger Button */}
      <button
        type="button"
        onClick={() => setIsChangePasswordOpen(true)}
        className={cn(
          'mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5',
          'text-xs font-bold uppercase tracking-wider text-gray-600 transition-colors',
          'hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 cursor-pointer',
        )}
      >
        <Lock className="size-4 shrink-0" />
        {t('cabinet.shell.changePassword')}
      </button>

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

      {/* Change Password AppModal */}
      <AppModal
        open={isChangePasswordOpen}
        onClose={() => {
          setIsChangePasswordOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
          setModalError(null);
        }}
        title={t('cabinet.shell.changePasswordTitle')}
        size="md"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {modalError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 leading-relaxed">
              {modalError}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('cabinet.shell.currentPassword')}
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all bg-white text-slate-850"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('cabinet.shell.newPassword')}
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all bg-white text-slate-850"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('cabinet.shell.confirmNewPassword')}
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all bg-white text-slate-850"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsChangePasswordOpen(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setModalError(null);
              }}
              className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              {t('cabinet.common.cancel')}
            </button>
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md cursor-pointer text-xs uppercase tracking-wider active:scale-98"
            >
              {changePasswordMutation.isPending ? t('cabinet.common.saving') : t('cabinet.common.save')}
            </button>
          </div>
        </form>
      </AppModal>
    </div>
  );
}
