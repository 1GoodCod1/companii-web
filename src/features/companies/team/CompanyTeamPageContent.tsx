import { useMemo, useState, useReducer } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  PageHero,
  cabinetBtnPrimary,
} from '@/widgets/cabinet/cabinet-ui';
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
} from '@/features/companies/api/useCompanies';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { useAuthStore } from '@/entities/user/model/authStore';
import {
  getTeamInviteErrorMessage,
  isTeamMemberNotFoundError,
  isTeamPlanLimitError,
  isTeamWrongAccountKindError,
} from '@/features/companies/teamInviteErrors';
import { COMPANY_ROLE } from '@/entities/company/model/roles.constants';
import type { InvitableCompanyRole } from '@/entities/company/model/roles.types';
import { groupMembersByRole, memberDisplayName } from '@/entities/company/model/teamMembers';
import { getErrorMessage } from '@/shared/utils/errors';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';
import { useLocale } from '@/shared/hooks/useLocale';
import {
  initialInviteState,
  inviteReducer,
} from './inviteState';
import { TeamInviteModal } from './TeamInviteModal';
import { TeamHierarchyPanel } from './TeamHierarchyPanel';
import { TeamInvitationsPanel } from './TeamInvitationsPanel';
import { TransferOwnershipPanel } from './TransferOwnershipPanel';

export function CompanyTeamPage() {
  const { t } = useTranslation();
  const locale = useLocale();
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
  const { ask, dialog } = useCabinetConfirmDialog();

  const [inviteState, inviteDispatch] = useReducer(inviteReducer, initialInviteState);
  const [transferTargetUserId, setTransferTargetUserId] = useState('');

  const roleGroups = members ? groupMembersByRole(members) : [];
  const transferableMembers = useMemo(
    () =>
      members?.filter((member) => member.role !== COMPANY_ROLE.OWNER && member.userId !== user?.sub) ?? [],
    [members, user?.sub],
  );

  const inviteRoleOptions = useMemo(() => {
    const options: Array<{ value: InvitableCompanyRole; label: string }> = [
      { value: COMPANY_ROLE.MEMBER, label: t('company.teamPage.roleMember') },
    ];
    if (canInviteManagers) {
      options.push({ value: COMPANY_ROLE.MANAGER, label: t('company.teamPage.roleManager') });
    }
    return options;
  }, [canInviteManagers, t]);

  const transferMemberOptions = useMemo(
    () => [
      { value: '', label: t('company.teamPage.selectMember') },
      ...transferableMembers.map((member) => ({
        value: member.userId,
        label: memberDisplayName(member),
      })),
    ],
    [transferableMembers, t],
  );

  const closeInviteModal = () => inviteDispatch({ type: 'CLOSE_INVITE' });

  const handleGenerateLink = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const invite = await createInviteLink.mutateAsync({
        role: inviteState.role,
        email: inviteState.restrictEmail.trim() || undefined,
      });
      const url = invite.inviteUrl ?? buildTeamInviteUrl(invite.token);
      inviteDispatch({ type: 'SET_GENERATED_LINK', payload: { url, expiresAt: invite.expiresAt } });
      try {
        await navigator.clipboard.writeText(url);
        if (invite.emailSent) {
          toast.success(t('company.teamPage.toastLinkCopiedSent'));
        } else if (inviteState.restrictEmail.trim()) {
          toast.success(t('company.teamPage.toastLinkCopiedEmailFailed'));
        } else {
          toast.success(t('company.teamPage.toastLinkCopied'));
        }
      } catch {
        toast.success(
          invite.emailSent
            ? t('company.teamPage.toastLinkSentCopyManual')
            : t('company.teamPage.toastLinkGeneratedCopyManual'),
        );
      }
    } catch (err: unknown) {
      const message = getTeamInviteErrorMessage(err, t);
      toast.error(message);
      if (isTeamPlanLimitError(err)) {
        inviteDispatch({ type: 'SET_DIRECT_ADD_HINT', payload: message });
      }
    }
  };

  const handleAddDirect = async (event: React.FormEvent) => {
    event.preventDefault();
    inviteDispatch({ type: 'SET_DIRECT_ADD_HINT', payload: null });
    if (!inviteState.contact.trim()) {
      toast.error(t('company.teamPage.toastContactRequired'));
      return;
    }
    try {
      await addDirect.mutateAsync({ contact: inviteState.contact.trim(), role: inviteState.role });
      toast.success(t('company.teamPage.toastMemberAdded'));
      closeInviteModal();
    } catch (err: unknown) {
      const message = getTeamInviteErrorMessage(err, t);
      toast.error(message);
      if (isTeamMemberNotFoundError(err) || isTeamWrongAccountKindError(err) || isTeamPlanLimitError(err)) {
        inviteDispatch({ type: 'SET_DIRECT_ADD_HINT', payload: message });
      }
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('company.teamPage.toastLinkCopiedShort'));
    } catch {
      toast.error(t('company.teamPage.toastCopyFailed'));
    }
  };

  const handleChangeRole = async (memberId: string, nextRole: InvitableCompanyRole) => {
    try {
      await updateRole.mutateAsync({ memberId, role: nextRole });
      toast.success(t('company.teamPage.toastRoleUpdated'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.teamPage.toastRoleUpdateFailed')));
    }
  };

  const handleDeactivate = (memberId: string) => {
    ask({
      title: t('cabinet.common.delete'),
      message: (
        <p className="text-sm text-gray-600 leading-relaxed">
          {t('company.teamPage.confirmRemoveMember')}
        </p>
      ),
      onConfirm: async () => {
        try {
          await deactivateMember.mutateAsync(memberId);
          toast.success(t('company.teamPage.toastMemberRemoved'));
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, t('company.teamPage.toastMemberRemoveFailed')));
        }
      },
    });
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await revokeInvitation.mutateAsync(invitationId);
      toast.success(t('company.teamPage.toastInvitationRevoked'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.teamPage.toastInvitationRevokeFailed')));
    }
  };

  const handleTransferOwnership = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeCompanyId || !transferTargetUserId) return;
    ask({
      title: t('cabinet.common.confirmAction'),
      confirmLabel: t('cabinet.common.confirmAction'),
      variant: 'primary',
      message: (
        <p className="text-sm text-gray-600 leading-relaxed">
          {t('company.teamPage.confirmTransferOwnership')}
        </p>
      ),
      onConfirm: async () => {
        try {
          await transferOwnership.mutateAsync({
            newOwnerUserId: transferTargetUserId,
          });
          toast.success(t('company.teamPage.toastOwnershipTransferred'));
          setTransferTargetUserId('');
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, t('company.teamPage.toastOwnershipTransferFailed')));
        }
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        title={t('company.teamPage.title')}
        description={t('company.teamPage.description')}
        action={
          <button type="button" onClick={() => inviteDispatch({ type: 'OPEN_INVITE' })} className={cabinetBtnPrimary}>
            {t('company.teamPage.inviteBtn')}
          </button>
        }
      />

      <TeamHierarchyPanel
        members={members}
        roleGroups={roleGroups}
        currentUserId={user?.sub}
        status={{ isLoading, isError, error }}
        permissions={{ canManageTeam, canInviteManagers }}
        onChangeRole={handleChangeRole}
        onDeactivate={handleDeactivate}
      />

      <TeamInvitationsPanel
        invitations={invitations ?? []}
        locale={locale}
        onCopyLink={handleCopyLink}
        onRevokeInvitation={handleRevokeInvitation}
      />

      <TeamInviteModal
        inviteState={inviteState}
        inviteRoleOptions={inviteRoleOptions}
        locale={locale}
        createInvitePending={createInviteLink.isPending}
        addDirectPending={addDirect.isPending}
        onClose={closeInviteModal}
        onDispatch={inviteDispatch}
        onGenerateLink={handleGenerateLink}
        onAddDirect={handleAddDirect}
        onCopyLink={handleCopyLink}
        onSwitchToLinkInvite={(email) => inviteDispatch({ type: 'SWITCH_TO_LINK_INVITE', payload: email })}
      />

      <TransferOwnershipPanel
        isOwner={isOwner}
        transferableMembers={transferableMembers}
        transferTargetUserId={transferTargetUserId}
        transferMemberOptions={transferMemberOptions}
        transferPending={transferOwnership.isPending}
        onTransferTargetUserIdChange={setTransferTargetUserId}
        onSubmit={handleTransferOwnership}
      />
      {dialog}
    </div>
  );
}