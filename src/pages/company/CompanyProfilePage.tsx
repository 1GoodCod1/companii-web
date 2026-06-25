import { useTranslation } from 'react-i18next';
import {
  useCompanyMeQuery,
  useCitiesQuery,
  useCategoriesQuery,
} from '@/features/companies/api/useCompanies';
import { LoadingStatus } from '@/shared/ui/LoadingStatus';
import { EmptyState, SkeletonPage } from '@/widgets/cabinet/cabinet-ui';
import { companyPageShellClass } from '@/features/companies/companyFormPanelUi';
import { useMeQuery } from '@/features/auth';
import { resolveActiveCompany } from '@/features/companies/resolveActiveCompany';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { CompanyProfileEditor } from '@/features/companies/profile/CompanyProfileEditor';
import { useAuthStore } from '@/entities/user/model/authStore';

export function CompanyProfilePage() {
  const { t } = useTranslation();
  const authUser = useAuthStore((s) => s.user);
  const { data: authMe } = useMeQuery();
  const { data: companyMe, isLoading: isLoadingMe } = useCompanyMeQuery();
  const { data: cities, isLoading: isLoadingCities } = useCitiesQuery();
  const { data: categories, isLoading: isLoadingCategories } = useCategoriesQuery();
  const { activeCompanyId, isLegalOwner, canEditLegalProfile, canPublishCompany, canRegisterCompany } =
    useCompanyPermissions();

  const { company: activeCompany } = resolveActiveCompany(companyMe, activeCompanyId);
  const userDefaults = {
    email: authMe?.email ?? authUser?.email,
    phone: authMe?.phone ?? null,
  };

  if (isLoadingMe || isLoadingCities || isLoadingCategories) {
    return (
      <LoadingStatus label={t('company.profilePage.loading')}>
        <div className={companyPageShellClass}>
          <SkeletonPage rows={3} />
        </div>
      </LoadingStatus>
    );
  }

  if (!activeCompany && canRegisterCompany) {
    return (
      <CompanyProfileEditor
        key="new"
        ownedCompany={null}
        permissions={{
          isLegalOwner: false,
          canRegisterCompany,
          canEditLegalProfile,
          canPublishCompany: false,
        }}
        cities={cities}
        categories={categories}
        userDefaults={userDefaults}
      />
    );
  }

  if (!activeCompany) {
    return (
      <div className={companyPageShellClass}>
        <EmptyState message={t('company.profilePage.unavailable')} />
      </div>
    );
  }

  return (
    <CompanyProfileEditor
      key={activeCompany.id}
      ownedCompany={activeCompany}
      permissions={{
        isLegalOwner,
        canEditLegalProfile,
        canPublishCompany,
      }}
      cities={cities}
      categories={categories}
      userDefaults={userDefaults}
    />
  );
}
