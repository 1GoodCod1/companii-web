import type { TFunction } from 'i18next';
import { COMPANY_ROLE } from '@/entities/company/model/roles.constants';

const ROLE_LABEL_KEYS: Record<string, string> = {
  [COMPANY_ROLE.OWNER]: 'company.roles.owner',
  [COMPANY_ROLE.MANAGER]: 'company.roles.manager',
  [COMPANY_ROLE.MEMBER]: 'company.roles.member',
  Administrator: 'company.roles.administrator',
};

export function getCompanyRoleLabel(t: TFunction, role: string): string {
  const key = ROLE_LABEL_KEYS[role];
  return key ? t(key) : role;
}
