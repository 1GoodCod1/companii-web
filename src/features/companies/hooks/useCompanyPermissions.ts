import { useAuthStore } from '@/entities/user/model/authStore';
import { useCompanyContextStore } from '@/entities/company/model/companyContextStore';
import { useCompanyMeQuery } from '@/features/companies/api/useCompanies';
import { resolveCompanyRole } from '@/widgets/layout/cabinet-nav';
import {
  isManagementRole,
  isOwnerRole,
  isTechnicianRole,
} from '@/entities/company/model/roles';
import type { CompanyRole } from '@/entities/company/model/roles.types';
import { canAccessCompanyRoute } from '@/entities/company/model/roleAccess';
import { companyRoleCan } from '@/entities/company/model/rolePermissions';
import { resolveActiveCompany } from '@/features/companies/resolveActiveCompany';
import type { CompanyPermissionAction } from '@/entities/company/model/rolePermissions';

export function useCompanyPermissions() {
  const user = useAuthStore((s) => s.user);
  const memberId = user?.memberId;
  const contextCompanyId = useCompanyContextStore((s) => s.activeCompanyId);
  const activeCompanyId = contextCompanyId ?? user?.activeCompanyId;
  const { data: companyMe } = useCompanyMeQuery();

  const role = resolveCompanyRole(user?.companyRole, companyMe, activeCompanyId) as
    | CompanyRole
    | undefined;
  const { isOwner: isLegalOwner } = resolveActiveCompany(companyMe, activeCompanyId);
  const canRegisterCompany = (companyMe?.owned?.length ?? 0) === 0;

  const isOwner = isOwnerRole(role);
  const isManagement = isManagementRole(role);
  const isTechnician = isTechnicianRole(role);

  return {
    role,
    memberId,
    activeCompanyId,
    companyMe,
    isOwner,
    isLegalOwner,
    canRegisterCompany,
    isManagement,
    isTechnician,
    canAccessRoute: (routePath: string) => canAccessCompanyRoute(role, routePath),
    can: (action: CompanyPermissionAction) => companyRoleCan(role, action),
    canManageTeam: companyRoleCan(role, 'manage_team'),
    canInviteManagers: companyRoleCan(role, 'invite_manager'),
    canManageSubscription: companyRoleCan(role, 'manage_subscription'),
    canEditLegalProfile: isLegalOwner && companyRoleCan(role, 'edit_legal_profile'),
    canPublishCompany: isLegalOwner && companyRoleCan(role, 'publish_company'),
    canListAllMembers: companyRoleCan(role, 'manage_team'),
    canAssignTechnicians: companyRoleCan(role, 'create_interventions'),
    canCreateInterventions: companyRoleCan(role, 'create_interventions'),
    canDeleteInterventions: companyRoleCan(role, 'delete_interventions'),
    canGenerateInvoices: companyRoleCan(role, 'manage_invoices'),
    canEditInterventionDetails: companyRoleCan(role, 'update_intervention_details'),
    canEditAssignedInterventionFields: companyRoleCan(role, 'update_assigned_intervention'),
    canDeleteOwnNotes: companyRoleCan(role, 'delete_own_note') && !!memberId,
    canDeleteAnyNote: companyRoleCan(role, 'delete_any_note'),
  };
}
