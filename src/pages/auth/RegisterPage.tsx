import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useRegisterMutation } from '@/features/auth/api/useAuth';
import { usePortalInvitePreviewQuery } from '@/features/portal/api/usePortal';
import { useTeamInvitePreviewQuery } from '@/features/companies/api/useCompanies';
import {
  getAuthErrorMessage,
  isAuthEmailTakenError,
  isAuthPhoneTakenError,
  isAuthRegistrationConflictError,
} from '@/features/auth/authErrors';
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
import { resolveCompanyHomeRoute } from '@/features/companies/companyHomeRoute';

const fieldClass =
  'w-full border border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl px-3 py-2 text-sm outline-none transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-slate-850 font-medium placeholder-slate-400';

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
  const [conflictType, setConflictType] = useState<'email' | 'phone' | 'general' | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (user && accessToken) {
      if (isEndClientAccount(user.accountKind)) nav(ROUTE_ABS.PORTAL, { replace: true });
      else if (isPlatformAdminAccount(user.accountKind)) nav(ROUTE_ABS.ADMIN, { replace: true });
      else nav(ROUTE_ABS.COMPANY, { replace: true });
    }
  }, [user, accessToken, nav]);

  if (portalInviteToken && invitePreview?.alreadyLinked) {
    return (
      <div className="max-w-md mx-auto py-10 px-4 text-center space-y-3">
        <p className="text-sm font-semibold text-gray-800">
          {t('auth.registerPage.portalAlreadyLinked')}
        </p>
        <Link
          to={`/login?invite=${encodeURIComponent(portalInviteToken)}`}
          className="inline-flex rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white"
        >
          {t('auth.registerPage.goToLogin')}
        </Link>
      </div>
    );
  }

  if (teamInviteToken && teamPreview?.alreadyMember) {
    return (
      <div className="max-w-md mx-auto py-10 px-4 text-center space-y-3">
        <p className="text-sm font-semibold text-gray-800">
          {t('auth.registerPage.alreadyTeamMember')}
        </p>
        <Link
          to={`/login?teamInvite=${encodeURIComponent(teamInviteToken)}`}
          className="inline-flex rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white"
        >
          {t('auth.registerPage.goToLogin')}
        </Link>
      </div>
    );
  }

  const needsInviteEmail = isPortalInviteFlow && !invitePreview?.customerEmail;
  const inviteLoading = portalInviteLoading || teamInviteLoading;
  const loginPrefill =
    conflictType === 'phone' && phone.trim() ? phone.trim() : email.trim();
  const loginLinkTo = teamInviteToken
    ? `/login?teamInvite=${encodeURIComponent(teamInviteToken)}&login=${encodeURIComponent(loginPrefill)}`
    : portalInviteToken
      ? `/login?invite=${encodeURIComponent(portalInviteToken)}&login=${encodeURIComponent(loginPrefill)}`
      : `/login?login=${encodeURIComponent(loginPrefill)}`;
  const showConflictBanner = conflictType === 'email' || conflictType === 'phone';

  return (
    <div className="w-full animate-fade-in">
      <div className="space-y-1 mb-4 text-center lg:text-left">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
          {isPortalInviteFlow
            ? t('auth.portalActivateTitle')
            : isTeamInviteFlow
              ? t('auth.teamJoinTitle')
              : t('auth.register')}
        </h1>
        <p className="text-[11px] text-slate-400 font-medium">
          {isPortalInviteFlow || isTeamInviteFlow
            ? t('auth.registerPage.inviteSubtitle', 'Finalizați configurarea profilului dvs.')
            : t('auth.registerPage.subtitle', 'Creați un cont nou în sistem')}
        </p>
      </div>

      {inviteLoading && (portalInviteToken || teamInviteToken) ? (
        <p className="mb-3 text-center text-xs text-slate-400 font-medium">
          {t('auth.registerPage.loadingInvite')}
        </p>
      ) : null}

      {teamPreview ? (
        <div className="mb-4 rounded-xl border border-indigo-105 bg-indigo-50/50 px-3.5 py-3 space-y-1.5">
          <p className="text-xs font-semibold text-indigo-900">
            {t('auth.registerPage.teamInviteTitle', { company: teamPreview.companyName })}
          </p>
          <p className="text-[11px] text-indigo-805 font-semibold leading-none">
            {t('auth.registerPage.roleLabel', {
              role: isManagerRole(teamPreview.role)
                ? t('auth.roleManager')
                : t('auth.roleTechnician'),
            })}
          </p>
          {teamPreview.invitedEmail ? (
            <p className="text-[10px] text-indigo-700/85 font-bold uppercase tracking-wider leading-none">
              {t('auth.registerPage.emailMustMatch', { email: teamPreview.invitedEmail })}
            </p>
          ) : null}
        </div>
      ) : null}

      {invitePreview ? (
        <div className="mb-4 rounded-xl border border-violet-100 bg-violet-50/50 p-3.5 space-y-2">
          <p className="text-xs font-semibold text-violet-900">
            {t('auth.registerPage.portalInviteTitle', { company: invitePreview.companyName })}
          </p>
          <dl className="grid grid-cols-1 gap-1.5 text-xs">
            <div className="flex justify-between gap-3 border-b border-violet-100/30 pb-1">
              <dt className="text-violet-700/70 font-bold uppercase tracking-widest text-[8px]">
                {t('auth.registerPage.nameLabel')}
              </dt>
              <dd className="font-semibold text-slate-800 text-right text-[11px]">{invitePreview.customerName}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-violet-100/30 pb-1">
              <dt className="text-violet-700/70 font-bold uppercase tracking-widest text-[8px]">
                {t('auth.registerPage.phoneLabel')}
              </dt>
              <dd className="font-semibold text-slate-800 text-right text-[11px]">{invitePreview.customerPhone}</dd>
            </div>
            {invitePreview.customerEmail ? (
              <div className="flex justify-between gap-3">
                <dt className="text-violet-700/70 font-bold uppercase tracking-widest text-[8px]">
                  {t('auth.registerPage.emailLabel')}
                </dt>
                <dd className="font-semibold text-slate-800 text-right break-all text-[11px]">{invitePreview.customerEmail}</dd>
              </div>
            ) : null}
          </dl>
          <p className="text-[10px] leading-relaxed text-violet-850">{t('auth.inviteRegisterHint')}</p>
        </div>
      ) : null}

      {!portalInviteToken && !teamInviteToken ? (
        <div className="flex gap-2.5 mb-4 bg-slate-100/50 p-1 rounded-2xl border border-slate-200 relative">
          {([ACCOUNT_KIND.COMPANY_STAFF, ACCOUNT_KIND.END_CLIENT] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setAccountKind(k)}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                accountKind === k
                  ? 'bg-white border border-slate-200 text-violet-650 shadow-xs font-black'
                  : 'border border-transparent text-slate-405 hover:text-slate-700'
              }`}
            >
              {k === ACCOUNT_KIND.COMPANY_STAFF ? t('auth.companyStaff') : t('auth.endClient')}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (submittingRef.current || register.isPending) return;

          setFormError(null);
          setConflictType(null);

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

          submittingRef.current = true;
          try {
            const registrationEmail =
              isPortalInviteFlow && invitePreview?.customerEmail
                ? invitePreview.customerEmail
                : isTeamInviteFlow && teamPreview?.invitedEmail
                  ? teamPreview.invitedEmail
                  : email;

            await register.mutateAsync({
              email: registrationEmail,
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
            if (isAuthPhoneTakenError(err)) {
              setConflictType('phone');
            } else if (isAuthEmailTakenError(err)) {
              setConflictType('email');
            } else if (isAuthRegistrationConflictError(err)) {
              setConflictType('general');
            }
            toast.error(message);
          } finally {
            submittingRef.current = false;
          }
        }}
      >
        {formError ? (
          <div
            className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold leading-relaxed ${
              showConflictBanner
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {conflictType === 'phone' ? (
              <p className="font-black uppercase tracking-widest text-[8px] text-amber-800 mb-1">
                {t('auth.phone')}
              </p>
            ) : null}
            {formError}
            {conflictType === 'phone' ? (
              <p className="mt-1.5 text-amber-805">{t('auth.registerPage.phoneTakenFieldHint')}</p>
            ) : null}
            {conflictType ? (
              <p className="mt-1.5">
                <Link
                  to={loginLinkTo}
                  className="text-violet-700 font-black uppercase tracking-widest text-[8px] hover:underline"
                >
                  {conflictType === 'phone'
                    ? t('auth.registerPage.phoneTakenLoginHint')
                    : t('auth.registerPage.goToLoginArrow')}
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        {!isPortalInviteFlow ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                {t('auth.email')}
              </label>
              <input
                type="email"
                required
                placeholder={t('auth.registerPage.emailPlaceholder')}
                className={`${fieldClass} ${
                  conflictType === 'email' ? 'border-amber-450 ring-2 ring-amber-250/20' : ''
                }`}
                value={isTeamInviteFlow && teamPreview?.invitedEmail ? teamPreview.invitedEmail : email}
                readOnly={!!(isTeamInviteFlow && teamPreview?.invitedEmail)}
                onChange={(e) => {
                  if (isTeamInviteFlow && teamPreview?.invitedEmail) return;
                  setEmail(e.target.value);
                  if (conflictType === 'email') {
                    setFormError(null);
                    setConflictType(null);
                  }
                }}
              />
            </div>
          </>
        ) : needsInviteEmail ? (
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">
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
            <p className="text-[10px] text-slate-400 mt-0.5">{t('auth.registerPage.emailFallbackHint')}</p>
          </div>
        ) : null}

        {!isPortalInviteFlow && !isTeamInviteFlow && isEndClientAccount(accountKind) ? (
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">
              {t('auth.phone')} *
            </label>
            <input
              type="tel"
              required
              placeholder="+37369123456"
              className={`${fieldClass} ${
                conflictType === 'phone' ? 'border-amber-450 ring-2 ring-amber-200/60' : ''
              }`}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (conflictType === 'phone') {
                  setFormError(null);
                  setConflictType(null);
                }
              }}
            />
            {conflictType === 'phone' ? (
              <p className="text-[10px] font-semibold text-amber-800 leading-snug mt-0.5">
                {t('auth.registerPage.phoneTakenFieldHint')}
              </p>
            ) : !portalInviteToken && !teamInviteToken ? (
              <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{t('auth.phoneLinkHint')}</p>
            ) : null}
          </div>
        ) : null}

        {!isPortalInviteFlow && !isTeamInviteFlow && isCompanyStaffAccount(accountKind) ? (
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">
              {t('auth.phone')} ({t('auth.optional')})
            </label>
            <input
              type="tel"
              placeholder="+37369123456"
              className={`${fieldClass} ${
                conflictType === 'phone' ? 'border-amber-450 ring-2 ring-amber-200/60' : ''
              }`}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (conflictType === 'phone') {
                  setFormError(null);
                  setConflictType(null);
                }
              }}
            />
            {conflictType === 'phone' ? (
              <p className="text-[10px] font-semibold text-amber-800 leading-snug mt-0.5">
                {t('auth.registerPage.phoneTakenFieldHint')}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                {t('auth.registerPage.companyPhoneHint')}
              </p>
            )}
          </div>
        ) : null}

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">
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

        <label className="flex items-start gap-2.5 text-[11px] text-slate-500 leading-snug cursor-pointer select-none py-0.5">
          <input
            type="checkbox"
            className="mt-0.5 rounded text-violet-600 focus:ring-violet-500/20 border-slate-200 w-3.5 h-3.5 cursor-pointer"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          <span>
            {t('auth.acceptTermsPrefix')}{' '}
            <Link to="/terms" className="font-extrabold text-violet-600 hover:text-violet-700">
              {t('auth.termsLink')}
            </Link>{' '}
            {t('auth.and')}{' '}
            <Link to="/privacy" className="font-extrabold text-violet-600 hover:text-violet-700">
              {t('auth.privacyLink')}
            </Link>
          </span>
        </label>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.99] text-white py-2.5 rounded-xl font-bold transition-all shadow-md shadow-violet-500/10 hover:shadow-lg hover:shadow-violet-500/15 cursor-pointer text-xs uppercase tracking-wider mt-2 disabled:opacity-60"
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

      <p className="mt-5 text-xs font-bold text-center lg:text-left text-slate-400 uppercase tracking-wider">
        {t('auth.registerPage.hasAccount')}{' '}
        <Link
          to={
            teamInviteToken
              ? `/login?teamInvite=${encodeURIComponent(teamInviteToken)}`
              : portalInviteToken
                ? `/login?invite=${encodeURIComponent(portalInviteToken)}`
                : '/login'
          }
          className="text-violet-600 hover:text-violet-700 font-extrabold transition-colors border-b-2 border-transparent hover:border-violet-650"
        >
          {t('auth.login')}
        </Link>
      </p>
    </div>
  );
}
