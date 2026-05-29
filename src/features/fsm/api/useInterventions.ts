import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { cabinetQueryDefaults } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import type { InterventionDto, InterventionNoteDto, InterventionStatus } from '@/types/fsm';
import { FSM_BASE } from './fsmBase';

export function useInterventionsQuery(
  status?: InterventionStatus,
  customerId?: string,
  technicianId?: string,
): UseQueryResult<InterventionDto[], Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery<InterventionDto[], Error>({
    queryKey: [...queryKeys.fsm.interventions(status), customerId, technicianId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (customerId) params.append('customerId', customerId);
      if (technicianId) params.append('technicianId', technicianId);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      return apiFetch<InterventionDto[]>(`${FSM_BASE}/interventions${queryStr}`);
    },
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId,
  });
}

export function useInterventionQuery(id: string): UseQueryResult<InterventionDto, Error> {
  return useQuery<InterventionDto, Error>({
    queryKey: queryKeys.fsm.intervention(id),
    queryFn: () => apiFetch<InterventionDto>(`${FSM_BASE}/interventions/${id}`),
    ...cabinetQueryDefaults,
    enabled: !!id,
  });
}

export function useCreateInterventionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      customerId: string;
      type: string;
      description: string;
      address: string;
      technicianId?: string;
      assigneeMemberIds?: string[];
      crewId?: string;
      scheduledAt?: string;
      estimatedPrice?: number;
      internalNotes?: string;
    }) =>
      apiFetch<InterventionDto>(`${FSM_BASE}/interventions`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}

export function useUpdateInterventionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      type?: string;
      description?: string;
      address?: string;
      technicianId?: string | null;
      assigneeMemberIds?: string[];
      crewId?: string | null;
      scheduledAt?: string | null;
      estimatedPrice?: number | null;
      finalPrice?: number | null;
      internalNotes?: string | null;
    }) =>
      apiFetch<InterventionDto>(`${FSM_BASE}/interventions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.intervention(id) });
    },
  });
}

export function useUpdateInterventionStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: InterventionStatus; note?: string }) =>
      apiFetch<InterventionDto>(`${FSM_BASE}/interventions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.intervention(id) });
    },
  });
}

export function useDeleteInterventionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`${FSM_BASE}/interventions/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.intervention(id) });
    },
  });
}

export function useCreateInterventionNoteMutation(interventionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { body: string; isInternal?: boolean }) =>
      apiFetch<InterventionNoteDto>(`${FSM_BASE}/interventions/${interventionId}/notes`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.intervention(interventionId) });
    },
  });
}

export function useDeleteInterventionNoteMutation(interventionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) =>
      apiFetch<{ success: boolean }>(`${FSM_BASE}/interventions/${interventionId}/notes/${noteId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.intervention(interventionId) });
    },
  });
}

export function useAddInterventionPhotosMutation(interventionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileKeys: string[]) =>
      apiFetch(`${FSM_BASE}/interventions/${interventionId}/photos`, {
        method: 'POST',
        body: JSON.stringify({ fileKeys }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.intervention(interventionId) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.worksheetIntervention(interventionId) });
    },
  });
}

export function useDeleteInterventionPhotoMutation(interventionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) =>
      apiFetch(`${FSM_BASE}/interventions/${interventionId}/photos/${photoId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.intervention(interventionId) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.worksheetIntervention(interventionId) });
    },
  });
}

export function useUpdateChecklistMutation(interventionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (progress: Record<string, boolean>) =>
      apiFetch(`${FSM_BASE}/interventions/${interventionId}/checklist`, {
        method: 'PATCH',
        body: JSON.stringify({ progress }),
      }),
    // U-06: Optimistic — apply checklist change immediately, rollback on error.
    onMutate: async (progress) => {
      await qc.cancelQueries({ queryKey: queryKeys.estimates.worksheetIntervention(interventionId) });
      const previous = qc.getQueryData(queryKeys.estimates.worksheetIntervention(interventionId));
      if (previous && typeof previous === 'object' && 'intervention' in previous) {
        qc.setQueryData(queryKeys.estimates.worksheetIntervention(interventionId), {
          ...(previous as Record<string, unknown>),
          intervention: {
            ...((previous as Record<string, unknown>).intervention as Record<string, unknown>),
            checklistProgress: progress,
          },
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.estimates.worksheetIntervention(interventionId), context.previous);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.intervention(interventionId) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.worksheetIntervention(interventionId) });
    },
  });
}
