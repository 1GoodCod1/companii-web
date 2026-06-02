import {
  ACCOUNT_KIND,
  ACCOUNT_KIND_CODES,
  COMPANY_ROLE,
  COMPANY_ROLE_CODES,
} from '@/entities/company/model/roles.constants';
import type { AccountKind, CompanyRole, InvitableCompanyRole } from '@/entities/company/model/roles.types';

const COMPANY_ROLE_SET = new Set<string>(COMPANY_ROLE_CODES);
const ACCOUNT_KIND_SET = new Set<string>(ACCOUNT_KIND_CODES);

export function isCompanyRole(value: unknown): value is CompanyRole {
  return typeof value === 'string' && COMPANY_ROLE_SET.has(value);
}

export function isAccountKind(value: unknown): value is AccountKind {
  return typeof value === 'string' && ACCOUNT_KIND_SET.has(value);
}

export function isInvitableCompanyRole(value: unknown): value is InvitableCompanyRole {
  return value === COMPANY_ROLE.MANAGER || value === COMPANY_ROLE.MEMBER;
}

export function isOwnerRole(
  role: CompanyRole | string | undefined | null,
): role is typeof COMPANY_ROLE.OWNER {
  return role === COMPANY_ROLE.OWNER;
}

export function isManagerRole(
  role: CompanyRole | string | undefined | null,
): role is typeof COMPANY_ROLE.MANAGER {
  return role === COMPANY_ROLE.MANAGER;
}

export function isMemberRole(
  role: CompanyRole | string | undefined | null,
): role is typeof COMPANY_ROLE.MEMBER {
  return role === COMPANY_ROLE.MEMBER;
}

export function isManagementRole(role: CompanyRole | string | undefined | null): boolean {
  return isOwnerRole(role) || isManagerRole(role);
}

export function isTechnicianRole(role: CompanyRole | string | undefined | null): boolean {
  return isMemberRole(role);
}

export function isEndClientAccount(
  kind: AccountKind | string | undefined | null,
): kind is typeof ACCOUNT_KIND.END_CLIENT {
  return kind === ACCOUNT_KIND.END_CLIENT;
}

export function isCompanyStaffAccount(
  kind: AccountKind | string | undefined | null,
): kind is typeof ACCOUNT_KIND.COMPANY_STAFF {
  return kind === ACCOUNT_KIND.COMPANY_STAFF;
}

export function isPlatformAdminAccount(
  kind: AccountKind | string | undefined | null,
): kind is typeof ACCOUNT_KIND.PLATFORM_ADMIN {
  return kind === ACCOUNT_KIND.PLATFORM_ADMIN;
}

export function companyRoleAllows(
  role: CompanyRole | undefined,
  allowed: readonly CompanyRole[],
): boolean {
  if (!role) return false;
  return allowed.includes(role);
}
