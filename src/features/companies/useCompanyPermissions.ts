import { useAuthStore } from '@/stores/authStore';
import { useCompanyContextStore } from '@/stores/companyContextStore';
import { useCompanyMeQuery } from '@/features/companies/api/useCompanies';
import { resolveCompanyRole } from '@/components/layout/cabinet-nav';
import {
  canAccessCompanyRoute,
  isManagementRole,
  isTechnicianRole,
  type CompanyRole,
} from '@/features/companies/roleAccess';
import { resolveActiveCompany } from '@/features/companies/resolveActiveCompany';

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

  const isOwner = role === 'OWNER';
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
    canManageTeam: isManagement,
    canInviteManagers: isOwner,
    canManageSubscription: isOwner,
    canEditLegalProfile: isLegalOwner,
    canPublishCompany: isLegalOwner,
    canListAllMembers: isManagement,
    canAssignTechnicians: isManagement,
    canCreateInterventions: isManagement,
    canDeleteInterventions: isManagement,
    canGenerateInvoices: isManagement,
    canEditInterventionDetails: isManagement,
    canEditAssignedInterventionFields: !!role && !isManagement,
    canDeleteOwnNotes: !!memberId,
    canDeleteAnyNote: isManagement,
  };
}
