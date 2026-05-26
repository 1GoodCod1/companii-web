import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useRegisterMutation } from '@/features/auth/api/useAuth';
import { usePortalInvitePreviewQuery } from '@/features/portal/api/usePortal';
import { useTeamInvitePreviewQuery } from '@/features/companies/api/useCompanies';
import { getAuthErrorMessage } from '@/features/auth/authErrors';
import { ACCOUNT_KIND } from '@/constants/roles.constants';
import { ROUTE_ABS } from '@/constants/routes.constants';
import {
  isCompanyStaffAccount,
  isEndClientAccount,
  isManagerRole,
  isPlatformAdminAccount,
} from '@/utils/roles';
import type { AccountKind } from '@/stores/authStore';
import { useAuthStore } from '@/stores/authStore';
import { ApiError } from '@/api/client';
import { resolveCompanyHomeRoute } from '@/features/companies/companyHomeRoute';

const fieldClass =
  'w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white';

export function RegisterPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const portalInviteToken = params.get('invite') ?? undefined;
  const teamInviteToken = params.get('teamInvite') ?? undefined;
  const initialKind = (params.get('kind') as AccountKind | null) ?? ACCOUNT_KIND.COMPANY_STAFF;
  const register = useRegisterMutation();
  const { user, accessToken } = useAuthStore();
  const { data: invitePreview, isLoading: portalInviteLoading } = usePortalInvitePreviewQuery(
    portalInviteToken ?? '',
  );
  const { data: teamPreview, isLoading: teamInviteLoading } = useTeamInvitePreviewQuery(
    teamInviteToken ?? '',
  );
  const isPortalInviteFlow =
    !!portalInviteToken && !!invitePreview && !invitePreview.alreadyLinked;
  const isTeamInviteFlow = !!teamInviteToken && !!teamPreview && !teamPreview.alreadyMember;

  const [accountKind, setAccountKind] = useState<AccountKind>(
    portalInviteToken ? ACCOUNT_KIND.END_CLIENT : teamInviteToken ? ACCOUNT_KIND.COMPANY_STAFF : initialKind,
  );
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);

  useEffect(() => {
    if (user && accessToken) {
      if (isEndClientAccount(user.accountKind)) nav(ROUTE_ABS.PORTAL, { replace: true });
      else if (isPlatformAdminAccount(user.accountKind)) nav(ROUTE_ABS.ADMIN, { replace: true });
      else nav(ROUTE_ABS.COMPANY, { replace: true });
    }
  }, [user, accessToken, nav]);

  if (portalInviteToken && invitePreview?.alreadyLinked) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <p className="text-sm font-semibold text-gray-800">
          {t('auth.registerPage.portalAlreadyLinked')}
        </p>
        <Link
          to={`/login?invite=${encodeURIComponent(portalInviteToken)}`}
          className="inline-flex rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
        >
          {t('auth.registerPage.goToLogin')}
        </Link>
      </div>
    );
  }

  if (teamInviteToken && teamPreview?.alreadyMember) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <p className="text-sm font-semibold text-gray-800">
          {t('auth.registerPage.alreadyTeamMember')}
        </p>
        <Link
          to={`/login?teamInvite=${encodeURIComponent(teamInviteToken)}`}
          className="inline-flex rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
        >
          {t('auth.registerPage.goToLogin')}
        </Link>
      </div>
    );
  }

  const needsInviteEmail = isPortalInviteFlow && !invitePreview?.customerEmail;
  const inviteLoading = portalInviteLoading || teamInviteLoading;

  return (
    <div className="max-w-md mx-auto py-20 px-4 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-8 rounded-3xl shadow-premium">
        <h1 className="text-2xl font-black mb-6 text-gray-900 tracking-tight text-center">
          {isPortalInviteFlow
            ? t('auth.portalActivateTitle')
            : isTeamInviteFlow
              ? t('auth.teamJoinTitle')
              : t('auth.register')}
        </h1>

        {inviteLoading && (portalInviteToken || teamInviteToken) ? (
          <p className="mb-4 text-center text-sm text-gray-400">
            {t('auth.registerPage.loadingInvite')}
          </p>
        ) : null}

        {teamPreview ? (
          <div className="mb-5 rounded-2xl border border-indigo-100 bg-indigo-50/80 px-4 py-4 space-y-2">
            <p className="text-xs font-semibold text-indigo-900">
              {t('auth.registerPage.teamInviteTitle', { company: teamPreview.companyName })}
            </p>
            <p className="text-xs text-indigo-800">
              {t('auth.registerPage.roleLabel', {
                role: isManagerRole(teamPreview.role)
                  ? t('auth.roleManager')
                  : t('auth.roleTechnician'),
              })}
            </p>
            {teamPreview.invitedEmail ? (
              <p className="text-[11px] text-indigo-700/80">
                {t('auth.registerPage.emailMustMatch', { email: teamPreview.invitedEmail })}
              </p>
            ) : null}
          </div>
        ) : null}

        {invitePreview ? (
          <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50/80 px-4 py-4 space-y-3">
            <p className="text-xs font-semibold text-violet-900">
              {t('auth.registerPage.portalInviteTitle', { company: invitePreview.companyName })}
            </p>
            <dl className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-violet-700/70 font-bold uppercase tracking-wider">
                  {t('auth.registerPage.nameLabel')}
                </dt>
                <dd className="font-semibold text-gray-900 text-right">{invitePreview.customerName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-violet-700/70 font-bold uppercase tracking-wider">
                  {t('auth.registerPage.phoneLabel')}
                </dt>
                <dd className="font-semibold text-gray-900 text-right">{invitePreview.customerPhone}</dd>
              </div>
              {invitePreview.customerEmail ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-violet-700/70 font-bold uppercase tracking-wider">
                    {t('auth.registerPage.emailLabel')}
                  </dt>
                  <dd className="font-semibold text-gray-900 text-right break-all">
                    {invitePreview.customerEmail}
                  </dd>
                </div>
              ) : null}
            </dl>
            <p className="text-[11px] leading-relaxed text-violet-800/80">{t('auth.inviteRegisterHint')}</p>
          </div>
        ) : null}

        {!portalInviteToken && !teamInviteToken ? (
          <div className="flex gap-2 mb-6">
            {([ACCOUNT_KIND.COMPANY_STAFF, ACCOUNT_KIND.END_CLIENT] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setAccountKind(k)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  accountKind === k
                    ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-xs'
                    : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500'
                }`}
              >
                {k === ACCOUNT_KIND.COMPANY_STAFF ? t('auth.companyStaff') : t('auth.endClient')}
              </button>
            ))}
          </div>
        ) : null}

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setFormError(null);
            setEmailTaken(false);

            if (!acceptTerms) {
              const message = t('auth.termsRequired');
              setFormError(message);
              toast.error(message);
              return;
            }

            if (!isPortalInviteFlow && !isTeamInviteFlow && isEndClientAccount(accountKind) && !phone.trim()) {
              const message = t('auth.phoneRequired');
              setFormError(message);
              toast.error(message);
              return;
            }

            if (isPortalInviteFlow && needsInviteEmail && !email.trim()) {
              const message = t('auth.inviteEmailRequired');
              setFormError(message);
              toast.error(message);
              return;
            }

            try {
              await register.mutateAsync({
                email:
                  isPortalInviteFlow && invitePreview?.customerEmail
                    ? invitePreview.customerEmail
                    : isTeamInviteFlow && teamPreview?.invitedEmail
                      ? teamPreview.invitedEmail
                      : email,
                password,
                accountKind: accountKind as typeof ACCOUNT_KIND.COMPANY_STAFF | typeof ACCOUNT_KIND.END_CLIENT,
                firstName: isPortalInviteFlow || isTeamInviteFlow ? firstName || undefined : firstName || undefined,
                lastName: isPortalInviteFlow || isTeamInviteFlow ? lastName || undefined : lastName || undefined,
                phone: isPortalInviteFlow || isTeamInviteFlow ? undefined : phone.trim() || undefined,
                acceptTerms: true,
                portalInviteToken: portalInviteToken,
                teamInviteToken: teamInviteToken,
              });
              toast.success(t('auth.registerPage.accountActivated'));
              if (isTeamInviteFlow) nav('/company/team', { replace: true });
              else if (isPortalInviteFlow) nav('/portal', { replace: true });
              else if (isEndClientAccount(accountKind)) nav(ROUTE_ABS.PORTAL, { replace: true });
              else {
                const sessionUser = useAuthStore.getState().user;
                nav(
                  resolveCompanyHomeRoute({
                    companyRole: sessionUser?.companyRole,
                    activeCompanyId: sessionUser?.activeCompanyId,
                  }),
                  { replace: true },
                );
              }
            } catch (err) {
              const message = getAuthErrorMessage(err);
              setFormError(message);
              if (err instanceof ApiError && err.status === 409) {
                setEmailTaken(true);
              }
              toast.error(message);
            }
          }}
        >
          {formError ? (
            <div
              className={`rounded-xl border px-4 py-3 text-xs font-semibold leading-relaxed ${
                emailTaken
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {formError}
              {emailTaken ? (
                <p className="mt-2">
                  <Link
                    to={
                      teamInviteToken
                        ? `/login?teamInvite=${encodeURIComponent(teamInviteToken)}`
                        : portalInviteToken
                          ? `/login?invite=${encodeURIComponent(portalInviteToken)}`
                          : '/login'
                    }
                    className="text-violet-700 font-black uppercase tracking-wider hover:underline"
                  >
                    {t('auth.registerPage.goToLoginArrow')}
                  </Link>
                </p>
              ) : null}
            </div>
          ) : null}

          {!isPortalInviteFlow ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {t('auth.firstName')}
                  </label>
                  <input
                    type="text"
                    required
                    className={fieldClass}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {t('auth.lastName')}
                  </label>
                  <input
                    type="text"
                    required
                    className={fieldClass}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  required
                  placeholder={t('auth.registerPage.emailPlaceholder')}
                  className={`${fieldClass} ${
                    emailTaken ? 'border-amber-400 focus:border-amber-500' : ''
                  }`}
                  value={isTeamInviteFlow && teamPreview?.invitedEmail ? teamPreview.invitedEmail : email}
                  readOnly={!!(isTeamInviteFlow && teamPreview?.invitedEmail)}
                  onChange={(e) => {
                    if (isTeamInviteFlow && teamPreview?.invitedEmail) return;
                    setEmail(e.target.value);
                    setFormError(null);
                    setEmailTaken(false);
                  }}
                />
              </div>
            </>
          ) : needsInviteEmail ? (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                {t('auth.email')} *
              </label>
              <input
                type="email"
                required
                placeholder={t('auth.registerPage.emailPlaceholder')}
                className={fieldClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-[11px] text-gray-400">{t('auth.registerPage.emailFallbackHint')}</p>
            </div>
          ) : null}

          {!isPortalInviteFlow && !isTeamInviteFlow && isEndClientAccount(accountKind) ? (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                {t('auth.phone')} *
              </label>
              <input
                type="tel"
                required
                placeholder="+37369123456"
                className={fieldClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {!portalInviteToken && !teamInviteToken ? (
                <p className="text-[11px] text-gray-400 leading-relaxed">{t('auth.phoneLinkHint')}</p>
              ) : null}
            </div>
          ) : null}

          {!isPortalInviteFlow && !isTeamInviteFlow && isCompanyStaffAccount(accountKind) ? (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                {t('auth.phone')} ({t('auth.optional')})
              </label>
              <input
                type="tel"
                placeholder="+37369123456"
                className={fieldClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          ) : null}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              {t('auth.password')} {isPortalInviteFlow || isTeamInviteFlow ? '*' : ''}
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className={fieldClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <label className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 rounded text-violet-600 focus:ring-violet-500/20 border-gray-200 w-4 h-4 cursor-pointer"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            <span>
              {t('auth.acceptTermsPrefix')}{' '}
              <Link to="/terms" className="font-semibold text-violet-600 hover:text-violet-700">
                {t('auth.termsLink')}
              </Link>{' '}
              {t('auth.and')}{' '}
              <Link to="/privacy" className="font-semibold text-violet-600 hover:text-violet-700">
                {t('auth.privacyLink')}
              </Link>
            </span>
          </label>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md cursor-pointer text-sm tracking-wide mt-2 disabled:opacity-60"
            disabled={
              register.isPending ||
              ((!!portalInviteToken || !!teamInviteToken) && inviteLoading)
            }
          >
            {register.isPending
              ? t('auth.registerPage.processing')
              : isPortalInviteFlow || isTeamInviteFlow
                ? t('auth.registerPage.activateAccount')
                : t('auth.register')}
          </button>
        </form>
        <p className="mt-6 text-xs font-semibold text-center text-gray-400 uppercase tracking-wider">
          {t('auth.registerPage.hasAccount')}{' '}
          <Link
            to={
              teamInviteToken
                ? `/login?teamInvite=${encodeURIComponent(teamInviteToken)}`
                : portalInviteToken
                  ? `/login?invite=${encodeURIComponent(portalInviteToken)}`
                  : '/login'
            }
            className="text-violet-600 hover:text-violet-700 font-bold transition-colors"
          >
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
