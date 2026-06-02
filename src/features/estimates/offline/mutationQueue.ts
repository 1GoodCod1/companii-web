import {
  idbClear,
  idbDelete,
  idbGet,
  idbGetAll,
  idbPut,
  STORE_META,
  STORE_QUEUE,
} from '@/entities/estimate/model/idb';

export type EstimateMutationKind =
  | 'update-project'
  | 'save-plan'
  | 'update-line'
  | 'add-line'
  | 'delete-line';

export type EstimateMutationPayload = Record<string, unknown>;

export type EstimateMutationRecord = {
  id?: number;
  projectId: string;
  kind: EstimateMutationKind;
  payload: EstimateMutationPayload;
  attempts: number;
  enqueuedAt: number;
  lastErrorAt?: number;
  clientMutationId?: string;
  draftVersion?: number;
};

export type EstimateMetaRecord = {
  lastSavedAt?: number;
  lastSyncedAt?: number;
  clientDraftId?: string;
  draftVersion?: number;
};

const META_PREFIX = 'project:';

export function metaKey(projectId: string): string {
  return `${META_PREFIX}${projectId}`;
}

export async function enqueueMutation(
  projectId: string,
  kind: EstimateMutationKind,
  payload: EstimateMutationPayload,
  meta?: { clientMutationId?: string; draftVersion?: number },
): Promise<number | undefined> {
  const record: EstimateMutationRecord = {
    projectId,
    kind,
    payload,
    attempts: 0,
    enqueuedAt: Date.now(),
    clientMutationId: meta?.clientMutationId,
    draftVersion: meta?.draftVersion,
  };
  try {
    await idbPut(STORE_QUEUE, record);
    return record.id;
  } catch {
    return undefined;
  }
}

export async function readMutationQueue(projectId?: string): Promise<EstimateMutationRecord[]> {
  try {
    if (projectId) {
      const all = await idbGetAll<EstimateMutationRecord>(STORE_QUEUE, 'projectId', projectId);
      return all.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    }
    const all = await idbGetAll<EstimateMutationRecord>(STORE_QUEUE);
    return all.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  } catch {
    return [];
  }
}

export async function removeMutation(id: number): Promise<void> {
  try {
    await idbDelete(STORE_QUEUE, id);
  } catch {
    /* ignore — queue read will retry next cycle */
  }
}

export async function markMutationFailed(record: EstimateMutationRecord): Promise<void> {
  if (record.id == null) return;
  const next: EstimateMutationRecord = {
    ...record,
    attempts: record.attempts + 1,
    lastErrorAt: Date.now(),
  };
  try {
    await idbPut(STORE_QUEUE, next);
  } catch {
    /* ignore */
  }
}

export function backoffDelayMs(attempts: number): number {
  return Math.min(30_000, 2 ** Math.max(0, attempts) * 1000);
}

export function isReady(record: EstimateMutationRecord, now: number = Date.now()): boolean {
  if (record.attempts === 0 || !record.lastErrorAt) return true;
  return now - record.lastErrorAt >= backoffDelayMs(record.attempts);
}

export type FlushHandler = (record: EstimateMutationRecord) => Promise<void>;

export type FlushReport = {
  attempted: number;
  succeeded: number;
  failed: number;
  remaining: number;
};

export async function flushMutationQueue(
  handler: FlushHandler,
  options: { projectId?: string; maxAttempts?: number; now?: number } = {},
): Promise<FlushReport> {
  const records = await readMutationQueue(options.projectId);
  const maxAttempts = options.maxAttempts ?? 8;
  const now = options.now ?? Date.now();
  const blockedByProject = new Set<string>();
  let attempted = 0;
  let succeeded = 0;
  let failed = 0;

  for (const record of records) {
    if (blockedByProject.has(record.projectId)) continue;
    if (record.attempts >= maxAttempts) continue;
    if (!isReady(record, now)) continue;

    attempted += 1;
    try {
      await handler(record);
      if (record.id != null) await removeMutation(record.id);
      succeeded += 1;
    } catch {
      await markMutationFailed(record);
      blockedByProject.add(record.projectId);
      failed += 1;
    }
  }

  const remaining = (await readMutationQueue(options.projectId)).length;
  return { attempted, succeeded, failed, remaining };
}

export async function getProjectMeta(projectId: string): Promise<EstimateMetaRecord | undefined> {
  try {
    return await idbGet<EstimateMetaRecord>(STORE_META, metaKey(projectId));
  } catch {
    return undefined;
  }
}

export async function setProjectMeta(projectId: string, meta: EstimateMetaRecord): Promise<void> {
  try {
    await idbPut(STORE_META, meta, metaKey(projectId));
  } catch {
    /* ignore */
  }
}

export async function clearOfflineQueue(): Promise<void> {
  try {
    await idbClear(STORE_QUEUE);
  } catch {
    /* ignore */
  }
}
