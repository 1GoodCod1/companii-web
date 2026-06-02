import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/shared/utils/errors';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';
import {
  useCreateAdminBlueprintMutation,
  useUpdateAdminBlueprintMutation,
  useDeleteAdminBlueprintMutation,
  type AdminBlueprintDto,
} from '@/features/admin/api/useAdminBlueprints';
import type {
  EstimateBlueprintConfig,
  BlueprintAccessDifficultyImpact,
  BlueprintUrgencyImpact,
} from '@/entities/estimate/model/estimate-blueprint-config.types';

export type EditorTab = 'visual' | 'json';

export const DEFAULT_BLUEPRINT_CONFIG: EstimateBlueprintConfig = {
  wizardSteps: ['object', 'diagnostic', 'stages', 'review'],
  siteTypes: [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
  ],
  planPointTypes: [],
  workModules: [],
  customFields: [],
  diagnosticQuestions: [],
  defaultStages: [
    { code: 'general', name: 'General Works', kind: 'MIXED', defaultLaborHours: 8, durationDays: 1 },
  ],
  pricingRules: [],
  defaultLaborRate: 250,
  defaultMarginPct: 15,
  accessDifficultyImpact: { easy: 1.0, medium: 1.05, difficult: 1.2, appliesToMaterial: false },
  urgencyImpact: { urgent: 1.15, emergency: 1.3, appliesToMaterial: false },
};

export function useAdminBlueprintForm() {
  const { t } = useTranslation();
  const { ask, dialog: confirmDialog } = useCabinetConfirmDialog();
  const createMutation = useCreateAdminBlueprintMutation();
  const updateMutation = useUpdateAdminBlueprintMutation();
  const deleteMutation = useDeleteAdminBlueprintMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBlueprintDto | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('visual');

  // Form fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [version, setVersion] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Visual settings state
  const [defaultLaborRate, setDefaultLaborRate] = useState(250);
  const [defaultMarginPct, setDefaultMarginPct] = useState(15);
  const [diffEasy, setDiffEasy] = useState(1.0);
  const [diffMedium, setDiffMedium] = useState(1.05);
  const [diffDifficult, setDiffDifficult] = useState(1.2);
  const [diffAppliesToMaterial, setDiffAppliesToMaterial] = useState(false);
  const [urgUrgent, setUrgUrgent] = useState(1.15);
  const [urgEmergency, setUrgEmergency] = useState(1.3);
  const [urgAppliesToMaterial, setUrgAppliesToMaterial] = useState(false);

  const [configJsonStr, setConfigJsonStr] = useState('{}');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const syncVisualsToJson = (updates: Partial<EstimateBlueprintConfig>) => {
    try {
      let parsed: Partial<EstimateBlueprintConfig> = {};
      try {
        parsed = JSON.parse(configJsonStr) as Partial<EstimateBlueprintConfig>;
      } catch {
        parsed = { ...DEFAULT_BLUEPRINT_CONFIG };
      }

      if (!parsed || typeof parsed !== 'object') parsed = { ...DEFAULT_BLUEPRINT_CONFIG };

      const merged = {
        ...parsed,
        ...updates,
      };

      setConfigJsonStr(JSON.stringify(merged, null, 2));
      setJsonError(null);
    } catch {
      // ignore
    }
  };

  const syncJsonToVisuals = (parsed: Partial<EstimateBlueprintConfig>) => {
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

  const handleVisualChange = (field: string, value: number | boolean) => {
    let parsed: Partial<EstimateBlueprintConfig> = {};
    try {
      parsed = JSON.parse(configJsonStr) as Partial<EstimateBlueprintConfig>;
    } catch {
      parsed = { ...DEFAULT_BLUEPRINT_CONFIG };
    }

    if (field === 'defaultLaborRate') {
      setDefaultLaborRate(value as number);
      syncVisualsToJson({ defaultLaborRate: value as number });
    } else if (field === 'defaultMarginPct') {
      setDefaultMarginPct(value as number);
      syncVisualsToJson({ defaultMarginPct: value as number });
    } else if (field.startsWith('diff_')) {
      const sub = field.replace('diff_', '');
      const currentAccess: BlueprintAccessDifficultyImpact = {
        ...DEFAULT_BLUEPRINT_CONFIG.accessDifficultyImpact,
        ...parsed.accessDifficultyImpact,
      } as BlueprintAccessDifficultyImpact;

      if (sub === 'easy') {
        currentAccess.easy = value as number;
        setDiffEasy(value as number);
      } else if (sub === 'medium') {
        currentAccess.medium = value as number;
        setDiffMedium(value as number);
      } else if (sub === 'difficult') {
        currentAccess.difficult = value as number;
        setDiffDifficult(value as number);
      } else if (sub === 'appliesToMaterial') {
        currentAccess.appliesToMaterial = value as boolean;
        setDiffAppliesToMaterial(value as boolean);
      }
      syncVisualsToJson({ accessDifficultyImpact: currentAccess });
    } else if (field.startsWith('urg_')) {
      const sub = field.replace('urg_', '');
      const currentUrg: BlueprintUrgencyImpact = {
        ...DEFAULT_BLUEPRINT_CONFIG.urgencyImpact,
        ...parsed.urgencyImpact,
      } as BlueprintUrgencyImpact;

      if (sub === 'urgent') {
        currentUrg.urgent = value as number;
        setUrgUrgent(value as number);
      } else if (sub === 'emergency') {
        currentUrg.emergency = value as number;
        setUrgEmergency(value as number);
      } else if (sub === 'appliesToMaterial') {
        currentUrg.appliesToMaterial = value as boolean;
        setUrgAppliesToMaterial(value as boolean);
      }
      syncVisualsToJson({ urgencyImpact: currentUrg });
    }
  };

  const handleJsonChange = (val: string) => {
    setConfigJsonStr(val);
    try {
      const parsed = JSON.parse(val) as Partial<EstimateBlueprintConfig>;
      setJsonError(null);
      syncJsonToVisuals(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid JSON syntax';
      setJsonError(message);
    }
  };

  const handleBeautify = () => {
    try {
      const parsed = JSON.parse(configJsonStr);
      setConfigJsonStr(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch {
      toast.error(t('admin.blueprintsPage.invalidJson'));
    }
  };

  const handleOpenCreate = () => {
    setEditing(null);
    setName('');
    setCategoryId('');
    setVersion(1);
    setIsActive(true);

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

  const handleOpenEdit = (bp: AdminBlueprintDto) => {
    setEditing(bp);
    setName(bp.name);
    setCategoryId(bp.categoryId);
    setVersion(bp.version);
    setIsActive(bp.isActive);

    const config = (bp.config || {}) as Partial<EstimateBlueprintConfig>;
    setConfigJsonStr(JSON.stringify(config, null, 2));
    setJsonError(null);
    syncJsonToVisuals(config);
    setActiveTab('visual');
    setModalOpen(true);
  };

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

    let parsedConfig: Record<string, unknown> = {};
    try {
      parsedConfig = JSON.parse(configJsonStr) as Record<string, unknown>;
    } catch {
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

  const handleDelete = (bp: AdminBlueprintDto) => {
    ask({
      title: t('cabinet.common.delete'),
      message: t('admin.blueprintsPage.confirmDelete', { name: bp.name }),
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(bp.id);
          toast.success(t('admin.blueprintsPage.toastDeleted'));
        } catch (err) {
          toast.error(getErrorMessage(err, t('cabinet.common.operationFailed')));
        }
      },
    });
  };

  return {
    modalOpen,
    setModalOpen,
    editing,
    activeTab,
    setActiveTab,
    name,
    setName,
    categoryId,
    setCategoryId,
    version,
    setVersion,
    isActive,
    setIsActive,
    defaultLaborRate,
    defaultMarginPct,
    diffEasy,
    diffMedium,
    diffDifficult,
    diffAppliesToMaterial,
    urgUrgent,
    urgEmergency,
    urgAppliesToMaterial,
    configJsonStr,
    jsonError,
    handleVisualChange,
    handleJsonChange,
    handleBeautify,
    handleOpenCreate,
    handleOpenEdit,
    handleToggleActive,
    handleSubmit,
    handleDelete,
    isPending: createMutation.isPending || updateMutation.isPending,
    confirmDialog,
  };
}
