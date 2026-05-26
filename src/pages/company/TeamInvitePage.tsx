import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  useAcceptTeamInvitationMutation,
  useTeamInvitePreviewQuery,
} from '@/features/companies/api/useCompanies';
import { useAuthStore } from '@/stores/authStore';

import { TEAM_INVITE_ROLE_LABELS } from '@/constants/team.constants';
import { getErrorMessage } from '@/utils/errors';

export function TeamInvitePage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const nav = useNavigate();
  const { user, accessToken } = useAuthStore();
  const acceptInvite = useAcceptTeamInvitationMutation();
  const { data, isLoading, isError } = useTeamInvitePreviewQuery(token);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (user && accessToken && user.accountKind === 'END_CLIENT') {
      nav('/portal', { replace: true });
    }
  }, [user, accessToken, nav]);

  const handleAccept = async () => {
    if (!token) return;
    try {
      await acceptInvite.mutateAsync(token);
      setAccepted(true);
      toast.success('Ai intrat în echipă!');
      nav('/company/team', { replace: true });
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

  const registerHref = `/register?teamInvite=${encodeURIComponent(token)}&kind=COMPANY_STAFF`;
  const roleLabel = TEAM_INVITE_ROLE_LABELS[data.role] ?? data.role;

  return (
    <div className="max-w-lg mx-auto py-20 px-4 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-8 rounded-3xl shadow-premium space-y-5">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700 bg-violet-50 px-3 py-1.5 rounded-full border border-violet-100">
          Invitație echipă
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {data.companyName} te invită în echipă
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Rol propus: <strong className="text-gray-800">{roleLabel}</strong>
          </p>
          {data.invitedEmail ? (
            <p className="text-xs text-gray-400">
              Invitația este pentru <strong>{data.invitedEmail}</strong>
            </p>
          ) : null}
        </div>

        {data.alreadyMember ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            Ești deja membru al acestei echipe.
          </p>
        ) : user && accessToken ? (
          <button
            type="button"
            onClick={handleAccept}
            disabled={acceptInvite.isPending || accepted}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {acceptInvite.isPending ? 'Se procesează...' : 'Accept invitația'}
          </button>
        ) : (
          <div className="space-y-3">
            <Link
              to={registerHref}
              className="block w-full text-center rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-700"
            >
              Creează cont companie și acceptă
            </Link>
            <Link
              to={`/login?teamInvite=${encodeURIComponent(token)}`}
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
