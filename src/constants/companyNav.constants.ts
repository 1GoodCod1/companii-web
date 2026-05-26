import { COMPANY_CABINET_PATH } from '@/constants/routes.constants';

export const COMPANY_NAV_SECTION_ORDER = ['main', 'operations', 'company'] as const;

export type CompanyNavSectionKey = (typeof COMPANY_NAV_SECTION_ORDER)[number];

export const COMPANY_NAV_SECTION_LABELS: Record<CompanyNavSectionKey, string> = {
  main: 'company.sections.main',
  operations: 'company.sections.operations',
  company: 'company.sections.company',
};

/** Routes visible to any company staff member when role is still resolving. */
export const COMPANY_BASELINE_ROUTES = [
  COMPANY_CABINET_PATH.DASHBOARD,
  COMPANY_CABINET_PATH.LUCRARI,
  COMPANY_CABINET_PATH.CALENDAR,
] as const;

/** Routes for a new account before the first company profile is created. */
export const COMPANY_ONBOARDING_ROUTES = [
  COMPANY_CABINET_PATH.DASHBOARD,
  COMPANY_CABINET_PATH.PROFILE,
] as const;
