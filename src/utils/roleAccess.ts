import {
  COMPANY_BASELINE_ROUTES,
  COMPANY_ONBOARDING_ROUTES,
} from '@/constants/companyNav.constants';
import { COMPANY_ROUTE, ROUTE_ABS } from '@/constants/routes.constants';
import { COMPANY_ROUTE_ROLES } from '@/constants/roleAccess.constants';
import type { CompanyRole } from '@/types/roles';
import { companyAbsolutePath } from '@/utils/routes';
import { isMemberRole } from '@/utils/roles';

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

export function defaultRouteForRole(role: string | undefined): string {
  if (isMemberRole(role)) return companyAbsolutePath(COMPANY_ROUTE.LUCRARI);
  return ROUTE_ABS.COMPANY;
}
