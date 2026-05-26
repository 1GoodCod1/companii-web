import { useMemo } from 'react';
import { COMPANY_ROLE } from '@/constants/roles.constants';
import toast from 'react-hot-toast';
import { useCompanyMeQuery, useSwitchCompanyMutation } from '@/features/companies/api/useCompanies';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
import { cabinetSelectClass, cabinetLabelClass } from '@/components/cabinet/cabinet-ui';
import { getErrorMessage } from '@/utils/errors';

export function CompanySwitcher() {
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

  if (options.length <= 1) return null;

  const handleChange = async (companyId: string) => {
    if (companyId === activeCompanyId) return;
    try {
      await switchCompany.mutateAsync(companyId);
      toast.success('Compania activă a fost schimbată.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut schimba compania.'));
    }
  };

  return (
    <div className="mb-4 px-1">
      <label className={cabinetLabelClass}>Companie activă</label>
      <select
        value={activeCompanyId ?? ''}
        onChange={(e) => void handleChange(e.target.value)}
        disabled={switchCompany.isPending}
        className={cabinetSelectClass}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
