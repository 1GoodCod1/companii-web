import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppModal } from '@/shared/ui/AppModal';
import {
  AppSelect,
  cabinetLabelClass,
  cabinetFieldClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/widgets/cabinet/cabinet-ui';
import type { AdminBlueprintDto, AdminCategoryDto } from '@/features/admin/api/useAdmin';
import type { EditorTab } from '../hooks/useAdminBlueprintForm';
import { BlueprintVisualSettings } from './BlueprintVisualSettings';
import { BlueprintJsonEditor } from './BlueprintJsonEditor';

export interface AdminBlueprintModalProps {
  open: boolean;
  onClose: () => void;
  editing: AdminBlueprintDto | null;
  availableCategories: AdminCategoryDto[];
  onSubmit: (e: React.FormEvent) => void;
  name: string;
  onNameChange: (val: string) => void;
  categoryId: string;
  onCategoryIdChange: (val: string) => void;
  version: number;
  onVersionChange: (val: number) => void;
  isActive: boolean;
  onIsActiveChange: (val: boolean) => void;
  activeTab: EditorTab;
  onActiveTabChange: (val: EditorTab) => void;
  defaultLaborRate: number;
  defaultMarginPct: number;
  diffEasy: number;
  diffMedium: number;
  diffDifficult: number;
  diffAppliesToMaterial: boolean;
  urgUrgent: number;
  urgEmergency: number;
  urgAppliesToMaterial: boolean;
  onVisualChange: (field: string, value: number | boolean) => void;
  configJsonStr: string;
  onJsonChange: (val: string) => void;
  jsonError: string | null;
  onBeautify: () => void;
  isPending: boolean;
}

type BlueprintCategoryOption = { value: string; label: string };

export function AdminBlueprintModal({
  open,
  onClose,
  editing,
  availableCategories,
  onSubmit,
  name,
  onNameChange,
  categoryId,
  onCategoryIdChange,
  version,
  onVersionChange,
  isActive,
  onIsActiveChange,
  activeTab,
  onActiveTabChange,
  defaultLaborRate,
  defaultMarginPct,
  diffEasy,
  diffMedium,
  diffDifficult,
  diffAppliesToMaterial,
  urgUrgent,
  urgEmergency,
  urgAppliesToMaterial,
  onVisualChange,
  configJsonStr,
  onJsonChange,
  jsonError,
  onBeautify,
  isPending,
}: AdminBlueprintModalProps) {
  const { t } = useTranslation();

  const categoryOptions = useMemo(
    () => [
      { value: '', label: t('admin.blueprintsPage.selectCategory') },
      ...availableCategories.map((cat) => ({
        value: cat.id,
        label: `${cat.name} (${cat.slug})`,
      })),
    ],
    [availableCategories, t],
  );

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={editing ? t('admin.blueprintsPage.modalEdit') : t('admin.blueprintsPage.modalCreate')}
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4 max-h-[85vh] overflow-y-auto pr-1">
        <BlueprintIdentityFields
          editing={editing}
          name={name}
          categoryId={categoryId}
          version={version}
          isActive={isActive}
          categoryOptions={categoryOptions}
          onNameChange={onNameChange}
          onCategoryIdChange={onCategoryIdChange}
          onVersionChange={onVersionChange}
          onIsActiveChange={onIsActiveChange}
        />

        <hr className="border-gray-100" />

        <div className="space-y-3">
          <BlueprintEditorTabs activeTab={activeTab} onActiveTabChange={onActiveTabChange} />
          {activeTab === 'visual' ? (
            <BlueprintVisualSettings
              defaultLaborRate={defaultLaborRate}
              defaultMarginPct={defaultMarginPct}
              diffEasy={diffEasy}
              diffMedium={diffMedium}
              diffDifficult={diffDifficult}
              diffAppliesToMaterial={diffAppliesToMaterial}
              urgUrgent={urgUrgent}
              urgEmergency={urgEmergency}
              urgAppliesToMaterial={urgAppliesToMaterial}
              onVisualChange={onVisualChange}
            />
          ) : (
            <BlueprintJsonEditor
              configJsonStr={configJsonStr}
              jsonError={jsonError}
              onBeautify={onBeautify}
              onJsonChange={onJsonChange}
            />
          )}
        </div>

        <BlueprintModalActions
          editing={editing}
          isPending={isPending}
          jsonError={jsonError}
          onClose={onClose}
        />
      </form>
    </AppModal>
  );
}

function BlueprintIdentityFields({
  editing,
  name,
  categoryId,
  version,
  isActive,
  categoryOptions,
  onNameChange,
  onCategoryIdChange,
  onVersionChange,
  onIsActiveChange,
}: Pick<
  AdminBlueprintModalProps,
  | 'editing'
  | 'name'
  | 'categoryId'
  | 'version'
  | 'isActive'
  | 'onNameChange'
  | 'onCategoryIdChange'
  | 'onVersionChange'
  | 'onIsActiveChange'
> & {
  categoryOptions: BlueprintCategoryOption[];
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="bp-name" className={cabinetLabelClass}>{t('admin.blueprintsPage.nameLabel')}</label>
          <input
            id="bp-name"
            type="text"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Electric Systems Blueprint"
            className={cabinetFieldClass}
          />
        </div>
        <div>
          <label className={cabinetLabelClass}>{t('admin.blueprintsPage.categoryLabel')}</label>
          <AppSelect
            value={categoryId}
            onChange={onCategoryIdChange}
            options={categoryOptions}
            disabled={!!editing}
            aria-label={t('admin.blueprintsPage.categoryLabel')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <label htmlFor="bp-version" className={cabinetLabelClass}>{t('admin.blueprintsPage.versionLabel')}</label>
          <input
            id="bp-version"
            type="number"
            required
            min={1}
            value={version}
            onChange={(e) => onVersionChange(Number(e.target.value))}
            className={cabinetFieldClass}
          />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            id="modalIsActive"
            checked={isActive}
            onChange={(e) => onIsActiveChange(e.target.checked)}
            className="size-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
          />
          <label htmlFor="modalIsActive" className="text-sm font-bold text-gray-700 cursor-pointer selection:bg-transparent">
            {t('admin.blueprintsPage.isActiveLabel')}
          </label>
        </div>
      </div>
    </>
  );
}

function BlueprintEditorTabs({
  activeTab,
  onActiveTabChange,
}: Pick<AdminBlueprintModalProps, 'activeTab' | 'onActiveTabChange'>) {
  const { t } = useTranslation();

  return (
    <div className="flex border-b border-gray-100">
      {(['visual', 'json'] as EditorTab[]).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onActiveTabChange(tab)}
          className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === tab
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          {tab === 'visual'
            ? t('admin.blueprintsPage.visualSettings')
            : t('admin.blueprintsPage.advancedJson')}
        </button>
      ))}
    </div>
  );
}

function BlueprintModalActions({
  editing,
  jsonError,
  isPending,
  onClose,
}: Pick<AdminBlueprintModalProps, 'editing' | 'jsonError' | 'isPending' | 'onClose'>) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
      <button type="button" onClick={onClose} className={cabinetBtnSecondary}>
        {t('cabinet.common.cancel')}
      </button>
      <button
        type="submit"
        disabled={!!jsonError || isPending}
        className={cabinetBtnPrimary}
      >
        {editing ? t('cabinet.common.save') : t('cabinet.common.create')}
      </button>
    </div>
  );
}