import { COMPANY_ROLE } from '@/entities/company/model/roles.constants';

export const COMPANY_ROLE_LABELS: Record<string, string> = {
  [COMPANY_ROLE.OWNER]: 'Proprietar',
  [COMPANY_ROLE.MANAGER]: 'Manager',
  [COMPANY_ROLE.MEMBER]: 'Angajat',
  Administrator: 'Administrator',
};

export const TEAM_INVITE_ROLE_LABELS: Record<string, string> = {
  [COMPANY_ROLE.MANAGER]: 'Manager',
  [COMPANY_ROLE.MEMBER]: 'Angajat',
};

export const TEAM_ERROR_MESSAGES: Record<string, string> = {
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
  'Employee limit reached for the current subscription plan':
    'Limita de angajați pentru planul curent a fost atinsă. Upgradați abonamentul sau eliminați un membru activ.',
  'Technician limit reached for the current subscription plan':
    'Limita de angajați pentru planul curent a fost atinsă. Upgradați abonamentul sau eliminați un membru activ.',
};

