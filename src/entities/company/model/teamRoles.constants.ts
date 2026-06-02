import { COMPANY_ROLE } from '@/entities/company/model/roles.constants';
import type { TeamRoleConfig, TeamRoleKey } from '@/entities/company/model/team.types';

export const TEAM_ROLE_ORDER: TeamRoleKey[] = [
  COMPANY_ROLE.OWNER,
  COMPANY_ROLE.MANAGER,
  COMPANY_ROLE.MEMBER,
];

export const TEAM_ROLE_CONFIG: Record<TeamRoleKey, TeamRoleConfig> = {
  [COMPANY_ROLE.OWNER]: {
    label: 'Proprietar',
    sectionTitle: 'Proprietar',
    description: 'Decizii finale, abonament și profil public al companiei.',
    badgeTone: 'violet',
    avatarClass: 'from-violet-600 to-indigo-700',
    responsibilities: [
      'Gestionează abonamentul',
      'Publică profilul companiei',
      'Invită manageri și angajați',
    ],
  },
  [COMPANY_ROLE.MANAGER]: {
    label: 'Manager',
    sectionTitle: 'Manageri',
    description: 'Operațiuni zilnice: clienți, lucrări, smete, oferte și facturare.',
    badgeTone: 'blue',
    avatarClass: 'from-blue-500 to-cyan-600',
    responsibilities: [
      'CRM clienți și programări',
      'Coordonare angajați',
      'Oferte, facturi și echipă',
    ],
  },
  [COMPANY_ROLE.MEMBER]: {
    label: 'Angajat',
    sectionTitle: 'Angajați',
    description: 'Execuție pe teren — doar lucrările alocate și calendarul personal.',
    badgeTone: 'amber',
    avatarClass: 'from-amber-500 to-orange-600',
    responsibilities: [
      'Lucrările alocate lui',
      'Actualizare status pe teren',
      'Note și finalizare intervenții',
    ],
  },
};
