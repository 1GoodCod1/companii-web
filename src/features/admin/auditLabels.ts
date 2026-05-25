export const AUDIT_ACTION_LABELS: Record<string, string> = {
  USER_REGISTERED: 'Utilizator înregistrat',
  LOGIN_SUCCESS: 'Autentificare reușită',
  LOGIN_FAILED: 'Autentificare eșuată',
  COMPANY_CREATED: 'Companie creată',
  COMPANY_PUBLISHED: 'Companie publicată',
  COMPANY_VERIFIED: 'Companie verificată',
  COMPANY_REJECTED: 'Companie respinsă',
  COMPANY_UNPUBLISHED: 'Publicare retrasă',
  COMPANY_SWITCHED: 'Companie activă schimbată',
  TEAM_MEMBER_ROLE_CHANGED: 'Rol membru schimbat',
  TEAM_MEMBER_DEACTIVATED: 'Membru dezactivat',
  TEAM_MEMBER_LEFT: 'Membru a părăsit echipa',
  TEAM_INVITATION_REVOKED: 'Invitație revocată',
  COMPANY_OWNERSHIP_TRANSFERRED: 'Proprietate transferată',
  SUBSCRIPTION_CHANGED: 'Plan abonament schimbat',
  REVIEW_MODERATED: 'Recenzie moderată',
  CONSENT_GRANTED: 'Consimțământ acordat',
  CONSENT_REVOKED: 'Consimțământ retras',
};

export const AUDIT_ACTION_FILTER_OPTIONS = [
  { value: 'COMPANY_VERIFIED', label: 'Verificare companie' },
  { value: 'COMPANY_REJECTED', label: 'Respingere companie' },
  { value: 'COMPANY_UNPUBLISHED', label: 'Retragere publicare' },
  { value: 'COMPANY_SWITCHED', label: 'Schimbare companie activă' },
  { value: 'TEAM_MEMBER_ROLE_CHANGED', label: 'Schimbare rol echipă' },
  { value: 'TEAM_MEMBER_DEACTIVATED', label: 'Dezactivare membru' },
  { value: 'TEAM_MEMBER_LEFT', label: 'Părăsire echipă' },
  { value: 'TEAM_INVITATION_REVOKED', label: 'Revocare invitație' },
  { value: 'COMPANY_OWNERSHIP_TRANSFERRED', label: 'Transfer proprietate' },
  { value: 'SUBSCRIPTION_CHANGED', label: 'Schimbare plan' },
  { value: 'REVIEW_MODERATED', label: 'Moderare recenzie' },
] as const;

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
