import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { useEstimateOfflineCache } from '@/features/estimates/offline/useEstimateOfflineCache';
import { clearOfflineQueue, readMutationQueue } from '@/features/estimates/offline/mutationQueue';
import { idbPut } from '@/entities/estimate/model/idb';
import { useSaveSitePlanMutation, useUpdateEstimateProjectMutation } from '@/features/estimates/api/useEstimates';
import type { Plan2dData } from '@/entities/estimate/model/estimates';
import type { WizardFormState } from './useWizardFormState';

type SaveAction =
  | { type: 'SET_SAVING' }
  | { type: 'SET_SAVED'; lastSavedAt: number | null }
  | { type: 'RESET_IDLE' };

interface SaveState {
  status: 'idle' | 'saving' | 'saved';
  lastSavedAt: number | null;
}

function saveReducer(state: SaveState, action: SaveAction): SaveState {
  switch (action.type) {
    case 'SET_SAVING':
      return { ...state, status: 'saving' };
    case 'SET_SAVED':
      return { status: 'saved', lastSavedAt: action.lastSavedAt };
    case 'RESET_IDLE':
      return { ...state, status: 'idle' };
    default:
      return state;
  }
}

export function useWizardOffline(projectId: string, formState: WizardFormState) {
  const updateProject = useUpdateEstimateProjectMutation();
  const savePlan = useSaveSitePlanMutation();
  const syncHandlerRef = useRef<(() => Promise<void>) | null>(null);
  const offline = useEstimateOfflineCache(projectId, { syncHandlerRef });

  const [saveState, saveDispatch] = useReducer(saveReducer, { status: 'idle', lastSavedAt: null });
  const [syncing, setSyncing] = useState(false);

  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshotRef = useRef({
    title: formState.title,
    siteType: formState.siteType,
    address: formState.address,
    marginPct: formState.marginPct,
    riskReservePct: formState.riskReservePct,
    siteFloor: formState.siteFloor,
    accessDifficulty: formState.accessDifficulty,
    urgency: formState.urgency,
    diagnostic: formState.diagnostic,
    customPricing: formState.customPricing,
    plan2d: formState.plan2d,
  });

  const offlineRef = useRef(offline);
  useEffect(() => {
    offlineRef.current = offline;
  });

  useEffect(() => {
    snapshotRef.current = {
      title: formState.title,
      siteType: formState.siteType,
      address: formState.address,
      marginPct: formState.marginPct,
      riskReservePct: formState.riskReservePct,
      siteFloor: formState.siteFloor,
      accessDifficulty: formState.accessDifficulty,
      urgency: formState.urgency,
      diagnostic: formState.diagnostic,
      customPricing: formState.customPricing,
      plan2d: formState.plan2d,
    };
  }, [formState]);

  const {
    title,
    siteType,
    address,
    marginPct,
    riskReservePct,
    siteFloor,
    accessDifficulty,
    urgency,
    diagnostic,
    customPricing,
    plan2d,
  } = formState;

  useEffect(() => {
    queueMicrotask(() => saveDispatch({ type: 'SET_SAVING' }));
    offlineRef.current.saveDraft({
      title,
      siteType,
      address,
      marginPct,
      riskReservePct,
      siteFloor,
      accessDifficulty,
      urgency,
      diagnostic,
      customPricing,
      plan2d,
    });
    const id = setTimeout(() => {
      saveDispatch({ type: 'SET_SAVED', lastSavedAt: offlineRef.current.lastSavedAt ?? null });
      const resetId = setTimeout(() => saveDispatch({ type: 'RESET_IDLE' }), 2000);
      resetTimerRef.current = resetId;
    }, 700);
    return () => {
      clearTimeout(id);
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    };
  }, [
    title,
    siteType,
    address,
    marginPct,
    riskReservePct,
    siteFloor,
    accessDifficulty,
    urgency,
    diagnostic,
    customPricing,
    plan2d,
    saveDispatch,
    offlineRef,
  ]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      void offlineRef.current.flushAutosave(snapshotRef.current);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleSyncNow = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await offline.flush(async (record) => {
        const payload = record.payload as Record<string, unknown>;
        const meta = {
          clientMutationId: record.clientMutationId,
          clientDraftId: offline.clientDraftId,
          expectedVersion: payload.expectedVersion as number | undefined,
        };
        switch (record.kind) {
          case 'update-project':
            await updateProject.mutateAsync({
              id: record.projectId,
              ...(payload as Record<string, never>),
              ...meta,
            });
            return;
          case 'save-plan':
            await savePlan.mutateAsync({
              id: record.projectId,
              plan2d: payload.plan2d as Plan2dData,
              ...meta,
            });
            return;
          default:
            throw new Error(`unsupported mutation kind: ${record.kind}`);
        }
      });
    } finally {
      setSyncing(false);
    }
  }, [offline, syncing, updateProject, savePlan]);

  const handleDiscardLocalChanges = useCallback(async () => {
    await Promise.all([offline.dropDraft(), clearOfflineQueue()]);
    offline.acknowledgeConflict();
    await offline.refresh();
  }, [offline]);

  const handleKeepLocalChanges = useCallback(async () => {
    offline.acknowledgeConflict();
    const queue = await readMutationQueue(projectId);
    await Promise.all(
      queue.map((record) => {
        const payload = { ...(record.payload as Record<string, unknown>) };
        delete payload.expectedVersion;
        return idbPut('estimate_mutation_queue', { ...record, payload });
      }),
    );
    void handleSyncNow();
  }, [offline, projectId, handleSyncNow]);

  useLayoutEffect(() => {
    syncHandlerRef.current = handleSyncNow;
  }, [handleSyncNow]);

  return {
    offline,
    savingStatus: saveState.status,
    lastSavedAt: saveState.lastSavedAt,
    syncing,
    handleSyncNow,
    handleDiscardLocalChanges,
    handleKeepLocalChanges,
  };
}

export type WizardOfflineState = ReturnType<typeof useWizardOffline>;