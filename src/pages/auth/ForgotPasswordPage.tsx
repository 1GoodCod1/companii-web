import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation } from '@/features/auth/api/useAuth';
import { getAuthErrorMessage } from '@/features/auth/authErrors';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const forgotPassword = useForgotPasswordMutation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      await forgotPassword.mutateAsync({ email: email.trim() });
      setSubmitted(true);
      toast.success(t('auth.forgotPasswordPage.toastSent'));
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <div className="w-full animate-fade-in py-2 relative z-10">
      {submitted ? (
        <div className="space-y-6 text-center lg:text-left py-4 animate-fade-in">
          <div className="mx-auto lg:mx-0 p-4 bg-emerald-50 text-emerald-600 rounded-3xl w-16 h-16 flex items-center justify-center shadow-xs border border-emerald-500/10">
            <CheckCircle2 className="w-8 h-8 animate-bounce-slow" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
              {t('auth.forgotPasswordPage.successTitle')}
            </h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              {t('auth.forgotPasswordPage.successBody', { email })}
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full border border-slate-200 hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('auth.forgotPasswordPage.backToLogin')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {t('auth.forgotPasswordPage.title')}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {t('auth.forgotPasswordPage.subtitle')}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 leading-relaxed">
                {formError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                {t('auth.forgotPasswordPage.emailLabel')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder={t('auth.forgotPasswordPage.emailPlaceholder')}
                  className="w-full border border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-slate-855 font-medium placeholder-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={forgotPassword.isPending}
              className="w-full bg-gray-900 hover:bg-gray-800 active:scale-[0.99] text-white py-3.5 rounded-xl font-black transition-all cursor-pointer text-xs uppercase tracking-wider mt-2 flex items-center justify-center gap-1.5"
            >
              {forgotPassword.isPending
                ? t('auth.forgotPasswordPage.submitting')
                : t('auth.forgotPasswordPage.submit')}
            </button>
          </form>

          <div className="border-t border-slate-100 pt-6 text-center lg:text-left">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-750 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('auth.forgotPasswordPage.backToLogin')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
