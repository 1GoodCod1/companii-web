import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { useAuthStore } from '@/entities/user/model/authStore';
import { FSM_BASE } from './fsmBase';

const base = `${FSM_BASE}/crews`;

const crewsKey = ['fsm', 'crews'] as const;
const crewKey = (id: string) => [...crewsKey, id] as const;

export interface CrewMemberDto {
  crewId: string;
  memberId: string;
  role: string | null;
  isLead: boolean;
  joinedAt: string;
  member: {
    id: string;
    fullName: string | null;
    phone: string | null;
    email: string | null;
    specialization: string | null;
    role: string;
    status: string;
  };
}

export interface CrewDto {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  color: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  members: CrewMemberDto[];
}

export function useCrewsQuery(opts?: {
  enabled?: boolean;
  includeInactive?: boolean;
}): UseQueryResult<CrewDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  const enabled = opts?.enabled ?? true;
  return useQuery<CrewDto[], Error>({
    queryKey: opts?.includeInactive ? [...crewsKey, { includeInactive: true }] : crewsKey,
    queryFn: () =>
      apiFetch<CrewDto[]>(
        opts?.includeInactive ? `${base}?includeInactive=true` : base,
      ),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId && enabled,
  });
}

export function useCrewQuery(id: string): UseQueryResult<CrewDto, Error> {
  return useQuery<CrewDto, Error>({
    queryKey: crewKey(id),
    queryFn: () => apiFetch<CrewDto>(`${base}/${id}`),
    ...cabinetQueryDefaults,
    enabled: !!id,
  });
}

export function useCreateCrewMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      description?: string;
      color?: string;
      memberIds?: string[];
      leadMemberId?: string;
    }) =>
      apiFetch<CrewDto>(base, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: crewsKey });
    },
  });
}

export function useUpdateCrewMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      description?: string | null;
      color?: string | null;
      isActive?: boolean;
      memberIds?: string[];
      leadMemberId?: string;
    }) =>
      apiFetch<CrewDto>(`${base}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: crewsKey });
      void qc.invalidateQueries({ queryKey: crewKey(id) });
    },
  });
}

export function useDeleteCrewMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`${base}/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: crewsKey });
    },
  });
}
