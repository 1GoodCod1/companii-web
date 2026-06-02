import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { COMPANY_ROLE } from '@/entities/company/model/roles.constants';
import toast from 'react-hot-toast';
import { useCompanyMeQuery, useSwitchCompanyMutation } from '@/features/companies/api/useCompanies';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { cabinetLabelClass, AppSelect } from '@/widgets/cabinet/cabinet-ui';
import { getErrorMessage } from '@/shared/utils/errors';

export function CompanySwitcher() {
  const { t } = useTranslation();
  const { data: companyMe } = useCompanyMeQuery();
  const { activeCompanyId } = useCompanyPermissions();
  const switchCompany = useSwitchCompanyMutation();

  const options = useMemo(() => {
    if (!companyMe) return [];
    const owned = companyMe.owned.map((company) => ({
      id: company.id,
      label: company.name,
      role: COMPANY_ROLE.OWNER,
    }));
    const memberships = companyMe.memberships
      .filter((membership) => !companyMe.owned.some((owned) => owned.id === membership.companyId))
      .map((membership) => ({
        id: membership.companyId,
        label: membership.company.name,
        role: membership.role ?? COMPANY_ROLE.MEMBER,
      }));
    return [...owned, ...memberships];
  }, [companyMe]);

  const companySelectOptions = useMemo(
    () => options.map((option) => ({ value: option.id, label: option.label })),
    [options],
  );

  if (options.length <= 1) return null;

  const handleChange = async (companyId: string) => {
    if (companyId === activeCompanyId) return;
    try {
      await switchCompany.mutateAsync(companyId);
      toast.success(t('cabinet.shell.companySwitched'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('cabinet.shell.companySwitchFailed')));
    }
  };

  return (
    <div className="mb-4 px-1">
      <label className={cabinetLabelClass}>{t('cabinet.shell.activeCompany')}</label>
      <AppSelect
        value={activeCompanyId ?? ''}
        onChange={(value) => void handleChange(value)}
        options={companySelectOptions}
        disabled={switchCompany.isPending}
        aria-label={t('cabinet.shell.activeCompany')}
      />
    </div>
  );
}
