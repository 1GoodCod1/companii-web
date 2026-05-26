import type { AccountKind } from '@/types/roles';

export type { AccountKind };

export interface AuthUserSnapshot {
  sub: string;
  email: string;
  accountKind?: AccountKind;
  activeCompanyId?: string;
  memberId?: string;
  customerId?: string;
  companyRole?: string;
}
