import { useMemo, useState } from 'react';
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
} from '@/features/estimates/api/useEstimates';
import { PlanEditor2D } from '@/features/estimates/components/PlanEditor2D';
import { PlanPreview3D } from '@/features/estimates/components/PlanPreview3D';
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

const EMPTY_PLAN: Plan2dData = { rooms: [], points: [] };

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
  const steps = config?.wizardSteps ?? ['object', 'plan', 'diagnostic', 'stages', 'review'];

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
      await savePlan.mutateAsync({ id: project.id, plan2d });
      toast.success('Plan salvat.');
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Eroare la salvare plan.');
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

  const handleCalculate = async () => {
    try {
      const nextDiagnostic = persistCustomPricing(diagnostic);
      await updateProject.mutateAsync({ id: project.id, diagnosticAnswers: nextDiagnostic });
      setDiagnostic(nextDiagnostic);
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

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <button
            key={step}
            type="button"
            onClick={() => setStepIndex(index)}
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
          <CustomPricingFields values={customPricing} onChange={setCustomPricing} />
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
          <PlanPreview3D
            plan2d={plan2d}
            plan3d={project.sitePlan?.plan3d}
            config={config}
            categoryName={project.category.name}
          />
          <div className="flex gap-3">
            <button type="button" onClick={handleSavePlan} className={cabinetBtnPrimary}>
              <Save className="w-4 h-4" /> Salvează plan
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
          {(config?.diagnosticQuestions ?? []).map((q) => (
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
          <CustomPricingFields values={customPricing} onChange={setCustomPricing} compact />
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
                <p className="text-sm text-gray-500">Recalculează liniile din plan, diagnostic, tarife personalizate și regulile categoriei.</p>
              </div>
              <button type="button" onClick={handleCalculate} disabled={calculate.isPending} className={cabinetBtnPrimary}>
                <Calculator className="w-4 h-4" /> Calculează smeta
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {(project.stages as EstimateStageDto[]).map((stage, index) => (
                <div key={stage.id} className="rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-full bg-violet-600 text-white text-xs font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <p className="font-bold text-gray-900">{stage.name}</p>
                  </div>
                  {stage.description && <p className="text-xs text-gray-500 mb-2">{stage.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                    {stage.laborHours != null ? <span>~{Number(stage.laborHours)} ore</span> : null}
                    {stage.durationDays != null ? <span>{stage.durationDays} zile</span> : null}
                  </div>
                  <p className="text-sm font-semibold text-violet-700">
                    {Number(stage.stageTotal ?? 0).toLocaleString('ro-MD')} MDL
                  </p>
                  {stage.lines?.length ? (
                    <ul className="mt-2 space-y-1 text-xs text-gray-600">
                      {stage.lines.slice(0, 3).map((line) => (
                        <li key={line.id}>• {line.description} — {Number(line.qty)} {line.unit}</li>
                      ))}
                    </ul>
                  ) : null}
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
              activeCustomPricing.customLaborHours) && (
              <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-gray-700 space-y-1">
                <p className="font-bold text-gray-900">Tarife personalizate aplicate</p>
                {activeCustomPricing.customUnitPriceSqm ? (
                  <p>Preț / m²: {activeCustomPricing.customUnitPriceSqm.toLocaleString('ro-MD')} MDL</p>
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
          <PlanPreview3D
            plan2d={plan2d}
            plan3d={project.sitePlan?.plan3d}
            config={config}
            categoryName={project.category.name}
          />
        </div>
      )}
    </>
  );
}

export function CompanyEstimateWizardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const { data: categories } = useCategoriesQuery();
  const { data: blueprints } = useEstimateBlueprintsQuery();
  const { data: customers } = useCustomersQuery();
  const { data: project, isLoading } = useEstimateProjectQuery(isNew ? '' : id!);

  const createProject = useCreateEstimateProjectMutation();

  const [customerId, setCustomerId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');

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
              <label className={cabinetLabelClass}>
                Categorie lucrare
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={cabinetSelectClass}>
                  <option value="">Selectați categoria</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
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
