import { Link } from 'react-router-dom';
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { ACCOUNT_KIND } from '@/constants/roles.constants';
import { PUBLIC_ROUTE } from '@/constants/routes.constants';
import { LoginTeamInviteBanner } from '@/features/auth/components/LoginTeamInviteBanner';
import { LoginPortalInviteBanner } from '@/features/auth/components/LoginPortalInviteBanner';

export function LoginPage() {
  const {
    t,
    inviteToken,
    teamInviteToken,
    invitePreview,
    teamPreview,
    setLoginValue,
    setLoginPresetApplied,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    formError,
    effectiveLogin,
    handleSubmit,
    isPending,
  } = useLoginForm();

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

      <LoginTeamInviteBanner teamPreview={teamPreview} />
      <LoginPortalInviteBanner invitePreview={invitePreview} />

      <form className="space-y-5" onSubmit={(e) => void handleSubmit(e)}>
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
          disabled={isPending}
        >
          {isPending ? t('auth.loggingIn') : t('auth.login')}
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
