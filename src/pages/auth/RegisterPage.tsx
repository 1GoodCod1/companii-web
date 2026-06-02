import { Link } from 'react-router-dom';
import { useRegisterForm } from '@/features/auth';
import {
  isCompanyStaffAccount,
  isEndClientAccount,
} from '@/entities/company/model/roles';
import { RegisterTeamInviteBanner } from '@/features/auth';
import { RegisterPortalInviteBanner } from '@/features/auth';
import { RegisterAccountKindSelector } from '@/features/auth';
import { authFieldClass, authLabelClass } from '@/features/auth';
import { FormFieldError } from '@/shared/ui/FormFieldError';
import { fieldClassName } from '@/lib/forms/fieldClassName';

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
    form,
    formError,
    conflictType,
    needsInviteEmail,
    inviteLoading,
    loginLinkTo,
    showConflictBanner,
    onSubmit,
    isPending,
  } = useRegisterForm();

  const {
    register,
    formState: { errors },
  } = form;

  if (portalInviteToken && invitePreview?.alreadyLinked) {
    return (
      <div className="max-w-md mx-auto py-10 px-4 text-center space-y-3">
        <p className="text-sm font-semibold text-gray-800">
          {t('auth.registerPage.portalAlreadyLinked')}
        </p>
        <Link
          to={`/login?invite=${encodeURIComponent(portalInviteToken)}`}
          className="inline-flex rounded-lg bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
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
          className="inline-flex rounded-lg bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          {t('auth.registerPage.goToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-5 text-center lg:text-left">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          {isPortalInviteFlow
            ? t('auth.portalActivateTitle')
            : isTeamInviteFlow
              ? t('auth.teamJoinTitle')
              : t('auth.register')}
        </h1>
        {isPortalInviteFlow || isTeamInviteFlow ? (
          <p className="text-sm text-slate-500 mt-1">{t('auth.registerPage.inviteSubtitle')}</p>
        ) : null}
      </div>

      {inviteLoading && (portalInviteToken || teamInviteToken) ? (
        <p className="mb-3 text-center text-sm text-slate-500">
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

      <form className="space-y-3" onSubmit={(e) => void onSubmit(e)}>
        {formError ? (
          <div
            className={`rounded-lg border px-3.5 py-2.5 text-sm leading-relaxed ${
              showConflictBanner
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {conflictType === 'phone' ? (
              <p className="text-xs font-medium text-amber-800 mb-1">
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
                  className="text-violet-700 text-sm font-medium hover:underline"
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
                <label className={authLabelClass}>
                  {t('auth.firstName')}
                </label>
                <input
                  type="text"
                  className={fieldClassName(authFieldClass, !!errors.firstName)}
                  {...register('firstName')}
                />
                <FormFieldError message={errors.firstName?.message} />
              </div>
              <div className="space-y-1">
                <label className={authLabelClass}>
                  {t('auth.lastName')}
                </label>
                <input
                  type="text"
                  className={fieldClassName(authFieldClass, !!errors.lastName)}
                  {...register('lastName')}
                />
                <FormFieldError message={errors.lastName?.message} />
              </div>
            </div>

            <div className="space-y-1">
              <label className={authLabelClass}>
                {t('auth.email')}
              </label>
              <input
                type="email"
                placeholder={t('auth.registerPage.emailPlaceholder')}
                className={fieldClassName(
                  authFieldClass,
                  !!errors.email || conflictType === 'email',
                )}
                readOnly={!!(isTeamInviteFlow && teamPreview?.invitedEmail)}
                {...register('email')}
              />
              <FormFieldError message={errors.email?.message} />
            </div>
          </>
        ) : needsInviteEmail ? (
          <div className="space-y-1">
            <label className={authLabelClass}>
              {t('auth.email')} *
            </label>
            <input
              type="email"
              placeholder={t('auth.registerPage.emailPlaceholder')}
              className={fieldClassName(authFieldClass, !!errors.email)}
              {...register('email')}
            />
            <FormFieldError message={errors.email?.message} />
            <p className="text-xs text-slate-500 mt-0.5">{t('auth.registerPage.emailFallbackHint')}</p>
          </div>
        ) : null}

        {!isPortalInviteFlow && !isTeamInviteFlow && isEndClientAccount(accountKind) ? (
          <div className="space-y-1">
            <label className={authLabelClass}>
              {t('auth.phone')} *
            </label>
            <input
              type="tel"
              placeholder="+37369123456"
              className={fieldClassName(
                authFieldClass,
                !!errors.phone || conflictType === 'phone',
              )}
              {...register('phone')}
            />
            <FormFieldError message={errors.phone?.message} />
            {conflictType === 'phone' ? (
              <p className="text-xs text-amber-800 leading-snug mt-0.5">
                {t('auth.registerPage.phoneTakenFieldHint')}
              </p>
            ) : null}
          </div>
        ) : null}

        {!isPortalInviteFlow && !isTeamInviteFlow && isCompanyStaffAccount(accountKind) ? (
          <div className="space-y-1">
            <label className={authLabelClass}>
              {t('auth.phone')} ({t('auth.optional')})
            </label>
            <input
              type="tel"
              placeholder="+37369123456"
              className={fieldClassName(
                authFieldClass,
                conflictType === 'phone',
              )}
              {...register('phone')}
            />
            {conflictType === 'phone' ? (
              <p className="text-xs text-amber-800 leading-snug mt-0.5">
                {t('auth.registerPage.phoneTakenFieldHint')}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-1">
          <label className={authLabelClass}>
            {t('auth.password')} {isPortalInviteFlow || isTeamInviteFlow ? '*' : ''}
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className={fieldClassName(authFieldClass, !!errors.password)}
            {...register('password')}
          />
          <FormFieldError message={errors.password?.message} />
        </div>

        <div>
          <label className="flex items-start gap-2.5 text-sm text-slate-600 leading-snug cursor-pointer select-none py-0.5">
            <input
              type="checkbox"
              className="mt-0.5 rounded text-violet-600 focus:ring-violet-500/20 border-slate-200 w-3.5 h-3.5 cursor-pointer"
              {...register('acceptTerms')}
            />
            <span>
              {t('auth.acceptTermsPrefix')}{' '}
              <Link to="/terms" className="font-medium text-violet-600 hover:text-violet-700">
                {t('auth.termsLink')}
              </Link>{' '}
              {t('auth.and')}{' '}
              <Link to="/privacy" className="font-medium text-violet-600 hover:text-violet-700">
                {t('auth.privacyLink')}
              </Link>
            </span>
          </label>
          <FormFieldError message={errors.acceptTerms?.message} />
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white py-2.5 rounded-lg font-semibold transition-all cursor-pointer text-sm mt-2 disabled:opacity-60"
          disabled={isPending || ((!!portalInviteToken || !!teamInviteToken) && inviteLoading)}
        >
          {isPending
            ? t('auth.registerPage.processing')
            : isPortalInviteFlow || isTeamInviteFlow
              ? t('auth.registerPage.activateAccount')
              : t('auth.register')}
        </button>
      </form>

      <p className="mt-6 text-sm text-center lg:text-left text-slate-500">
        {t('auth.registerPage.hasAccount')}{' '}
        <Link
          to={
            teamInviteToken
              ? `/login?teamInvite=${encodeURIComponent(teamInviteToken)}`
              : portalInviteToken
                ? `/login?invite=${encodeURIComponent(portalInviteToken)}`
                : '/login'
          }
          className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
        >
          {t('auth.login')}
        </Link>
      </p>
    </div>
  );
}
