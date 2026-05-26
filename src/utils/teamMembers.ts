import { COMPANY_ROLE } from '@/constants/roles.constants';
import { TEAM_ROLE_ORDER } from '@/constants/teamRoles.constants';
import type { CompanyMemberDto } from '@/types/fsm';
import type { TeamRoleKey } from '@/types/team';
import { formatPersonName, personInitials } from '@/utils/person';

export function memberDisplayName(member: CompanyMemberDto): string {
  return formatPersonName(
    {
      fullName: member.fullName,
      firstName: member.user?.firstName,
      lastName: member.user?.lastName,
      email: member.user?.email,
    },
    'Membru',
  );
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
  return member.role === COMPANY_ROLE.MEMBER && member.status === 'ACTIVE';
}

export function filterAssignableTechnicians(
  members: CompanyMemberDto[] | undefined,
): CompanyMemberDto[] {
  return (members ?? []).filter(isAssignableTechnician);
}

export function memberInitials(name: string): string {
  return personInitials(name);
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
