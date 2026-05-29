import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import type { CompanySubscriptionPlanCode } from '@/types/subscriptions';

export interface AdminStatsDto {
  companies: number;
  users: number;
  interventions: number;
  waitlist: number;
}

export interface AdminCompanyDto {
  id: string;
  name: string;
  slug: string;
  isVerified: boolean;
  isPublished?: boolean;
  legalName?: string;
  idno?: string;
  legalAddress?: string;
  isTvaPayer?: boolean;
  tvaCode?: string | null;
  description?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  logoUrl?: string | null;
  rating?: number;
  totalReviews?: number;
  teamSize?: number;
  createdAt: string;
  updatedAt?: string;
  city?: { id?: string; name: string };
  category?: { id: string; name: string } | null;
  owner?: {
    id?: string;
    email: string;
    phone?: string | null;
    firstName: string | null;
    lastName: string | null;
    isActive?: boolean;
    createdAt?: string;
  };
  subscription?: {
    status: string;
    plan?: { code: CompanySubscriptionPlanCode; name: string };
  };
  galleryImages?: AdminCompanyGalleryImageDto[];
  documents?: AdminCompanyDocumentDto[];
  _count?: {
    members: number;
    customers: number;
    interventions: number;
    reviews: number;
    services: number;
  };
}

export interface AdminCompanyGalleryImageDto {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
}

export interface AdminCompanyDocumentDto {
  id: string;
  type: string;
  fileKey: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt: string | null;
  createdAt: string;
}

export interface AdminAuditLogDto {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface AdminWaitlistDto {
  id: string;
  email: string;
  companyName: string;
  createdAt: string;
}

export interface AdminReviewDto {
  id: string;
  rating: number;
  comment: string | null;
  clientName: string | null;
  status: 'PENDING' | 'VISIBLE' | 'HIDDEN';
  createdAt: string;
  company: { id: string; name: string; slug: string };
  author: { id: string; email: string; firstName: string | null; lastName: string | null };
  intervention: { id: string; number: string };
}

export function useAdminStatsQuery(): UseQueryResult<AdminStatsDto, Error> {
  return useQuery<AdminStatsDto, Error>({
    queryKey: queryKeys.admin.stats,
    queryFn: () => apiFetch<AdminStatsDto>('/admin/stats'),
    ...cabinetQueryDefaults,
  });
}

export function useAdminPendingCompaniesQuery(): UseQueryResult<AdminCompanyDto[], Error> {
  return useQuery<AdminCompanyDto[], Error>({
    queryKey: queryKeys.admin.pending,
    queryFn: () => apiFetch<AdminCompanyDto[]>('/admin/companies/pending'),
    ...cabinetQueryDefaults,
  });
}

export function useAdminCompaniesQuery(): UseQueryResult<AdminCompanyDto[], Error> {
  return useQuery<AdminCompanyDto[], Error>({
    queryKey: queryKeys.admin.companies,
    queryFn: () => apiFetch<AdminCompanyDto[]>('/admin/companies'),
    ...cabinetQueryDefaults,
  });
}

export function useAdminCompanyQuery(
  companyId: string | null,
): UseQueryResult<AdminCompanyDto, Error> {
  return useQuery<AdminCompanyDto, Error>({
    queryKey: queryKeys.admin.company(companyId ?? ''),
    queryFn: () => apiFetch<AdminCompanyDto>(`/admin/companies/${companyId}`),
    enabled: !!companyId,
    ...cabinetQueryDefaults,
  });
}

export function useAdminAuditQuery(filters: {
  entityType?: string;
  entityId?: string;
  action?: string;
}): UseQueryResult<AdminAuditLogDto[], Error> {
  return useQuery<AdminAuditLogDto[], Error>({
    queryKey: queryKeys.admin.audit(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.entityType) params.set('entityType', filters.entityType);
      if (filters.entityId) params.set('entityId', filters.entityId);
      if (filters.action) params.set('action', filters.action);
      const qs = params.toString();
      return apiFetch<AdminAuditLogDto[]>(`/admin/audit${qs ? `?${qs}` : ''}`);
    },
    ...cabinetQueryDefaults,
  });
}

export function useAdminWaitlistQuery(): UseQueryResult<AdminWaitlistDto[], Error> {
  return useQuery<AdminWaitlistDto[], Error>({
    queryKey: queryKeys.admin.waitlist,
    queryFn: () => apiFetch<AdminWaitlistDto[]>('/admin/waitlist'),
    ...cabinetQueryDefaults,
  });
}

export function useAdminReviewsQuery(): UseQueryResult<AdminReviewDto[], Error> {
  return useQuery<AdminReviewDto[], Error>({
    queryKey: queryKeys.admin.reviews,
    queryFn: () => apiFetch<AdminReviewDto[]>('/admin/reviews'),
    ...cabinetQueryDefaults,
  });
}

function invalidateCompanyModeration(qc: ReturnType<typeof useQueryClient>, companyId?: string) {
  void qc.invalidateQueries({ queryKey: queryKeys.admin.pending });
  void qc.invalidateQueries({ queryKey: queryKeys.admin.companies });
  void qc.invalidateQueries({ queryKey: queryKeys.admin.stats });
  if (companyId) {
    void qc.invalidateQueries({ queryKey: queryKeys.admin.company(companyId) });
    void qc.invalidateQueries({
      queryKey: queryKeys.admin.audit({ entityType: 'Company', entityId: companyId }),
    });
  }
}

export function useVerifyCompanyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, note }: { companyId: string; note?: string }) =>
      apiFetch(`/admin/companies/${companyId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ note }),
      }),
    onSuccess: (_data, vars) => invalidateCompanyModeration(qc, vars.companyId),
  });
}

export function useRejectCompanyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, note }: { companyId: string; note?: string }) =>
      apiFetch(`/admin/companies/${companyId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ note }),
      }),
    onSuccess: (_data, vars) => invalidateCompanyModeration(qc, vars.companyId),
  });
}

export function useUnpublishCompanyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, note }: { companyId: string; note?: string }) =>
      apiFetch(`/admin/companies/${companyId}/unpublish`, {
        method: 'PATCH',
        body: JSON.stringify({ note }),
      }),
    onSuccess: (_data, vars) => invalidateCompanyModeration(qc, vars.companyId),
  });
}

export function useModerateReviewMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'VISIBLE' | 'HIDDEN' }) =>
      apiFetch<AdminReviewDto>(`/admin/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.reviews });
    },
  });
}

export interface AdminCityDto {
  id: string;
  name: string;
  slug: string;
  translations?: Record<string, { name?: string }> | null;
  _count?: { companies: number };
}

export interface AdminCategoryDto {
  id: string;
  name: string;
  slug: string;
  translations?: Record<string, { name?: string }> | null;
  _count?: { companies: number; companyServices: number };
}

export interface AdminClientDto {
  id: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: string;
  portalCustomer?: {
    id: string;
    fullName: string;
    company?: { id: string; name: string };
  } | null;
}

export function useAdminCitiesQuery(): UseQueryResult<AdminCityDto[], Error> {
  return useQuery<AdminCityDto[], Error>({
    queryKey: queryKeys.admin.cities,
    queryFn: () => apiFetch<AdminCityDto[]>('/admin/cities'),
    ...cabinetQueryDefaults,
  });
}

export function useCreateAdminCityMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      slug?: string;
      translations?: Record<string, { name?: string }>;
    }) =>
      apiFetch<AdminCityDto>('/admin/cities', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.cities });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useUpdateAdminCityMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: {
      id: string;
      name?: string;
      slug?: string;
      translations?: Record<string, { name?: string }>;
    }) =>
      apiFetch<AdminCityDto>(`/admin/cities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.cities });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useDeleteAdminCityMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/cities/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.cities });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useAdminCategoriesQuery(): UseQueryResult<AdminCategoryDto[], Error> {
  return useQuery<AdminCategoryDto[], Error>({
    queryKey: queryKeys.admin.categories,
    queryFn: () => apiFetch<AdminCategoryDto[]>('/admin/categories'),
    ...cabinetQueryDefaults,
  });
}

export function useCreateAdminCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      slug?: string;
      translations?: Record<string, { name?: string }>;
    }) =>
      apiFetch<AdminCategoryDto>('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.categories });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useUpdateAdminCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: {
      id: string;
      name?: string;
      slug?: string;
      translations?: Record<string, { name?: string }>;
    }) =>
      apiFetch<AdminCategoryDto>(`/admin/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.categories });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useDeleteAdminCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.categories });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useAdminClientsQuery(): UseQueryResult<AdminClientDto[], Error> {
  return useQuery<AdminClientDto[], Error>({
    queryKey: queryKeys.admin.clients,
    queryFn: () => apiFetch<AdminClientDto[]>('/admin/clients'),
    ...cabinetQueryDefaults,
  });
}
export function useUpdateAdminClientMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch<AdminClientDto>(`/admin/clients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.clients });
    },
  });
}

export interface AdminBlueprintDto {
  id: string;
  categoryId: string;
  name: string;
  version: number;
  config: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string; slug: string };
  _count?: { projects: number };
}

export function useAdminBlueprintsQuery(): UseQueryResult<AdminBlueprintDto[], Error> {
  return useQuery<AdminBlueprintDto[], Error>({
    queryKey: queryKeys.admin.blueprints,
    queryFn: () => apiFetch<AdminBlueprintDto[]>('/admin/blueprints'),
    ...cabinetQueryDefaults,
  });
}

export function useCreateAdminBlueprintMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      categoryId: string;
      name: string;
      version?: number;
      config: Record<string, any>;
      isActive?: boolean;
    }) =>
      apiFetch<AdminBlueprintDto>('/admin/blueprints', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.blueprints });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.blueprints });
    },
  });
}

export function useUpdateAdminBlueprintMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      version?: number;
      config?: Record<string, any>;
      isActive?: boolean;
    }) =>
      apiFetch<AdminBlueprintDto>(`/admin/blueprints/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.blueprints });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.blueprints });
    },
  });
}

export function useDeleteAdminBlueprintMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/blueprints/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.blueprints });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.blueprints });
    },
  });
}
