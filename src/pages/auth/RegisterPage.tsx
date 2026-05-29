import { Link } from 'react-router-dom';
import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm';
import {
  isCompanyStaffAccount,
  isEndClientAccount,
} from '@/utils/roles';
import { RegisterTeamInviteBanner } from '@/features/auth/components/RegisterTeamInviteBanner';
import { RegisterPortalInviteBanner } from '@/features/auth/components/RegisterPortalInviteBanner';
import { RegisterAccountKindSelector } from '@/features/auth/components/RegisterAccountKindSelector';

const fieldClass =
  'w-full border border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl px-3 py-2 text-sm outline-none transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-slate-855 font-medium placeholder-slate-400';

export function RegisterPage() {
  const {
    t,
    portalInviteToken,
    teamInviteToken,
    invitePreview,
    teamPreview,
    isPortalInviteFlow,
    isTeamInviteFlow,
    accountKind,
    setAccountKind,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    password,
    setPassword,
    acceptTerms,
    setAcceptTerms,
    formError,
    conflictType,
    needsInviteEmail,
    inviteLoading,
    loginLinkTo,
    showConflictBanner,
    handleSubmit,
    isPending,
  } = useRegisterForm();

  if (portalInviteToken && invitePreview?.alreadyLinked) {
    return (
      <div className="max-w-md mx-auto py-10 px-4 text-center space-y-3">
        <p className="text-sm font-semibold text-gray-800">
          {t('auth.registerPage.portalAlreadyLinked')}
        </p>
        <Link
          to={`/login?invite=${encodeURIComponent(portalInviteToken)}`}
          className="inline-flex rounded-xl bg-gray-900 hover:bg-gray-800 px-5 py-2 text-xs font-black uppercase tracking-wider text-white transition-colors"
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
          className="inline-flex rounded-xl bg-gray-900 hover:bg-gray-800 px-5 py-2 text-xs font-black uppercase tracking-wider text-white transition-colors"
        >
          {t('auth.registerPage.goToLogin')}
        </Link>
      </div>
    );
  }

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

      <RegisterTeamInviteBanner teamPreview={teamPreview} />
      <RegisterPortalInviteBanner invitePreview={invitePreview} />

      <RegisterAccountKindSelector
        portalInviteToken={portalInviteToken}
        teamInviteToken={teamInviteToken}
        accountKind={accountKind}
        onAccountKindChange={setAccountKind}
      />

      <form className="space-y-3" onSubmit={(e) => void handleSubmit(e)}>
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
              onChange={(e) => setPhone(e.target.value)}
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
              onChange={(e) => setPhone(e.target.value)}
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
          className="w-full bg-gray-900 hover:bg-gray-800 active:scale-[0.99] text-white py-2.5 rounded-xl font-black transition-all cursor-pointer text-xs uppercase tracking-wider mt-2 disabled:opacity-60"
          disabled={isPending || ((!!portalInviteToken || !!teamInviteToken) && inviteLoading)}
        >
          {isPending
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
          className="text-violet-650 hover:text-violet-750 font-extrabold transition-colors border-b-2 border-transparent hover:border-violet-650"
        >
          {t('auth.login')}
        </Link>
      </p>
    </div>
  );
}
