import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/queryKeys';
import { FSM_BASE } from './fsmBase';

export const SEARCH_ENTITY_TYPES = [
  'customer',
  'lead',
  'intervention',
  'quote',
  'invoice',
  'estimate',
  'service',
] as const;

export type SearchEntityType = (typeof SEARCH_ENTITY_TYPES)[number];

export interface GlobalSearchItem {
  type: SearchEntityType;
  id: string;
  title: string;
  subtitle: string | null;
  status: string | null;
  createdAt: string;
}

export interface GlobalSearchGroup {
  type: SearchEntityType;
  total: number;
  items: GlobalSearchItem[];
}

export interface GlobalSearchResponse {
  query: string;
  groups: GlobalSearchGroup[];
}

export function useGlobalSearchQuery(q: string): UseQueryResult<GlobalSearchResponse, Error> {
  const trimmed = q.trim();
  return useQuery<GlobalSearchResponse, Error>({
    queryKey: queryKeys.fsm.search(trimmed),
    queryFn: () =>
      apiFetch<GlobalSearchResponse>(`${FSM_BASE}/search?q=${encodeURIComponent(trimmed)}`),
    enabled: trimmed.length >= 2,
    staleTime: 15_000,
    placeholderData: (previous: GlobalSearchResponse | undefined) => previous,
  });
}
