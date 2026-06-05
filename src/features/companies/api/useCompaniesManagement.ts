import type { CompanyGalleryImageDto } from '@/entities/company/model/companies.types';
import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { uploadFile } from '@/shared/api/files';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import { refreshAuthSession } from '@/features/auth';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useCompanyContextStore } from '@/entities/company/model/companyContextStore';
import type { CompanyMeResponse } from '@/entities/company/model/companies.types';
import type { AuthUserSnapshot } from '@/entities/user/model/auth.types';

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
    onSuccess: async () => {
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
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch(`/companies/me`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.me });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function usePublishCompanyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch(`/companies/me/publish`, { method: 'PATCH' }),
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
      url,
      caption,
    }: {
      url: string;
      caption?: string;
    }) => addGalleryImageApi({ url, caption }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.companies.me });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function addGalleryImageApi(
  body: { url: string; caption?: string },
): Promise<CompanyGalleryImageDto> {
  return apiFetch<CompanyGalleryImageDto>(`/companies/me/gallery`, {
    method: 'POST',
    body: JSON.stringify({ url: body.url, caption: body.caption || undefined }),
  });
}

export function removeGalleryImageApi(imageId: string): Promise<void> {
  return apiFetch(`/companies/me/gallery/${imageId}`, { method: 'DELETE' });
}

export function useRemoveGalleryImageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId }: { imageId: string }) =>
      removeGalleryImageApi(imageId),
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
