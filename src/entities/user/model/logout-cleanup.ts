import type { QueryClient } from '@tanstack/react-query';
import type { Persister } from '@tanstack/query-persist-client-core';
type LogoutCleanup = () => void | Promise<void>;

const cleanups = new Set<LogoutCleanup>();

export function registerLogoutCleanup(cleanup: LogoutCleanup): () => void {
  cleanups.add(cleanup);
  return () => cleanups.delete(cleanup);
}

export async function runLogoutCleanup(): Promise<void> {
  for (const cleanup of Array.from(cleanups)) {
    try {
      await cleanup();
    } catch {
      /* never let one failure block the others */
    }
  }
}

export function bindLogoutCleanup(
  queryClient: QueryClient,
  persister: Persister,
): () => void {
  return registerLogoutCleanup(async () => {
    queryClient.cancelQueries();
    queryClient.clear();
    await persister.removeClient();
  });
}
