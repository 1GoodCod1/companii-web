import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingStatus } from '@/shared/ui/LoadingStatus';
import {
  Panel,
  PanelHeader,
  EmptyState,
  SkeletonList,
} from '@/widgets/cabinet/cabinet-ui';
import type { InvitableCompanyRole } from '@/entities/company/model/roles.types';
import type { TeamRoleKey } from '@/entities/company/model/team.types';
import type { CompanyMemberDto } from '@/entities/fsm/model/types';
import { TeamRoleSection } from '@/features/companies/team/teamMemberViews';

export function TeamHierarchyPanel({
  members,
  roleGroups,
  currentUserId,
  status,
  permissions,
  onChangeRole,
  onDeactivate,
  action,
}: {
  members?: CompanyMemberDto[];
  roleGroups: Array<{ role: TeamRoleKey; items: CompanyMemberDto[] }>;
  currentUserId?: string;
  status: { isLoading: boolean; isError: boolean; error: unknown };
  permissions: { canManageTeam: boolean; canInviteManagers: boolean };
  onChangeRole: (memberId: string, nextRole: InvitableCompanyRole) => void;
  onDeactivate: (memberId: string) => void;
  action?: ReactNode;
}) {
  const { t } = useTranslation();
  const memberCountMeta = useMemo(
    () => (
      <span className="text-xs text-gray-400 font-medium">
        {t('company.teamPage.activeCount', { count: members?.length ?? 0 })}
      </span>
    ),
    [members?.length, t],
  );

  return (
    <Panel>
      <PanelHeader
        title={t('company.teamPage.hierarchyTitle')}
        meta={memberCountMeta}
        action={action}
      />

      {status.isLoading ? (
        <LoadingStatus label={t('company.teamPage.loading')}>
          <SkeletonList rows={4} />
        </LoadingStatus>
      ) : status.isError ? (
        <EmptyState message={status.error instanceof Error ? status.error.message : t('company.teamPage.loadError')} />
      ) : !members?.length ? (
        <EmptyState message={t('company.teamPage.emptyMembers')} />
      ) : (
        <div className="space-y-8">
          {roleGroups.map((group) => (
            <TeamRoleSection
              key={group.role}
              role={group.role}
              items={group.items}
              currentUserId={currentUserId}
              canManage={permissions.canManageTeam}
              canInviteManagers={permissions.canInviteManagers}
              onChangeRole={onChangeRole}
              onDeactivate={onDeactivate}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}