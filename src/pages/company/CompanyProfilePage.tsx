import { useTranslation } from 'react-i18next';
import {
  useCompanyMeQuery,
  useCitiesQuery,
  useCategoriesQuery,
} from '@/features/companies/api/useCompanies';
import { EmptyState } from '@/components/cabinet/cabinet-ui';
import { useMeQuery } from '@/features/auth/api/useAuth';
import { resolveActiveCompany } from '@/features/companies/resolveActiveCompany';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { CompanyProfileEditor } from '@/features/companies/profile/CompanyProfileEditor';
import { useAuthStore } from '@/stores/authStore';

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
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        {t('company.profilePage.loading')}
      </div>
    );
  }

  if (!activeCompany && canRegisterCompany) {
    return (
      <CompanyProfileEditor
        key="new"
        ownedCompany={null}
        isLegalOwner={false}
        canRegisterCompany
        canEditLegalProfile
        canPublishCompany={false}
        cities={cities}
        categories={categories}
        userDefaults={userDefaults}
      />
    );
  }

  if (!activeCompany) {
    return (
      <div className="max-w-2xl">
        <EmptyState message={t('company.profilePage.unavailable')} />
      </div>
    );
  }

  return (
    <CompanyProfileEditor
      key={activeCompany.id}
      ownedCompany={activeCompany}
      isLegalOwner={isLegalOwner}
      canEditLegalProfile={canEditLegalProfile}
      canPublishCompany={canPublishCompany}
      cities={cities}
      categories={categories}
      userDefaults={userDefaults}
    />
  );
}
