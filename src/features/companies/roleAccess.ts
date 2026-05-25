import { COMPANY_BASELINE_ROUTES, COMPANY_ONBOARDING_ROUTES } from '@/components/layout/cabinet-nav';

export type CompanyRole = 'OWNER' | 'MANAGER' | 'MEMBER';

/** Routes under /company — which roles may open them. */
export const COMPANY_ROUTE_ROLES: Record<string, CompanyRole[]> = {
  '': ['OWNER', 'MANAGER', 'MEMBER'],
  '/profile': ['OWNER', 'MANAGER'],
  '/clienti': ['OWNER', 'MANAGER'],
  '/lucrari': ['OWNER', 'MANAGER', 'MEMBER'],
  '/calendar': ['OWNER', 'MANAGER', 'MEMBER'],
  '/servicii': ['OWNER', 'MANAGER'],
  '/cereri': ['OWNER', 'MANAGER'],
  '/oferte': ['OWNER', 'MANAGER'],
  '/smete': ['OWNER', 'MANAGER'],
  '/facturi': ['OWNER', 'MANAGER'],
  '/recenzii': ['OWNER', 'MANAGER'],
  '/team': ['OWNER', 'MANAGER'],
  '/subscription': ['OWNER'],
};

export function canAccessCompanyRoute(
  role: string | undefined,
  routePath: string,
): boolean {
  if (!role) {
    return (
      COMPANY_ONBOARDING_ROUTES.includes(routePath as (typeof COMPANY_ONBOARDING_ROUTES)[number]) ||
      COMPANY_BASELINE_ROUTES.includes(routePath as (typeof COMPANY_BASELINE_ROUTES)[number])
    );
  }
  const allowed = COMPANY_ROUTE_ROLES[routePath];
  if (!allowed) return true;
  return allowed.includes(role as CompanyRole);
}

export function isManagementRole(role: string | undefined): boolean {
  return role === 'OWNER' || role === 'MANAGER';
}

export function isTechnicianRole(role: string | undefined): boolean {
  return role === 'MEMBER';
}

export function defaultRouteForRole(role: string | undefined): string {
  if (role === 'MEMBER') return '/company/lucrari';
  return '/company';
}
