import { useTranslation } from 'react-i18next';
import { cabinetBtnSecondary } from '@/widgets/cabinet/cabinet-ui';
import {
  companyPagePanelClass,
  companyPagePanelInsetClass,
} from '@/features/companies/companyFormPanelUi';

interface LeaveTeamSectionProps {
  canLeaveCompany: boolean;
  leaveCompanyPending: boolean;
  handleLeaveTeam: () => void;
}

export function LeaveTeamSection({
  canLeaveCompany,
  leaveCompanyPending,
  handleLeaveTeam,
}: LeaveTeamSectionProps) {
  const { t } = useTranslation();

  if (!canLeaveCompany) return null;

  return (
    <section
      className={`${companyPagePanelClass} ${companyPagePanelInsetClass} space-y-4 border-l-[3px] border-l-red-300`}
    >
      <div className="text-center sm:text-left">
        <h2 className="text-base font-black tracking-tight text-gray-900">
          {t('company.profileEditor.form.leaveTeamTitle')}
        </h2>
        <p className="mt-1 text-sm text-gray-500">{t('company.profileEditor.form.leaveTeamDesc')}</p>
      </div>
      <div className="flex justify-center sm:justify-start">
        <button
          type="button"
          disabled={leaveCompanyPending}
          onClick={() => handleLeaveTeam()}
          className={`${cabinetBtnSecondary} border-red-200 text-red-700 hover:bg-red-50`}
        >
          {leaveCompanyPending ? t('company.profileEditor.leaving') : t('company.profileEditor.leaveCompany')}
        </button>
      </div>
    </section>
  );
}
