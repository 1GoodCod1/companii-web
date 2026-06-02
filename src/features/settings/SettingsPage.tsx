import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Panel, PanelHeader } from '@/widgets/cabinet/cabinet-ui';
import { LanguageSwitcher } from '@/shared/ui/i18n/LanguageSwitcher';
import { AppModal } from '@/shared/ui/AppModal';
import { useChangePasswordMutation } from '@/features/auth';
import { getAuthErrorMessage } from '@/features/auth';

interface ChangePasswordState {
  isOpen: boolean;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  error: string | null;
}

const initialPasswordState: ChangePasswordState = {
  isOpen: false,
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
  error: null,
};

type ChangePasswordAction =
  | { type: 'OPEN_MODAL' }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SET_CURRENT_PASSWORD'; payload: string }
  | { type: 'SET_NEW_PASSWORD'; payload: string }
  | { type: 'SET_CONFIRM_NEW_PASSWORD'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_FORM' };

function changePasswordReducer(
  state: ChangePasswordState,
  action: ChangePasswordAction,
): ChangePasswordState {
  switch (action.type) {
    case 'OPEN_MODAL':
      return { ...state, isOpen: true };
    case 'CLOSE_MODAL':
      return initialPasswordState;
    case 'SET_CURRENT_PASSWORD':
      return { ...state, currentPassword: action.payload };
    case 'SET_NEW_PASSWORD':
      return { ...state, newPassword: action.payload };
    case 'SET_CONFIRM_NEW_PASSWORD':
      return { ...state, confirmNewPassword: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_FORM':
      return {
        ...state,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        error: null,
      };
    default:
      return state;
  }
}

export function SettingsPage() {
  const { t } = useTranslation();
  const changePasswordMutation = useChangePasswordMutation();
  const [passwordState, passwordDispatch] = useReducer(changePasswordReducer, initialPasswordState);
  const {
    isOpen: isChangePasswordOpen,
    currentPassword,
    newPassword,
    confirmNewPassword,
    error: modalError,
  } = passwordState;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    passwordDispatch({ type: 'SET_ERROR', payload: null });

    if (newPassword.length < 8) {
      passwordDispatch({ type: 'SET_ERROR', payload: t('cabinet.shell.passwordMinLength') });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      passwordDispatch({ type: 'SET_ERROR', payload: t('cabinet.shell.passwordMismatch') });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      toast.success(t('cabinet.shell.passwordChanged'));
      passwordDispatch({ type: 'CLOSE_MODAL' });
    } catch (err) {
      const message = getAuthErrorMessage(err);
      passwordDispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PanelHeader
        title={t('settings.title')}
        description={t('settings.description')}
      />

      {/* Language */}
      <Panel className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Globe className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900">
              {t('settings.language.title')}
            </h3>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              {t('settings.language.description')}
            </p>
            <div className="mt-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </Panel>

      {/* Password */}
      <Panel className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Lock className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900">
              {t('settings.password.title')}
            </h3>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              {t('settings.password.description')}
            </p>
            <button
              type="button"
              onClick={() => passwordDispatch({ type: 'OPEN_MODAL' })}
              className={cn(
                'mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5',
                'text-xs font-bold uppercase tracking-wider text-gray-600 transition-colors',
                'hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 cursor-pointer',
              )}
            >
              <Lock className="size-4 shrink-0" />
              {t('cabinet.shell.changePassword')}
            </button>
          </div>
        </div>
      </Panel>

      {/* Change Password Modal */}
      <AppModal
        open={isChangePasswordOpen}
        onClose={() => passwordDispatch({ type: 'CLOSE_MODAL' })}
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
            <label htmlFor="settings-current-password" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('cabinet.shell.currentPassword')}
            </label>
            <input
              id="settings-current-password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all bg-white text-slate-850"
              value={currentPassword}
              onChange={(e) => passwordDispatch({ type: 'SET_CURRENT_PASSWORD', payload: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="settings-new-password" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('cabinet.shell.newPassword')}
            </label>
            <input
              id="settings-new-password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all bg-white text-slate-850"
              value={newPassword}
              onChange={(e) => passwordDispatch({ type: 'SET_NEW_PASSWORD', payload: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="settings-confirm-password" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('cabinet.shell.confirmNewPassword')}
            </label>
            <input
              id="settings-confirm-password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all bg-white text-slate-850"
              value={confirmNewPassword}
              onChange={(e) => passwordDispatch({ type: 'SET_CONFIRM_NEW_PASSWORD', payload: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => passwordDispatch({ type: 'CLOSE_MODAL' })}
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