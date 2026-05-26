import { COMPANY_ROLE } from '@/constants/roles.constants';
import type { InvitableCompanyRole } from '@/types/roles';
import {
  SoftBadge,
  cabinetBtnSecondary,
  cabinetSelectClass,
} from '@/components/cabinet/cabinet-ui';
import type { CompanyMemberDto } from '@/types/fsm';
import { TEAM_ROLE_CONFIG } from '@/constants/teamRoles.constants';
import type { TeamRoleKey } from '@/types/team';
import {
  memberContactEmail,
  memberContactPhone,
  memberDisplayName,
  memberInitials,
} from '@/utils/teamMembers';
import { formatDateRoOrNull } from '@/utils/date';

function TeamMemberCard({
  member,
  currentUserId,
  canManage,
  canInviteManagers,
  onChangeRole,
  onDeactivate,
}: {
  member: CompanyMemberDto;
  currentUserId?: string;
  canManage: boolean;
  canInviteManagers: boolean;
  onChangeRole: (memberId: string, role: InvitableCompanyRole) => void;
  onDeactivate: (memberId: string) => void;
}) {
  const config = TEAM_ROLE_CONFIG[member.role as TeamRoleKey];
  const name = memberDisplayName(member);
  const email = memberContactEmail(member);
  const phone = memberContactPhone(member);
  const joined = formatDateRoOrNull(member.joinedAt ?? member.createdAt, 'medium');
  const jobCount = member._count?.interventions ?? 0;
  const isSelf = member.userId === currentUserId;
  const canModify =
    canManage &&
    !isSelf &&
    member.role !== COMPANY_ROLE.OWNER &&
    (canInviteManagers || member.role === COMPANY_ROLE.MEMBER);

  return (
    <li className="rounded-2xl border border-gray-100/80 bg-white/70 p-4 shadow-xs">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${config.avatarClass} text-sm font-black text-white shadow-sm`}
        >
          {memberInitials(name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-gray-900 truncate">{name}</p>
            <SoftBadge tone={config.badgeTone}>{config.label}</SoftBadge>
          </div>

          <div className="mt-2 space-y-1 text-xs text-gray-600">
            {email ? (
              <p className="truncate">
                <span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px] mr-1.5">
                  Email
                </span>
                {email}
              </p>
            ) : null}
            {phone ? (
              <p className="truncate">
                <span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px] mr-1.5">
                  Telefon
                </span>
                {phone}
              </p>
            ) : null}
            {member.specialization ? (
              <p className="truncate">
                <span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px] mr-1.5">
                  Specializare
                </span>
                {member.specialization}
              </p>
            ) : null}
            {joined ? (
              <p>
                <span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px] mr-1.5">
                  În echipă din
                </span>
                {joined}
              </p>
            ) : null}
            {member.role === COMPANY_ROLE.MEMBER ? (
              <p>
                <span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px] mr-1.5">
                  Lucrări alocate
                </span>
                {jobCount}
              </p>
            ) : null}
          </div>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {config.responsibilities.map((item) => (
              <li
                key={item}
                className="rounded-lg bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-500"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {canModify ? (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
            {canInviteManagers && member.role !== COMPANY_ROLE.OWNER ? (
              <select
                value={member.role === COMPANY_ROLE.MANAGER ? COMPANY_ROLE.MANAGER : COMPANY_ROLE.MEMBER}
                onChange={(e) =>
                  onChangeRole(member.id, e.target.value as InvitableCompanyRole)
                }
                className={cabinetSelectClass}
              >
                <option value={COMPANY_ROLE.MEMBER}>Tehnician</option>
                <option value={COMPANY_ROLE.MANAGER}>Manager</option>
              </select>
            ) : null}
            <button
              type="button"
              onClick={() => onDeactivate(member.id)}
              className={cabinetBtnSecondary}
            >
              Elimină din echipă
            </button>
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function TeamRoleSection({
  role,
  items,
  currentUserId,
  canManage,
  canInviteManagers,
  onChangeRole,
  onDeactivate,
}: {
  role: TeamRoleKey;
  items: CompanyMemberDto[];
  currentUserId?: string;
  canManage: boolean;
  canInviteManagers: boolean;
  onChangeRole: (memberId: string, role: InvitableCompanyRole) => void;
  onDeactivate: (memberId: string) => void;
}) {
  const config = TEAM_ROLE_CONFIG[role];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-800">
            {config.sectionTitle}
          </h3>
          <p className="mt-1 text-xs text-gray-500 max-w-xl">{config.description}</p>
        </div>
        <span className="text-xs font-semibold text-gray-400">
          {items.length} {items.length === 1 ? 'persoană' : 'persoane'}
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((member) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            currentUserId={currentUserId}
            canManage={canManage}
            canInviteManagers={canInviteManagers}
            onChangeRole={onChangeRole}
            onDeactivate={onDeactivate}
          />
        ))}
      </ul>
    </section>
  );
}
