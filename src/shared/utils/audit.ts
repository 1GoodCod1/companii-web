import type { TFunction } from 'i18next';
import { AUDIT_ACTION_LABELS } from '@/entities/company/model/admin.constants';

export function auditActionLabel(action: string, t?: TFunction): string {
  if (t) {
    const key = `admin.auditPage.actionLabels.${action}`;
    const translated = t(key);
    if (translated !== key) return translated;
  }
  return AUDIT_ACTION_LABELS[action] ?? action;
}
const ENTITY_TYPE_LABELS: Record<string, string> = {
  Company: 'Компания',
  CompanyMember: 'Сотрудник',
  User: 'Пользователь',
  Estimate: 'Расчет стоимости',
  Intervention: 'Работа',
  Invoice: 'Счёт',
  Lead: 'Заявка',
  Subscription: 'Подписка',
  Service: 'Услуга',
};

export function formatEntityType(entityType: string | null | undefined): string {
  if (!entityType) return '—';
  return ENTITY_TYPE_LABELS[entityType] ?? entityType;
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
    case 'COMPANY_CREATED':
    case 'COMPANY_PUBLISHED':
    case 'COMPANY_UNPUBLISHED':
    case 'COMPANY_VERIFIED':
    case 'COMPANY_REJECTED':
      return newData.name ? String(newData.name) : '—';

    case 'SUBSCRIPTION_CHANGED': {
      const plan = newData.planCode ?? newData.plan ?? '';
      const status = newData.status ?? '';
      if (plan && status) return `${plan} · ${status}`;
      if (plan) return String(plan);
      return '—';
    }

    case 'ESTIMATE_SENT':
    case 'ESTIMATE_ACCEPTED':
    case 'ESTIMATE_REJECTED':
    case 'ESTIMATE_CONVERTED': {
      const title = newData.title ?? newData.estimateTitle ?? '';
      const client = newData.clientName ?? '';
      if (title && client) return `${title} → ${client}`;
      if (title) return String(title);
      return '—';
    }

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
    default: {
      const readable = extractReadableFields(newData);
      return readable || '—';
    }
  }
}

function extractReadableFields(data: Record<string, unknown>): string {
  const SKIP = new Set(['id', 'createdAt', 'updatedAt', 'userId', 'companyId', 'entityId', 'entityType']);
  const entries = Object.entries(data)
    .filter(([key, val]) => !SKIP.has(key) && val != null && val !== '')
    .slice(0, 3);
  if (entries.length === 0) return '';
  return entries
    .flatMap(([, val]) => {
      if (typeof val === 'string') return [val];
      if (typeof val === 'number' || typeof val === 'boolean') return [String(val)];
      return [];
    })
    .join(' · ');
}
