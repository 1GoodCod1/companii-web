import type { ReactNode } from 'react';
import {
  COMPANY_BASELINE_ROUTES,
  COMPANY_ONBOARDING_ROUTES,
} from '@/constants/companyNav.constants';
import { COMPANY_ROLE } from '@/constants/roles.constants';

export type CabinetNavItem = {
  key: string;
  to: string;
  labelKey: string;
  icon: ReactNode;
  badge?: number | string;
};

export type CabinetNavSection = {
  key: string;
  labelKey: string;
  items: CabinetNavItem[];
};

export { COMPANY_ROLE_LABELS } from '@/constants/team.constants';

export function buildCabinetPath(basePath: string, itemTo: string): string {
  return itemTo ? `${basePath}${itemTo}` : basePath;
}

export function isCabinetNavItemActive(
  pathname: string,
  basePath: string,
  itemTo: string,
  allPaths: string[],
): boolean {
  const fullPath = buildCabinetPath(basePath, itemTo);
  const exactMatch = pathname === fullPath;
  const anyExactMatch = allPaths.some((path) => pathname === path);
  const nestedMatch =
    !anyExactMatch &&
    itemTo !== '' &&
    pathname.startsWith(`${fullPath}/`);
  return exactMatch || nestedMatch;
}

export function resolveCompanyRole(
  jwtRole: string | undefined,
  companyMe?: {
    memberships?: { role?: string; companyId?: string }[];
    owned?: { id?: string }[];
  },
  activeCompanyId?: string | null,
): string | undefined {
  if (jwtRole) return jwtRole;

  if (activeCompanyId && companyMe) {
    const ownedMatch = companyMe.owned?.find((item) => item.id === activeCompanyId);
    if (ownedMatch) return COMPANY_ROLE.OWNER;

    const membership = companyMe.memberships?.find(
      (item) => item.companyId === activeCompanyId,
    );
    if (membership?.role) return membership.role;
  }

  if (companyMe?.owned?.length) return COMPANY_ROLE.OWNER;
  const membershipRole = companyMe?.memberships?.find((item) => item.role)?.role;
  if (membershipRole) return membershipRole;
  return undefined;
}

/** Routes visible to any company staff member when role is still resolving. */
export { COMPANY_BASELINE_ROUTES };

/** Routes for a new account before the first company profile is created. */
export { COMPANY_ONBOARDING_ROUTES };
