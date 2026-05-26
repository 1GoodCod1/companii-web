import { useState } from 'react';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  cabinetLabelClass,
  cabinetFieldClass,
  cabinetSelectClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import {
  useCompanyMembersQuery,
  useCompanyInvitationsQuery,
  useCreateTeamInviteLinkMutation,
  useAddTeamMemberDirectMutation,
  useUpdateMemberRoleMutation,
  useDeactivateMemberMutation,
  useRevokeInvitationMutation,
  useTransferOwnershipMutation,
  buildTeamInviteUrl,
  type CompanyInvitationDto,
} from '@/features/companies/api/useCompanies';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
import { useAuthStore } from '@/stores/authStore';
import {
  getTeamInviteErrorMessage,
  isTeamMemberNotFoundError,
  isTeamPlanLimitError,
  isTeamWrongAccountKindError,
} from '@/features/companies/teamInviteErrors';
import { COMPANY_ROLE } from '@/constants/roles.constants';
import type { InvitableCompanyRole } from '@/types/roles';
import { TEAM_ROLE_CONFIG } from '@/constants/teamRoles.constants';
import type { TeamRoleKey } from '@/types/team';
import { groupMembersByRole, memberDisplayName } from '@/utils/teamMembers';
import { TeamRoleSection } from '@/features/companies/team/teamMemberViews';
import { formatDateTimeRo } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';

type InviteMode = 'link' | 'direct';

export function CompanyTeamPage() {
  const user = useAuthStore((s) => s.user);
  const { isOwner, canManageTeam, canInviteManagers, activeCompanyId } = useCompanyPermissions();
  const { data: members, isLoading, isError, error } = useCompanyMembersQuery({
    enabled: canManageTeam,
  });
  const { data: invitations } = useCompanyInvitationsQuery();
  const createInviteLink = useCreateTeamInviteLinkMutation();
  const addDirect = useAddTeamMemberDirectMutation();
  const updateRole = useUpdateMemberRoleMutation();
  const deactivateMember = useDeactivateMemberMutation();
  const revokeInvitation = useRevokeInvitationMutation();
  const transferOwnership = useTransferOwnershipMutation();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteMode, setInviteMode] = useState<InviteMode>('link');
  const [role, setRole] = useState<InvitableCompanyRole>(COMPANY_ROLE.MEMBER);
  const [restrictEmail, setRestrictEmail] = useState('');
  const [contact, setContact] = useState('');
  const [generatedLink, setGeneratedLink] = useState<{
    url: string;
    expiresAt: string;
  } | null>(null);
  const [directAddHint, setDirectAddHint] = useState<string | null>(null);
  const [transferTargetUserId, setTransferTargetUserId] = useState('');

  const resetInviteForm = () => {
    setRole(COMPANY_ROLE.MEMBER);
    setRestrictEmail('');
    setContact('');
    setGeneratedLink(null);
    setInviteMode('link');
    setDirectAddHint(null);
  };

  const closeInviteModal = () => {
    setShowInvite(false);
    resetInviteForm();
  };

  const handleGenerateLink = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const invite = await createInviteLink.mutateAsync({
        role,
        email: restrictEmail.trim() || undefined,
      });
      const url = invite.inviteUrl ?? buildTeamInviteUrl(invite.token);
      setGeneratedLink({ url, expiresAt: invite.expiresAt });
      try {
        await navigator.clipboard.writeText(url);
        if (invite.emailSent) {
          toast.success('Link generat, copiat și trimis pe email.');
        } else if (restrictEmail.trim()) {
          toast.success('Link generat și copiat. Emailul nu a putut fi trimis — verificați SMTP.');
        } else {
          toast.success('Link invitație generat și copiat.');
        }
      } catch {
        toast.success(
          invite.emailSent
            ? 'Link generat și trimis pe email. Copiază manual din câmp.'
            : 'Link invitație generat. Copiază manual din câmp.',
        );
      }
    } catch (err: unknown) {
      const message = getTeamInviteErrorMessage(err);
      toast.error(message);
      if (isTeamPlanLimitError(err)) {
        setDirectAddHint(message);
      }
    }
  };

  const switchToLinkInvite = (email?: string) => {
    if (email?.includes('@')) {
      setRestrictEmail(email.trim());
    }
    setDirectAddHint(null);
    setGeneratedLink(null);
    setInviteMode('link');
  };

  const handleAddDirect = async (event: React.FormEvent) => {
    event.preventDefault();
    setDirectAddHint(null);
    if (!contact.trim()) {
      toast.error('Introduceți emailul sau telefonul colegului.');
      return;
    }
    try {
      await addDirect.mutateAsync({ contact: contact.trim(), role });
      toast.success('Membrul a fost adăugat direct în echipă.');
      closeInviteModal();
    } catch (err: unknown) {
      const message = getTeamInviteErrorMessage(err);
      toast.error(message);
      if (isTeamMemberNotFoundError(err) || isTeamWrongAccountKindError(err) || isTeamPlanLimitError(err)) {
        setDirectAddHint(message);
      }
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiat.');
    } catch {
      toast.error('Nu s-a putut copia linkul.');
    }
  };

  const handleChangeRole = async (memberId: string, nextRole: InvitableCompanyRole) => {
    try {
      await updateRole.mutateAsync({ memberId, role: nextRole });
      toast.success('Rol actualizat.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut actualiza rolul.'));
    }
  };

  const handleDeactivate = async (memberId: string) => {
    if (!confirm('Eliminați acest membru din echipă?')) return;
    try {
      await deactivateMember.mutateAsync(memberId);
      toast.success('Membrul a fost eliminat din echipă.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut elimina membrul.'));
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await revokeInvitation.mutateAsync(invitationId);
      toast.success('Invitația a fost revocată.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut revoca invitația.'));
    }
  };

  const handleTransferOwnership = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeCompanyId || !transferTargetUserId) return;
    if (!confirm('Transferați proprietatea companiei către acest membru?')) return;
    try {
      await transferOwnership.mutateAsync({
        companyId: activeCompanyId,
        newOwnerUserId: transferTargetUserId,
      });
      toast.success('Proprietatea companiei a fost transferată.');
      setTransferTargetUserId('');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut transfera proprietatea.'));
    }
  };

  const roleGroups = members ? groupMembersByRole(members) : [];
  const transferableMembers =
    members?.filter((member) => member.role !== COMPANY_ROLE.OWNER && member.userId !== user?.sub) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        title="Echipă"
        description="Structura echipei: proprietar, manageri și tehnicieni — fiecare rol cu responsabilități clare."
        action={
          <button type="button" onClick={() => setShowInvite(true)} className={cabinetBtnPrimary}>
            + Invită membru
          </button>
        }
      />

      <Panel>
        <PanelHeader
          title="Ierarhia echipei"
          meta={
            <span className="text-xs text-gray-400 font-medium">
              {members?.length ?? 0} persoane active
            </span>
          }
        />

        {isLoading ? (
          <p className="text-sm text-gray-400">Se încarcă echipa...</p>
        ) : isError ? (
          <EmptyState
            message={
              error instanceof Error
                ? error.message
                : 'Nu s-a putut încărca lista echipei. Reîncercați.'
            }
          />
        ) : !members?.length ? (
          <EmptyState message="Nu există membri în echipă." />
        ) : (
          <div className="space-y-8">
            {roleGroups.map((group) => (
              <TeamRoleSection
                key={group.role}
                role={group.role}
                items={group.items}
                currentUserId={user?.sub}
                canManage={canManageTeam}
                canInviteManagers={canInviteManagers}
                onChangeRole={handleChangeRole}
                onDeactivate={handleDeactivate}
              />
            ))}
          </div>
        )}
      </Panel>

      {(invitations?.length ?? 0) > 0 && (
        <Panel>
          <PanelHeader title="Linkuri invitație active" />
          <ul className="divide-y divide-gray-100/80">
            {invitations?.map((invite: CompanyInvitationDto) => {
              const url = buildTeamInviteUrl(invite.token);
              return (
                <li
                  key={invite.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">
                      {TEAM_ROLE_CONFIG[invite.role as TeamRoleKey]?.label ?? invite.role}
                      {invite.invitedEmail ? ` · ${invite.invitedEmail}` : ' · link deschis'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Expiră {formatDateTimeRo(invite.expiresAt)}
                    </p>
                    <p className="text-[11px] text-gray-400 font-mono truncate mt-1">{url}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(url)}
                    className={cabinetBtnSecondary}
                  >
                    Copiază link
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRevokeInvitation(invite.id)}
                    className={cabinetBtnSecondary}
                  >
                    Revocă
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      <AppModal
        open={showInvite}
        onClose={closeInviteModal}
        title="Invită membru în echipă"
        size="lg"
        backgroundIndex={0}
      >
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => {
              setInviteMode('link');
              setDirectAddHint(null);
              setGeneratedLink(null);
            }}
            className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
              inviteMode === 'link'
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Link invitație
          </button>
          <button
            type="button"
            onClick={() => {
              setInviteMode('direct');
              setDirectAddHint(null);
            }}
            className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
              inviteMode === 'direct'
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Adaugă direct
          </button>
        </div>

        {inviteMode === 'link' ? (
          <form onSubmit={handleGenerateLink} className="space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">
              Generează un link valabil 2 ore. Trimite-l colegului pe WhatsApp, Telegram sau SMS.
              Linkurile vechi devin invalide la regenerare.
            </p>
            <div>
              <label className={cabinetLabelClass}>Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as InvitableCompanyRole)}
                className={cabinetSelectClass}
              >
                <option value={COMPANY_ROLE.MEMBER}>Tehnician (lucrător)</option>
                {canInviteManagers ? <option value={COMPANY_ROLE.MANAGER}>Manager</option> : null}
              </select>
            </div>
            <div>
              <label className={cabinetLabelClass}>Email coleg (opțional)</label>
              <input
                type="email"
                value={restrictEmail}
                onChange={(e) => setRestrictEmail(e.target.value)}
                placeholder="ex: tehnician@companie.md — trimite invitația pe email"
                className={cabinetFieldClass}
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Dacă completați emailul, invitația se trimite automat (Mailtrap în dev).
              </p>
            </div>
            {generatedLink ? (
              <div className="space-y-2">
                <label className={cabinetLabelClass}>Link invitație</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink.url}
                    className={`${cabinetFieldClass} text-xs font-mono`}
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLink(generatedLink.url)}
                    className={`${cabinetBtnSecondary} shrink-0 px-3`}
                  >
                    Copiază
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  Expiră la:{' '}
                  {formatDateTimeRo(generatedLink.expiresAt, 'datetimeShort')}
                </p>
              </div>
            ) : null}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeInviteModal} className={cabinetBtnSecondary}>
                Închide
              </button>
              <button type="submit" disabled={createInviteLink.isPending} className={cabinetBtnPrimary}>
                {createInviteLink.isPending
                  ? 'Se generează...'
                  : generatedLink
                    ? 'Regenerează link'
                    : 'Generează link'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAddDirect} className="space-y-4">
            <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 leading-relaxed">
              <strong>Adaugă direct</strong> funcționează doar dacă colegul s-a înregistrat deja cu tipul{' '}
              <strong>Companie</strong> (nu Client). Pentru persoane noi — folosiți{' '}
              <strong>Link invitație</strong>.
            </div>
            <div>
              <label className={cabinetLabelClass}>Email sau telefon *</label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  setDirectAddHint(null);
                }}
                placeholder="ex: ion@companie.md sau +37369123456"
                className={cabinetFieldClass}
              />
            </div>
            {directAddHint ? (
              <div className="rounded-xl border border-violet-100 bg-violet-50/80 px-4 py-3 space-y-3">
                <p className="text-sm text-violet-900">{directAddHint}</p>
                {contact.includes('@') ? (
                  <button
                    type="button"
                    onClick={() => switchToLinkInvite(contact)}
                    className={cabinetBtnPrimary}
                  >
                    Generează link invitație pentru acest email
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => switchToLinkInvite()}
                    className={cabinetBtnPrimary}
                  >
                    Mergi la Link invitație
                  </button>
                )}
              </div>
            ) : null}
            <div>
              <label className={cabinetLabelClass}>Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as InvitableCompanyRole)}
                className={cabinetSelectClass}
              >
                <option value={COMPANY_ROLE.MEMBER}>Tehnician (lucrător)</option>
                {canInviteManagers ? <option value={COMPANY_ROLE.MANAGER}>Manager</option> : null}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeInviteModal} className={cabinetBtnSecondary}>
                Anulează
              </button>
              <button type="submit" disabled={addDirect.isPending} className={cabinetBtnPrimary}>
                {addDirect.isPending ? 'Se adaugă...' : 'Adaugă în echipă'}
              </button>
            </div>
          </form>
        )}
      </AppModal>

      {isOwner && transferableMembers.length > 0 ? (
        <Panel>
          <PanelHeader title="Transfer proprietate" />
          <form onSubmit={handleTransferOwnership} className="space-y-4">
            <p className="text-sm text-gray-500">
              Transferați rolul de proprietar legal către un alt membru activ. Veți deveni manager.
            </p>
            <div>
              <label className={cabinetLabelClass}>Noul proprietar</label>
              <select
                value={transferTargetUserId}
                onChange={(e) => setTransferTargetUserId(e.target.value)}
                className={cabinetSelectClass}
                required
              >
                <option value="">Selectați membru...</option>
                {transferableMembers.map((member) => (
                  <option key={member.id} value={member.userId}>
                    {memberDisplayName(member)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={transferOwnership.isPending}
                className={cabinetBtnPrimary}
              >
                {transferOwnership.isPending ? 'Se transferă...' : 'Transferă proprietatea'}
              </button>
            </div>
          </form>
        </Panel>
      ) : null}
    </div>
  );
}
