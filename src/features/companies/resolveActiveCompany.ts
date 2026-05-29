import type { CompanyMeResponse, OwnedCompanyDto } from '@/types/companies';

export function resolveActiveCompany(
  me: CompanyMeResponse | undefined,
  activeCompanyId: string | undefined,
): { company: OwnedCompanyDto | null; isOwner: boolean } {
  if (!me) {
    return { company: null, isOwner: false };
  }

  if (activeCompanyId) {
    const owned = me.owned.find((c) => c.id === activeCompanyId);
    if (owned) return { company: owned, isOwner: true };

    const membership = me.memberships.find((m) => m.companyId === activeCompanyId);
    if (membership?.company) {
      return { company: membership.company, isOwner: false };
    }
  }

  if (me.owned[0]) {
    return { company: me.owned[0], isOwner: true };
  }

  return { company: null, isOwner: false };
}

export const MANAGER_PROFILE_FIELDS = [
  'contactPhone',
  'contactEmail',
  'description',
  'cityId',
  'categoryId',
  'logoUrl',
] as const;
