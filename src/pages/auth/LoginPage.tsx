import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useLoginMutation } from '@/features/auth/api/useAuth';
import {
  useAcceptPortalInvitationMutation,
  usePortalInvitePreviewQuery,
} from '@/features/portal/api/usePortal';
import {
  useAcceptTeamInvitationMutation,
  useTeamInvitePreviewQuery,
} from '@/features/companies/api/useCompanies';
import { getAuthErrorMessage } from '@/features/auth/authErrors';
import { useAuthStore } from '@/stores/authStore';
import { resolveCompanyHomeRoute } from '@/features/companies/companyHomeRoute';

export function LoginPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const inviteToken = params.get('invite') ?? undefined;
  const teamInviteToken = params.get('teamInvite') ?? undefined;
  const returnUrl = params.get('returnUrl');
  const safeReturnUrl =
    returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : null;
  const login = useLoginMutation();
  const acceptInvite = useAcceptPortalInvitationMutation();
  const acceptTeamInvite = useAcceptTeamInvitationMutation();
  const { data: invitePreview } = usePortalInvitePreviewQuery(inviteToken ?? '');
  const { data: teamPreview } = useTeamInvitePreviewQuery(teamInviteToken ?? '');
  const { user, accessToken } = useAuthStore();
  const [loginValue, setLoginValue] = useState('');
  const [loginPresetApplied, setLoginPresetApplied] = useState(false);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user && accessToken) {
      if (safeReturnUrl && user.accountKind === 'END_CLIENT') {
        nav(safeReturnUrl, { replace: true });
        return;
      }
      if (user.accountKind === 'END_CLIENT') nav('/portal', { replace: true });
      else if (user.accountKind === 'PLATFORM_ADMIN') nav('/admin', { replace: true });
      else {
        nav(
          resolveCompanyHomeRoute({
            companyRole: user.companyRole,
            activeCompanyId: user.activeCompanyId,
          }),
          { replace: true },
        );
      }
    }
  }, [user, accessToken, nav, safeReturnUrl]);

  const presetLogin =
    invitePreview?.customerEmail ||
    invitePreview?.customerPhone ||
    teamPreview?.invitedEmail ||
    '';
  const effectiveLogin = loginPresetApplied || !presetLogin ? loginValue : presetLogin;

  return (
    <div className="max-w-md mx-auto py-20 px-4 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-8 rounded-3xl shadow-premium">
        <h1 className="text-2xl font-black mb-2 text-gray-900 tracking-tight text-center">{t('auth.login')}</h1>
        <p className="text-xs text-center text-gray-400 mb-6">{t('auth.loginHint')}</p>

        {teamPreview ? (
          <p className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs font-semibold text-indigo-800">
            Invitație în echipa <strong>{teamPreview.companyName}</strong> ca{' '}
            <strong>{teamPreview.role === 'MANAGER' ? 'Manager' : 'Tehnician'}</strong>.
          </p>
        ) : null}

        {invitePreview ? (
          <p className="mb-4 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-xs font-semibold text-violet-800">
            Invitație pentru <strong>{invitePreview.customerName}</strong> de la{' '}
            <strong>{invitePreview.companyName}</strong>. Autentificați-vă cu emailul sau telefonul
            din fișă.
          </p>
        ) : null}

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setFormError(null);

            try {
              const res = await login.mutateAsync({
                login: effectiveLogin.trim(),
                password,
                rememberMe,
              });
              if (inviteToken && res.user.accountKind === 'END_CLIENT') {
                await acceptInvite.mutateAsync(inviteToken);
                toast.success('Invitația a fost acceptată.');
              }
              if (teamInviteToken && res.user.accountKind === 'COMPANY_STAFF') {
                await acceptTeamInvite.mutateAsync(teamInviteToken);
                toast.success('Ai intrat în echipă!');
              }
              if (res.user.accountKind === 'END_CLIENT') {
                nav(safeReturnUrl ?? '/portal');
              } else if (res.user.accountKind === 'PLATFORM_ADMIN') nav('/admin');
              else if (teamInviteToken) nav('/company/team');
              else {
                nav(
                  resolveCompanyHomeRoute({
                    companyRole: res.user.companyRole,
                    activeCompanyId: res.user.activeCompanyId,
                  }),
                );
              }
            } catch (err) {
              const message = getAuthErrorMessage(err);
              setFormError(message);
              toast.error(message);
            }
          }}
        >
          {formError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 leading-relaxed">
              {formError}
            </div>
          ) : null}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              {t('auth.loginField')}
            </label>
            <input
              type="text"
              required
              placeholder="email@exemplu.md sau +37369123456"
              className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white"
              value={effectiveLogin}
              onChange={(e) => {
                setLoginPresetApplied(true);
                setLoginValue(e.target.value);
              }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              {t('auth.password')}
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer py-1">
            <input
              type="checkbox"
              className="rounded text-violet-600 focus:ring-violet-500/20 border-gray-200 w-4 h-4 cursor-pointer"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            {t('auth.rememberMe', 'Ține-mă minte')}
          </label>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md cursor-pointer text-sm tracking-wide mt-2"
            disabled={login.isPending || acceptInvite.isPending || acceptTeamInvite.isPending}
          >
            {login.isPending ? 'Se autentifică...' : t('auth.login')}
          </button>
        </form>
        <p className="mt-6 text-xs font-semibold text-center text-gray-400 uppercase tracking-wider">
          Nu ai cont?{' '}
          <Link
            to={
              teamInviteToken
                ? `/register?teamInvite=${encodeURIComponent(teamInviteToken)}&kind=COMPANY_STAFF`
                : inviteToken
                  ? `/register?invite=${encodeURIComponent(inviteToken)}&kind=END_CLIENT`
                  : '/register'
            }
            className="text-violet-600 hover:text-violet-700 font-bold transition-colors"
          >
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
