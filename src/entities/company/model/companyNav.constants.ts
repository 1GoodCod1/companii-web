import { COMPANY_CABINET_PATH } from '@/shared/constants/routes.constants';

export const COMPANY_NAV_SECTION_ORDER = ['main', 'operations', 'company'] as const;

export type CompanyNavSectionKey = (typeof COMPANY_NAV_SECTION_ORDER)[number];

export const COMPANY_NAV_SECTION_LABELS: Record<CompanyNavSectionKey, string> = {
  main: 'company.sections.main',
  operations: 'company.sections.operations',
  company: 'company.sections.company',
};

export const COMPANY_OPERATIONS_GROUP_ORDER = [
  'clients',
  'work',
  'finance',
  'catalog',
] as const;

export type CompanyOperationsGroupKey = (typeof COMPANY_OPERATIONS_GROUP_ORDER)[number];

export const COMPANY_OPERATIONS_GROUP_LABELS: Record<CompanyOperationsGroupKey, string> = {
  clients: 'company.navGroups.clients',
  work: 'company.navGroups.work',
  finance: 'company.navGroups.finance',
  catalog: 'company.navGroups.catalog',
};

export const COMPANY_COMPANY_GROUP_ORDER = ['profile', 'admin'] as const;

export type CompanyCompanyGroupKey = (typeof COMPANY_COMPANY_GROUP_ORDER)[number];

export const COMPANY_COMPANY_GROUP_LABELS: Record<CompanyCompanyGroupKey, string> = {
  profile: 'company.navGroups.profile',
  admin: 'company.navGroups.admin',
};

export const COMPANY_BASELINE_ROUTES = [
  COMPANY_CABINET_PATH.DASHBOARD,
  COMPANY_CABINET_PATH.LUCRARI,
  COMPANY_CABINET_PATH.CALENDAR,
] as const;

export const COMPANY_ONBOARDING_ROUTES = [
  COMPANY_CABINET_PATH.DASHBOARD,
  COMPANY_CABINET_PATH.PROFILE,
] as const;
