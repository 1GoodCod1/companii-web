import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  useAcceptPortalInvitationMutation,
  usePortalInvitePreviewQuery,
} from '@/features/portal/api/usePortal';
import { useAuthStore } from '@/stores/authStore';
import { getErrorMessage } from '@/utils/errors';

export function PortalInvitePage() {
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
      toast.success('Contul tău a fost legat de profilul client.');
      nav('/portal', { replace: true });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut accepta invitația.'));
    }
  };

  if (!token) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center text-sm text-red-500">
        Link de invitație invalid.
      </div>
    );
  }

  if (isLoading) {
    return <div className="max-w-lg mx-auto py-20 px-4 text-center text-gray-400">Se verifică invitația...</div>;
  }

  if (isError || !data) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center space-y-3">
        <p className="text-red-500 font-semibold">Invitația nu este validă sau a expirat.</p>
        <Link to="/contacts" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
          Contactează suportul
        </Link>
      </div>
    );
  }

  const registerHref = `/register?invite=${encodeURIComponent(token)}&kind=END_CLIENT`;

  return (
    <div className="max-w-lg mx-auto py-20 px-4 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-8 rounded-3xl shadow-premium space-y-5">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700 bg-violet-50 px-3 py-1.5 rounded-full border border-violet-100">
          Invitație portal client
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {data.companyName} te invită în portal
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Profil client: <strong className="text-gray-800">{data.customerName}</strong>
          </p>
          <p className="text-xs text-gray-400">
            După legare vei vedea lucrările, ofertele și facturile tale.
          </p>
        </div>

        {data.alreadyLinked ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            Acest profil client este deja legat unui cont.
          </p>
        ) : user && accessToken ? (
          <button
            type="button"
            onClick={handleAccept}
            disabled={acceptInvite.isPending || accepted}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {acceptInvite.isPending ? 'Se leagă contul...' : 'Accept invitația'}
          </button>
        ) : (
          <div className="space-y-3">
            <Link
              to={registerHref}
              className="block w-full text-center rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-700"
            >
              Creează cont și acceptă
            </Link>
            <Link
              to={`/login?invite=${encodeURIComponent(token)}`}
              className="block w-full text-center rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Am deja cont — autentifică-mă
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
