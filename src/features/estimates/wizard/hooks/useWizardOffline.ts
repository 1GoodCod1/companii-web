import { useCallback, useEffect, useRef, useState } from 'react';
import { useEstimateOfflineCache } from '@/features/estimates/offline/useEstimateOfflineCache';
import { useSaveSitePlanMutation, useUpdateEstimateProjectMutation } from '@/features/estimates/api/useEstimates';
import type { Plan2dData } from '@/types/estimates';
import type { WizardFormState } from './useWizardFormState';

export function useWizardOffline(projectId: string, formState: WizardFormState) {
  const updateProject = useUpdateEstimateProjectMutation();
  const savePlan = useSaveSitePlanMutation();
  const offline = useEstimateOfflineCache(projectId);

  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshotRef = useRef({
    title: formState.title,
    siteType: formState.siteType,
    address: formState.address,
    marginPct: formState.marginPct,
    riskReservePct: formState.riskReservePct,
    buildingYear: formState.buildingYear,
    siteFloor: formState.siteFloor,
    accessDifficulty: formState.accessDifficulty,
    urgency: formState.urgency,
    diagnostic: formState.diagnostic,
    customPricing: formState.customPricing,
    plan2d: formState.plan2d,
  });

  useEffect(() => {
    snapshotRef.current = {
      title: formState.title,
      siteType: formState.siteType,
      address: formState.address,
      marginPct: formState.marginPct,
      riskReservePct: formState.riskReservePct,
      buildingYear: formState.buildingYear,
      siteFloor: formState.siteFloor,
      accessDifficulty: formState.accessDifficulty,
      urgency: formState.urgency,
      diagnostic: formState.diagnostic,
      customPricing: formState.customPricing,
      plan2d: formState.plan2d,
    };
  }, [formState]);

  useEffect(() => {
    queueMicrotask(() => setSavingStatus('saving'));
    offline.saveDraft({
      title: formState.title,
      siteType: formState.siteType,
      address: formState.address,
      marginPct: formState.marginPct,
      riskReservePct: formState.riskReservePct,
      buildingYear: formState.buildingYear,
      siteFloor: formState.siteFloor,
      accessDifficulty: formState.accessDifficulty,
      urgency: formState.urgency,
      diagnostic: formState.diagnostic,
      customPricing: formState.customPricing,
      plan2d: formState.plan2d,
    });
    const id = setTimeout(() => {
      setSavingStatus('saved');
      setLastSavedAt(offline.lastSavedAt ?? null);
      const resetId = setTimeout(() => setSavingStatus('idle'), 2000);
      resetTimerRef.current = resetId;
    }, 700);
    return () => {
      clearTimeout(id);
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formState.title,
    formState.siteType,
    formState.address,
    formState.marginPct,
    formState.riskReservePct,
    formState.buildingYear,
    formState.siteFloor,
    formState.accessDifficulty,
    formState.urgency,
    formState.diagnostic,
    formState.customPricing,
    formState.plan2d,
  ]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      void offline.flushAutosave(snapshotRef.current);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    await offline.dropDraft();
    const { clearOfflineQueue } = await import('@/features/estimates/offline/mutationQueue');
    await clearOfflineQueue();
    offline.acknowledgeConflict();
    await offline.refresh();
  }, [offline]);

  const handleKeepLocalChanges = useCallback(async () => {
    offline.acknowledgeConflict();
    const { readMutationQueue, idbPut } = await Promise.all([
      import('@/features/estimates/offline/mutationQueue'),
      import('@/utils/idb'),
    ]).then(([mq, idb]) => ({ readMutationQueue: mq.readMutationQueue, idbPut: idb.idbPut }));
    const queue = await readMutationQueue(projectId);
    for (const record of queue) {
      const payload = { ...(record.payload as Record<string, unknown>) };
      delete payload.expectedVersion;
      await idbPut('estimate_mutation_queue', { ...record, payload });
    }
    void handleSyncNow();
  }, [offline, projectId, handleSyncNow]);

  const handleSyncNowRef = useRef(handleSyncNow);
  useEffect(() => {
    handleSyncNowRef.current = handleSyncNow;
  });

  useEffect(() => {
    if (offline.online && offline.pendingMutations > 0 && !syncing) {
      queueMicrotask(() => void handleSyncNowRef.current());
    }
  }, [offline.online, offline.pendingMutations, syncing]);

  return {
    offline,
    savingStatus,
    lastSavedAt,
    syncing,
    handleSyncNow,
    handleDiscardLocalChanges,
    handleKeepLocalChanges,
  };
}

export type WizardOfflineState = ReturnType<typeof useWizardOffline>;
