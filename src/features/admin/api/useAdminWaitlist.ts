import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';

export interface AdminWaitlistDto {
  id: string;
  email: string;
  companyName: string;
  createdAt: string;
}

export function useAdminWaitlistQuery(): UseQueryResult<AdminWaitlistDto[], Error> {
  return useQuery<AdminWaitlistDto[], Error>({
    queryKey: queryKeys.admin.waitlist,
    queryFn: () => apiFetch<AdminWaitlistDto[]>('/admin/waitlist'),
    ...cabinetQueryDefaults,
  });
}
