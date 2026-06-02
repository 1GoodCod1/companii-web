import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import type { CompanySubscriptionPlanCode } from '@/entities/subscription/model/types';

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
