import type { ReactNode } from 'react';

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

export const COMPANY_ROLE_LABELS: Record<string, string> = {
  OWNER: 'Proprietar',
  MANAGER: 'Manager',
  MEMBER: 'Tehnician',
  Administrator: 'Administrator',
};

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
    if (ownedMatch) return 'OWNER';

    const membership = companyMe.memberships?.find(
      (item) => item.companyId === activeCompanyId,
    );
    if (membership?.role) return membership.role;
  }

  if (companyMe?.owned?.length) return 'OWNER';
  const membershipRole = companyMe?.memberships?.find((item) => item.role)?.role;
  if (membershipRole) return membershipRole;
  return undefined;
}

/** Routes visible to any company staff member when role is still resolving. */
export const COMPANY_BASELINE_ROUTES = ['', '/lucrari', '/calendar'] as const;

/** Routes for a new account before the first company profile is created. */
export const COMPANY_ONBOARDING_ROUTES = ['', '/profile'] as const;
