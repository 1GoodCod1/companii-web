import type { AccountKind } from '@/entities/company/model/roles.types';

export type { AccountKind };

export interface AuthUserSnapshot {
  sub: string;
  email: string;
  accountKind?: AccountKind;
  activeCompanyId?: string;
  memberId?: string;
  customerId?: string;
  companyRole?: string;
  telegramChatId?: string | null;
  notifyInApp?: boolean;
  leadNotifyChannel?: 'NONE' | 'IN_APP' | 'TELEGRAM' | 'BOTH';
}
