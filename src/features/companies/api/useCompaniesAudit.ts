import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import type { AdminAuditLogDto } from '@/features/admin';

export function useCompanyAuditLogsQuery(
  companyId: string,
  filters: { action?: string; userId?: string; limit?: number } = {},
): UseQueryResult<AdminAuditLogDto[], Error> {
  const qs = new URLSearchParams();
  if (filters.action) qs.set('action', filters.action);
  if (filters.userId) qs.set('userId', filters.userId);
  if (filters.limit) qs.set('limit', String(filters.limit));
  const suffix = qs.toString() ? `?${qs}` : '';

  return useQuery<AdminAuditLogDto[], Error>({
    queryKey: ['companies', companyId, 'audit', filters],
    queryFn: () => apiFetch<AdminAuditLogDto[]>(`/companies/${companyId}/audit${suffix}`),
    ...cabinetQueryDefaults,
    enabled: !!companyId,
  });
}
