import { useTranslation } from 'react-i18next';
import { isManagerRole } from '@/utils/roles';

interface LoginTeamInviteBannerProps {
  teamPreview: {
    companyName: string;
    role: string;
  } | null | undefined;
}

export function LoginTeamInviteBanner({ teamPreview }: LoginTeamInviteBannerProps) {
  const { t } = useTranslation();

  if (!teamPreview) return null;

  return (
    <div className="mb-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-xs font-semibold text-indigo-800 leading-relaxed">
      {t('auth.teamInviteBanner', {
        company: teamPreview.companyName,
        role: isManagerRole(teamPreview.role)
          ? t('auth.roleManager')
          : t('auth.roleTechnician'),
      })}
    </div>
  );
}
