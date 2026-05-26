import type { TFunction } from 'i18next';
import { AUDIT_ACTION_LABELS } from '@/constants/admin.constants';

export function auditActionLabel(action: string, t?: TFunction): string {
  if (t) {
    const key = `admin.auditPage.actionLabels.${action}`;
    const translated = t(key);
    if (translated !== key) return translated;
  }
  return AUDIT_ACTION_LABELS[action] ?? action;
}

export function formatAuditDetails(
  action: string,
  newData: Record<string, unknown> | null | undefined,
  entityId?: string | null,
  t?: TFunction,
): string {
  if (action === 'COMPANY_SWITCHED') {
    const companyId =
      (newData && typeof newData === 'object' && newData.companyId) || entityId;
    if (t) {
      return t('admin.auditPage.details.activeCompany', { id: companyId ?? '—' });
    }
    return `Companie activă: ${companyId ?? '—'}`;
  }

  if (!newData || typeof newData !== 'object') return '—';

  if ('note' in newData && newData.note) {
    return String(newData.note);
  }

  switch (action) {
    case 'TEAM_MEMBER_ROLE_CHANGED':
      if (t) {
        return t('admin.auditPage.details.roleChanged', {
          memberId: newData.memberId ?? '—',
          role: newData.role ?? '—',
        });
      }
      return `Membru ${newData.memberId ?? '—'} → rol ${newData.role ?? '—'}`;
    case 'TEAM_MEMBER_DEACTIVATED':
      if (t) {
        return t('admin.auditPage.details.memberDeactivated', {
          memberId: newData.memberId ?? '—',
        });
      }
      return `Membru dezactivat: ${newData.memberId ?? '—'}`;
    case 'TEAM_MEMBER_LEFT':
      if (t) {
        return t('admin.auditPage.details.memberLeft', {
          memberId: newData.memberId ?? '—',
        });
      }
      return `Membru a părăsit compania: ${newData.memberId ?? '—'}`;
    case 'TEAM_INVITATION_REVOKED':
      if (t) {
        return t('admin.auditPage.details.invitationRevoked', {
          invitationId: newData.invitationId ?? '—',
        });
      }
      return `Invitație revocată: ${newData.invitationId ?? '—'}`;
    case 'COMPANY_OWNERSHIP_TRANSFERRED':
      if (t) {
        return t('admin.auditPage.details.ownershipTransferred', {
          userId: newData.newOwnerUserId ?? '—',
        });
      }
      return `Proprietar nou: ${newData.newOwnerUserId ?? '—'}`;
    default:
      return JSON.stringify(newData);
  }
}
