import type { Query } from '@tanstack/react-query';
import { QUERY_CACHE_PERSIST_MAX_AGE_MS } from '@/constants/storage';

/** Only low-churn public catalog data — never auth/cabinet. */
export function shouldPersistQuery(query: Query): boolean {
  const key = query.queryKey;
  if (!Array.isArray(key) || key.length < 2) return false;
  const [root, second] = key;
  if (root === 'subscriptions' && second === 'plans') return true;
  if (root === 'packages' && second === 'list') return true;
  if (root === 'companies' && second === 'list') return true;
  return false;
}

export const queryPersistOptions = {
  maxAge: QUERY_CACHE_PERSIST_MAX_AGE_MS,
  dehydrateOptions: {
    shouldDehydrateQuery: shouldPersistQuery,
  },
} as const;
