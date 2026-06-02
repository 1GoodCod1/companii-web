import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AppModal } from '@/shared/ui/AppModal';
import {
  AppSelect,
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  cabinetLabelClass,
  cabinetFieldClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
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
  type CompanyInvitationDto,
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
import type { TeamRoleKey } from '@/entities/company/model/team.types';
import { groupMembersByRole, memberDisplayName } from '@/entities/company/model/teamMembers';
import { TeamRoleSection } from '@/features/companies/team/teamMemberViews';
import { formatDateTimeLocalized } from '@/shared/utils/date';
import { getCompanyRoleLabel } from '@/entities/company/model/companyRoleLabel';
import { getErrorMessage } from '@/shared/utils/errors';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';
import { useLocale } from '@/shared/hooks/useLocale';

type InviteMode = 'link' | 'direct';

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
          toast.success(t('company.teamPage.toastLinkCopiedSent'));
        } else if (restrictEmail.trim()) {
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
      toast.error(t('company.teamPage.toastContactRequired'));
      return;
    }
    try {
      await addDirect.mutateAsync({ contact: contact.trim(), role });
      toast.success(t('company.teamPage.toastMemberAdded'));
      closeInviteModal();
    } catch (err: unknown) {
      const message = getTeamInviteErrorMessage(err, t);
      toast.error(message);
      if (isTeamMemberNotFoundError(err) || isTeamWrongAccountKindError(err) || isTeamPlanLimitError(err)) {
        setDirectAddHint(message);
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
            companyId: activeCompanyId,
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

  const roleGroups = members ? groupMembersByRole(members) : [];
  const transferableMembers = useMemo(
    () =>
      members?.filter((member) => member.role !== COMPANY_ROLE.OWNER && member.userId !== user?.sub) ??
      [],
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

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        title={t('company.teamPage.title')}
        description={t('company.teamPage.description')}
        action={
          <button type="button" onClick={() => setShowInvite(true)} className={cabinetBtnPrimary}>
            {t('company.teamPage.inviteBtn')}
          </button>
        }
      />

      <Panel>
        <PanelHeader
          title={t('company.teamPage.hierarchyTitle')}
          meta={
            <span className="text-xs text-gray-400 font-medium">
              {t('company.teamPage.activeCount', { count: members?.length ?? 0 })}
            </span>
          }
        />

        {isLoading ? (
          <p className="text-sm text-gray-400">{t('company.teamPage.loading')}</p>
        ) : isError ? (
          <EmptyState
            message={
              error instanceof Error
                ? error.message
                : t('company.teamPage.loadError')
            }
          />
        ) : !members?.length ? (
          <EmptyState message={t('company.teamPage.emptyMembers')} />
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
          <PanelHeader title={t('company.teamPage.invitationsTitle')} />
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
                      {getCompanyRoleLabel(t, invite.role as TeamRoleKey)}
                      {invite.invitedEmail
                        ? ` · ${invite.invitedEmail}`
                        : ` · ${t('company.teamPage.openLink')}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('company.teamPage.expiresAt', {
                        date: formatDateTimeLocalized(invite.expiresAt, locale),
                      })}
                    </p>
                    <p className="text-[11px] text-gray-400 font-mono truncate mt-1">{url}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(url)}
                    className={cabinetBtnSecondary}
                  >
                    {t('company.teamPage.copyLink')}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRevokeInvitation(invite.id)}
                    className={cabinetBtnSecondary}
                  >
                    {t('company.teamPage.revoke')}
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
        title={t('company.teamPage.inviteModalTitle')}
        size="lg"
      >
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => {
              setInviteMode('link');
              setDirectAddHint(null);
              setGeneratedLink(null);
            }}
            className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider border transition-colors ${inviteMode === 'link'
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
          >
            {t('company.teamPage.inviteModeLink')}
          </button>
          <button
            type="button"
            onClick={() => {
              setInviteMode('direct');
              setDirectAddHint(null);
            }}
            className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider border transition-colors ${inviteMode === 'direct'
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
          >
            {t('company.teamPage.inviteModeDirect')}
          </button>
        </div>

        {inviteMode === 'link' ? (
          <form onSubmit={handleGenerateLink} className="space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">
              {t('company.teamPage.linkInviteDescription')}
            </p>
            <div>
              <label className={cabinetLabelClass}>{t('company.teamPage.roleLabel')}</label>
              <AppSelect
                value={role}
                onChange={(value) => setRole(value as InvitableCompanyRole)}
                options={inviteRoleOptions}
                aria-label={t('company.teamPage.roleLabel')}
              />
            </div>
            <div>
              <label className={cabinetLabelClass}>{t('company.teamPage.colleagueEmailLabel')}</label>
              <input
                type="email"
                value={restrictEmail}
                onChange={(e) => setRestrictEmail(e.target.value)}
                placeholder={t('company.teamPage.colleagueEmailPlaceholder')}
                className={cabinetFieldClass}
              />
              <p className="text-[11px] text-gray-400 mt-1">
                {t('company.teamPage.colleagueEmailHint')}
              </p>
            </div>
            {generatedLink ? (
              <div className="space-y-2">
                <label className={cabinetLabelClass}>{t('company.teamPage.inviteLinkLabel')}</label>
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
                    {t('company.teamPage.copy')}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  {t('company.teamPage.expiresAtLabel')}{' '}
                  {formatDateTimeLocalized(generatedLink.expiresAt, locale, 'datetimeShort')}
                </p>
              </div>
            ) : null}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeInviteModal} className={cabinetBtnSecondary}>
                {t('company.teamPage.close')}
              </button>
              <button type="submit" disabled={createInviteLink.isPending} className={cabinetBtnPrimary}>
                {createInviteLink.isPending
                  ? t('company.teamPage.generating')
                  : generatedLink
                    ? t('company.teamPage.regenerateLink')
                    : t('company.teamPage.generateLink')}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAddDirect} className="space-y-4">
            <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 leading-relaxed">
              {t('company.teamPage.directAddNotice')}
            </div>
            <div>
              <label className={cabinetLabelClass}>{t('company.teamPage.contactLabel')}</label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  setDirectAddHint(null);
                }}
                placeholder={t('company.teamPage.contactPlaceholder')}
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
                    {t('company.teamPage.generateLinkForEmail')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => switchToLinkInvite()}
                    className={cabinetBtnPrimary}
                  >
                    {t('company.teamPage.goToLinkInvite')}
                  </button>
                )}
              </div>
            ) : null}
            <div>
              <label className={cabinetLabelClass}>{t('company.teamPage.roleLabel')}</label>
              <AppSelect
                value={role}
                onChange={(value) => setRole(value as InvitableCompanyRole)}
                options={inviteRoleOptions}
                aria-label={t('company.teamPage.roleLabel')}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeInviteModal} className={cabinetBtnSecondary}>
                {t('company.teamPage.cancel')}
              </button>
              <button type="submit" disabled={addDirect.isPending} className={cabinetBtnPrimary}>
                {addDirect.isPending ? t('company.teamPage.adding') : t('company.teamPage.addToTeam')}
              </button>
            </div>
          </form>
        )}
      </AppModal>

      {isOwner && transferableMembers.length > 0 ? (
        <Panel>
          <PanelHeader title={t('company.teamPage.transferTitle')} />
          <form onSubmit={handleTransferOwnership} className="space-y-4">
            <p className="text-sm text-gray-500">{t('company.teamPage.transferDescription')}</p>
            <div>
              <label className={cabinetLabelClass}>{t('company.teamPage.newOwnerLabel')}</label>
              <AppSelect
                value={transferTargetUserId}
                onChange={setTransferTargetUserId}
                options={transferMemberOptions}
                aria-label={t('company.teamPage.newOwnerLabel')}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={transferOwnership.isPending}
                className={cabinetBtnPrimary}
              >
                {transferOwnership.isPending
                  ? t('company.teamPage.transferring')
                  : t('company.teamPage.transferBtn')}
              </button>
            </div>
          </form>
        </Panel>
      ) : null}
      {dialog}
    </div>
  );
}
