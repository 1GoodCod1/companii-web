import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  ShieldWarningIcon,
  SpinnerIcon,
} from '@phosphor-icons/react';
import { useVerifyEmailMutation, getAuthErrorMessage } from '@/features/auth';

type Status = 'verifying' | 'success' | 'error';

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const verifyEmail = useVerifyEmailMutation();

  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'error');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!token || startedRef.current) return;
    startedRef.current = true;
    verifyEmail
      .mutateAsync({ token })
      .then(() => setStatus('success'))
      .catch((err) => {
        setErrorMessage(getAuthErrorMessage(err));
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (status === 'verifying') {
    return (
      <div className="w-full animate-fade-in py-2 relative z-10">
        <div className="space-y-6 text-center lg:text-left py-4">
          <div className="mx-auto lg:mx-0 p-4 bg-slate-50 text-slate-500 rounded-3xl size-16 flex items-center justify-center shadow-xs border border-slate-200">
            <SpinnerIcon className="size-8 animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
            {t('auth.verifyEmailPage.verifyingTitle')}
          </h2>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="w-full animate-fade-in py-2 relative z-10">
        <div className="space-y-6 text-center lg:text-left py-4">
          <div className="mx-auto lg:mx-0 p-4 bg-emerald-50 text-emerald-600 rounded-3xl size-16 flex items-center justify-center shadow-xs border border-emerald-500/10">
            <CheckCircleIcon className="size-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
              {t('auth.verifyEmailPage.successTitle')}
            </h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              {t('auth.verifyEmailPage.successDesc')}
            </p>
          </div>
          <Link
            to="/portal"
            className="inline-flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-98"
          >
            {t('auth.verifyEmailPage.goToCabinet')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in py-2 relative z-10">
      <div className="space-y-6 text-center lg:text-left py-4">
        <div className="mx-auto lg:mx-0 p-4 bg-rose-50 text-rose-600 rounded-3xl size-16 flex items-center justify-center shadow-xs border border-rose-500/10">
          <ShieldWarningIcon className="size-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
            {t('auth.verifyEmailPage.errorTitle')}
          </h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            {errorMessage ?? t('auth.verifyEmailPage.errorDesc')}
          </p>
        </div>
        <Link
          to="/portal"
          className="inline-flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-98"
        >
          {t('auth.verifyEmailPage.goToCabinet')}
        </Link>
      </div>
    </div>
  );
}
