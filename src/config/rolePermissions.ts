import type { CompanyRole } from '@/features/companies/roleAccess';

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

const ALL_MANAGEMENT: CompanyRole[] = ['OWNER', 'MANAGER'];
const OWNER_ONLY: CompanyRole[] = ['OWNER'];
const ANY_MEMBER: CompanyRole[] = ['OWNER', 'MANAGER', 'MEMBER'];

/** Role permission matrix for company cabinet UI. */
export const COMPANY_ROLE_PERMISSIONS: Record<
  CompanyPermissionAction,
  CompanyRole[]
> = {
  manage_subscription: OWNER_ONLY,
  transfer_ownership: OWNER_ONLY,
  publish_company: OWNER_ONLY,
  edit_legal_profile: OWNER_ONLY,
  manage_team: ALL_MANAGEMENT,
  invite_manager: OWNER_ONLY,
  manage_public_services: ALL_MANAGEMENT,
  manage_customers: ALL_MANAGEMENT,
  manage_leads: ALL_MANAGEMENT,
  create_interventions: ALL_MANAGEMENT,
  delete_interventions: ALL_MANAGEMENT,
  update_intervention_details: ALL_MANAGEMENT,
  update_assigned_intervention: ANY_MEMBER,
  change_intervention_status: ANY_MEMBER,
  manage_internal_services: ALL_MANAGEMENT,
  manage_quotes: ALL_MANAGEMENT,
  manage_invoices: ALL_MANAGEMENT,
  manage_estimates: ALL_MANAGEMENT,
  view_reviews: ALL_MANAGEMENT,
  delete_any_note: ALL_MANAGEMENT,
  delete_own_note: ANY_MEMBER,
};

export function companyRoleCan(
  role: CompanyRole | undefined,
  action: CompanyPermissionAction,
): boolean {
  if (!role) return false;
  return COMPANY_ROLE_PERMISSIONS[action].includes(role);
}
