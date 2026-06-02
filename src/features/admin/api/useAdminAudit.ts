import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';

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
