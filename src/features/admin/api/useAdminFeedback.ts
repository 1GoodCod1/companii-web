import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';

export interface AdminFeedbackDto {
  id: string;
  category: string;
  details: string;
  createdAt: string;
  user: { id: string; email: string; firstName: string | null; lastName: string | null };
  company: { id: string; name: string } | null;
  project: { id: string; number: string; title: string } | null;
}

export function useAdminFeedbackQuery(): UseQueryResult<AdminFeedbackDto[], Error> {
  return useQuery<AdminFeedbackDto[], Error>({
    queryKey: queryKeys.admin.feedback,
    queryFn: () => apiFetch<AdminFeedbackDto[]>('/admin/feedback'),
    ...cabinetQueryDefaults,
  });
}
