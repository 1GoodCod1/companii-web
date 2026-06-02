import { ACCOUNT_KIND, COMPANY_ROLE, INVITABLE_COMPANY_ROLES } from '@/entities/company/model/roles.constants';

export type AccountKind = (typeof ACCOUNT_KIND)[keyof typeof ACCOUNT_KIND];
export type CompanyRole = (typeof COMPANY_ROLE)[keyof typeof COMPANY_ROLE];
export type InvitableCompanyRole = (typeof INVITABLE_COMPANY_ROLES)[number];
