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
import { ACCOUNT_KIND } from '@/constants/roles.constants';
import { COMPANY_ROUTE, PUBLIC_ROUTE, ROUTE_ABS } from '@/constants/routes.constants';
import { companyAbsolutePath } from '@/utils/routes';
import {
  isCompanyStaffAccount,
  isEndClientAccount,
  isManagerRole,
  isPlatformAdminAccount,
} from '@/utils/roles';
import { resolveCompanyHomeRoute } from '@/features/companies/companyHomeRoute';

export function LoginPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const inviteToken = params.get('invite') ?? undefined;
  const teamInviteToken = params.get('teamInvite') ?? undefined;
  const queryLogin = params.get('login') ?? params.get('email') ?? '';
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
      if (safeReturnUrl && isEndClientAccount(user.accountKind)) {
        nav(safeReturnUrl, { replace: true });
        return;
      }
      if (isEndClientAccount(user.accountKind)) nav(ROUTE_ABS.PORTAL, { replace: true });
      else if (isPlatformAdminAccount(user.accountKind)) nav(ROUTE_ABS.ADMIN, { replace: true });
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
    queryLogin ||
    '';
  const effectiveLogin = loginPresetApplied || !presetLogin ? loginValue : presetLogin;

  return (
    <div className="w-full animate-fade-in py-2">
      <div className="space-y-2 mb-8 text-center lg:text-left">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {t('auth.login')}
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          {t('auth.loginHint')}
        </p>
      </div>

      {teamPreview ? (
        <div className="mb-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-xs font-semibold text-indigo-800 leading-relaxed">
          {t('auth.teamInviteBanner', {
            company: teamPreview.companyName,
            role: isManagerRole(teamPreview.role)
              ? t('auth.roleManager')
              : t('auth.roleTechnician'),
          })}
        </div>
      ) : null}

      {invitePreview ? (
        <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50/50 px-4 py-3 text-xs font-semibold text-violet-850 leading-relaxed">
          {t('auth.portalInviteBanner', {
            customer: invitePreview.customerName,
            company: invitePreview.companyName,
          })}
        </div>
      ) : null}

      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setFormError(null);

          try {
            const res = await login.mutateAsync({
              login: effectiveLogin.trim(),
              password,
              rememberMe,
            });
            if (inviteToken && isEndClientAccount(res.user.accountKind)) {
              await acceptInvite.mutateAsync(inviteToken);
              toast.success(t('auth.inviteAccepted'));
            }
            if (teamInviteToken && isCompanyStaffAccount(res.user.accountKind)) {
              await acceptTeamInvite.mutateAsync(teamInviteToken);
              toast.success(t('auth.teamJoined'));
            }
            if (isEndClientAccount(res.user.accountKind)) {
              nav(safeReturnUrl ?? ROUTE_ABS.PORTAL);
            } else if (isPlatformAdminAccount(res.user.accountKind)) nav(ROUTE_ABS.ADMIN);
            else if (teamInviteToken) nav(companyAbsolutePath(COMPANY_ROUTE.TEAM));
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

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            {t('auth.loginField')}
          </label>
          <input
            type="text"
            required
            placeholder={t('auth.loginPlaceholder')}
            className="w-full border border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl px-4 py-3 text-sm outline-none transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-slate-855 font-medium placeholder-slate-400"
            value={effectiveLogin}
            onChange={(e) => {
              setLoginPresetApplied(true);
              setLoginValue(e.target.value);
            }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            {t('auth.password')}
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            className="w-full border border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl px-4 py-3 text-sm outline-none transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-slate-855 font-medium placeholder-slate-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center py-1">
          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-450 uppercase tracking-wider cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded text-violet-600 focus:ring-violet-500/20 border-slate-200 w-4 h-4 cursor-pointer"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            {t('auth.rememberMe', 'Ține-mă minte')}
          </label>
          <Link
            to="/forgot-password"
            className="text-xs font-bold text-violet-650 hover:text-violet-750 uppercase tracking-wider transition-colors"
          >
            {t('auth.forgotPassword', 'Ai uitat parola?')}
          </Link>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 hover:bg-gray-800 active:scale-[0.99] text-white py-3 rounded-xl font-black transition-all cursor-pointer text-xs uppercase tracking-wider mt-2"
          disabled={login.isPending || acceptInvite.isPending || acceptTeamInvite.isPending}
        >
          {login.isPending ? t('auth.loggingIn') : t('auth.login')}
        </button>
      </form>

      <p className="mt-8 text-xs font-bold text-center lg:text-left text-slate-400 uppercase tracking-wider">
        {t('auth.noAccount')}{' '}
        <Link
          to={
            teamInviteToken
              ? `/register?teamInvite=${encodeURIComponent(teamInviteToken)}&kind=${ACCOUNT_KIND.COMPANY_STAFF}`
              : inviteToken
                ? `/register?invite=${encodeURIComponent(inviteToken)}&kind=${ACCOUNT_KIND.END_CLIENT}`
                : `/${PUBLIC_ROUTE.REGISTER}`
          }
          className="text-violet-650 hover:text-violet-750 font-extrabold transition-colors border-b-2 border-transparent hover:border-violet-650"
        >
          {t('auth.register')}
        </Link>
      </p>
    </div>
  );
}

