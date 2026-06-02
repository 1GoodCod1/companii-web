import { defaultRouteForRole } from '@/entities/company/model/roleAccess';
import { COMPANY_ROUTE } from '@/shared/constants/routes.constants';
import { companyAbsolutePath } from '@/shared/utils/routes';

type CompanyHomeInput = {
  companyRole?: string;
  activeCompanyId?: string | null;
  ownedCount?: number;
  membershipCount?: number;
};

export function needsCompanyOnboarding(input: CompanyHomeInput): boolean {
  const owned = input.ownedCount ?? 0;
  const memberships = input.membershipCount ?? 0;
  return !input.activeCompanyId && owned === 0 && memberships === 0;
}

export function resolveCompanyHomeRoute(input: CompanyHomeInput): string {
  if (needsCompanyOnboarding(input)) {
    return companyAbsolutePath(COMPANY_ROUTE.PROFILE);
  }
  return defaultRouteForRole(input.companyRole);
}
