import type { Query } from '@tanstack/react-query';
import { matchesPersistedQueryKey } from '@/shared/utils/queryKeys';
import { QUERY_CACHE_PERSIST_MAX_AGE_MS } from '@/shared/constants/storage';

export function shouldPersistQuery(query: Query): boolean {
  const key = query.queryKey;
  if (!Array.isArray(key)) return false;
  return matchesPersistedQueryKey(key);
}

export const queryPersistOptions = {
  maxAge: QUERY_CACHE_PERSIST_MAX_AGE_MS,
  hydrateOptions: {
    defaultOptions: {},
  },
  dehydrateOptions: {
    shouldDehydrateQuery: shouldPersistQuery,
    shouldDehydrateMutation: () => false,
  },
} as const;
