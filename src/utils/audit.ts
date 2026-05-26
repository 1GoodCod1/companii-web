import { AUDIT_ACTION_LABELS } from '@/constants/admin.constants';

export function auditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}

export function formatAuditDetails(
  action: string,
  newData: Record<string, unknown> | null | undefined,
  entityId?: string | null,
): string {
  if (action === 'COMPANY_SWITCHED') {
    const companyId =
      (newData && typeof newData === 'object' && newData.companyId) || entityId;
    return `Companie activă: ${companyId ?? '—'}`;
  }

  if (!newData || typeof newData !== 'object') return '—';

  if ('note' in newData && newData.note) {
    return String(newData.note);
  }

  switch (action) {
    case 'TEAM_MEMBER_ROLE_CHANGED':
      return `Membru ${newData.memberId ?? '—'} → rol ${newData.role ?? '—'}`;
    case 'TEAM_MEMBER_DEACTIVATED':
      return `Membru dezactivat: ${newData.memberId ?? '—'}`;
    case 'TEAM_MEMBER_LEFT':
      return `Membru a părăsit compania: ${newData.memberId ?? '—'}`;
    case 'TEAM_INVITATION_REVOKED':
      return `Invitație revocată: ${newData.invitationId ?? '—'}`;
    case 'COMPANY_OWNERSHIP_TRANSFERRED':
      return `Proprietar nou: ${newData.newOwnerUserId ?? '—'}`;
    default:
      return JSON.stringify(newData);
  }
}
