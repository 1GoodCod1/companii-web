import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/api/client';

const TEAM_ERROR_KEYS: Record<string, string> = {
  'Nu există cont de tip Companie pentru acest contact. Folosiți link invitație.':
    'company.teamPage.errors.noCompanyAccount',
  'Contul există, dar este de tip Client — nu Companie. Folosiți link invitație.':
    'company.teamPage.errors.clientNotCompany',
  'No registered company account found for this contact. Send an invite link instead.':
    'company.teamPage.errors.noCompanyAccount',
  'Only company staff accounts can join a team': 'company.teamPage.errors.clientNotCompany',
  'User is already a member of this company': 'company.teamPage.errors.alreadyMember',
  'This user already owns another company and cannot join as a team member':
    'company.teamPage.errors.ownsOtherCompany',
  'Account is disabled': 'company.teamPage.errors.accountDisabled',
  'Technician limit reached for the current subscription plan':
    'company.teamPage.errors.planLimit',
};

export function getTeamInviteErrorMessage(err: unknown, t: TFunction): string {
  if (err instanceof ApiError) {
    const raw = Array.isArray(err.message) ? err.message[0] : err.message;
    if (raw && TEAM_ERROR_KEYS[raw]) {
      return t(TEAM_ERROR_KEYS[raw]);
    }
    if (err.status === 404) {
      return t('company.teamPage.errors.noCompanyAccount');
    }
    return raw || t('company.teamPage.errors.inviteFailed');
  }
  if (err instanceof Error && err.message) {
    const key = TEAM_ERROR_KEYS[err.message];
    return key ? t(key) : err.message;
  }
  return t('company.teamPage.errors.inviteFailed');
}

export function isTeamMemberNotFoundError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  const raw = Array.isArray(err.message) ? err.message[0] : err.message;
  return (
    err.status === 404 ||
    raw === 'No registered company account found for this contact. Send an invite link instead.' ||
    raw === 'Nu există cont de tip Companie pentru acest contact. Folosiți link invitație.'
  );
}

export function isTeamWrongAccountKindError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  const raw = Array.isArray(err.message) ? err.message[0] : err.message;
  return (
    raw === 'Only company staff accounts can join a team' ||
    raw === 'Contul există, dar este de tip Client — nu Companie. Folosiți link invitație.'
  );
}

export function isTeamPlanLimitError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  const raw = Array.isArray(err.message) ? err.message[0] : err.message;
  return raw === 'Technician limit reached for the current subscription plan';
}
