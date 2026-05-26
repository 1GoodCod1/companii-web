import type { Query } from '@tanstack/react-query';
import { matchesPersistedQueryKey } from '@/utils/queryKeys';
import { QUERY_CACHE_PERSIST_MAX_AGE_MS } from '@/constants/storage';

/** Only low-churn public catalog data — never auth/cabinet. */
export function shouldPersistQuery(query: Query): boolean {
  const key = query.queryKey;
  if (!Array.isArray(key)) return false;
  return matchesPersistedQueryKey(key);
}

export const queryPersistOptions = {
  maxAge: QUERY_CACHE_PERSIST_MAX_AGE_MS,
  dehydrateOptions: {
    shouldDehydrateQuery: shouldPersistQuery,
  },
} as const;
