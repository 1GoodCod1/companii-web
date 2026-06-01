import { Link } from 'react-router-dom';
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { ACCOUNT_KIND } from '@/constants/roles.constants';
import { PUBLIC_ROUTE } from '@/constants/routes.constants';
import { LoginTeamInviteBanner } from '@/features/auth/components/LoginTeamInviteBanner';
import { LoginPortalInviteBanner } from '@/features/auth/components/LoginPortalInviteBanner';
import { authFieldClass, authLabelClass } from '@/features/auth/authFormStyles';
import { FormFieldError } from '@/components/ui/FormFieldError';
import { fieldClassName } from '@/lib/forms/fieldClassName';

export function LoginPage() {
  const {
    t,
    inviteToken,
    teamInviteToken,
    invitePreview,
    teamPreview,
    form,
    formError,
    onSubmit,
    isPending,
  } = useLoginForm();

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="w-full animate-fade-in py-2">
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          {t('auth.login')}
        </h1>
      </div>

      <LoginTeamInviteBanner teamPreview={teamPreview} />
      <LoginPortalInviteBanner invitePreview={invitePreview} />

      <form className="space-y-5" onSubmit={(e) => void onSubmit(e)}>
        {formError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 leading-relaxed">
            {formError}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label className={authLabelClass}>{t('auth.loginField')}</label>
          <input
            type="text"
            placeholder={t('auth.loginPlaceholder')}
            className={fieldClassName(authFieldClass, !!errors.login)}
            {...register('login')}
          />
          <FormFieldError message={errors.login?.message} />
        </div>

        <div className="space-y-1.5">
          <label className={authLabelClass}>{t('auth.password')}</label>
          <input
            type="password"
            placeholder="••••••••"
            className={fieldClassName(authFieldClass, !!errors.password)}
            {...register('password')}
          />
          <FormFieldError message={errors.password?.message} />
        </div>

        <div className="flex justify-between items-center py-1">
          <label className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded text-violet-600 focus:ring-violet-500/20 border-slate-200 w-4 h-4 cursor-pointer"
              {...register('rememberMe')}
            />
            {t('auth.rememberMe')}
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white py-2.5 rounded-lg font-semibold transition-all cursor-pointer text-sm mt-2"
          disabled={isPending}
        >
          {isPending ? t('auth.loggingIn') : t('auth.login')}
        </button>
      </form>

      <p className="mt-8 text-sm text-center lg:text-left text-slate-500">
        {t('auth.noAccount')}{' '}
        <Link
          to={
            teamInviteToken
              ? `/register?teamInvite=${encodeURIComponent(teamInviteToken)}&kind=${ACCOUNT_KIND.COMPANY_STAFF}`
              : inviteToken
                ? `/register?invite=${encodeURIComponent(inviteToken)}&kind=${ACCOUNT_KIND.END_CLIENT}`
                : `/${PUBLIC_ROUTE.REGISTER}`
          }
          className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
        >
          {t('auth.register')}
        </Link>
      </p>
    </div>
  );
}
