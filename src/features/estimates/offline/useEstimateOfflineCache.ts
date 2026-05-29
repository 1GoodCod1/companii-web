import { useCallback, useEffect, useRef, useState } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { Plan2dData } from '@/types/estimate-plan2d.types';
import type { CustomPricingValues } from '../utils/customPricing';
import {
  clearDraft,
  readDraft,
  writeDraft,
  type EstimateDraft,
} from './draftCache';
import {
  enqueueMutation,
  flushMutationQueue,
  getProjectMeta,
  readMutationQueue,
  setProjectMeta,
  type EstimateMutationKind,
  type EstimateMutationPayload,
  type EstimateMutationRecord,
  type FlushHandler,
} from './mutationQueue';
import {
  extractConflict,
  newClientDraftId,
  newClientMutationId,
  type EstimateVersionConflict,
} from './conflictResolution';

export type OfflineSyncState = 'idle' | 'offline' | 'syncing' | 'error';

export type OfflineCacheState = {
  online: boolean;
  syncState: OfflineSyncState;
  pendingMutations: number;
  lastSavedAt?: number;
  lastSyncedAt?: number;
  clientDraftId?: string;
  draftVersion?: number;
  conflict: EstimateVersionConflict | null;
};

const AUTOSAVE_DEBOUNCE_MS = 600;

export type WizardSnapshot = {
  title?: string;
  siteType?: string;
  address?: string;
  marginPct?: number;
  riskReservePct?: number;
  buildingYear?: number | null;
  siteFloor?: number | null;
  accessDifficulty?: string | null;
  urgency?: string | null;
  diagnostic?: Record<string, unknown>;
  customPricing?: CustomPricingValues;
  plan2d?: Plan2dData;
};

export function useEstimateOfflineCache(projectId: string | undefined) {
  const online = useOnlineStatus();
  const [state, setState] = useState<OfflineCacheState>({
    online,
    syncState: online ? 'idle' : 'offline',
    pendingMutations: 0,
    conflict: null,
  });
  const lastSnapshotRef = useRef<string>('');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftIdRef = useRef<string | undefined>(undefined);
  const draftVersionRef = useRef<number>(0);

  const ensureDraftId = useCallback(async (): Promise<string | undefined> => {
    if (!projectId) return undefined;
    if (draftIdRef.current) return draftIdRef.current;
    const id = newClientDraftId();
    draftIdRef.current = id;
    return id;
  }, [projectId]);

  const refreshPending = useCallback(async () => {
    if (!projectId) return;
    const queue = await readMutationQueue(projectId);
    const meta = await getProjectMeta(projectId);
    if (meta?.clientDraftId) draftIdRef.current = meta.clientDraftId;
    if (typeof meta?.draftVersion === 'number') draftVersionRef.current = meta.draftVersion;
    setState((prev) => ({
      ...prev,
      pendingMutations: queue.length,
      lastSavedAt: meta?.lastSavedAt ?? prev.lastSavedAt,
      lastSyncedAt: meta?.lastSyncedAt ?? prev.lastSyncedAt,
      clientDraftId: meta?.clientDraftId ?? prev.clientDraftId,
      draftVersion: meta?.draftVersion ?? prev.draftVersion,
    }));
  }, [projectId]);

  const prevOnlineRef = useRef(online);
  useEffect(() => {
    if (online !== prevOnlineRef.current) {
      prevOnlineRef.current = online;
      queueMicrotask(() =>
        setState((prev) => ({
          ...prev,
          online,
          syncState: online ? (prev.pendingMutations > 0 ? 'syncing' : 'idle') : 'offline',
        })),
      );
    }
  }, [online]);

  useEffect(() => {
    queueMicrotask(() => void refreshPending());
  }, [refreshPending]);

  const saveDraft = useCallback(
    (snapshot: WizardSnapshot) => {
      if (!projectId) return;
      const serialized = JSON.stringify(snapshot);
      if (serialized === lastSnapshotRef.current) return;
      lastSnapshotRef.current = serialized;

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        const savedAt = Date.now();
        const draft: EstimateDraft = { id: projectId, ...snapshot, savedAt };
        const clientDraftId = await ensureDraftId();
        draftVersionRef.current += 1;
        await writeDraft(draft);
        await setProjectMeta(projectId, {
          lastSavedAt: savedAt,
          clientDraftId,
          draftVersion: draftVersionRef.current,
        });
        setState((prev) => ({
          ...prev,
          lastSavedAt: savedAt,
          clientDraftId,
          draftVersion: draftVersionRef.current,
        }));
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [projectId, ensureDraftId],
  );

  const flushAutosave = useCallback(
    async (snapshot: WizardSnapshot) => {
      if (!projectId) return;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      const savedAt = Date.now();
      const draft: EstimateDraft = { id: projectId, ...snapshot, savedAt };
      const clientDraftId = await ensureDraftId();
      draftVersionRef.current += 1;
      await writeDraft(draft);
      await setProjectMeta(projectId, {
        lastSavedAt: savedAt,
        clientDraftId,
        draftVersion: draftVersionRef.current,
      });
      setState((prev) => ({
        ...prev,
        lastSavedAt: savedAt,
        clientDraftId,
        draftVersion: draftVersionRef.current,
      }));
    },
    [projectId, ensureDraftId],
  );

  const restoreDraft = useCallback(async (): Promise<EstimateDraft | undefined> => {
    if (!projectId) return undefined;
    return readDraft(projectId);
  }, [projectId]);

  const dropDraft = useCallback(async () => {
    if (!projectId) return;
    await clearDraft(projectId);
    lastSnapshotRef.current = '';
    draftVersionRef.current = 0;
  }, [projectId]);

  const enqueue = useCallback(
    async (kind: EstimateMutationKind, payload: EstimateMutationPayload) => {
      if (!projectId) return undefined;
      const clientMutationId = newClientMutationId();
      const id = await enqueueMutation(projectId, kind, payload, {
        clientMutationId,
        draftVersion: draftVersionRef.current,
      });
      await refreshPending();
      return id;
    },
    [projectId, refreshPending],
  );

  const acknowledgeConflict = useCallback(() => {
    setState((prev) => ({ ...prev, conflict: null }));
  }, []);

  const flush = useCallback(
    async (handler: FlushHandler) => {
      if (!projectId) return { attempted: 0, succeeded: 0, failed: 0, remaining: 0 };
      setState((prev) => ({ ...prev, syncState: 'syncing', conflict: null }));
      let conflictCaptured: EstimateVersionConflict | null = null;
      const wrappedHandler: FlushHandler = async (record) => {
        try {
          await handler(record);
        } catch (err) {
          const conflict = extractConflict(err);
          if (conflict) conflictCaptured = conflict;
          throw err;
        }
      };
      const report = await flushMutationQueue(wrappedHandler, { projectId });
      if (report.remaining === 0 && report.failed === 0) {
        await setProjectMeta(projectId, {
          lastSyncedAt: Date.now(),
          lastSavedAt: state.lastSavedAt,
          clientDraftId: draftIdRef.current,
          draftVersion: draftVersionRef.current,
        });
      }
      const remainingQueue = await readMutationQueue(projectId);
      const meta = await getProjectMeta(projectId);
      setState((prev) => ({
        ...prev,
        pendingMutations: remainingQueue.length,
        syncState:
          report.failed > 0
            ? 'error'
            : remainingQueue.length > 0
              ? 'syncing'
              : 'idle',
        lastSyncedAt: meta?.lastSyncedAt ?? prev.lastSyncedAt,
        conflict: conflictCaptured ?? prev.conflict,
      }));
      return report;
    },
    [projectId, state.lastSavedAt],
  );

  return {
    ...state,
    saveDraft,
    flushAutosave,
    restoreDraft,
    dropDraft,
    enqueue,
    flush,
    refresh: refreshPending,
    acknowledgeConflict,
  };
}

export type EstimateOfflineCacheApi = ReturnType<typeof useEstimateOfflineCache>;
export type { EstimateMutationRecord, EstimateMutationKind };
