import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';

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
