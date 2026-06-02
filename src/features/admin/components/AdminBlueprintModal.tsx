import React, { useMemo } from 'react';
import { Sliders, RefreshCw, Play, AlertCircle, FileCode } from 'lucide-react';
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

interface AdminBlueprintModalProps {
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
        {/* Visual Category & Name Fields */}
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
              onClick={() => onActiveTabChange('visual')}
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
              onClick={() => onActiveTabChange('json')}
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
                  <label htmlFor="bp-margin" className={cabinetLabelClass}>{t('admin.blueprintsPage.marginLabel')}</label>
                  <input
                    id="bp-margin"
                    type="number"
                    value={defaultMarginPct}
                    onChange={(e) => onVisualChange('defaultMarginPct', Number(e.target.value))}
                    className={cabinetFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="bp-labor-rate" className={cabinetLabelClass}>{t('admin.blueprintsPage.laborRateLabel')}</label>
                  <input
                    id="bp-labor-rate"
                    type="number"
                    value={defaultLaborRate}
                    onChange={(e) => onVisualChange('defaultLaborRate', Number(e.target.value))}
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
                    <label htmlFor="bp-diff-easy" className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                      {t('admin.blueprintsPage.easyLabel')}
                    </label>
                    <input
                      id="bp-diff-easy"
                      type="number"
                      step={0.05}
                      value={diffEasy}
                      onChange={(e) => onVisualChange('diff_easy', Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="bp-diff-medium" className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                      {t('admin.blueprintsPage.mediumLabel')}
                    </label>
                    <input
                      id="bp-diff-medium"
                      type="number"
                      step={0.05}
                      value={diffMedium}
                      onChange={(e) => onVisualChange('diff_medium', Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="bp-diff-difficult" className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                      {t('admin.blueprintsPage.difficultLabel')}
                    </label>
                    <input
                      id="bp-diff-difficult"
                      type="number"
                      step={0.05}
                      value={diffDifficult}
                      onChange={(e) => onVisualChange('diff_difficult', Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="diffApplies"
                      checked={diffAppliesToMaterial}
                      onChange={(e) => onVisualChange('diff_appliesToMaterial', e.target.checked)}
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
                    <label htmlFor="bp-urg-urgent" className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                      {t('admin.blueprintsPage.urgentLabel')}
                    </label>
                    <input
                      id="bp-urg-urgent"
                      type="number"
                      step={0.05}
                      value={urgUrgent}
                      onChange={(e) => onVisualChange('urg_urgent', Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="bp-urg-emergency" className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                      {t('admin.blueprintsPage.emergencyLabel')}
                    </label>
                    <input
                      id="bp-urg-emergency"
                      type="number"
                      step={0.05}
                      value={urgEmergency}
                      onChange={(e) => onVisualChange('urg_emergency', Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="urgApplies"
                      checked={urgAppliesToMaterial}
                      onChange={(e) => onVisualChange('urg_appliesToMaterial', e.target.checked)}
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
                  onClick={onBeautify}
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary-dark transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  {t('admin.blueprintsPage.beautifyBtn')}
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={configJsonStr}
                  onChange={(e) => onJsonChange(e.target.value)}
                  rows={16}
                  aria-label="Blueprint config JSON"
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
      </form>
    </AppModal>
  );
}
