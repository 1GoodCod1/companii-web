import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { uploadFile } from '@/api/files';
import {
  cabinetQueryDefaults,
  publicDetailQueryOptions,
  publicListQueryOptions,
} from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import { refreshAuthSession } from '@/features/auth/api/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyContextStore } from '@/stores/companyContextStore';
import type { AuthUserSnapshot } from '@/features/auth/types';
import type { CompanyMemberDto } from '@/features/fsm/types';
import type {
  CatalogOptionDto,
  CompaniesListResponse,
  CompanyMeResponse,
  PublicCompanyDetailDto,
} from '@/features/companies/types';

export function useCompaniesListQuery(
  filters: Record<string, string | undefined> = {},
): UseQueryResult<CompaniesListResponse, Error> {
  const qs = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v && qs.set(k, v));
  const suffix = qs.toString() ? `?${qs}` : '';
  return useQuery<CompaniesListResponse, Error>({
    queryKey: queryKeys.companies.list(filters),
    queryFn: () => apiFetch<CompaniesListResponse>(`/companies${suffix}`),
    ...publicListQueryOptions,
  });
}

export function useCompanyMeQuery(): UseQueryResult<CompanyMeResponse, Error> {
  return useQuery<CompanyMeResponse, Error>({
    queryKey: queryKeys.companies.me,
    queryFn: () => apiFetch<CompanyMeResponse>('/companies/me'),
    ...cabinetQueryDefaults,
  });
}

export function useCompanyMembersQuery(options?: { enabled?: boolean }): UseQueryResult<CompanyMemberDto[], Error> {
  const enabled = options?.enabled ?? true;
  return useQuery<CompanyMemberDto[], Error>({
    queryKey: ['companies', 'members'] as const,
    queryFn: () => apiFetch<CompanyMemberDto[]>('/companies/members/list'),
    ...cabinetQueryDefaults,
    enabled,
  });
}

export interface CompanyInvitationDto {
  id: string;
  invitedEmail: string | null;
  role: 'OWNER' | 'MANAGER' | 'MEMBER';
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
  role: 'OWNER' | 'MANAGER' | 'MEMBER';
  invitedEmail: string | null;
  companyName: string;
  companySlug: string;
  alreadyMember: boolean;
}

export function buildTeamInviteUrl(token: string): string {
  if (typeof window === 'undefined') return `/team/invite?token=${encodeURIComponent(token)}`;
  return `${window.location.origin}/team/invite?token=${encodeURIComponent(token)}`;
}

export function useCompanyInvitationsQuery(): UseQueryResult<CompanyInvitationDto[], Error> {
  return useQuery<CompanyInvitationDto[], Error>({
    queryKey: ['companies', 'invitations'] as const,
    queryFn: () => apiFetch<CompanyInvitationDto[]>('/companies/members/invitations'),
    ...cabinetQueryDefaults,
  });
}

export function useCreateTeamInviteLinkMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { role: 'MANAGER' | 'MEMBER'; email?: string }) =>
      apiFetch<TeamInviteLinkResponse>('/companies/members/invite-link', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', 'invitations'] });
    },
  });
}

export function useAddTeamMemberDirectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { contact: string; role: 'MANAGER' | 'MEMBER' }) =>
      apiFetch('/companies/members/add-direct', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      void qc.invalidateQueries({ queryKey: ['companies', 'invitations'] });
      void qc.invalidateQueries({ queryKey: ['companies', 'members'] });
    },
  });
}

export function useTeamInvitePreviewQuery(token: string) {
  return useQuery<TeamInvitePreviewDto, Error>({
    queryKey: ['team', 'invite-preview', token],
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
      void qc.invalidateQueries({ queryKey: ['companies', 'members'] });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.me });
      void qc.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useCitiesQuery(): UseQueryResult<CatalogOptionDto[], Error> {
  return useQuery<CatalogOptionDto[], Error>({
    queryKey: ['companies', 'cities'] as const,
    queryFn: () => apiFetch<CatalogOptionDto[]>('/companies/cities'),
    ...publicListQueryOptions,
  });
}

export function useCategoriesQuery(): UseQueryResult<CatalogOptionDto[], Error> {
  return useQuery<CatalogOptionDto[], Error>({
    queryKey: ['companies', 'categories'] as const,
    queryFn: () => apiFetch<CatalogOptionDto[]>('/companies/categories'),
    ...publicListQueryOptions,
  });
}

export function useCompanyBySlugQuery(
  slug: string,
): UseQueryResult<PublicCompanyDetailDto, Error> {
  return useQuery<PublicCompanyDetailDto, Error>({
    queryKey: queryKeys.companies.detail(slug),
    queryFn: () => apiFetch<PublicCompanyDetailDto>(`/companies/${slug}`),
    enabled: !!slug,
    ...publicDetailQueryOptions,
  });
}

export function useCreateCompanyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<{ id: string }>('/companies', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: async (company) => {
      const { accessToken, user, setTokens } = useAuthStore.getState();
      useCompanyContextStore.getState().setActiveCompanyId(company.id);
      if (user && accessToken) {
        setTokens(accessToken, {
          ...user,
          activeCompanyId: company.id,
          companyRole: user.companyRole ?? 'OWNER',
        });
      }
      await refreshAuthSession();
      void qc.invalidateQueries({ queryKey: queryKeys.companies.me });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
      void qc.invalidateQueries({ queryKey: queryKeys.subscriptions.me });
    },
  });
}

export function useUpdateCompanyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [key: string]: unknown }) =>
      apiFetch(`/companies/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.me });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function usePublishCompanyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (companyId: string) =>
      apiFetch(`/companies/${companyId}/publish`, { method: 'PATCH' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.me });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useAddGalleryImageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      companyId,
      url,
      caption,
    }: {
      companyId: string;
      url: string;
      caption?: string;
    }) =>
      apiFetch(`/companies/${companyId}/gallery`, {
        method: 'POST',
        body: JSON.stringify({ url, caption: caption || undefined }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.me });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useRemoveGalleryImageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, imageId }: { companyId: string; imageId: string }) =>
      apiFetch(`/companies/${companyId}/gallery/${imageId}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.me });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export async function uploadCompanyLogo(file: File): Promise<string> {
  const uploaded = await uploadFile(file);
  return uploaded.url;
}

export function useSwitchCompanyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (companyId: string) =>
      apiFetch<{ accessToken: string; user: AuthUserSnapshot }>('/companies/switch', {
        method: 'POST',
        body: JSON.stringify({ companyId }),
      }),
    onSuccess: async (session) => {
      const { setTokens } = useAuthStore.getState();
      useCompanyContextStore.getState().setActiveCompanyId(session.user.activeCompanyId ?? null);
      setTokens(session.accessToken, session.user);
      await refreshAuthSession();
      void qc.invalidateQueries({ queryKey: queryKeys.companies.me });
      void qc.invalidateQueries({ queryKey: ['companies', 'members'] });
      void qc.invalidateQueries({ queryKey: ['companies', 'invitations'] });
      void qc.invalidateQueries({ queryKey: queryKeys.subscriptions.me });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customers });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoices });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}

export function useUpdateMemberRoleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: 'MANAGER' | 'MEMBER' }) =>
      apiFetch(`/companies/members/${memberId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', 'members'] });
    },
  });
}

export function useDeactivateMemberMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      apiFetch(`/companies/members/${memberId}/deactivate`, { method: 'POST' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', 'members'] });
    },
  });
}

export function useRevokeInvitationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      apiFetch(`/companies/members/invitations/${invitationId}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', 'invitations'] });
    },
  });
}

export function useTransferOwnershipMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      companyId,
      newOwnerUserId,
    }: {
      companyId: string;
      newOwnerUserId: string;
    }) =>
      apiFetch(`/companies/${companyId}/transfer-ownership`, {
        method: 'POST',
        body: JSON.stringify({ newOwnerUserId }),
      }),
    onSuccess: async () => {
      await refreshAuthSession();
      void qc.invalidateQueries({ queryKey: queryKeys.companies.me });
      void qc.invalidateQueries({ queryKey: ['companies', 'members'] });
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
      void qc.invalidateQueries({ queryKey: ['companies', 'members'] });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}

export function useRequestPublicServiceMutation(companySlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      serviceId: string;
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      message?: string;
      scheduledAt?: string;
    }) =>
      apiFetch<{ leadId: string }>(`/companies/${companySlug}/services/${body.serviceId}/request`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.detail(companySlug) });
    },
  });
}
