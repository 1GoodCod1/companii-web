import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAuthStore } from '@/entities/user/model/authStore';
import type {
  BoardResponse,
  ColumnPage,
  PipelineEntity,
} from '../components/pipeline/pipeline.types';
import { FSM_BASE } from './fsmBase';

export function usePipelineBoardQuery(
  entity: PipelineEntity,
): UseQueryResult<BoardResponse, Error> {
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId);
  return useQuery<BoardResponse, Error>({
    queryKey: queryKeys.fsm.pipelineBoard(entity),
    queryFn: () => apiFetch<BoardResponse>(`${FSM_BASE}/pipeline/${entity}`),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId,
  });
}

/** Fetches the next page of a single column (load-more / infinite scroll). */
export function fetchPipelineColumn(
  entity: PipelineEntity,
  status: string,
  cursor: string,
): Promise<ColumnPage> {
  const params = new URLSearchParams({ status, cursor });
  return apiFetch<ColumnPage>(`${FSM_BASE}/pipeline/${entity}/column?${params.toString()}`);
}
