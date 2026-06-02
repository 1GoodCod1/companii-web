import { CLOSED_LEAD_STATUSES, LEAD_STATUS, LEAD_STATUS_CODES } from '@/entities/fsm/model/leadStatus.constants';
import type { CompanyLeadStatus } from '@/entities/fsm/model/types';

const LEAD_STATUS_SET = new Set<string>(LEAD_STATUS_CODES);
const CLOSED_LEAD_STATUS_SET = new Set<string>(CLOSED_LEAD_STATUSES);

export function isLeadStatus(value: unknown): value is CompanyLeadStatus {
  return typeof value === 'string' && LEAD_STATUS_SET.has(value);
}

export function isClosedLeadStatus(status: CompanyLeadStatus): boolean {
  return CLOSED_LEAD_STATUS_SET.has(status);
}

export function isOpenLeadStatus(status: CompanyLeadStatus): boolean {
  return !isClosedLeadStatus(status);
}

export { LEAD_STATUS };
