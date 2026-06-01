import { useMemo, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useResetPasswordMutation } from '@/features/auth/api/useAuth';
import { getAuthErrorMessage } from '@/features/auth/authErrors';
import { Lock, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { FormFieldError } from '@/components/ui/FormFieldError';
import { fieldClassName } from '@/lib/forms/fieldClassName';
import {
  createResetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/lib/forms/schemas/authSchemas';
import { showFirstFormError } from '@/lib/forms/showFirstFormError';

const resetFieldClass =
  'w-full border border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-slate-855 font-medium placeholder-slate-400';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const resetPassword = useResetPasswordMutation();
  const nav = useNavigate();

  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const schema = useMemo(() => createResetPasswordSchema(t), [t]);
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const {
    register,
    formState: { errors },
  } = form;

  const onSubmit = form.handleSubmit(
    async (values) => {
      setFormError(null);

      if (!token) {
        setFormError(t('auth.resetPasswordPage.tokenMissingError'));
        return;
      }

      try {
        await resetPassword.mutateAsync({
          token,
          password: values.password,
        });
        setSubmitted(true);
        toast.success(t('auth.resetPasswordPage.toastChanged'));
      } catch (err) {
        const message = getAuthErrorMessage(err);
        setFormError(message);
        toast.error(message);
      }
    },
    (validationErrors) => showFirstFormError(validationErrors),
  );

  return (
    <div className="w-full animate-fade-in py-2 relative z-10">
      {!token ? (
        <div className="space-y-6 text-center lg:text-left py-4">
          <div className="mx-auto lg:mx-0 p-4 bg-rose-50 text-rose-600 rounded-3xl w-16 h-16 flex items-center justify-center shadow-xs border border-rose-500/10">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
              {t('auth.resetPasswordPage.tokenMissingTitle')}
            </h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              {t('auth.resetPasswordPage.tokenMissingDesc')}
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-98"
          >
            {t('auth.resetPasswordPage.requestNewLink')}
          </Link>
        </div>
      ) : submitted ? (
        <div className="space-y-6 text-center lg:text-left py-4 animate-fade-in">
          <div className="mx-auto lg:mx-0 p-4 bg-emerald-50 text-emerald-600 rounded-3xl w-16 h-16 flex items-center justify-center shadow-xs border border-emerald-500/10">
            <CheckCircle2 className="w-8 h-8 animate-bounce-slow" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
              {t('auth.resetPasswordPage.passwordChangedTitle')}
            </h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              {t('auth.resetPasswordPage.passwordChangedDesc')}
            </p>
          </div>
          <button
            onClick={() => nav('/login', { replace: true })}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-98 cursor-pointer"
          >
            {t('auth.resetPasswordPage.loginBtn')}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {t('auth.resetPasswordPage.setPasswordTitle')}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {t('auth.resetPasswordPage.setPasswordSubtitle')}
            </p>
          </div>

          <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 leading-relaxed">
                {formError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                {t('auth.resetPasswordPage.newPasswordLabel')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={fieldClassName(resetFieldClass, !!errors.password)}
                  {...register('password')}
                />
              </div>
              <FormFieldError message={errors.password?.message} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                {t('auth.resetPasswordPage.confirmPasswordLabel')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={fieldClassName(resetFieldClass, !!errors.confirmPassword)}
                  {...register('confirmPassword')}
                />
              </div>
              <FormFieldError message={errors.confirmPassword?.message} />
            </div>

            <button
              type="submit"
              disabled={resetPassword.isPending}
              className="w-full bg-gray-900 hover:bg-gray-800 active:scale-[0.99] text-white py-3.5 rounded-xl font-black transition-all cursor-pointer text-xs uppercase tracking-wider mt-2 flex items-center justify-center gap-1.5"
            >
              {resetPassword.isPending
                ? t('auth.resetPasswordPage.processing')
                : t('auth.resetPasswordPage.resetButton')}
            </button>
          </form>

          <div className="border-t border-slate-100 pt-6 text-center lg:text-left">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-750 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('auth.resetPasswordPage.backToLogin')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
