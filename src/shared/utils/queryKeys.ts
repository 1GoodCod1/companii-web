import { PERSISTED_QUERY_KEY_PREFIXES } from '@/shared/constants/queryKeys.constants';

export function matchesPersistedQueryKey(key: readonly unknown[]): boolean {
  if (key.length < 2) return false;
  return PERSISTED_QUERY_KEY_PREFIXES.some(
    ([root, segment]) => key[0] === root && key[1] === segment,
  );
}
