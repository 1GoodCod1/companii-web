import { ApiError } from '@/api/client';

const TEAM_ERROR_MESSAGES: Record<string, string> = {
  'Nu există cont de tip Companie pentru acest contact. Folosiți link invitație.':
    'Nu există cont de tip Companie pentru acest email/telefon. Folosiți tab-ul „Link invitație”.',
  'Contul există, dar este de tip Client — nu Companie. Folosiți link invitație.':
    'Acest cont este de tip Client, nu Companie. Folosiți link invitație pentru a crea cont nou.',
  'No registered company account found for this contact. Send an invite link instead.':
    'Nu există cont de tip Companie pentru acest email/telefon. Folosiți tab-ul „Link invitație”.',
  'Only company staff accounts can join a team':
    'Acest cont este de tip Client, nu Companie. Folosiți link invitație.',
  'User is already a member of this company': 'Persoana este deja membru al echipei.',
  'This user already owns another company and cannot join as a team member':
    'Utilizatorul deține deja o altă companie și nu poate fi adăugat ca membru.',
  'Account is disabled': 'Contul este dezactivat.',
  'Technician limit reached for the current subscription plan':
    'Limita de tehnicieni pentru planul curent a fost atinsă. Upgradați abonamentul sau eliminați un membru activ.',
};

export function getTeamInviteErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const raw = Array.isArray(err.message) ? err.message[0] : err.message;
    if (raw && TEAM_ERROR_MESSAGES[raw]) {
      return TEAM_ERROR_MESSAGES[raw];
    }
    if (err.status === 404) {
      return TEAM_ERROR_MESSAGES[
        'No registered company account found for this contact. Send an invite link instead.'
      ];
    }
    return raw || 'Nu s-a putut finaliza invitația.';
  }
  if (err instanceof Error && err.message) {
    return TEAM_ERROR_MESSAGES[err.message] ?? err.message;
  }
  return 'Nu s-a putut finaliza invitația.';
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
  return raw === 'Only company staff accounts can join a team' ||
    raw === 'Contul există, dar este de tip Client — nu Companie. Folosiți link invitație.';
}

export function isTeamPlanLimitError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  const raw = Array.isArray(err.message) ? err.message[0] : err.message;
  return raw === 'Technician limit reached for the current subscription plan';
}
