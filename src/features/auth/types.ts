export type AccountKind = 'COMPANY_STAFF' | 'END_CLIENT' | 'PLATFORM_ADMIN';

export interface AuthUserSnapshot {
  sub: string;
  email: string;
  accountKind: AccountKind;
  activeCompanyId?: string;
  memberId?: string;
  customerId?: string;
  companyRole?: string;
}
