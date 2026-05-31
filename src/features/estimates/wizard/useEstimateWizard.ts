import { useWizardFormState } from './hooks/useWizardFormState';
import { useWizardOffline } from './hooks/useWizardOffline';
import { useWizardDerivations } from './hooks/useWizardDerivations';
import { useWizardLineActions } from './hooks/useWizardLineActions';
import { useWizardStepActions } from './hooks/useWizardStepActions';
import type { EstimateProjectDto } from '@/types/estimates';

export function useEstimateWizard(project: EstimateProjectDto) {
  const formState = useWizardFormState(project);
  const offlineState = useWizardOffline(project.id, formState);
  const derivations = useWizardDerivations(project, formState);
  const lineActions = useWizardLineActions(project.id);
  const stepActions = useWizardStepActions({ project, formState, derivations });

  return {
    // Form state & setters
    project,
    title: formState.title,
    setTitle: formState.setTitle,
    siteType: formState.siteType,
    setSiteType: formState.setSiteType,
    address: formState.address,
    setAddress: formState.setAddress,
    marginPct: formState.marginPct,
    setMarginPct: formState.setMarginPct,
    riskReservePct: formState.riskReservePct,
    setRiskReservePct: formState.setRiskReservePct,
    siteFloor: formState.siteFloor,
    setSiteFloor: formState.setSiteFloor,
    accessDifficulty: formState.accessDifficulty,
    setAccessDifficulty: formState.setAccessDifficulty,
    urgency: formState.urgency,
    setUrgency: formState.setUrgency,
    plan2d: formState.plan2d,
    setPlan2d: formState.setPlan2d,
    diagnostic: formState.diagnostic,
    setDiagnostic: formState.setDiagnostic,
    customPricing: formState.customPricing,
    setCustomPricing: formState.setCustomPricing,
    dirty: formState.dirty,
    setDirty: formState.setDirty,
    estimateMode: formState.estimateMode,
    setEstimateMode: formState.setEstimateMode,
    setEnabledWorkModules: formState.setEnabledWorkModules,
    setWorkModuleEnabled: formState.setWorkModuleEnabled,

    // Offline / Autosave state & actions
    offlineState: {
      online: offlineState.offline.online,
      syncState: offlineState.offline.syncState,
      pendingMutations: offlineState.offline.pendingMutations,
      lastSavedAt: offlineState.offline.lastSavedAt,
      lastSyncedAt: offlineState.offline.lastSyncedAt,
      conflict: offlineState.offline.conflict,
      clientDraftId: offlineState.offline.clientDraftId,
      draftVersion: offlineState.offline.draftVersion,
    },
    handleSyncNow: offlineState.handleSyncNow,
    offlineSyncing: offlineState.syncing,
    handleDiscardLocalChanges: offlineState.handleDiscardLocalChanges,
    handleKeepLocalChanges: offlineState.handleKeepLocalChanges,
    acknowledgeConflict: offlineState.offline.acknowledgeConflict,
    savingStatus: offlineState.savingStatus,
    lastSavedAt: offlineState.lastSavedAt,

    // Derived properties & view models
    config: derivations.config,
    diagnosticQuestions: derivations.diagnosticQuestions,
    steps: derivations.steps,
    enabledWorkModules: derivations.enabledWorkModules,
    validationErrors: derivations.validationErrors,
    validationWarnings: derivations.validationWarnings,
    hasBlockingErrors: derivations.hasBlockingErrors,
    canGoNext: derivations.canGoNext,
    customFieldSections: derivations.customFieldSections,
    visibleStages: derivations.visibleStages,
    stageGroups: derivations.stageGroups,
    scopeSummary: derivations.scopeSummary,
    projectHasManualLines: derivations.projectHasManualLines,
    previewLines: derivations.previewLines,
    previewTotals: derivations.previewTotals,
    previewVsBackendDiff: derivations.previewVsBackendDiff,
    previewIsStale: derivations.previewIsStale,
    isReadOnly: derivations.isReadOnly,
    canSendEstimate: derivations.canSendEstimate,
    canConvertEstimate: derivations.canConvertEstimate,
    activeCustomPricing: derivations.activeCustomPricing,
    pricingUnitLabel: derivations.pricingUnitLabel,
    isServiceCategory: derivations.isServiceCategory,
    isFurnitureCategory: derivations.isFurnitureCategory,
    isElektrikaCategory: derivations.isElektrikaCategory,
    isPlumbingCategory: derivations.isPlumbingCategory,
    isConstructiiCategory: derivations.isConstructiiCategory,

    // Line Actions
    editingStore: lineActions.editingStore,
    setEditingStore: lineActions.setEditingStore,
    uploadingLineId: lineActions.uploadingLineId,
    updateLine: lineActions.updateLine,
    addLineMutation: lineActions.addLineMutation,
    handleUploadReceipt: lineActions.handleUploadReceipt,
    handleDeleteReceipt: lineActions.handleDeleteReceipt,
    handleSaveStore: lineActions.handleSaveStore,
    handleUpdateLineQtyOrPrice: lineActions.handleUpdateLineQtyOrPrice,
    handleUpdateLineUnit: lineActions.handleUpdateLineUnit,
    handleAddLine: lineActions.handleAddLine,
    handleDeleteLine: lineActions.handleDeleteLine,

    // Step Actions & Mutations
    stepIndex: stepActions.stepIndex,
    setStepIndex: stepActions.setStepIndex,
    currentStep: stepActions.currentStep,
    apiWarnings: stepActions.apiWarnings,
    sanityWarnings: stepActions.sanityWarnings,
    handleSaveObject: stepActions.handleSaveObject,
    handleSavePlan: stepActions.handleSavePlan,
    handleSaveDiagnostic: stepActions.handleSaveDiagnostic,
    handleStepChange: stepActions.handleStepChange,
    handleCalculate: stepActions.handleCalculate,
    handleGenerateQuote: stepActions.handleGenerateQuote,
    handleConvert: stepActions.handleConvert,
    handleSendEstimate: stepActions.handleSendEstimate,
    calculate: stepActions.calculate,
    generateQuote: stepActions.generateQuote,
    sendEstimate: stepActions.sendEstimate,
  };
}

export type EstimateWizardApi = ReturnType<typeof useEstimateWizard>;
