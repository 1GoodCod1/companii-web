import type { CompanyMemberDto } from '@/features/fsm/types';
import type { CompanyRole } from '@/features/companies/roleAccess';

export type TeamRoleKey = CompanyRole;

export const TEAM_ROLE_ORDER: TeamRoleKey[] = ['OWNER', 'MANAGER', 'MEMBER'];

export const TEAM_ROLE_CONFIG: Record<
  TeamRoleKey,
  {
    label: string;
    sectionTitle: string;
    description: string;
    badgeTone: 'violet' | 'emerald' | 'amber' | 'blue' | 'gray';
    avatarClass: string;
    responsibilities: string[];
  }
> = {
  OWNER: {
    label: 'Proprietar',
    sectionTitle: 'Proprietar',
    description: 'Decizii finale, abonament și profil public al companiei.',
    badgeTone: 'violet',
    avatarClass: 'from-violet-600 to-indigo-700',
    responsibilities: [
      'Gestionează abonamentul',
      'Publică profilul companiei',
      'Invită manageri și tehnicieni',
    ],
  },
  MANAGER: {
    label: 'Manager',
    sectionTitle: 'Manageri',
    description: 'Operațiuni zilnice: clienți, lucrări, oferte și facturare.',
    badgeTone: 'blue',
    avatarClass: 'from-blue-500 to-cyan-600',
    responsibilities: [
      'CRM clienți și programări',
      'Coordonare tehnicieni',
      'Oferte, facturi și echipă',
    ],
  },
  MEMBER: {
    label: 'Tehnician',
    sectionTitle: 'Tehnicieni (lucrători)',
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

export function memberDisplayName(member: CompanyMemberDto): string {
  if (member.fullName?.trim()) return member.fullName.trim();
  const user = member.user;
  if (!user) return 'Membru';
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return full || user.email;
}

export function memberContactEmail(member: CompanyMemberDto): string | undefined {
  return member.email ?? member.user?.email;
}

export function memberContactPhone(member: CompanyMemberDto): string | undefined {
  return member.phone ?? member.user?.phone ?? undefined;
}

export function technicianDisplayName(technician?: CompanyMemberDto | null): string {
  if (!technician) return 'Neatribuit';
  return memberDisplayName(technician);
}

export function isAssignableTechnician(member: CompanyMemberDto): boolean {
  return member.role === 'MEMBER' && member.status === 'ACTIVE';
}

export function filterAssignableTechnicians(members: CompanyMemberDto[] | undefined): CompanyMemberDto[] {
  return (members ?? []).filter(isAssignableTechnician);
}

export function memberInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function groupMembersByRole(
  members: CompanyMemberDto[],
): Array<{ role: TeamRoleKey; items: CompanyMemberDto[] }> {
  const buckets = new Map<TeamRoleKey, CompanyMemberDto[]>(
    TEAM_ROLE_ORDER.map((role) => [role, []]),
  );

  for (const member of members) {
    const role = member.role as TeamRoleKey;
    if (buckets.has(role)) {
      buckets.get(role)!.push(member);
    }
  }

  for (const items of buckets.values()) {
    items.sort((a, b) => memberDisplayName(a).localeCompare(memberDisplayName(b), 'ro'));
  }

  return TEAM_ROLE_ORDER.map((role) => ({ role, items: buckets.get(role)! })).filter(
    (group) => group.items.length > 0,
  );
}
