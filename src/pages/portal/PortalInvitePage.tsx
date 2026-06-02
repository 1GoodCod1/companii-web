import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  useAcceptPortalInvitationMutation,
  usePortalInvitePreviewQuery,
} from '@/features/portal';
import { useAuthStore } from '@/entities/user/model/authStore';
import { getErrorMessage } from '@/shared/utils/errors';

export function PortalInvitePage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const nav = useNavigate();
  const { user, accessToken } = useAuthStore();
  const acceptInvite = useAcceptPortalInvitationMutation();
  const { data, isLoading, isError } = usePortalInvitePreviewQuery(token);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (user && accessToken && user.accountKind !== 'END_CLIENT') {
      nav('/company', { replace: true });
    }
  }, [user, accessToken, nav]);

  const handleAccept = async () => {
    if (!token) return;
    try {
      await acceptInvite.mutateAsync(token);
      setAccepted(true);
      toast.success(t('portal.invitePage.toastLinked'));
      nav('/portal', { replace: true });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('portal.invitePage.toastAcceptFailed')));
    }
  };

  if (!token) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center text-sm text-red-500">
        {t('portal.invitePage.invalidLink')}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center text-gray-400">
        {t('portal.invitePage.checking')}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center space-y-3">
        <p className="text-red-500 font-semibold">{t('portal.invitePage.invalidExpired')}</p>
        <Link to="/contacts" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
          {t('portal.invitePage.contactSupport')}
        </Link>
      </div>
    );
  }

  const registerHref = `/register?invite=${encodeURIComponent(token)}&kind=END_CLIENT`;

  return (
    <div className="max-w-lg mx-auto py-20 px-4 animate-fade-in">
      <div className="border border-gray-100 p-8 rounded-3xl glass-panel space-y-5">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700 bg-violet-50 px-3 py-1.5 rounded-full border border-violet-100">
          {t('portal.invitePage.eyebrow')}
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {t('portal.invitePage.title', { company: data.companyName })}
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            {t('portal.invitePage.customerProfile')}{' '}
            <strong className="text-gray-800">{data.customerName}</strong>
          </p>
          <p className="text-xs text-gray-400">{t('portal.invitePage.afterLink')}</p>
        </div>

        {data.alreadyLinked ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            {t('portal.invitePage.alreadyLinked')}
          </p>
        ) : user && accessToken ? (
          <button
            type="button"
            onClick={handleAccept}
            disabled={acceptInvite.isPending || accepted}
            className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors disabled:opacity-60"
          >
            {acceptInvite.isPending ? t('portal.invitePage.linking') : t('portal.invitePage.accept')}
          </button>
        ) : (
          <div className="space-y-3">
            <Link
              to={registerHref}
              className="block w-full text-center rounded-xl bg-gray-900 hover:bg-gray-800 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors"
            >
              {t('portal.invitePage.createAndAccept')}
            </Link>
            <Link
              to={`/login?invite=${encodeURIComponent(token)}`}
              className="block w-full text-center rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              {t('portal.invitePage.haveAccountLogin')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
