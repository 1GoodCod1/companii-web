import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { usePricingModifiersQuery } from '@/features/companies/api/useCompanies';
import { getCustomFieldKeys, groupVisibleCustomFields } from '@/features/estimates/diagnostic/groupCustomFields';
import { readEnabledWorkModulesForCategory, mergeEnabledWorkModulesIntoDiagnostic } from '@/features/estimates/diagnostic/workModules';
import { mergeCustomPricing } from '@/features/estimates/utils/customPricing';
import { validateDiagnostic } from '@/features/estimates/diagnostic/diagnosticValidation';
import { getVisibleStages } from '@/features/estimates/stages/stageVisibility';
import { groupStagesByWorkModule } from '@/features/estimates/stages/stageGrouping';
import { buildScopeSummary, hasManualLines } from '@/features/estimates/stages/scopeSummary';
import { computePreviewLinesWithStageDefaults, computePreviewTotals, extractMeasurementsFromDiagnostic } from '@/features/estimates/preview/previewEngine';
import { DUPLICATE_DIAGNOSTIC_KEYS } from '@/constants/estimatesWizard.constants';
import { isEstimateServiceCategorySlug } from '@/constants/estimateCategorySlugs.constants';
import type { EstimateProjectDto } from '@/types/estimates';
import type { WizardFormState } from './useWizardFormState';

export function useWizardDerivations(project: EstimateProjectDto, formState: WizardFormState) {
  const { t } = useTranslation();

  const activeCompanyId = useAuthStore((s) => s.user?.activeCompanyId) ?? '';
  const pricingOverrides = usePricingModifiersQuery(activeCompanyId).data?.overrides;

  const config = project.blueprint?.config ?? null;

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

  const enabledWorkModules = useMemo(
    () => (config ? readEnabledWorkModulesForCategory(project.category.slug, formState.diagnostic, config) : []),
    [formState.diagnostic, config, project.category.slug],
  );

  const persistDiagnostic = useCallback(
    (answers: Record<string, unknown>) =>
      mergeEnabledWorkModulesIntoDiagnostic(
        mergeCustomPricing(answers, formState.customPricing),
        config,
      ),
    [formState.customPricing, config],
  );

  const validation = useMemo(
    () => validateDiagnostic(config, persistDiagnostic(formState.diagnostic)),
    [config, formState.diagnostic, persistDiagnostic],
  );
  const validationErrors = validation.fieldErrors;
  const validationWarnings = validation.warnings;
  const hasBlockingErrors = !validation.ok;
  const canGoNext = !hasBlockingErrors;

  const customFieldSections = useMemo(
    () => groupVisibleCustomFields(config, enabledWorkModules, persistDiagnostic(formState.diagnostic)),
    [config, enabledWorkModules, formState.diagnostic, persistDiagnostic],
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
    () => buildScopeSummary(config, enabledWorkModules, project.stages ?? [], formState.diagnostic),
    [config, enabledWorkModules, project.stages, formState.diagnostic],
  );

  const projectHasManualLines = useMemo(
    () => hasManualLines(project.stages ?? []),
    [project.stages],
  );

  const previewLines = useMemo(
    () =>
      computePreviewLinesWithStageDefaults(
        config,
        extractMeasurementsFromDiagnostic(
          persistDiagnostic(formState.diagnostic),
          project.category?.slug ?? undefined,
          pricingOverrides,
          formState.plan2d,
        ),
        enabledWorkModules,
        formState.accessDifficulty,
        formState.urgency,
        formState.diagnostic.materialIncluded !== false,
        formState.diagnostic,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config, formState.diagnostic, formState.plan2d, enabledWorkModules, formState.accessDifficulty, formState.urgency, persistDiagnostic, pricingOverrides],
  );

  const previewTotals = useMemo(
    () => computePreviewTotals(previewLines, formState.marginPct, formState.customPricing, formState.riskReservePct),
    [previewLines, formState.marginPct, formState.customPricing, formState.riskReservePct],
  );

  const backendGrandTotal = Number(project.grandTotal ?? 0);
  const previewVsBackendDiff =
    backendGrandTotal > 0 && previewTotals.hasContent
      ? Math.round((previewTotals.grandTotal - backendGrandTotal) * 100) / 100
      : 0;
  const previewIsStale = Math.abs(previewVsBackendDiff) >= 1;

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
  const canConvertEstimate = project.status === 'ACCEPTED';
  const activeCustomPricing = useMemo(
    () => formState.customPricing,
    [formState.customPricing],
  );

  const isServiceCategory = isEstimateServiceCategorySlug(project.category.slug);
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
    config,
    diagnosticQuestions,
    steps,
    enabledWorkModules,
    persistDiagnostic,
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
    canSendEstimate,
    canConvertEstimate,
    activeCustomPricing,
    pricingUnitLabel,
    isServiceCategory,
    isFurnitureCategory,
    isElektrikaCategory,
    isPlumbingCategory,
    isConstructiiCategory,
  };
}

export type WizardDerivations = ReturnType<typeof useWizardDerivations>;
