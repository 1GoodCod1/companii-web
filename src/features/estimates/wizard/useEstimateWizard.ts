import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  useCalculateEstimateMutation,
  useConvertEstimateMutation,
  useGenerateEstimateQuoteMutation,
  useSaveSitePlanMutation,
  useUpdateEstimateProjectMutation,
  useSendEstimateMutation,
  useUpdateEstimateLineMutation,
  useAddEstimateLineMutation,
  useDeleteEstimateLineMutation,
} from '@/features/estimates/api/useEstimates';
import { mergeCustomPricing, readCustomPricing, type CustomPricingValues } from '@/features/estimates/utils/customPricing';
import {
  ENABLED_WORK_MODULES_KEY,
  mergeEnabledWorkModulesIntoDiagnostic,
  readEnabledWorkModules,
  toggleWorkModule,
} from '@/features/estimates/diagnostic/workModules';
import { validateDiagnostic } from '@/features/estimates/diagnostic/diagnosticValidation';
import {
  getCustomFieldKeys,
  groupVisibleCustomFields,
} from '@/features/estimates/diagnostic/groupCustomFields';
import { getVisibleStages } from '@/features/estimates/stages/stageVisibility';
import { groupStagesByWorkModule } from '@/features/estimates/stages/stageGrouping';
import { buildScopeSummary, hasManualLines } from '@/features/estimates/stages/scopeSummary';
import {
  computePreviewLines,
  computePreviewTotals,
  extractMeasurementsFromDiagnostic,
} from '@/features/estimates/preview/previewEngine';
import { useEstimateOfflineCache } from '@/features/estimates/offline/useEstimateOfflineCache';
import type { EstimateBlueprintConfig, EstimateProjectDto, Plan2dData } from '@/types/estimates';
import { ESTIMATE_STATUS } from '@/constants/estimateStatus.constants';
import { DUPLICATE_DIAGNOSTIC_KEYS, EMPTY_PLAN } from '@/constants/estimatesWizard.constants';
import { syncGlobalParamsToDiagnostic } from './syncGlobalParamsToDiagnostic';
import { getErrorMessage } from '@/utils/errors';
import { useAuthStore } from '@/stores/authStore';
import { usePricingModifiersQuery } from '@/features/companies/api/useCompanies';

export function useEstimateWizard(project: EstimateProjectDto) {
  const { t } = useTranslation();
  const updateProject = useUpdateEstimateProjectMutation();
  const savePlan = useSaveSitePlanMutation();

  // Company-configured pricing-modifier overrides — keep the live preview in
  // lock-step with what the backend will compute on "Calculate".
  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId) ?? '';
  const pricingOverrides = usePricingModifiersQuery(activeCompanyId).data?.overrides;
  const calculate = useCalculateEstimateMutation();
  const generateQuote = useGenerateEstimateQuoteMutation();
  const convert = useConvertEstimateMutation();
  const sendEstimate = useSendEstimateMutation();

  const config: EstimateBlueprintConfig | null = project.blueprint?.config ?? null;

  const diagnosticQuestions = useMemo(() => {
    const allQuestions = config?.diagnosticQuestions ?? [];
    const customKeys = getCustomFieldKeys(config);
    return allQuestions.filter(
      (q) =>
        !(DUPLICATE_DIAGNOSTIC_KEYS as readonly string[]).includes(q.key) &&
        !customKeys.has(q.key),
    );
  }, [config]);

  const steps = useMemo(() => {
    const defaultSteps = config?.wizardSteps ?? ['object', 'plan', 'diagnostic', 'stages', 'review'];
    const hasCustomFields = config?.customFields && config.customFields.length > 0;
    const hasWorkModules = config?.workModules && config.workModules.length > 0;
    const hasQuestions = diagnosticQuestions.length > 0;
    if (!hasCustomFields && !hasWorkModules && !hasQuestions) {
      return defaultSteps.filter((s) => s !== 'diagnostic');
    }
    return defaultSteps;
  }, [config, diagnosticQuestions]);

  const [stepIndex, setStepIndex] = useState(0);
  const [title, setTitle] = useState(project.title);
  const [siteType, setSiteType] = useState(project.siteType ?? 'apartment');
  const [address, setAddress] = useState(project.address ?? '');
  const [marginPct, setMarginPct] = useState(Number(project.marginPct));
  const [riskReservePct, setRiskReservePct] = useState(Number(project.riskReservePct ?? 0));
  const [buildingYear, setBuildingYear] = useState<number | null>(project.buildingYear ?? null);
  const [siteFloor, setSiteFloor] = useState<number | null>(project.siteFloor ?? null);
  const [accessDifficulty, setAccessDifficulty] = useState<string | null>(
    project.accessDifficulty ?? null,
  );
  const [urgency, setUrgency] = useState<string | null>(project.urgency ?? null);
  const [plan2d, setPlan2d] = useState<Plan2dData>(project.sitePlan?.plan2d ?? EMPTY_PLAN);
  const [diagnostic, setDiagnostic] = useState<Record<string, unknown>>(
    (project.diagnosticAnswers as Record<string, unknown>) ?? {},
  );
  const [customPricing, setCustomPricing] = useState<CustomPricingValues>(() =>
    readCustomPricing((project.diagnosticAnswers as Record<string, unknown>) ?? {}),
  );
  const [dirty, setDirty] = useState(false);
  const [estimateMode, setEstimateMode] = useState<'brief' | 'detailed' | 'by-room'>('detailed');
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const enabledWorkModules = useMemo(
    () => (config ? readEnabledWorkModules(diagnostic, config) : []),
    [diagnostic, config],
  );

  const setEnabledWorkModules = (next: string[]) => {
    setDiagnostic((prev) => ({ ...prev, [ENABLED_WORK_MODULES_KEY]: next }));
    setDirty(true);
  };

  const setWorkModuleEnabled = (moduleKey: string, enabled: boolean) => {
    setEnabledWorkModules(toggleWorkModule(enabledWorkModules, moduleKey, enabled));
  };

  const updateDiagnosticField = (key: string, value: unknown) => {
    setDiagnostic((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const persistDiagnostic = useCallback(
    (answers: Record<string, unknown>) =>
      mergeEnabledWorkModulesIntoDiagnostic(
        mergeCustomPricing(answers, customPricing),
        config,
      ),
    [customPricing, config],
  );

  const validation = useMemo(
    () => validateDiagnostic(config, persistDiagnostic(diagnostic)),
    [config, diagnostic, persistDiagnostic],
  );
  const validationErrors = validation.fieldErrors;
  const validationWarnings = validation.warnings;
  const hasBlockingErrors = !validation.ok;
  const canGoNext = !hasBlockingErrors;

  const customFieldSections = useMemo(
    () => groupVisibleCustomFields(config, enabledWorkModules, persistDiagnostic(diagnostic)),
    [config, enabledWorkModules, diagnostic, persistDiagnostic],
  );

  const visibleStages = useMemo(
    () => getVisibleStages(project.stages ?? [], config, enabledWorkModules),
    [project.stages, config, enabledWorkModules],
  );

  const stageGroups = useMemo(
    () =>
      groupStagesByWorkModule(
        project.stages ?? [],
        config,
        enabledWorkModules,
        t('company.estimateWizard.stagesStep.unlabeledGroup'),
      ),
    [project.stages, config, enabledWorkModules, t],
  );

  const scopeSummary = useMemo(
    () => buildScopeSummary(config, enabledWorkModules, project.stages ?? [], diagnostic),
    [config, enabledWorkModules, project.stages, diagnostic],
  );

  const projectHasManualLines = useMemo(
    () => hasManualLines(project.stages ?? []),
    [project.stages],
  );

  const previewLines = useMemo(
    () =>
      computePreviewLines(
        config,
        extractMeasurementsFromDiagnostic(
          persistDiagnostic(diagnostic),
          project.category?.slug ?? undefined,
          pricingOverrides,
        ),
        enabledWorkModules,
        accessDifficulty,
        urgency,
        diagnostic.materialIncluded !== false,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config, diagnostic, enabledWorkModules, accessDifficulty, urgency, persistDiagnostic, pricingOverrides],
  );
  const previewTotals = useMemo(
    () => computePreviewTotals(previewLines, marginPct, customPricing, riskReservePct),
    [previewLines, marginPct, customPricing, riskReservePct],
  );

  const backendGrandTotal = Number(project.grandTotal ?? 0);
  const previewVsBackendDiff =
    backendGrandTotal > 0 && previewTotals.hasContent
      ? Math.round((previewTotals.grandTotal - backendGrandTotal) * 100) / 100
      : 0;
  const previewIsStale = Math.abs(previewVsBackendDiff) >= 1;

  const [apiWarnings, setApiWarnings] = useState<Array<{ key: string; message: string }>>([]);
  const [sanityWarnings, setSanityWarnings] = useState<
    Array<{ key: string; severity: 'info' | 'warning'; message: string }>
  >([]);
  const offline = useEstimateOfflineCache(project.id);
  const [syncing, setSyncing] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshotRef = useRef({
    title,
    siteType,
    address,
    marginPct,
    riskReservePct,
    buildingYear,
    siteFloor,
    accessDifficulty,
    urgency,
    diagnostic,
    customPricing,
    plan2d,
  });

  const handleSetSiteType = useCallback(
    (nextType: string) => {
      setSiteType(nextType);
      if (nextType === 'house' && siteFloor !== null) {
        setSiteFloor(null);
      }
      if ((nextType === 'office' || nextType === 'commercial') && !accessDifficulty) {
        setAccessDifficulty('medium');
      }
      const categorySlug = project.category.slug;
      setDiagnostic((prev) => {
        const next = { ...prev };
        let changed = false;
        if (categorySlug === 'elektrika') {
          if (!next.wallMaterial) { next.wallMaterial = 'beton'; changed = true; }
          if (next.voltageStabilizer === undefined) { next.voltageStabilizer = true; changed = true; }
          if (next.groundingRequired === undefined) { next.groundingRequired = true; changed = true; }
        }
        if (categorySlug === 'clima') {
          if (next.isMultiSplit === undefined) { next.isMultiSplit = true; changed = true; }
        }
        if (categorySlug === 'it-networks') {
          if (!next.projectScope) { next.projectScope = 'Mediu (6-20 pagini / 1-2 săptămâni)'; changed = true; }
          if (next.multilingual === undefined) { next.multilingual = true; changed = true; }
          if (next.customDesign === undefined) { next.customDesign = true; changed = true; }
        }
        if (categorySlug === 'it-hardware') {
          if (!next.deviceType) { next.deviceType = 'Desktop / PC'; changed = true; }
          if (next.warrantyMonths === undefined) { next.warrantyMonths = 3; changed = true; }
          if (next.deviceCount === undefined || (typeof next.deviceCount === 'number' && next.deviceCount < 1)) {
            next.deviceCount = 1;
            changed = true;
          }
        }
        if (categorySlug === 'mobila') {
          if (!next.materialType) { next.materialType = 'pal'; changed = true; }
          if (!next.materialThickness) { next.materialThickness = '16 mm'; changed = true; }
          if (!next.finishType) { next.finishType = 'Mat'; changed = true; }
          if (!next.frontMaterialType) { next.frontMaterialType = 'pal'; changed = true; }
          if (next.softClose === undefined) { next.softClose = true; changed = true; }
        }
        if (categorySlug === 'santehnika') {
          if (!next.pipeMaterial) { next.pipeMaterial = 'ppr'; changed = true; }
          if (next.replacePipes === undefined) { next.replacePipes = true; changed = true; }
          if (next.filterSystem === undefined) { next.filterSystem = false; changed = true; }
        }
        if (categorySlug === 'constructii') {
          if (!next.foundationType) { next.foundationType = 'strip'; changed = true; }
          if (!next.wallMaterial) { next.wallMaterial = 'bca'; changed = true; }
          if (!next.slabType) { next.slabType = 'monolithic'; changed = true; }
          if (next.projectDocumentation === undefined) { next.projectDocumentation = true; changed = true; }
        }
        return changed ? next : prev;
      });
    },
    [siteFloor, accessDifficulty, project.category.slug],
  );

  useEffect(() => {
    snapshotRef.current = {
      title,
      siteType,
      address,
      marginPct,
      riskReservePct,
      buildingYear,
      siteFloor,
      accessDifficulty,
      urgency,
      diagnostic,
      customPricing,
      plan2d,
    };
  });

  useEffect(() => {
    queueMicrotask(() => setSavingStatus('saving'));
    offline.saveDraft({
      title,
      siteType,
      address,
      marginPct,
      riskReservePct,
      buildingYear,
      siteFloor,
      accessDifficulty,
      urgency,
      diagnostic,
      customPricing,
      plan2d,
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
    title,
    siteType,
    address,
    marginPct,
    riskReservePct,
    buildingYear,
    siteFloor,
    accessDifficulty,
    urgency,
    diagnostic,
    customPricing,
    plan2d,
  ]);

  // M-04 — flush autosave on tab unload so refresh never loses unsynced data
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

  /**
   * M-05: drop local offline state + reload server truth. Used when the
   * user explicitly accepts server-side changes after a 409 conflict.
   */
  const handleDiscardLocalChanges = useCallback(async () => {
    await offline.dropDraft();
    const { clearOfflineQueue } = await import('@/features/estimates/offline/mutationQueue');
    await clearOfflineQueue();
    offline.acknowledgeConflict();
    await offline.refresh();
  }, [offline]);

  const handleKeepLocalChanges = useCallback(async () => {
    offline.acknowledgeConflict();
    // Drop expectedVersion from every queued mutation so they re-apply
    // against whatever version the server is at now.
    const { readMutationQueue, idbPut } = await Promise.all([
      import('@/features/estimates/offline/mutationQueue'),
      import('@/utils/idb'),
    ]).then(([mq, idb]) => ({ readMutationQueue: mq.readMutationQueue, idbPut: idb.idbPut }));
    const queue = await readMutationQueue(project.id);
    for (const record of queue) {
      const payload = { ...(record.payload as Record<string, unknown>) };
      delete payload.expectedVersion;
      await idbPut('estimate_mutation_queue', { ...record, payload });
    }
    void handleSyncNow();
  }, [offline, project.id, handleSyncNow]);
  const handleSyncNowRef = useRef(handleSyncNow);
  useEffect(() => {
    handleSyncNowRef.current = handleSyncNow;
  });

  useEffect(() => {
    if (offline.online && offline.pendingMutations > 0 && !syncing) {
      queueMicrotask(() => void handleSyncNowRef.current());
    }
  }, [offline.online, offline.pendingMutations, syncing]);

  const updateLine = useUpdateEstimateLineMutation();
  const addLineMutation = useAddEstimateLineMutation();
  const deleteLineMutation = useDeleteEstimateLineMutation();
  const [editingStore, setEditingStore] = useState<{ lineId: string; value: string } | null>(null);
  const [uploadingLineId, setUploadingLineId] = useState<string | null>(null);

  const handleUploadReceipt = async (lineId: string, stageId: string, file: File) => {
    setUploadingLineId(lineId);
    try {
      const { uploadFile } = await import('@/api/files');
      const uploaded = await uploadFile(file);
      await updateLine.mutateAsync({
        projectId: project.id,
        stageId,
        lineId,
        receiptFileKey: uploaded.id,
      });
      toast.success(t('company.estimateWizard.wizard.toasts.receiptUploaded'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.receiptUploadFailed')));
    } finally {
      setUploadingLineId(null);
    }
  };

  const handleDeleteReceipt = async (lineId: string, stageId: string) => {
    if (!confirm(t('company.estimateWizard.wizard.toasts.confirmDeleteReceipt'))) return;
    try {
      await updateLine.mutateAsync({
        projectId: project.id,
        stageId,
        lineId,
        receiptFileKey: null,
      });
      toast.success(t('company.estimateWizard.wizard.toasts.receiptDeleted'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.deleteFailed')));
    }
  };

  const handleSaveStore = async (lineId: string, stageId: string) => {
    if (!editingStore || editingStore.lineId !== lineId) return;
    try {
      await updateLine.mutateAsync({
        projectId: project.id,
        stageId,
        lineId,
        materialStore: editingStore.value || null,
      });
      setEditingStore(null);
      toast.success(t('company.estimateWizard.wizard.toasts.storeSaved'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.storeSaveFailed')));
    }
  };

  const handleUpdateLineQtyOrPrice = async (
    lineId: string,
    stageId: string,
    field: 'qty' | 'unitPrice',
    val: number,
  ) => {
    if (isNaN(val) || val < 0) return;
    try {
      await updateLine.mutateAsync({
        projectId: project.id,
        stageId,
        lineId,
        [field]: val,
      });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.updateFailed')));
    }
  };

  const handleAddLine = async (stageId: string) => {
    try {
      await addLineMutation.mutateAsync({
        projectId: project.id,
        stageId,
        description: t('company.estimateWizard.wizard.toasts.newLineDescription'),
        qty: 1,
        unit: 'buc',
        unitPrice: 0,
      });
      toast.success(t('company.estimateWizard.wizard.toasts.lineAdded'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.lineAddFailed')));
    }
  };

  const handleDeleteLine = async (lineId: string, stageId: string) => {
    if (!confirm(t('company.estimateWizard.wizard.toasts.confirmDeleteLine'))) return;
    try {
      await deleteLineMutation.mutateAsync({
        projectId: project.id,
        stageId,
        lineId,
      });
      toast.success(t('company.estimateWizard.wizard.toasts.lineDeleted'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.lineDeleteFailed')));
    }
  };

  const currentStep = steps[stepIndex] ?? 'object';

  const handleSaveObject = async () => {
    try {
      const result = (await updateProject.mutateAsync({
        id: project.id,
        title,
        siteType,
        address,
        marginPct,
        riskReservePct,
        buildingYear,
        siteFloor,
        accessDifficulty,
        urgency,
        diagnosticAnswers: persistDiagnostic(diagnostic),
      })) as { warnings?: Array<{ key: string; message: string }> } | undefined;
      setDiagnostic(persistDiagnostic(diagnostic));
      setDirty(false);
      setApiWarnings(Array.isArray(result?.warnings) ? result!.warnings! : []);
      toast.success(t('company.estimateWizard.wizard.toasts.dataSaved'));
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.saveFailed')));
    }
  };

  const handleSavePlan = async () => {
    try {
      const nextDiag = syncGlobalParamsToDiagnostic(plan2d, diagnostic);
      await savePlan.mutateAsync({ id: project.id, plan2d });
      await updateProject.mutateAsync({ id: project.id, diagnosticAnswers: persistDiagnostic(nextDiag) });
      setDiagnostic(persistDiagnostic(nextDiag));
      setDirty(false);
      toast.success(t('company.estimateWizard.wizard.toasts.dataSaved'));
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.saveFailed')));
    }
  };

  const handleSaveDiagnostic = async () => {
    if (hasBlockingErrors) {
      toast.error(t('company.estimateWizard.wizard.toasts.validationFailed'));
      return;
    }
    try {
      const nextDiagnostic = persistDiagnostic(diagnostic);
      const result = (await updateProject.mutateAsync({
        id: project.id,
        diagnosticAnswers: nextDiagnostic,
      })) as { warnings?: Array<{ key: string; message: string }> } | undefined;
      setDiagnostic(nextDiagnostic);
      setDirty(false);
      setApiWarnings(Array.isArray(result?.warnings) ? result!.warnings! : []);
      toast.success(t('company.estimateWizard.wizard.toasts.diagnosticSaved'));

      // O-01: auto-calculate so the user lands on the Stages step with the smeta
      // already populated (no separate "Calculează" click required). Failure is
      // non-fatal — the save itself succeeded, user can retry calculate manually.
      try {
        const calcResult = (await calculate.mutateAsync(project.id)) as
          | { sanityWarnings?: Array<{ key: string; severity: 'info' | 'warning'; message: string }> }
          | undefined;
        setSanityWarnings(
          Array.isArray(calcResult?.sanityWarnings) ? calcResult!.sanityWarnings! : [],
        );
      } catch (calcErr) {
        console.warn('Auto-calculate after diagnostic save failed:', calcErr);
      }

      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.saveFailed')));
    }
  };

  const handleStepChange = async (targetIndex: number) => {
    const diagnosticIndex = steps.indexOf('diagnostic');
    if (
      targetIndex > stepIndex &&
      diagnosticIndex !== -1 &&
      stepIndex >= diagnosticIndex &&
      hasBlockingErrors
    ) {
      toast.error(t('company.estimateWizard.wizard.toasts.validationFailed'));
      return;
    }
    if (currentStep === 'plan') {
      try {
        const nextDiag = syncGlobalParamsToDiagnostic(plan2d, diagnostic);
        await savePlan.mutateAsync({ id: project.id, plan2d });
        await updateProject.mutateAsync({ id: project.id, diagnosticAnswers: persistDiagnostic(nextDiag) });
        setDiagnostic(persistDiagnostic(nextDiag));
        setDirty(false);
      } catch (err) {
        console.error('Autosave plan failed:', err);
      }
    }
    if (currentStep === 'diagnostic') {
      try {
        const nextDiagnostic = persistDiagnostic(diagnostic);
        await updateProject.mutateAsync({ id: project.id, diagnosticAnswers: nextDiagnostic });
        setDiagnostic(nextDiagnostic);
        setDirty(false);
      } catch (err) {
        console.error('Autosave diagnostic failed:', err);
      }
    }
    setStepIndex(targetIndex);
  };

  const handleCalculate = async () => {
    if (hasBlockingErrors) {
      toast.error(t('company.estimateWizard.wizard.toasts.validationFailed'));
      return;
    }
    // J-03: warn before recalculate when manual lines exist
    if (projectHasManualLines) {
      const confirmed = window.confirm(
        t('company.estimateWizard.wizard.toasts.recalculateConfirm'),
      );
      if (!confirmed) return;
    }
    try {
      const nextDiag = syncGlobalParamsToDiagnostic(plan2d, diagnostic);
      const nextDiagnostic = persistDiagnostic(nextDiag);
      await updateProject.mutateAsync({ id: project.id, diagnosticAnswers: nextDiagnostic });
      setDiagnostic(nextDiagnostic);

      await savePlan.mutateAsync({ id: project.id, plan2d });

      const result = (await calculate.mutateAsync(project.id)) as
        | { sanityWarnings?: Array<{ key: string; severity: 'info' | 'warning'; message: string }> }
        | undefined;
      setSanityWarnings(Array.isArray(result?.sanityWarnings) ? result!.sanityWarnings! : []);
      setDirty(false);
      toast.success(t('company.estimateWizard.wizard.toasts.calculateSuccess'));
      setStepIndex(steps.indexOf('review'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.calculateFailed')));
    }
  };

  const handleGenerateQuote = async () => {
    try {
      await generateQuote.mutateAsync(project.id);
      toast.success(t('company.estimateWizard.wizard.toasts.quoteGenerated'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.quoteGenerateFailed')));
    }
  };

  const handleConvert = async (mode: 'single' | 'by-stage') => {
    try {
      await convert.mutateAsync({ id: project.id, mode });
      toast.success(
        mode === 'by-stage'
          ? t('company.estimateWizard.wizard.toasts.convertByStage')
          : t('company.estimateWizard.wizard.toasts.convertSingle'),
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.convertFailed')));
    }
  };

  const handleSendEstimate = async () => {
    try {
      const result = await sendEstimate.mutateAsync(project.id);
      toast.success(
        result.emailSent
          ? t('company.estimateWizard.wizard.toasts.sentWithEmail')
          : t('company.estimateWizard.wizard.toasts.sentMarked'),
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.sendFailed')));
    }
  };

  const clientFeedbackHistory = useMemo(() => {
    try {
      const raw = project.clientFeedback;
      if (!raw) return [];
      return Array.isArray(raw) ? raw : JSON.parse(raw as string);
    } catch {
      return [];
    }
  }, [project.clientFeedback]);

  const hasRequestChanges = useMemo(() => {
    if (!clientFeedbackHistory.length) return false;
    const last = clientFeedbackHistory[clientFeedbackHistory.length - 1];
    return last?.kind === 'REQUEST_CHANGES';
  }, [clientFeedbackHistory]);

  const isReadOnly = useMemo(() => {
    if (['ACCEPTED', 'IN_EXECUTION', 'DONE', 'CANCELLED'].includes(project.status)) {
      return true;
    }
    if (project.status === 'SENT' && !hasRequestChanges) {
      return true;
    }
    return false;
  }, [project.status, hasRequestChanges]);

  const canSendEstimate = project.status === 'CALCULATED' || project.status === 'APPROVED';
  const canConvertEstimate = project.status === ESTIMATE_STATUS.ACCEPTED;
  const activeCustomPricing = readCustomPricing(persistDiagnostic(diagnostic));
  const isServiceCategory = ['it-networks', 'it-hardware'].includes(project.category.slug);
  const isFurnitureCategory = project.category.slug === 'mobila';
  const isElektrikaCategory = project.category.slug === 'elektrika';
  const isPlumbingCategory = project.category.slug === 'santehnika';
  const isConstructiiCategory = project.category.slug === 'constructii';
  const pricingUnitLabel = isServiceCategory
    ? t('company.estimateWizard.customPricing.unitPriceHour')
    : isFurnitureCategory
      ? t('company.estimateWizard.customPricing.unitPriceLinear')
      : isElektrikaCategory
        ? t('company.estimateWizard.customPricing.unitPricePoint')
        : isPlumbingCategory
          ? t('company.estimateWizard.customPricing.unitPricePoint')
          : isConstructiiCategory
            ? t('company.estimateWizard.customPricing.unitPriceSqm')
            : undefined;

  return {
    project,
    config,
    diagnosticQuestions,
    steps,
    stepIndex,
    setStepIndex,
    currentStep,
    title,
    setTitle,
    siteType,
    setSiteType: handleSetSiteType,
    address,
    setAddress,
    marginPct,
    setMarginPct,
    riskReservePct,
    setRiskReservePct,
    buildingYear,
    setBuildingYear,
    siteFloor,
    setSiteFloor,
    accessDifficulty,
    setAccessDifficulty,
    urgency,
    setUrgency,
    plan2d,
    setPlan2d,
    diagnostic,
    setDiagnostic,
    updateDiagnosticField,
    enabledWorkModules,
    setEnabledWorkModules,
    setWorkModuleEnabled,
    validationErrors,
    validationWarnings,
    hasBlockingErrors,
    canGoNext,
    customFieldSections,
    visibleStages,
    stageGroups,
    scopeSummary,
    projectHasManualLines,
    previewLines,
    previewTotals,
    previewVsBackendDiff,
    previewIsStale,
    isReadOnly,
    offlineState: {
      online: offline.online,
      syncState: offline.syncState,
      pendingMutations: offline.pendingMutations,
      lastSavedAt: offline.lastSavedAt,
      lastSyncedAt: offline.lastSyncedAt,
      conflict: offline.conflict,
      clientDraftId: offline.clientDraftId,
      draftVersion: offline.draftVersion,
    },
    handleSyncNow,
    offlineSyncing: syncing,
    handleDiscardLocalChanges,
    handleKeepLocalChanges,
    acknowledgeConflict: offline.acknowledgeConflict,
    apiWarnings,
    sanityWarnings,
    dirty,
    setDirty,
    savingStatus,
    lastSavedAt,
    customPricing,
    setCustomPricing,
    editingStore,
    setEditingStore,
    uploadingLineId,
    updateLine,
    addLineMutation,
    calculate,
    generateQuote,
    sendEstimate,
    handleUploadReceipt,
    handleDeleteReceipt,
    handleSaveStore,
    handleUpdateLineQtyOrPrice,
    handleAddLine,
    handleDeleteLine,
    handleSaveObject,
    handleSavePlan,
    handleSaveDiagnostic,
    handleStepChange,
    handleCalculate,
    handleGenerateQuote,
    handleConvert,
    handleSendEstimate,
    canSendEstimate,
    canConvertEstimate,
    activeCustomPricing,
    pricingUnitLabel,
    estimateMode,
    setEstimateMode,
    isServiceCategory,
    isFurnitureCategory,
    isElektrikaCategory,
    isPlumbingCategory,
    isConstructiiCategory,
  };
}

export type EstimateWizardApi = ReturnType<typeof useEstimateWizard> & {
  isServiceCategory: boolean;
  isFurnitureCategory: boolean;
  isElektrikaCategory: boolean;
  isPlumbingCategory: boolean;
  isConstructiiCategory: boolean;
  isReadOnly: boolean;
};
