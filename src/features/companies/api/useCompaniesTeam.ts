import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import { refreshAuthSession } from '@/features/auth';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useCompanyContextStore } from '@/entities/company/model/companyContextStore';
import type { CompanyMemberDto } from '@/entities/fsm/model/types';
import type { CompanyRole, InvitableCompanyRole } from '@/entities/company/model/roles.types';
import type { AuthUserSnapshot } from '@/entities/user/model/auth.types';

export interface CompanyInvitationDto {
  id: string;
  invitedEmail: string | null;
  role: CompanyRole;
  status: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  company?: { name: string; slug: string };
}

export interface TeamInviteLinkResponse extends CompanyInvitationDto {
  company: { name: string; slug: string };
  inviteUrl?: string;
  emailSent?: boolean;
}

export interface TeamInvitePreviewDto {
  token: string;
  expiresAt: string;
  role: CompanyRole;
  invitedEmail: string | null;
  companyName: string;
  companySlug: string;
  alreadyMember: boolean;
}

export function buildTeamInviteUrl(token: string): string {
  if (typeof window === 'undefined') return `/team/invite?token=${encodeURIComponent(token)}`;
  return `${window.location.origin}/team/invite?token=${encodeURIComponent(token)}`;
}

export function useCompanyMembersQuery(options?: { enabled?: boolean }): UseQueryResult<CompanyMemberDto[], Error> {
  const enabled = options?.enabled ?? true;
  return useQuery<CompanyMemberDto[], Error>({
    queryKey: queryKeys.companies.members,
    queryFn: () => apiFetch<CompanyMemberDto[]>('/companies/members/list'),
    ...cabinetQueryDefaults,
    enabled,
  });
}

export function useCompanyInvitationsQuery(): UseQueryResult<CompanyInvitationDto[], Error> {
  return useQuery<CompanyInvitationDto[], Error>({
    queryKey: queryKeys.companies.invitations,
    queryFn: () => apiFetch<CompanyInvitationDto[]>('/companies/members/invitations'),
    ...cabinetQueryDefaults,
  });
}

export function useCreateTeamInviteLinkMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { role: InvitableCompanyRole; email?: string }) =>
      apiFetch<TeamInviteLinkResponse>('/companies/members/invite-link', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.invitations });
    },
  });
}

export function useAddTeamMemberDirectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { contact: string; role: InvitableCompanyRole }) =>
      apiFetch('/companies/members/add-direct', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.invitations });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.members });
    },
  });
}

export function useTeamInvitePreviewQuery(token: string) {
  return useQuery<TeamInvitePreviewDto, Error>({
    queryKey: queryKeys.companies.teamInvitePreview(token),
    queryFn: () =>
      apiFetch<TeamInvitePreviewDto>(
        `/companies/members/invitations/preview?token=${encodeURIComponent(token)}`,
      ),
    enabled: !!token,
    retry: false,
  });
}

export function useAcceptTeamInvitationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      apiFetch('/companies/members/invitations/accept', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    onSuccess: async () => {
      await refreshAuthSession();
      void qc.invalidateQueries({ queryKey: queryKeys.companies.members });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.me });
      void qc.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useUpdateMemberRoleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: InvitableCompanyRole }) =>
      apiFetch(`/companies/members/${memberId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.members });
    },
  });
}

export function useDeactivateMemberMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      apiFetch(`/companies/members/${memberId}/deactivate`, { method: 'POST' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.members });
    },
  });
}

export function useRevokeInvitationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      apiFetch(`/companies/members/invitations/${invitationId}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.invitations });
    },
  });
}

export function useTransferOwnershipMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ newOwnerUserId }: { newOwnerUserId: string }) =>
      apiFetch(`/companies/me/transfer-ownership`, {
        method: 'POST',
        body: JSON.stringify({ newOwnerUserId }),
      }),
    onSuccess: async () => {
      await refreshAuthSession();
      void qc.invalidateQueries({ queryKey: queryKeys.companies.me });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.members });
    },
  });
}

export function useLeaveCompanyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<{ accessToken: string; user: AuthUserSnapshot }>('/companies/members/leave', {
        method: 'POST',
      }),
    onSuccess: async (session) => {
      const { setTokens } = useAuthStore.getState();
      useCompanyContextStore.getState().setActiveCompanyId(session.user.activeCompanyId ?? null);
      setTokens(session.accessToken, session.user);
      await refreshAuthSession();
      void qc.invalidateQueries({ queryKey: queryKeys.companies.me });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.members });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}
