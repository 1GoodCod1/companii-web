import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  FileText,
  Hammer,
  Save,
  Send,
  Paperclip,
  Trash2,
  Eye,
  Check,
  Plus,
} from 'lucide-react';
import {
  PageHero,
  Panel,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
  cabinetSelectClass,
} from '@/components/cabinet/cabinet-ui';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';
import { useCategoriesQuery } from '@/features/companies/api/useCompanies';
import { useCustomersQuery } from '@/features/fsm/api/useFsm';
import {
  useCalculateEstimateMutation,
  useConvertEstimateMutation,
  useCreateEstimateProjectMutation,
  useEstimateBlueprintsQuery,
  useEstimateProjectQuery,
  useGenerateEstimateQuoteMutation,
  useSaveSitePlanMutation,
  useUpdateEstimateProjectMutation,
  useSendEstimateMutation,
  useUpdateEstimateLineMutation,
  useAddEstimateLineMutation,
  useDeleteEstimateLineMutation,
} from '@/features/estimates/api/useEstimates';
import { PlanEditor2D } from '@/features/estimates/components/PlanEditor2D';
import { CustomPricingFields } from '@/features/estimates/components/CustomPricingFields';
import {
  mergeCustomPricing,
  readCustomPricing,
  type CustomPricingValues,
} from '@/features/estimates/customPricing';
import {
  ESTIMATE_STATUS_LABELS,
  WIZARD_STEP_LABELS,
} from '@/features/estimates/statusLabels';
import type { EstimateBlueprintConfig, EstimateProjectDto, EstimateStageDto, Plan2dData } from '@/features/estimates/types';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
import { resolveActiveCompany } from '@/features/companies/resolveActiveCompany';
import { downloadFile } from '@/api/files';

const EMPTY_PLAN: Plan2dData = { rooms: [], points: [] };

const DUPLICATE_DIAGNOSTIC_KEYS = [
  'roofArea',
  'gutterLengthM',
  'roomCount',
  'acUnits',
  'finishArea',
  'wallHeight',
  'windowCount',
  'doorCount',
  'cabinetCount',
  'wardrobeCount',
  'cleanArea',
  'networkPoints',
  'apCount',
  'cameraCount',
  'panelCount',
  'builtArea',
  'storyCount',
  'pavementArea',
  'borderLengthM',
  'facadeArea',
  'scaffoldingArea',
];

const syncGlobalParamsToDiagnostic = (
  plan: Plan2dData,
  currentDiag: Record<string, unknown>,
): Record<string, unknown> => {
  const next = { ...currentDiag };
  const params = (plan.globalParameters || {}) as any;

  // 1. Map global parameters if set by user
  if (params.baseArea != null) {
    next.baseArea = params.baseArea;
    next.roofArea = params.baseArea;
    next.builtArea = params.baseArea;
    next.pavementArea = params.baseArea;
    next.cleanArea = params.baseArea;
    next.finishArea = params.baseArea;
  }
  if (params.wallHeight != null) {
    next.wallHeight = params.wallHeight;
  }
  if (params.floorsCount != null) {
    next.storyCount = params.floorsCount;
    next.roomCount = params.floorsCount;
  }
  if (params.roofSlope != null) {
    next.roofSlope = params.roofSlope;
  }
  if (params.facadeArea != null) {
    next.facadeArea = params.facadeArea;
    next.scaffoldingArea = params.facadeArea;
  }

  // 2. Map Room counts & calculated area
  if (plan.rooms && plan.rooms.length > 0) {
    const totalArea = plan.rooms.reduce((acc, r) => acc + r.width * r.height, 0);
    next.totalFloorArea = totalArea;
    next.roomCount = plan.rooms.length;

    // Set fallbacks if not set
    if (next.roofArea == null) next.roofArea = totalArea;
    if (next.builtArea == null) next.builtArea = totalArea;
    if (next.pavementArea == null) next.pavementArea = totalArea;
    if (next.cleanArea == null) next.cleanArea = totalArea;
    if (next.finishArea == null) next.finishArea = totalArea;
  }

  // 3. Map point counts dynamically to diagnostic answers
  const pointsCount = (type: string) => plan.points?.filter((p) => p.type === type).length ?? 0;

  // Clima
  const splitCount = pointsCount('indoor');
  if (splitCount > 0) next.acUnits = splitCount;
  const routeCount = pointsCount('route');
  if (routeCount > 0) next.routeLengthM = routeCount * 5;

  // Okna-dveri
  const windowCount = pointsCount('window');
  if (windowCount > 0) next.windowCount = windowCount;
  const doorCount = pointsCount('door') + pointsCount('sliding_door');
  if (doorCount > 0) next.doorCount = doorCount;

  // Mobila
  const cabinetCount = pointsCount('kitchen_cabinet') + pointsCount('table');
  if (cabinetCount > 0) next.cabinetCount = cabinetCount;
  const wardrobeCount = pointsCount('wardrobe') + pointsCount('bed');
  if (wardrobeCount > 0) next.wardrobeCount = wardrobeCount;

  // Cleaning
  const cleanWindows = pointsCount('window_clean');
  if (cleanWindows > 0) next.windowCount = cleanWindows;

  // IT networks
  const netPoints = pointsCount('ethernet');
  if (netPoints > 0) next.networkPoints = netPoints;
  const apPoints = pointsCount('ap');
  if (apPoints > 0) next.apCount = apPoints;
  const camPoints = pointsCount('camera');
  if (camPoints > 0) next.cameraCount = camPoints;

  // Solar panels
  const panelPoints = pointsCount('solar_panel');
  if (panelPoints > 0) next.panelCount = panelPoints;

  // Acoperis
  const gutterPoints = pointsCount('gutter');
  if (gutterPoints > 0) next.gutterLengthM = gutterPoints * 6;

  // Pavaj
  const borderPoints = pointsCount('border');
  if (borderPoints > 0) next.borderLengthM = borderPoints * 8;

  return next;
};

type ExistingEstimateWizardProps = {
  project: EstimateProjectDto;
};

function ExistingEstimateWizard({ project }: ExistingEstimateWizardProps) {
  const updateProject = useUpdateEstimateProjectMutation();
  const savePlan = useSaveSitePlanMutation();
  const calculate = useCalculateEstimateMutation();
  const generateQuote = useGenerateEstimateQuoteMutation();
  const convert = useConvertEstimateMutation();
  const sendEstimate = useSendEstimateMutation();

  const config: EstimateBlueprintConfig | null = project.blueprint?.config ?? null;

  const diagnosticQuestions = useMemo(() => {
    const allQuestions = config?.diagnosticQuestions ?? [];
    return allQuestions.filter((q) => !DUPLICATE_DIAGNOSTIC_KEYS.includes(q.key));
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
      toast.error((err as Error).message || 'Nu s-a putut încărca chitanța.');
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
      toast.error((err as Error).message || 'Nu s-a putut șterge.');
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
      toast.error((err as Error).message || 'Nu s-a putut salva magazinul.');
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
      toast.error((err as Error).message || 'Nu s-a putut actualiza.');
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
      toast.error((err as Error).message || 'Nu s-a putut adăuga linia.');
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
      toast.error((err as Error).message || 'Nu s-a putut șterge linia.');
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
      toast.error((err as Error).message || 'Eroare la salvare.');
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
      toast.error((err as Error).message || 'Eroare la salvare.');
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
      toast.error((err as Error).message || 'Eroare la salvare.');
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

      // Auto-save the latest plan as well
      await savePlan.mutateAsync({ id: project.id, plan2d });

      await calculate.mutateAsync(project.id);
      toast.success('Smetă calculată.');
      setStepIndex(steps.indexOf('review'));
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Eroare la calcul.');
    }
  };

  const handleGenerateQuote = async () => {
    try {
      await generateQuote.mutateAsync(project.id);
      toast.success('Deviz generat.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Eroare la generare deviz.');
    }
  };

  const handleConvert = async (mode: 'single' | 'by-stage') => {
    try {
      await convert.mutateAsync({ id: project.id, mode });
      toast.success(mode === 'by-stage' ? 'Lucrări create pe etape.' : 'Lucrare creată.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Eroare la convertire.');
    }
  };

  const handleSendEstimate = async () => {
    try {
      const result = await sendEstimate.mutateAsync(project.id);
      toast.success(result.emailSent ? 'Smetă trimisă clientului pe email.' : 'Smetă marcată ca trimisă.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Eroare la trimiterea smetei.');
    }
  };

  const canSendEstimate = project.status === 'CALCULATED' || project.status === 'APPROVED';
  const canConvertEstimate = project.status === 'ACCEPTED';
  const activeCustomPricing = readCustomPricing(persistCustomPricing(diagnostic));
  const isServiceCategory = ['it-networks'].includes(project.category.slug);
  const pricingUnitLabel = isServiceCategory ? 'Preț / oră (MDL)' : undefined;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <button
            key={step}
            type="button"
            onClick={() => handleStepChange(index)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
              index === stepIndex
                ? 'bg-violet-600 text-white shadow-md'
                : index < stepIndex
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {index + 1}. {WIZARD_STEP_LABELS[step]}
          </button>
        ))}
      </div>

      {currentStep === 'object' && (
        <Panel className="p-6 max-w-2xl space-y-4">
          <label className={cabinetLabelClass}>
            Titlu proiect
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={cabinetFieldClass} />
          </label>
          <label className={cabinetLabelClass}>
            Tip obiect
            <select value={siteType} onChange={(e) => setSiteType(e.target.value)} className={cabinetSelectClass}>
              {(config?.siteTypes ?? []).map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
          <label className={cabinetLabelClass}>
            Adresă obiect
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={cabinetFieldClass} />
          </label>
          <label className={cabinetLabelClass}>
            Marjă (%)
            <input type="number" min={0} max={100} value={marginPct} onChange={(e) => setMarginPct(Number(e.target.value))} className={cabinetFieldClass} />
          </label>
          <CustomPricingFields values={customPricing} onChange={setCustomPricing} unitLabel={pricingUnitLabel} />
          <button type="button" onClick={handleSaveObject} className={cabinetBtnPrimary}>
            <Save className="w-4 h-4" /> Salvează și continuă
          </button>
        </Panel>
      )}

      {currentStep === 'plan' && (
        <div className="space-y-6">
          <PlanEditor2D
            value={plan2d}
            config={config}
            categoryName={project.category.name}
            categorySlug={project.category.slug}
            onChange={setPlan2d}
          />
          <div className="flex gap-3">
            <button type="button" onClick={handleSavePlan} className={cabinetBtnPrimary}>
              <Save className="w-4 h-4" /> Salvează dimensiuni & dotări
            </button>
            <button type="button" onClick={() => setStepIndex((i) => i + 1)} className={cabinetBtnSecondary}>
              Continuă fără salvare
            </button>
          </div>
        </div>
      )}

      {currentStep === 'diagnostic' && (
        <Panel className="p-6 max-w-2xl space-y-4">
          <h3 className="font-bold text-gray-900">Diagnostic — {project.category.name}</h3>
          {diagnosticQuestions.map((q) => (
            <label key={q.key} className={cabinetLabelClass}>
              {q.label}
              {q.type === 'boolean' ? (
                <select
                  value={String(diagnostic[q.key] ?? '')}
                  onChange={(e) => setDiagnostic({ ...diagnostic, [q.key]: e.target.value === 'true' })}
                  className={cabinetSelectClass}
                >
                  <option value="">—</option>
                  <option value="true">Da</option>
                  <option value="false">Nu</option>
                </select>
              ) : q.type === 'select' ? (
                <select
                  value={String(diagnostic[q.key] ?? '')}
                  onChange={(e) => setDiagnostic({ ...diagnostic, [q.key]: e.target.value })}
                  className={cabinetSelectClass}
                >
                  <option value="">—</option>
                  {(q.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={String(diagnostic[q.key] ?? '')}
                  onChange={(e) => setDiagnostic({ ...diagnostic, [q.key]: Number(e.target.value) })}
                  className={cabinetFieldClass}
                />
              )}
            </label>
          ))}
          <CustomPricingFields values={customPricing} onChange={setCustomPricing} compact unitLabel={pricingUnitLabel} />
          <button type="button" onClick={handleSaveDiagnostic} className={cabinetBtnPrimary}>
            Salvează diagnostic
          </button>
        </Panel>
      )}

      {currentStep === 'stages' && (
        <div className="space-y-4">
          <Panel className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Etape & calcul preț</h3>
                <p className="text-sm text-gray-500">
                  Recalculează liniile din plan, diagnostic, tarife personalizate și regulile categoriei.
                  Puteți edita direct descrierea, cantitatea, prețul și materialele fiecărei lucrări.
                </p>
              </div>
              <button type="button" onClick={handleCalculate} disabled={calculate.isPending} className={cabinetBtnPrimary}>
                <Calculator className="w-4 h-4" /> Calculează smeta
              </button>
            </div>

            <div className="space-y-6">
              {(project.stages as EstimateStageDto[]).map((stage, index) => (
                <div key={stage.id} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-gray-100/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-violet-600 text-white text-xs font-black flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900">{stage.name}</p>
                        {stage.description && <p className="text-[10px] text-gray-500">{stage.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {stage.laborHours != null && <span>~{Number(stage.laborHours)} ore</span>}
                      {stage.durationDays != null && <span>{stage.durationDays} zile</span>}
                      <span className="text-sm font-bold text-violet-700">
                        {Number(stage.stageTotal ?? 0).toLocaleString('ro-MD')} MDL
                      </span>
                    </div>
                  </div>

                  {stage.lines?.length ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                            <th className="py-2">Descriere lucrare</th>
                            <th className="py-2 w-20">Cant.</th>
                            <th className="py-2 w-20">Unitate</th>
                            <th className="py-2 w-28">Preț Unitar</th>
                            <th className="py-2 w-28">Total</th>
                            <th className="py-2">Magazin / Sursă</th>
                            <th className="py-2 text-right">Bon</th>
                            <th className="py-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                          {stage.lines.map((line) => {
                            const isLabor =
                              line.unit === 'ore' ||
                              line.unit === 'h' ||
                              line.description.toLowerCase().includes('manoperă') ||
                              line.description.toLowerCase().includes('manopera');
                            return (
                              <tr key={line.id} className="hover:bg-violet-50/20 transition-colors">
                                <td className="py-3">
                                  <input
                                    type="text"
                                    defaultValue={line.description}
                                    onBlur={(e) => {
                                      const val = e.target.value.trim();
                                      if (val && val !== line.description) {
                                        updateLine.mutate({
                                          projectId: project.id,
                                          stageId: stage.id,
                                          lineId: line.id,
                                          description: val,
                                        });
                                      }
                                    }}
                                    className="w-full min-w-[160px] rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                                  />
                                </td>
                                <td className="py-3">
                                  <input
                                    type="number"
                                    defaultValue={Number(line.qty)}
                                    onBlur={(e) =>
                                      handleUpdateLineQtyOrPrice(
                                        line.id,
                                        stage.id,
                                        'qty',
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                                  />
                                </td>
                                <td className="py-3 text-gray-500 font-medium">{line.unit}</td>
                                <td className="py-3">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      defaultValue={Number(line.unitPrice)}
                                      onBlur={(e) =>
                                        handleUpdateLineQtyOrPrice(
                                          line.id,
                                          stage.id,
                                          'unitPrice',
                                          Number(e.target.value),
                                        )
                                      }
                                      className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                                    />
                                    <span className="text-[10px] text-gray-400">MDL</span>
                                  </div>
                                </td>
                                <td className="py-3 font-extrabold text-gray-900">
                                  {Number(line.lineTotal).toLocaleString('ro-MD')} MDL
                                </td>
                                <td className="py-3">
                                  {isLabor ? (
                                    <span className="text-[10px] text-gray-400 italic">Serviciu / Manoperă</span>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        placeholder="Ex: Supraten, Leroy"
                                        value={
                                          editingStore?.lineId === line.id
                                            ? editingStore.value
                                            : line.materialStore || ''
                                        }
                                        onChange={(e) =>
                                          setEditingStore({ lineId: line.id, value: e.target.value })
                                        }
                                        onBlur={() => handleSaveStore(line.id, stage.id)}
                                        className="w-36 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                                      />
                                      {editingStore?.lineId === line.id && (
                                        <button
                                          type="button"
                                          onMouseDown={() => handleSaveStore(line.id, stage.id)}
                                          className="rounded-md bg-emerald-100 p-1 text-emerald-700 hover:bg-emerald-200 transition-colors"
                                        >
                                          <Check className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 text-right">
                                  {isLabor ? null : (
                                    <div className="inline-flex items-center gap-2">
                                      {line.receiptFileKey ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              downloadFile(
                                                line.receiptFileKey!,
                                                `Bon-${line.description.replace(/\s+/g, '_')}.pdf`,
                                              )
                                            }
                                            className="inline-flex items-center gap-1 rounded-xl bg-violet-50 border border-violet-100 px-2 py-1 text-[10px] font-bold text-violet-700 hover:bg-violet-100 transition-colors"
                                          >
                                            <Eye className="w-3.5 h-3.5" /> Vezi
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteReceipt(line.id, stage.id)}
                                            className="rounded-xl bg-red-50 border border-red-100 p-1 text-red-600 hover:bg-red-100 transition-colors"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      ) : (
                                        <label className="relative cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                                          {uploadingLineId === line.id ? (
                                            <span className="animate-pulse">Se încarcă...</span>
                                          ) : (
                                            <>
                                              <Plus className="w-3 h-3" /> Bon
                                            </>
                                          )}
                                          <input
                                            type="file"
                                            className="sr-only"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleUploadReceipt(line.id, stage.id, file);
                                            }}
                                          />
                                        </label>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLine(line.id, stage.id)}
                                    title="Șterge linia"
                                    className="rounded-lg bg-red-50 border border-red-100 p-1.5 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Nu există linii. Apăsați «Calculează smeta» pentru a genera liniile automat.</p>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAddLine(stage.id)}
                    disabled={addLineMutation.isPending}
                    className="w-full mt-2 rounded-xl border border-dashed border-violet-200 bg-violet-50/50 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adaugă lucrare nouă
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {currentStep === 'review' && (
        <div className="space-y-4">
          <Panel className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">Rezumat smetă</h3>
            {(activeCustomPricing.customUnitPriceSqm ||
              activeCustomPricing.customDurationDays ||
              activeCustomPricing.customLaborHours ||
              activeCustomPricing.customLaborTotal) && (
              <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-gray-700 space-y-1">
                <p className="font-bold text-gray-900">Tarife personalizate aplicate</p>
                {activeCustomPricing.customUnitPriceSqm ? (
                  <p>Preț / m²: {activeCustomPricing.customUnitPriceSqm.toLocaleString('ro-MD')} MDL</p>
                ) : null}
                {activeCustomPricing.customLaborTotal ? (
                  <p>Preț total fix manoperă: {activeCustomPricing.customLaborTotal.toLocaleString('ro-MD')} MDL</p>
                ) : null}
                {activeCustomPricing.customDurationDays ? (
                  <p>Durată: {activeCustomPricing.customDurationDays} zile</p>
                ) : null}
                {activeCustomPricing.customLaborHours ? (
                  <p>Ore manoperă: {activeCustomPricing.customLaborHours}</p>
                ) : null}
              </div>
            )}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Manoperă</p>
                <p className="text-xl font-black text-gray-900">{Number(project.laborTotal).toLocaleString('ro-MD')} MDL</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Materiale</p>
                <p className="text-xl font-black text-gray-900">{Number(project.materialTotal).toLocaleString('ro-MD')} MDL</p>
              </div>
              <div className="rounded-2xl bg-violet-50 p-4 border border-violet-100">
                <p className="text-xs text-violet-600">Total cu marjă {Number(project.marginPct)}%</p>
                <p className="text-2xl font-black text-violet-700">{Number(project.grandTotal).toLocaleString('ro-MD')} MDL</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {canSendEstimate ? (
                <button
                  type="button"
                  onClick={handleSendEstimate}
                  disabled={sendEstimate.isPending}
                  className={cabinetBtnPrimary}
                >
                  <Send className="w-4 h-4" /> {sendEstimate.isPending ? 'Se trimite...' : 'Trimite smeta clientului'}
                </button>
              ) : null}
              <button type="button" onClick={handleGenerateQuote} disabled={!!project.quote || generateQuote.isPending} className={cabinetBtnPrimary}>
                <FileText className="w-4 h-4" /> Generează deviz
              </button>
              {canConvertEstimate ? (
                <>
                  <button type="button" onClick={() => handleConvert('single')} className={cabinetBtnSecondary}>
                    <Hammer className="w-4 h-4" /> O lucrare
                  </button>
                  <button type="button" onClick={() => handleConvert('by-stage')} className={cabinetBtnSecondary}>
                    <Send className="w-4 h-4" /> Câte o lucrare / etapă
                  </button>
                </>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  Convertirea în lucrări este disponibilă după ce clientul acceptă smeta în portal.
                </p>
              )}
              {project.quote && (
                <Link to="/company/oferte" className={cabinetBtnSecondary}>
                  Vezi deviz {project.quote.number}
                </Link>
              )}
            </div>
          </Panel>

          {/* Detailed Materials and Receipts Section */}
          <Panel className="p-6">
            <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2 mb-1">
              <Paperclip className="w-5 h-5 text-violet-600 animate-pulse" /> Detalii materiale, prețuri și bonuri de plată
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Mărește precizia smetei ajustând prețurile reale din magazine, adăugând denumirea magazinului de achiziție și atașând chitanțele / bonurile fiscale pentru transparență totală față de client.
            </p>

            <div className="space-y-6">
              {(project.stages as EstimateStageDto[]).map((stage) => {
                const materialLines = (stage.lines ?? []).filter((l) => l.source !== 'stage-default');
                if (materialLines.length === 0) return null;

                return (
                  <div key={stage.id} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-3 shadow-xs">
                    <div className="font-extrabold text-sm text-gray-800 border-b border-gray-100/80 pb-2 flex items-center justify-between">
                      <span className="text-gray-900 font-bold text-sm">Etapa: {stage.name}</span>
                      <span className="text-xs font-semibold text-violet-600">Total etapă: {Number(stage.stageTotal).toLocaleString('ro-MD')} MDL</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                            <th className="py-2">Descriere</th>
                            <th className="py-2 w-20">Cantitate</th>
                            <th className="py-2 w-20">Unitate</th>
                            <th className="py-2 w-28">Preț Unitar</th>
                            <th className="py-2 w-28">Total</th>
                            <th className="py-2">Magazin / Sursă</th>
                            <th className="py-2 text-right">Bon de Casă / Chec</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                          {materialLines.map((line) => {
                            const isLabor =
                              line.unit === 'ore' ||
                              line.unit === 'h' ||
                              line.description.toLowerCase().includes('manoperă') ||
                              line.description.toLowerCase().includes('manopera');
                            return (
                              <tr key={line.id} className="hover:bg-violet-50/20 transition-colors">
                                <td className="py-3 font-semibold text-gray-700">{line.description}</td>
                                <td className="py-3">
                                  <input
                                    type="number"
                                    defaultValue={Number(line.qty)}
                                    onBlur={(e) =>
                                      handleUpdateLineQtyOrPrice(
                                        line.id,
                                        stage.id,
                                        'qty',
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                                  />
                                </td>
                                <td className="py-3 text-gray-500 font-medium">{line.unit}</td>
                                <td className="py-3">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      defaultValue={Number(line.unitPrice)}
                                      onBlur={(e) =>
                                        handleUpdateLineQtyOrPrice(
                                          line.id,
                                          stage.id,
                                          'unitPrice',
                                          Number(e.target.value),
                                        )
                                      }
                                      className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                                    />
                                    <span className="text-[10px] text-gray-400">MDL</span>
                                  </div>
                                </td>
                                <td className="py-3 font-extrabold text-gray-900">
                                  {Number(line.lineTotal).toLocaleString('ro-MD')} MDL
                                </td>
                                <td className="py-3">
                                  {isLabor ? (
                                    <span className="text-[10px] text-gray-400 italic">Serviciu / Manoperă</span>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        placeholder="Ex: Supraten, Leroy"
                                        value={
                                          editingStore?.lineId === line.id
                                            ? editingStore.value
                                            : line.materialStore || ''
                                        }
                                        onChange={(e) =>
                                          setEditingStore({ lineId: line.id, value: e.target.value })
                                        }
                                        onBlur={() => handleSaveStore(line.id, stage.id)}
                                        className="w-36 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                                      />
                                      {editingStore?.lineId === line.id && (
                                        <button
                                          type="button"
                                          onMouseDown={() => handleSaveStore(line.id, stage.id)}
                                          className="rounded-md bg-emerald-100 p-1 text-emerald-700 hover:bg-emerald-200 transition-colors"
                                        >
                                          <Check className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 text-right">
                                  {isLabor ? null : (
                                    <div className="inline-flex items-center gap-2">
                                      {line.receiptFileKey ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              downloadFile(
                                                line.receiptFileKey!,
                                                `Bon-${line.description.replace(/\s+/g, '_')}.pdf`,
                                              )
                                            }
                                            className="inline-flex items-center gap-1 rounded-xl bg-violet-50 border border-violet-100 px-2 py-1 text-[10px] font-bold text-violet-700 hover:bg-violet-100 transition-colors"
                                          >
                                            <Eye className="w-3.5 h-3.5" /> Vizualizează
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteReceipt(line.id, stage.id)}
                                            className="rounded-xl bg-red-50 border border-red-100 p-1 text-red-600 hover:bg-red-100 transition-colors"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      ) : (
                                        <label className="relative cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                                          {uploadingLineId === line.id ? (
                                            <span className="animate-pulse">Se încarcă...</span>
                                          ) : (
                                            <>
                                              <Plus className="w-3 h-3" /> Atașează Bon
                                            </>
                                          )}
                                          <input
                                            type="file"
                                            className="sr-only"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleUploadReceipt(line.id, stage.id, file);
                                            }}
                                          />
                                        </label>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}

export function CompanyEstimateWizardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const { companyMe, activeCompanyId } = useCompanyPermissions();
  const activeCompany = useMemo(() => {
    return resolveActiveCompany(companyMe, activeCompanyId).company;
  }, [companyMe, activeCompanyId]);

  const { data: categories } = useCategoriesQuery();
  const { data: blueprints } = useEstimateBlueprintsQuery();
  const { data: customers } = useCustomersQuery();
  const { data: project, isLoading } = useEstimateProjectQuery(isNew ? '' : id!);

  const createProject = useCreateEstimateProjectMutation();

  const [customerId, setCustomerId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');

  // Auto-fill category selection with the active company's category!
  useEffect(() => {
    if (activeCompany?.categoryId) {
      setCategoryId(activeCompany.categoryId);
    }
  }, [activeCompany]);

  const activeBlueprint = useMemo(() => {
    if (!categoryId) return null;
    return blueprints?.find((bp) => bp.category.id === categoryId) ?? null;
  }, [blueprints, categoryId]);

  const handleCreate = async () => {
    if (!customerId || !categoryId) {
      toast.error('Selectați clientul și categoria.');
      return;
    }
    try {
      const created = await createProject.mutateAsync({
        customerId,
        categoryId,
        title: title || undefined,
        siteType: 'apartment',
      });
      toast.success('Smetă creată.');
      navigate(`/company/smete/${created.id}`, { replace: true });
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Nu s-a putut crea smeta.');
    }
  };

  if (!isNew && isLoading) {
    return <p className="p-8 text-sm text-gray-400">Se încarcă smeta...</p>;
  }

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Link to="/company/smete" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-violet-600">
            <ArrowLeft className="w-4 h-4" /> Înapoi la listă
          </Link>
        </div>

        <PageHero
          title={isNew ? 'Smetă nouă' : project?.title ?? 'Smetă'}
          description={
            isNew
              ? 'Alegeți categoria — fiecare tip de lucrare are propriul plan și etape.'
              : `${project?.number ?? ''} · ${project?.category.name ?? ''} · ${project ? ESTIMATE_STATUS_LABELS[project.status] : ''}`
          }
        />

        {isNew ? (
          <Panel className="p-6 max-w-2xl">
            <div className="space-y-4">
              <label className={cabinetLabelClass}>
                Client
                <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={cabinetSelectClass}>
                  <option value="">Selectați clientul</option>
                  {customers?.map((c) => (
                    <option key={c.id} value={c.id}>{c.fullName} · {c.phone}</option>
                  ))}
                </select>
              </label>

              {activeCompany?.categoryId ? (
                <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 space-y-1.5 shadow-xs">
                  <span className="text-[10px] font-extrabold text-violet-600 uppercase tracking-widest">
                    Categorie de lucru (Auto-Detectată)
                  </span>
                  <p className="font-extrabold text-gray-900 text-sm">
                    {categories?.find((c) => c.id === categoryId)?.name || 'Încărcare domeniu...'}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Smeta este configurată automat pentru domeniul companiei tale, blocând utilizarea altor categorii pentru a păstra izolarea perfectă și corectitudinea proceselor.
                  </p>
                </div>
              ) : (
                <label className={cabinetLabelClass}>
                  Categorie lucrare
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={cabinetSelectClass}>
                    <option value="">Selectați categoria</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
              )}
              {categoryId && activeBlueprint && (
                <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4 text-sm text-violet-900">
                  <p className="font-bold">{activeBlueprint.name}</p>
                  <p className="mt-1 text-violet-700/80">
                    {activeBlueprint.config.defaultStages.length} etape · plan personalizat pentru această categorie
                  </p>
                </div>
              )}
              <label className={cabinetLabelClass}>
                Titlu (opțional)
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={cabinetFieldClass} placeholder="Ex: Renovare baie" />
              </label>
              <button type="button" onClick={handleCreate} disabled={createProject.isPending} className={cabinetBtnPrimary}>
                Creează smetă <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Panel>
        ) : project ? (
          <ExistingEstimateWizard key={project.id} project={project} />
        ) : null}
      </div>
    </CompanyManagementGate>
  );
}
