import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { uploadFile } from '@/api/files';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import { refreshAuthSession } from '@/features/auth/api/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyContextStore } from '@/stores/companyContextStore';
import { COMPANY_ROLE } from '@/constants/roles.constants';
import type { CompanyMeResponse } from '@/types/companies';
import type { AuthUserSnapshot } from '@/types/auth';

export function useCompanyMeQuery(): UseQueryResult<CompanyMeResponse, Error> {
  return useQuery<CompanyMeResponse, Error>({
    queryKey: queryKeys.companies.me,
    queryFn: () => apiFetch<CompanyMeResponse>('/companies/me'),
    ...cabinetQueryDefaults,
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
          companyRole: user.companyRole ?? COMPANY_ROLE.OWNER,
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
  const uploaded = await uploadFile(file, { visibility: 'PUBLIC' });
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
      void qc.invalidateQueries({ queryKey: queryKeys.companies.members });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.invitations });
      void qc.invalidateQueries({ queryKey: queryKeys.subscriptions.me });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customersRoot });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoices });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}
