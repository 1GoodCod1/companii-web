import { useTranslation } from 'react-i18next';
import {
  Panel,
  PanelHeader,
  cabinetBtnSecondary,
} from '@/widgets/cabinet/cabinet-ui';
import { buildTeamInviteUrl, type CompanyInvitationDto } from '@/features/companies/api/useCompanies';
import { getCompanyRoleLabel } from '@/entities/company/model/companyRoleLabel';
import { formatDateTimeLocalized } from '@/shared/utils/date';
import type { TeamRoleKey } from '@/entities/company/model/team.types';
import { useLocale } from '@/shared/hooks/useLocale';

type TeamLocale = ReturnType<typeof useLocale>;

export function TeamInvitationsPanel({
  invitations,
  locale,
  onCopyLink,
  onRevokeInvitation,
}: {
  invitations: CompanyInvitationDto[];
  locale: TeamLocale;
  onCopyLink: (url: string) => void;
  onRevokeInvitation: (invitationId: string) => Promise<void>;
}) {
  const { t } = useTranslation();

  if (invitations.length === 0) return null;

  return (
    <Panel>
      <PanelHeader title={t('company.teamPage.invitationsTitle')} />
      <ul className="divide-y divide-gray-100/80">
        {invitations.map((invite) => {
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
                    ? ` В· ${invite.invitedEmail}`
                    : ` В· ${t('company.teamPage.openLink')}`}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('company.teamPage.expiresAt', {
                    date: formatDateTimeLocalized(invite.expiresAt, locale),
                  })}
                </p>
                <p className="text-[11px] text-gray-400 font-mono truncate mt-1">{url}</p>
              </div>
              <button type="button" onClick={() => onCopyLink(url)} className={cabinetBtnSecondary}>
                {t('company.teamPage.copyLink')}
              </button>
              <button
                type="button"
                onClick={() => void onRevokeInvitation(invite.id)}
                className={cabinetBtnSecondary}
              >
                {t('company.teamPage.revoke')}
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}