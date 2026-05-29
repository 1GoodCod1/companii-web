import { useTranslation } from 'react-i18next';
import { isManagerRole } from '@/utils/roles';

interface RegisterTeamInviteBannerProps {
  teamPreview: {
    companyName: string;
    role: string;
    invitedEmail?: string | null;
  } | null | undefined;
}

export function RegisterTeamInviteBanner({ teamPreview }: RegisterTeamInviteBannerProps) {
  const { t } = useTranslation();

  if (!teamPreview) return null;

  return (
    <div className="mb-4 rounded-xl border border-indigo-105 bg-indigo-50/50 px-3.5 py-3 space-y-1.5">
      <p className="text-xs font-semibold text-indigo-900">
        {t('auth.registerPage.teamInviteTitle', { company: teamPreview.companyName })}
      </p>
      <p className="text-[11px] text-indigo-805 font-semibold leading-none">
        {t('auth.registerPage.roleLabel', {
          role: isManagerRole(teamPreview.role)
            ? t('auth.roleManager')
            : t('auth.roleTechnician'),
        })}
      </p>
      {teamPreview.invitedEmail ? (
        <p className="text-[10px] text-indigo-700/85 font-bold uppercase tracking-wider leading-none">
          {t('auth.registerPage.emailMustMatch', { email: teamPreview.invitedEmail })}
        </p>
      ) : null}
    </div>
  );
}
