import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { EnvelopeSimpleIcon } from '@phosphor-icons/react';
import {
  useMeQuery,
  useResendVerificationMutation,
  getAuthErrorMessage,
} from '@/features/auth';
import { useAuthStore } from '@/entities/user/model/authStore';

/**
 * Soft (non-blocking) reminder shown in the END_CLIENT cabinet until the user
 * confirms their email. Offers a "resend link" action.
 */
export function EmailVerificationBanner() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: me } = useMeQuery(!!user);
  const resend = useResendVerificationMutation();
  const [sent, setSent] = useState(false);

  // Only END_CLIENT, and only once we know the email is not yet verified.
  if (!me || me.emailVerified !== false) return null;

  const onResend = async () => {
    try {
      const res = await resend.mutateAsync();
      setSent(true);
      toast.success(res.message ?? t('portal.emailBanner.resent'));
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    }
  };

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <EnvelopeSimpleIcon className="size-5" />
        </span>
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-amber-900">
            {t('portal.emailBanner.title')}
          </p>
          <p className="text-xs font-medium text-amber-700/90 leading-relaxed">
            {t('portal.emailBanner.desc', { email: me.email })}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void onResend()}
        disabled={resend.isPending || sent}
        className="shrink-0 rounded-xl bg-amber-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-amber-700 active:scale-98 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {resend.isPending
          ? t('portal.emailBanner.sending')
          : sent
            ? t('portal.emailBanner.sentLabel')
            : t('portal.emailBanner.resend')}
      </button>
    </div>
  );
}
