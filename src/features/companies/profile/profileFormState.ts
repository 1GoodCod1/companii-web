import type { OwnedCompanyDto } from '@/types/companies';

export const MAX_GALLERY = 12;

export function createFormState(
  company: OwnedCompanyDto | null,
  userDefaults?: { email?: string; phone?: string | null },
) {
  return {
    name: company?.name ?? '',
    legalName: company?.legalName ?? '',
    idno: company?.idno ?? '',
    legalAddress: company?.legalAddress ?? '',
    cityId: company?.cityId ?? '',
    categoryId: company?.categoryId ?? '',
    isTvaPayer: company?.isTvaPayer ?? false,
    tvaCode: company?.tvaCode ?? '',
    contactPhone: company?.contactPhone ?? userDefaults?.phone ?? '',
    contactEmail: company?.contactEmail ?? userDefaults?.email ?? '',
    showPublicPhone: company?.showPublicPhone ?? true,
    showPublicEmail: company?.showPublicEmail ?? true,
    description: company?.description ?? '',
    logoUrl: company?.logoUrl ?? null,
  };
}
