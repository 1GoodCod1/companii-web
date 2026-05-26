import {
  INTERVENTION_STATUS,
  INACTIVE_INTERVENTION_STATUSES,
  INTERVENTION_STATUS_BADGE_CLASSES,
  INTERVENTION_STATUS_DEFAULT_BADGE_CLASS,
  TERMINAL_INTERVENTION_STATUSES,
} from '@/constants/interventionStatus.constants';
import {
  INTERVENTION_STATUS_HINTS,
  MANAGEMENT_INTERVENTION_TRANSITIONS,
  TECHNICIAN_INTERVENTION_TRANSITIONS,
} from '@/constants/fsmStatusTransitions.constants';
import type { InterventionStatus } from '@/types/fsm';
import type { CompanyRole } from '@/types/roles';
import { isMemberRole } from '@/utils/roles';

const INTERVENTION_STATUS_SET = new Set<string>(Object.values(INTERVENTION_STATUS));
const INACTIVE_INTERVENTION_STATUS_SET = new Set<string>(INACTIVE_INTERVENTION_STATUSES);

export function isInterventionStatus(value: unknown): value is InterventionStatus {
  return typeof value === 'string' && INTERVENTION_STATUS_SET.has(value);
}

export function isTerminalInterventionStatus(status: InterventionStatus): boolean {
  return (
    status === TERMINAL_INTERVENTION_STATUSES[0] ||
    status === TERMINAL_INTERVENTION_STATUSES[1]
  );
}

export function isInactiveInterventionStatus(status: InterventionStatus): boolean {
  return INACTIVE_INTERVENTION_STATUS_SET.has(status);
}

export function isActiveInterventionStatus(status: InterventionStatus): boolean {
  return !isInactiveInterventionStatus(status);
}

export function getInterventionStatusStyle(status: string): string {
  return INTERVENTION_STATUS_BADGE_CLASSES[status] ?? INTERVENTION_STATUS_DEFAULT_BADGE_CLASS;
}

export function getAllowedInterventionTransitions(
  from: InterventionStatus,
  role?: CompanyRole,
): InterventionStatus[] {
  if (isTerminalInterventionStatus(from) || from === INTERVENTION_STATUS.INVOICED) return [];
  if (isMemberRole(role)) return TECHNICIAN_INTERVENTION_TRANSITIONS[from] ?? [];
  return MANAGEMENT_INTERVENTION_TRANSITIONS[from] ?? [];
}

export function getInterventionStatusHint(status: InterventionStatus): string | null {
  return INTERVENTION_STATUS_HINTS[status] ?? null;
}
