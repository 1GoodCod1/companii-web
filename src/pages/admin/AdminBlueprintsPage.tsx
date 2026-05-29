import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import { getErrorMessage } from '@/utils/errors';
import { Sliders, RefreshCw, Trash2, Search, Edit2, Play, AlertCircle, FileCode } from 'lucide-react';
import {
  PageHero,
  EmptyState,
  cabinetLabelClass,
  cabinetFieldClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import {
  useAdminBlueprintsQuery,
  useCreateAdminBlueprintMutation,
  useUpdateAdminBlueprintMutation,
  useDeleteAdminBlueprintMutation,
  useAdminCategoriesQuery,
  type AdminBlueprintDto,
} from '@/features/admin/api/useAdmin';

type EditorTab = 'visual' | 'json';

const DEFAULT_BLUEPRINT_CONFIG = {
  wizardSteps: ['object', 'diagnostic', 'stages', 'review'],
  siteTypes: [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' }
  ],
  planPointTypes: [],
  workModules: [],
  customFields: [],
  diagnosticQuestions: [],
  defaultStages: [
    { code: 'general', name: 'General Works', kind: 'MIXED', defaultLaborHours: 8, durationDays: 1 }
  ],
  pricingRules: [],
  defaultLaborRate: 250,
  defaultMarginPct: 15,
  accessDifficultyImpact: { easy: 1.0, medium: 1.05, difficult: 1.2, appliesToMaterial: false },
  urgencyImpact: { urgent: 1.15, emergency: 1.3, appliesToMaterial: false }
};

export function AdminBlueprintsPage() {
  const { t } = useTranslation();
  const { data: blueprints, isLoading, refetch } = useAdminBlueprintsQuery();
  const { data: categories } = useAdminCategoriesQuery();

  const createMutation = useCreateAdminBlueprintMutation();
  const updateMutation = useUpdateAdminBlueprintMutation();
  const deleteMutation = useDeleteAdminBlueprintMutation();

  // Filter and search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal and editing states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBlueprintDto | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('visual');

  // Basic Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [version, setVersion] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Visual Config Fields (directly bound to JSON)
  const [defaultLaborRate, setDefaultLaborRate] = useState(250);
  const [defaultMarginPct, setDefaultMarginPct] = useState(15);
  const [diffEasy, setDiffEasy] = useState(1.0);
  const [diffMedium, setDiffMedium] = useState(1.05);
  const [diffDifficult, setDiffDifficult] = useState(1.2);
  const [diffAppliesToMaterial, setDiffAppliesToMaterial] = useState(false);
  const [urgUrgent, setUrgUrgent] = useState(1.15);
  const [urgEmergency, setUrgEmergency] = useState(1.3);
  const [urgAppliesToMaterial, setUrgAppliesToMaterial] = useState(false);

  // JSON Advanced string
  const [configJsonStr, setConfigJsonStr] = useState('{}');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Synchronize visual fields to JSON state
  const syncVisualsToJson = (updates: Partial<typeof DEFAULT_BLUEPRINT_CONFIG>) => {
    try {
      let parsed = JSON.parse(configJsonStr);
      if (!parsed || typeof parsed !== 'object') parsed = { ...DEFAULT_BLUEPRINT_CONFIG };

      const merged = {
        ...parsed,
        ...updates
      };

      setConfigJsonStr(JSON.stringify(merged, null, 2));
      setJsonError(null);
    } catch {
      // If current JSON is invalid, keep it as is until user fixes it
    }
  };

  // Synchronize parsed JSON fields to visual states
  const syncJsonToVisuals = (parsed: any) => {
    if (parsed.defaultLaborRate !== undefined) setDefaultLaborRate(Number(parsed.defaultLaborRate));
    if (parsed.defaultMarginPct !== undefined) setDefaultMarginPct(Number(parsed.defaultMarginPct));

    if (parsed.accessDifficultyImpact) {
      const access = parsed.accessDifficultyImpact;
      if (access.easy !== undefined) setDiffEasy(Number(access.easy));
      if (access.medium !== undefined) setDiffMedium(Number(access.medium));
      if (access.difficult !== undefined) setDiffDifficult(Number(access.difficult));
      if (access.appliesToMaterial !== undefined) setDiffAppliesToMaterial(Boolean(access.appliesToMaterial));
    }

    if (parsed.urgencyImpact) {
      const urg = parsed.urgencyImpact;
      if (urg.urgent !== undefined) setUrgUrgent(Number(urg.urgent));
      if (urg.emergency !== undefined) setUrgEmergency(Number(urg.emergency));
      if (urg.appliesToMaterial !== undefined) setUrgAppliesToMaterial(Boolean(urg.appliesToMaterial));
    }
  };

  // Handle visual input changes
  const handleVisualChange = (field: string, value: any) => {
    let parsed: any = {};
    try {
      parsed = JSON.parse(configJsonStr);
    } catch {
      parsed = { ...DEFAULT_BLUEPRINT_CONFIG };
    }

    if (field === 'defaultLaborRate') {
      setDefaultLaborRate(value);
      syncVisualsToJson({ defaultLaborRate: value });
    } else if (field === 'defaultMarginPct') {
      setDefaultMarginPct(value);
      syncVisualsToJson({ defaultMarginPct: value });
    } else if (field.startsWith('diff_')) {
      const sub = field.replace('diff_', '');
      const currentAccess = parsed.accessDifficultyImpact || { ...DEFAULT_BLUEPRINT_CONFIG.accessDifficultyImpact };
      currentAccess[sub] = value;
      if (sub === 'easy') setDiffEasy(value);
      if (sub === 'medium') setDiffMedium(value);
      if (sub === 'difficult') setDiffDifficult(value);
      if (sub === 'appliesToMaterial') setDiffAppliesToMaterial(value);
      syncVisualsToJson({ accessDifficultyImpact: currentAccess });
    } else if (field.startsWith('urg_')) {
      const sub = field.replace('urg_', '');
      const currentUrg = parsed.urgencyImpact || { ...DEFAULT_BLUEPRINT_CONFIG.urgencyImpact };
      currentUrg[sub] = value;
      if (sub === 'urgent') setUrgUrgent(value);
      if (sub === 'emergency') setUrgEmergency(value);
      if (sub === 'appliesToMaterial') setUrgAppliesToMaterial(value);
      syncVisualsToJson({ urgencyImpact: currentUrg });
    }
  };

  // Handle advanced JSON edit
  const handleJsonChange = (val: string) => {
    setConfigJsonStr(val);
    try {
      const parsed = JSON.parse(val);
      setJsonError(null);
      syncJsonToVisuals(parsed);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
    }
  };

  // Format advanced JSON helper
  const handleBeautify = () => {
    try {
      const parsed = JSON.parse(configJsonStr);
      setConfigJsonStr(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      toast.error(t('admin.blueprintsPage.invalidJson'));
    }
  };

  // Filter available categories for new blueprint selection (only one blueprint per category)
  const availableCategories = useMemo(() => {
    if (!categories) return [];
    const usedCategoryIds = new Set((blueprints || []).map((bp) => bp.categoryId));
    return categories.filter((cat) => !usedCategoryIds.has(cat.id) || cat.id === editing?.categoryId);
  }, [categories, blueprints, editing]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditing(null);
    setName('');
    setCategoryId('');
    setVersion(1);
    setIsActive(true);

    // Reset visual fields
    setDefaultLaborRate(250);
    setDefaultMarginPct(15);
    setDiffEasy(1.0);
    setDiffMedium(1.05);
    setDiffDifficult(1.2);
    setDiffAppliesToMaterial(false);
    setUrgUrgent(1.15);
    setUrgEmergency(1.3);
    setUrgAppliesToMaterial(false);

    setConfigJsonStr(JSON.stringify(DEFAULT_BLUEPRINT_CONFIG, null, 2));
    setJsonError(null);
    setActiveTab('visual');
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (bp: AdminBlueprintDto) => {
    setEditing(bp);
    setName(bp.name);
    setCategoryId(bp.categoryId);
    setVersion(bp.version);
    setIsActive(bp.isActive);

    const config = bp.config || {};
    setConfigJsonStr(JSON.stringify(config, null, 2));
    setJsonError(null);

    // Sync variables to visual controls
    syncJsonToVisuals(config);

    setActiveTab('visual');
    setModalOpen(true);
  };

  // Direct toggle active switch
  const handleToggleActive = async (bp: AdminBlueprintDto) => {
    try {
      await updateMutation.mutateAsync({
        id: bp.id,
        isActive: !bp.isActive,
      });
      toast.success(t('admin.blueprintsPage.toastUpdated'));
    } catch (err) {
      toast.error(getErrorMessage(err, t('cabinet.common.operationFailed')));
    }
  };

  // Form submit (create / update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('admin.blueprintsPage.nameLabel'));
      return;
    }
    if (!categoryId) {
      toast.error(t('admin.blueprintsPage.categoryLabel'));
      return;
    }

    let parsedConfig = {};
    try {
      parsedConfig = JSON.parse(configJsonStr);
    } catch (err) {
      toast.error(t('admin.blueprintsPage.invalidJson'));
      return;
    }

    const payload = {
      name: name.trim(),
      categoryId,
      version,
      isActive,
      config: parsedConfig,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          ...payload,
        });
        toast.success(t('admin.blueprintsPage.toastUpdated'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('admin.blueprintsPage.toastCreated'));
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, t('cabinet.common.operationFailed')));
    }
  };

  // Delete action
  const handleDelete = async (bp: AdminBlueprintDto) => {
    if (!confirm(t('admin.blueprintsPage.confirmDelete', { name: bp.name }))) return;
    try {
      await deleteMutation.mutateAsync(bp.id);
      toast.success(t('admin.blueprintsPage.toastDeleted'));
    } catch (err) {
      toast.error(getErrorMessage(err, t('cabinet.common.operationFailed')));
    }
  };

  // Search filter blueprints list
  const filteredBlueprints = useMemo(() => {
    if (!blueprints) return [];
    return blueprints.filter((bp) => {
      const matchesSearch =
        bp.name.toLowerCase().includes(search.toLowerCase()) ||
        bp.category.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && bp.isActive) ||
        (statusFilter === 'inactive' && !bp.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [blueprints, search, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHero
        eyebrow={t('admin.blueprintsPage.eyebrow')}
        title={t('admin.blueprintsPage.title')}
        description={t('admin.blueprintsPage.description')}
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void refetch()}
              className={`${cabinetBtnSecondary} flex items-center gap-1.5`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className={`${cabinetBtnPrimary} flex items-center gap-1.5`}
            >
              <Sliders className="h-3.5 w-3.5" />
              {t('admin.blueprintsPage.createBtn')}
            </button>
          </div>
        }
      />

      {/* Control panel containing filters and search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blueprints by name or category..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'inactive'
                ? 'bg-gray-500 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Blueprints Display Cards Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <RefreshCw className="h-8 w-8 animate-spin mb-2 text-primary/60" />
          <p className="text-sm font-semibold">{t('cabinet.common.loading')}</p>
        </div>
      ) : filteredBlueprints.length === 0 ? (
        <EmptyState
          message={t('admin.blueprintsPage.empty')}
          action={
            <button type="button" onClick={handleOpenCreate} className={cabinetBtnSecondary}>
              {t('admin.blueprintsPage.emptyAction')}
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlueprints.map((bp) => {
            const projectsCount = bp._count?.projects ?? 0;
            return (
              <div
                key={bp.id}
                className="group relative bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
              >
                {/* Visual Glassmorphism Category Badge */}
                <div className="absolute top-0 right-0 p-3">
                  <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase bg-primary/10 text-primary border border-primary/10">
                    {bp.category.name}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="pr-20">
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors text-base line-clamp-1">
                      {bp.name}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-medium font-mono">
                      Category Slug: <span className="text-gray-600">{bp.category.slug}</span>
                    </p>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        {t('admin.blueprintsPage.colVersion')}
                      </span>
                      <p className="font-semibold text-gray-700">v{bp.version}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        {t('admin.blueprintsPage.colUsage')}
                      </span>
                      <p className="font-semibold text-gray-700">{projectsCount} смет</p>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Footer actions with visual status switch */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bp.isActive}
                          onChange={() => void handleToggleActive(bp)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${bp.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {bp.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(bp)}
                        className="p-2 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-xl transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(bp)}
                        disabled={projectsCount > 0}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal for Blueprints */}
      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t('admin.blueprintsPage.modalEdit') : t('admin.blueprintsPage.modalCreate')}
        size="lg"
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 max-h-[85vh] overflow-y-auto pr-1">
          {/* Visual Category & Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={cabinetLabelClass}>{t('admin.blueprintsPage.nameLabel')}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Electric Systems Blueprint"
                className={cabinetFieldClass}
              />
            </div>
            <div>
              <label className={cabinetLabelClass}>{t('admin.blueprintsPage.categoryLabel')}</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={!!editing}
                className={`${cabinetFieldClass} appearance-none cursor-pointer`}
              >
                <option value="">{t('admin.blueprintsPage.selectCategory')}</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className={cabinetLabelClass}>{t('admin.blueprintsPage.versionLabel')}</label>
              <input
                type="number"
                required
                min={1}
                value={version}
                onChange={(e) => setVersion(Number(e.target.value))}
                className={cabinetFieldClass}
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="modalIsActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
              />
              <label htmlFor="modalIsActive" className="text-sm font-bold text-gray-700 cursor-pointer selection:bg-transparent">
                {t('admin.blueprintsPage.isActiveLabel')}
              </label>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Double-Tab Panel (Visual Coeffs vs Code Editor) */}
          <div className="space-y-3">
            <div className="flex border-b border-gray-100">
              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'visual'
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {t('admin.blueprintsPage.visualSettings')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'json'
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {t('admin.blueprintsPage.advancedJson')}
              </button>
            </div>

            {/* TAB 1: Visual Form Settings */}
            {activeTab === 'visual' && (
              <div className="space-y-4 p-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={cabinetLabelClass}>{t('admin.blueprintsPage.marginLabel')}</label>
                    <input
                      type="number"
                      value={defaultMarginPct}
                      onChange={(e) => handleVisualChange('defaultMarginPct', Number(e.target.value))}
                      className={cabinetFieldClass}
                    />
                  </div>
                  <div>
                    <label className={cabinetLabelClass}>{t('admin.blueprintsPage.laborRateLabel')}</label>
                    <input
                      type="number"
                      value={defaultLaborRate}
                      onChange={(e) => handleVisualChange('defaultLaborRate', Number(e.target.value))}
                      className={cabinetFieldClass}
                    />
                  </div>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                    <Sliders className="h-3.5 w-3.5 text-primary/60" />
                    {t('admin.blueprintsPage.difficultySettings')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                        {t('admin.blueprintsPage.easyLabel')}
                      </label>
                      <input
                        type="number"
                        step={0.05}
                        value={diffEasy}
                        onChange={(e) => handleVisualChange('diff_easy', Number(e.target.value))}
                        className="w-full mt-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                        {t('admin.blueprintsPage.mediumLabel')}
                      </label>
                      <input
                        type="number"
                        step={0.05}
                        value={diffMedium}
                        onChange={(e) => handleVisualChange('diff_medium', Number(e.target.value))}
                        className="w-full mt-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                        {t('admin.blueprintsPage.difficultLabel')}
                      </label>
                      <input
                        type="number"
                        step={0.05}
                        value={diffDifficult}
                        onChange={(e) => handleVisualChange('diff_difficult', Number(e.target.value))}
                        className="w-full mt-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="diffApplies"
                        checked={diffAppliesToMaterial}
                        onChange={(e) => handleVisualChange('diff_appliesToMaterial', e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-primary cursor-pointer"
                      />
                      <label htmlFor="diffApplies" className="text-[10px] font-black uppercase tracking-wider text-gray-500 cursor-pointer">
                        {t('admin.blueprintsPage.appliesToMaterial')}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                    <Play className="h-3.5 w-3.5 text-primary/60" />
                    {t('admin.blueprintsPage.urgencySettings')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                        {t('admin.blueprintsPage.urgentLabel')}
                      </label>
                      <input
                        type="number"
                        step={0.05}
                        value={urgUrgent}
                        onChange={(e) => handleVisualChange('urg_urgent', Number(e.target.value))}
                        className="w-full mt-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                        {t('admin.blueprintsPage.emergencyLabel')}
                      </label>
                      <input
                        type="number"
                        step={0.05}
                        value={urgEmergency}
                        onChange={(e) => handleVisualChange('urg_emergency', Number(e.target.value))}
                        className="w-full mt-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="urgApplies"
                        checked={urgAppliesToMaterial}
                        onChange={(e) => handleVisualChange('urg_appliesToMaterial', e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-primary cursor-pointer"
                      />
                      <label htmlFor="urgApplies" className="text-[10px] font-black uppercase tracking-wider text-gray-500 cursor-pointer">
                        {t('admin.blueprintsPage.appliesToMaterial')}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Advanced JSON Code Editor */}
            {activeTab === 'json' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                    <FileCode className="h-3.5 w-3.5 text-primary/60" />
                    Complete Blueprint Config Schema JSON
                  </p>
                  <button
                    type="button"
                    onClick={handleBeautify}
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary-dark transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {t('admin.blueprintsPage.beautifyBtn')}
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={configJsonStr}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    rows={16}
                    className="w-full p-4 font-mono text-[11px] bg-gray-900 text-emerald-400 border border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner leading-relaxed"
                  />
                  {jsonError && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-950/80 backdrop-blur border border-red-800 text-red-200 px-3.5 py-2.5 rounded-xl flex items-start gap-2 text-xs shadow-lg">
                      <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold uppercase tracking-wider text-[9px] text-red-400">JSON Syntax Error</p>
                        <p className="font-medium text-[11px] leading-relaxed">{jsonError}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setModalOpen(false)} className={cabinetBtnSecondary}>
              {t('cabinet.common.cancel')}
            </button>
            <button
              type="submit"
              disabled={!!jsonError || createMutation.isPending || updateMutation.isPending}
              className={cabinetBtnPrimary}
            >
              {editing ? t('cabinet.common.save') : t('cabinet.common.create')}
            </button>
          </div>
        </form>
      </AppModal>
    </div>
  );
}
