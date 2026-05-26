import { COMPANY_ROLE_GROUPS } from '@/constants/roles.constants';
import type { CompanyRole } from '@/types/roles';

export type CompanyPermissionAction =
  | 'manage_subscription'
  | 'transfer_ownership'
  | 'publish_company'
  | 'edit_legal_profile'
  | 'manage_team'
  | 'invite_manager'
  | 'manage_public_services'
  | 'manage_customers'
  | 'manage_leads'
  | 'create_interventions'
  | 'delete_interventions'
  | 'update_intervention_details'
  | 'update_assigned_intervention'
  | 'change_intervention_status'
  | 'manage_internal_services'
  | 'manage_quotes'
  | 'manage_invoices'
  | 'manage_estimates'
  | 'view_reviews'
  | 'delete_any_note'
  | 'delete_own_note';

export const COMPANY_ROLE_PERMISSIONS: Record<
  CompanyPermissionAction,
  readonly CompanyRole[]
> = {
  manage_subscription: COMPANY_ROLE_GROUPS.OWNER_ONLY,
  transfer_ownership: COMPANY_ROLE_GROUPS.OWNER_ONLY,
  publish_company: COMPANY_ROLE_GROUPS.OWNER_ONLY,
  edit_legal_profile: COMPANY_ROLE_GROUPS.OWNER_ONLY,
  manage_team: COMPANY_ROLE_GROUPS.MANAGEMENT,
  invite_manager: COMPANY_ROLE_GROUPS.OWNER_ONLY,
  manage_public_services: COMPANY_ROLE_GROUPS.MANAGEMENT,
  manage_customers: COMPANY_ROLE_GROUPS.MANAGEMENT,
  manage_leads: COMPANY_ROLE_GROUPS.MANAGEMENT,
  create_interventions: COMPANY_ROLE_GROUPS.MANAGEMENT,
  delete_interventions: COMPANY_ROLE_GROUPS.MANAGEMENT,
  update_intervention_details: COMPANY_ROLE_GROUPS.MANAGEMENT,
  update_assigned_intervention: COMPANY_ROLE_GROUPS.ALL_STAFF,
  change_intervention_status: COMPANY_ROLE_GROUPS.ALL_STAFF,
  manage_internal_services: COMPANY_ROLE_GROUPS.MANAGEMENT,
  manage_quotes: COMPANY_ROLE_GROUPS.MANAGEMENT,
  manage_invoices: COMPANY_ROLE_GROUPS.MANAGEMENT,
  manage_estimates: COMPANY_ROLE_GROUPS.MANAGEMENT,
  view_reviews: COMPANY_ROLE_GROUPS.MANAGEMENT,
  delete_any_note: COMPANY_ROLE_GROUPS.MANAGEMENT,
  delete_own_note: COMPANY_ROLE_GROUPS.ALL_STAFF,
};

export function companyRoleCan(
  role: CompanyRole | undefined,
  action: CompanyPermissionAction,
): boolean {
  if (!role) return false;
  return COMPANY_ROLE_PERMISSIONS[action].includes(role);
}

