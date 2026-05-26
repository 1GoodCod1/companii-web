import { useMemo, useState } from 'react';
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
import {
  mergeCustomPricing,
  readCustomPricing,
  type CustomPricingValues,
} from '@/features/estimates/customPricing';
import type { EstimateBlueprintConfig, EstimateProjectDto, Plan2dData } from '@/types/estimates';
import { ESTIMATE_STATUS } from '@/constants/estimateStatus.constants';
import { DUPLICATE_DIAGNOSTIC_KEYS, EMPTY_PLAN } from '@/constants/estimatesWizard.constants';
import { syncGlobalParamsToDiagnostic } from './syncGlobalParamsToDiagnostic';
import { getErrorMessage } from '@/utils/errors';

export function useEstimateWizard(project: EstimateProjectDto) {
  const updateProject = useUpdateEstimateProjectMutation();
  const savePlan = useSaveSitePlanMutation();
  const calculate = useCalculateEstimateMutation();
  const generateQuote = useGenerateEstimateQuoteMutation();
  const convert = useConvertEstimateMutation();
  const sendEstimate = useSendEstimateMutation();

  const config: EstimateBlueprintConfig | null = project.blueprint?.config ?? null;

  const diagnosticQuestions = useMemo(() => {
    const allQuestions = config?.diagnosticQuestions ?? [];
    return allQuestions.filter((q) => !(DUPLICATE_DIAGNOSTIC_KEYS as readonly string[]).includes(q.key));
  }, [config]);

  const steps = useMemo(() => {
    const defaultSteps = config?.wizardSteps ?? ['object', 'plan', 'diagnostic', 'stages', 'review'];
    if (diagnosticQuestions.length === 0) {
      return defaultSteps.filter((s) => s !== 'diagnostic');
    }
    return defaultSteps;
  }, [config, diagnosticQuestions]);

  const [stepIndex, setStepIndex] = useState(0);
  const [title, setTitle] = useState(project.title);
  const [siteType, setSiteType] = useState(project.siteType ?? 'apartment');
  const [address, setAddress] = useState(project.address ?? '');
  const [marginPct, setMarginPct] = useState(Number(project.marginPct));
  const [plan2d, setPlan2d] = useState<Plan2dData>(project.sitePlan?.plan2d ?? EMPTY_PLAN);
  const [diagnostic, setDiagnostic] = useState<Record<string, unknown>>(
    (project.diagnosticAnswers as Record<string, unknown>) ?? {},
  );
  const [customPricing, setCustomPricing] = useState<CustomPricingValues>(() =>
    readCustomPricing((project.diagnosticAnswers as Record<string, unknown>) ?? {}),
  );

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
      toast.success('Chitanță încărcată.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut încărca chitanța.'));
    } finally {
      setUploadingLineId(null);
    }
  };

  const handleDeleteReceipt = async (lineId: string, stageId: string) => {
    if (!confirm('Sigur doriți să ștergeți această chitanță?')) return;
    try {
      await updateLine.mutateAsync({
        projectId: project.id,
        stageId,
        lineId,
        receiptFileKey: null,
      });
      toast.success('Chitanță ștearsă.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut șterge.'));
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
      toast.success('Magazin salvat.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut salva magazinul.'));
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
      toast.error(getErrorMessage(err, 'Nu s-a putut actualiza.'));
    }
  };

  const handleAddLine = async (stageId: string) => {
    try {
      await addLineMutation.mutateAsync({
        projectId: project.id,
        stageId,
        description: 'Lucrare nouă',
        qty: 1,
        unit: 'buc',
        unitPrice: 0,
      });
      toast.success('Linie adăugată.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut adăuga linia.'));
    }
  };

  const handleDeleteLine = async (lineId: string, stageId: string) => {
    if (!confirm('Sigur doriți să ștergeți această linie?')) return;
    try {
      await deleteLineMutation.mutateAsync({
        projectId: project.id,
        stageId,
        lineId,
      });
      toast.success('Linie ștearsă.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut șterge linia.'));
    }
  };

  const currentStep = steps[stepIndex] ?? 'object';

  const persistCustomPricing = (answers: Record<string, unknown>) =>
    mergeCustomPricing(answers, customPricing);

  const handleSaveObject = async () => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        title,
        siteType,
        address,
        marginPct,
        diagnosticAnswers: persistCustomPricing(diagnostic),
      });
      setDiagnostic(persistCustomPricing(diagnostic));
      toast.success('Date salvate.');
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare la salvare.'));
    }
  };

  const handleSavePlan = async () => {
    try {
      const nextDiag = syncGlobalParamsToDiagnostic(plan2d, diagnostic);
      await savePlan.mutateAsync({ id: project.id, plan2d });
      await updateProject.mutateAsync({ id: project.id, diagnosticAnswers: persistCustomPricing(nextDiag) });
      setDiagnostic(persistCustomPricing(nextDiag));
      toast.success('Date salvate.');
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare la salvare.'));
    }
  };

  const handleSaveDiagnostic = async () => {
    try {
      const nextDiagnostic = persistCustomPricing(diagnostic);
      await updateProject.mutateAsync({ id: project.id, diagnosticAnswers: nextDiagnostic });
      setDiagnostic(nextDiagnostic);
      toast.success('Diagnostic salvat.');
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare la salvare.'));
    }
  };

  const handleStepChange = async (targetIndex: number) => {
    if (currentStep === 'plan') {
      try {
        const nextDiag = syncGlobalParamsToDiagnostic(plan2d, diagnostic);
        await savePlan.mutateAsync({ id: project.id, plan2d });
        await updateProject.mutateAsync({ id: project.id, diagnosticAnswers: persistCustomPricing(nextDiag) });
        setDiagnostic(persistCustomPricing(nextDiag));
      } catch (err) {
        console.error('Autosave plan failed:', err);
      }
    }
    if (currentStep === 'diagnostic') {
      try {
        const nextDiagnostic = persistCustomPricing(diagnostic);
        await updateProject.mutateAsync({ id: project.id, diagnosticAnswers: nextDiagnostic });
        setDiagnostic(nextDiagnostic);
      } catch (err) {
        console.error('Autosave diagnostic failed:', err);
      }
    }
    setStepIndex(targetIndex);
  };

  const handleCalculate = async () => {
    try {
      const nextDiag = syncGlobalParamsToDiagnostic(plan2d, diagnostic);
      const nextDiagnostic = persistCustomPricing(nextDiag);
      await updateProject.mutateAsync({ id: project.id, diagnosticAnswers: nextDiagnostic });
      setDiagnostic(nextDiagnostic);

      await savePlan.mutateAsync({ id: project.id, plan2d });

      await calculate.mutateAsync(project.id);
      toast.success('Smetă calculată.');
      setStepIndex(steps.indexOf('review'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare la calcul.'));
    }
  };

  const handleGenerateQuote = async () => {
    try {
      await generateQuote.mutateAsync(project.id);
      toast.success('Deviz generat.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare la generare deviz.'));
    }
  };

  const handleConvert = async (mode: 'single' | 'by-stage') => {
    try {
      await convert.mutateAsync({ id: project.id, mode });
      toast.success(mode === 'by-stage' ? 'Lucrări create pe etape.' : 'Lucrare creată.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare la convertire.'));
    }
  };

  const handleSendEstimate = async () => {
    try {
      const result = await sendEstimate.mutateAsync(project.id);
      toast.success(result.emailSent ? 'Smetă trimisă clientului pe email.' : 'Smetă marcată ca trimisă.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare la trimiterea smetei.'));
    }
  };

  const canSendEstimate = project.status === 'CALCULATED' || project.status === 'APPROVED';
  const canConvertEstimate = project.status === ESTIMATE_STATUS.ACCEPTED;
  const activeCustomPricing = readCustomPricing(persistCustomPricing(diagnostic));
  const isServiceCategory = ['it-networks'].includes(project.category.slug);
  const pricingUnitLabel = isServiceCategory ? 'Preț / oră (MDL)' : undefined;

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
    setSiteType,
    address,
    setAddress,
    marginPct,
    setMarginPct,
    plan2d,
    setPlan2d,
    diagnostic,
    setDiagnostic,
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
  };
}

export type EstimateWizardApi = ReturnType<typeof useEstimateWizard>;
