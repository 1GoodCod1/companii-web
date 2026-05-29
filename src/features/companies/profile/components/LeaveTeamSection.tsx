import { useTranslation } from 'react-i18next';
import { cabinetBtnSecondary } from '@/components/cabinet/cabinet-ui';

interface LeaveTeamSectionProps {
  canLeaveCompany: boolean;
  leaveCompanyPending: boolean;
  handleLeaveTeam: () => Promise<void>;
}

export function LeaveTeamSection({
  canLeaveCompany,
  leaveCompanyPending,
  handleLeaveTeam,
}: LeaveTeamSectionProps) {
  const { t } = useTranslation();

  if (!canLeaveCompany) return null;

  return (
    <section className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4 border border-red-100">
      <div>
        <h2 className="text-base font-bold text-gray-900">
          {t('company.profileEditor.form.leaveTeamTitle')}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {t('company.profileEditor.form.leaveTeamDesc')}
        </p>
      </div>
      <button
        type="button"
        disabled={leaveCompanyPending}
        onClick={() => void handleLeaveTeam()}
        className={`${cabinetBtnSecondary} border-red-200 text-red-700 hover:bg-red-50`}
      >
        {leaveCompanyPending ? t('company.profileEditor.leaving') : t('company.profileEditor.leaveCompany')}
      </button>
    </section>
  );
}
