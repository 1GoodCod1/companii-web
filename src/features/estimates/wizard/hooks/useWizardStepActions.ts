import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  useUpdateEstimateProjectMutation,
  useSaveSitePlanMutation,
  useCalculateEstimateMutation,
  useGenerateEstimateQuoteMutation,
  useConvertEstimateMutation,
  useSendEstimateMutation,
} from '@/features/estimates/api/useEstimates';
import { syncGlobalParamsToDiagnostic } from '../syncGlobalParamsToDiagnostic';
import { resolveEstimateWizardStepIndex } from '../resolveEstimateWizardStep';
import { getErrorMessage } from '@/shared/utils/errors';
import type { EstimateProjectDto } from '@/entities/estimate/model/estimates';
import type { WizardFormState } from './useWizardFormState';
import type { WizardDerivations } from './useWizardDerivations';
import type { AskCabinetConfirm } from '@/shared/hooks/useCabinetConfirmDialog';

type SubHookProps = {
  project: EstimateProjectDto;
  formState: WizardFormState;
  derivations: WizardDerivations;
  askConfirm: AskCabinetConfirm;
};

export function useWizardStepActions({ project, formState, derivations, askConfirm }: SubHookProps) {
  const { t } = useTranslation();

  const updateProject = useUpdateEstimateProjectMutation();
  const savePlan = useSaveSitePlanMutation();
  const calculate = useCalculateEstimateMutation();
  const generateQuote = useGenerateEstimateQuoteMutation();
  const convert = useConvertEstimateMutation();
  const sendEstimate = useSendEstimateMutation();

  const [apiWarnings, setApiWarnings] = useState<Array<{ key: string; message: string }>>([]);
  const [sanityWarnings, setSanityWarnings] = useState<
    Array<{ key: string; severity: 'info' | 'warning'; message: string }>
  >([]);

  const resolvedStepIndex = useMemo(
    () => resolveEstimateWizardStepIndex(project, derivations.steps, derivations.config),
    [project, derivations.steps, derivations.config],
  );

  const [userStepIndex, setUserStepIndex] = useState<number | null>(null);
  const stepIndex = userStepIndex ?? resolvedStepIndex;

  const setStepIndex = useCallback(
    (value: number | ((prev: number) => number)) => {
      setUserStepIndex((prev) => {
        const current = prev ?? resolvedStepIndex;
        return typeof value === 'function' ? value(current) : value;
      });
    },
    [resolvedStepIndex],
  );

  const currentStep = derivations.steps[stepIndex] ?? 'object';

  const handleSaveObject = async () => {
    try {
      const result = (await updateProject.mutateAsync({
        id: project.id,
        title: formState.title,
        siteType: formState.siteType,
        address: formState.address,
        marginPct: formState.marginPct,
    riskReservePct: formState.riskReservePct,
    siteFloor: formState.siteFloor,
        accessDifficulty: formState.accessDifficulty,
        urgency: formState.urgency,
        diagnosticAnswers: derivations.persistDiagnostic(formState.diagnostic),
      })) as { warnings?: Array<{ key: string; message: string }> } | undefined;
      formState.setDiagnostic(derivations.persistDiagnostic(formState.diagnostic));
      formState.setDirty(false);
      setApiWarnings(Array.isArray(result?.warnings) ? result!.warnings! : []);
      toast.success(t('company.estimateWizard.wizard.toasts.dataSaved'));
      setStepIndex((i) => Math.min(i + 1, derivations.steps.length - 1));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.saveFailed')));
    }
  };

  const handleSavePlan = async () => {
    try {
      const nextDiag = syncGlobalParamsToDiagnostic(formState.plan2d, formState.diagnostic);
      await savePlan.mutateAsync({ id: project.id, plan2d: formState.plan2d });
      await updateProject.mutateAsync({
        id: project.id,
        diagnosticAnswers: derivations.persistDiagnostic(nextDiag),
      });
      formState.setDiagnostic(derivations.persistDiagnostic(nextDiag));
      formState.setDirty(false);
      toast.success(t('company.estimateWizard.wizard.toasts.dataSaved'));
      setStepIndex((i) => Math.min(i + 1, derivations.steps.length - 1));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.saveFailed')));
    }
  };

  const handleSaveDiagnostic = async () => {
    if (derivations.hasBlockingErrors) {
      toast.error(t('company.estimateWizard.wizard.toasts.validationFailed'));
      return;
    }
    try {
      const nextDiagnostic = derivations.persistDiagnostic(formState.diagnostic);
      const result = (await updateProject.mutateAsync({
        id: project.id,
        diagnosticAnswers: nextDiagnostic,
      })) as { warnings?: Array<{ key: string; message: string }> } | undefined;
      formState.setDiagnostic(nextDiagnostic);
      formState.setDirty(false);
      setApiWarnings(Array.isArray(result?.warnings) ? result!.warnings! : []);
      toast.success(t('company.estimateWizard.wizard.toasts.diagnosticSaved'));

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
      const stagesIndex = derivations.steps.indexOf('stages');
      setStepIndex(
        stagesIndex >= 0 ? stagesIndex : Math.min(stepIndex + 1, derivations.steps.length - 1),
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.saveFailed')));
    }
  };

  const handleStepChange = async (targetIndex: number) => {
    const diagnosticIndex = derivations.steps.indexOf('diagnostic');
    if (
      targetIndex > stepIndex &&
      diagnosticIndex !== -1 &&
      stepIndex >= diagnosticIndex &&
      derivations.hasBlockingErrors
    ) {
      toast.error(t('company.estimateWizard.wizard.toasts.validationFailed'));
      return;
    }
    const targetStep = derivations.steps[targetIndex];
    if (currentStep === 'plan' && formState.dirty) {
      try {
        const nextDiag = syncGlobalParamsToDiagnostic(formState.plan2d, formState.diagnostic);
        await savePlan.mutateAsync({ id: project.id, plan2d: formState.plan2d });
        await updateProject.mutateAsync({
          id: project.id,
          diagnosticAnswers: derivations.persistDiagnostic(nextDiag),
        });
        formState.setDiagnostic(derivations.persistDiagnostic(nextDiag));
        formState.setDirty(false);

        if (targetStep === 'stages' || targetStep === 'review') {
          try {
            const calcResult = (await calculate.mutateAsync(project.id)) as
              | { sanityWarnings?: Array<{ key: string; severity: 'info' | 'warning'; message: string }> }
              | undefined;
            setSanityWarnings(
              Array.isArray(calcResult?.sanityWarnings) ? calcResult!.sanityWarnings! : [],
            );
          } catch (calcErr) {
            console.warn('Auto-calculate after step change from plan failed:', calcErr);
          }
        }
      } catch (err) {
        console.error('Autosave plan failed:', err);
      }
    }
    if (currentStep === 'diagnostic' && formState.dirty) {
      try {
        const nextDiagnostic = derivations.persistDiagnostic(formState.diagnostic);
        await updateProject.mutateAsync({ id: project.id, diagnosticAnswers: nextDiagnostic });
        formState.setDiagnostic(nextDiagnostic);
        formState.setDirty(false);

        if (targetIndex > stepIndex && (targetStep === 'stages' || targetStep === 'review')) {
          try {
            const calcResult = (await calculate.mutateAsync(project.id)) as
              | { sanityWarnings?: Array<{ key: string; severity: 'info' | 'warning'; message: string }> }
              | undefined;
            setSanityWarnings(
              Array.isArray(calcResult?.sanityWarnings) ? calcResult!.sanityWarnings! : [],
            );
          } catch (calcErr) {
            console.warn('Auto-calculate after step change from diagnostic failed:', calcErr);
          }
        }
      } catch (err) {
        console.error('Autosave diagnostic failed:', err);
      }
    }
    setStepIndex(targetIndex);
  };

  const runCalculate = async () => {
    try {
      const nextDiag = syncGlobalParamsToDiagnostic(formState.plan2d, formState.diagnostic);
      const nextDiagnostic = derivations.persistDiagnostic(nextDiag);
      await updateProject.mutateAsync({ id: project.id, diagnosticAnswers: nextDiagnostic });
      formState.setDiagnostic(nextDiagnostic);

      await savePlan.mutateAsync({ id: project.id, plan2d: formState.plan2d });

      const result = (await calculate.mutateAsync(project.id)) as
        | { sanityWarnings?: Array<{ key: string; severity: 'info' | 'warning'; message: string }> }
        | undefined;
      setSanityWarnings(Array.isArray(result?.sanityWarnings) ? result!.sanityWarnings! : []);
      formState.setDirty(false);
      toast.success(t('company.estimateWizard.wizard.toasts.calculateSuccess'));
      setStepIndex(derivations.steps.indexOf('review'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.wizard.toasts.calculateFailed')));
    }
  };

  const handleCalculate = async () => {
    if (derivations.hasBlockingErrors) {
      toast.error(t('company.estimateWizard.wizard.toasts.validationFailed'));
      return;
    }
    if (derivations.projectHasManualLines) {
      askConfirm({
        title: t('cabinet.common.confirmAction'),
        confirmLabel: t('cabinet.common.confirmAction'),
        variant: 'primary',
        message: t('company.estimateWizard.wizard.toasts.recalculateConfirm'),
        onConfirm: runCalculate,
      });
      return;
    }
    await runCalculate();
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

  return {
    stepIndex,
    setStepIndex,
    currentStep,
    apiWarnings,
    sanityWarnings,
    handleSaveObject,
    handleSavePlan,
    handleSaveDiagnostic,
    handleStepChange,
    handleCalculate,
    handleGenerateQuote,
    handleConvert,
    handleSendEstimate,
    calculate,
    generateQuote,
    sendEstimate,
  };
}

export type WizardStepActions = ReturnType<typeof useWizardStepActions>;
