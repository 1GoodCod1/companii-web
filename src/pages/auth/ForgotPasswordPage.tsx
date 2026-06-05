import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation } from '@/features/auth';
import { getAuthErrorMessage } from '@/features/auth';
import { ArrowLeftIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { authFieldClass, authLabelClass } from '@/features/auth';
import { FormFieldError } from '@/shared/ui/FormFieldError';
import { fieldClassName } from '@/lib/forms/fieldClassName';
import {
  createForgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/lib/forms/schemas/authSchemas';
import { showFirstFormError } from '@/lib/forms/showFirstFormError';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const forgotPassword = useForgotPasswordMutation();
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const schema = useMemo(() => createForgotPasswordSchema(t), [t]);
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const {
    register,
    formState: { errors },
    getValues,
  } = form;

  const onSubmit = form.handleSubmit(
    async (values) => {
      setFormError(null);

      try {
        await forgotPassword.mutateAsync({ email: values.email.trim() });
        setSubmitted(true);
        toast.success(t('auth.forgotPasswordPage.toastSent'));
      } catch (err) {
        const message = getAuthErrorMessage(err);
        setFormError(message);
        toast.error(message);
      }
    },
    (validationErrors) => showFirstFormError(validationErrors),
  );

  if (submitted) {
    return (
      <div className="w-full animate-fade-in py-2 space-y-5 text-center lg:text-left">
        <div className="mx-auto lg:mx-0 p-3 bg-emerald-50 text-emerald-600 rounded-xl size-12 flex items-center justify-center border border-emerald-100">
          <CheckCircleIcon className="size-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {t('auth.forgotPasswordPage.successTitle')}
          </h2>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            {t('auth.forgotPasswordPage.successBody', { email: getValues('email') })}
          </p>
        </div>
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 w-full border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          {t('auth.forgotPasswordPage.backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in py-2">
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          {t('auth.forgotPasswordPage.title')}
        </h1>
      </div>

      <form className="space-y-5" onSubmit={(e) => void onSubmit(e)}>
        {formError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 leading-relaxed">
            {formError}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label className={authLabelClass}>{t('auth.email')}</label>
          <input
            type="email"
            placeholder={t('auth.forgotPasswordPage.emailPlaceholder')}
            className={fieldClassName(authFieldClass, !!errors.email)}
            {...register('email')}
          />
          <FormFieldError message={errors.email?.message} />
        </div>

        <button
          type="submit"
          disabled={forgotPassword.isPending}
          className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white py-2.5 rounded-lg font-semibold transition-all cursor-pointer text-sm mt-2 disabled:opacity-60"
        >
          {forgotPassword.isPending
            ? t('auth.forgotPasswordPage.submitting')
            : t('auth.forgotPasswordPage.submit')}
        </button>
      </form>

      <p className="mt-8 text-sm text-center lg:text-left text-slate-500">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-violet-600 hover:text-violet-700 font-medium transition-colors"
        >
          <ArrowLeftIcon className="size-3.5" />
          {t('auth.forgotPasswordPage.backToLogin')}
        </Link>
      </p>
    </div>
  );
}
