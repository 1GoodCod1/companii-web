import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';

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

export function useAdminReviewsQuery(): UseQueryResult<AdminReviewDto[], Error> {
  return useQuery<AdminReviewDto[], Error>({
    queryKey: queryKeys.admin.reviews,
    queryFn: () => apiFetch<AdminReviewDto[]>('/admin/reviews'),
    ...cabinetQueryDefaults,
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
