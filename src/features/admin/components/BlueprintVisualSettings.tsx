import React from 'react';
import { Sliders, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cabinetLabelClass, cabinetFieldClass } from '@/widgets/cabinet/cabinet-ui';
import type { AdminBlueprintModalProps } from './AdminBlueprintModal';

function BlueprintNumberField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={cabinetLabelClass}>{label}</label>
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cabinetFieldClass}
      />
    </div>
  );
}

function BlueprintCoefficientGroup({
  icon,
  title,
  fields,
  appliesId,
  appliesChecked,
  appliesField,
  onVisualChange,
}: {
  icon: React.ReactNode;
  title: string;
  fields: Array<[id: string, label: string, value: number, field: string]>;
  appliesId: string;
  appliesChecked: boolean;
  appliesField: string;
  onVisualChange: AdminBlueprintModalProps['onVisualChange'];
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 space-y-3">
      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
        {icon}
        {title}
      </h4>
      <div className={`grid grid-cols-1 gap-4 ${fields.length === 3 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        {fields.map(([id, label, value, field]) => (
          <div key={id}>
            <label htmlFor={id} className="text-[10px] font-black uppercase tracking-wider text-gray-500">
              {label}
            </label>
            <input
              id={id}
              type="number"
              step={0.05}
              value={value}
              onChange={(e) => onVisualChange(field, Number(e.target.value))}
              className="w-full mt-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
            />
          </div>
        ))}
        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            id={appliesId}
            checked={appliesChecked}
            onChange={(e) => onVisualChange(appliesField, e.target.checked)}
            className="size-3.5 rounded border-gray-300 text-primary cursor-pointer"
          />
          <label htmlFor={appliesId} className="text-[10px] font-black uppercase tracking-wider text-gray-500 cursor-pointer">
            {t('admin.blueprintsPage.appliesToMaterial')}
          </label>
        </div>
      </div>
    </div>
  );
}

export function BlueprintVisualSettings({
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
}: Pick<
  AdminBlueprintModalProps,
  | 'defaultLaborRate'
  | 'defaultMarginPct'
  | 'diffEasy'
  | 'diffMedium'
  | 'diffDifficult'
  | 'diffAppliesToMaterial'
  | 'urgUrgent'
  | 'urgEmergency'
  | 'urgAppliesToMaterial'
  | 'onVisualChange'
>) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 p-1">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BlueprintNumberField
          id="bp-margin"
          label={t('admin.blueprintsPage.marginLabel')}
          value={defaultMarginPct}
          onChange={(value) => onVisualChange('defaultMarginPct', value)}
        />
        <BlueprintNumberField
          id="bp-labor-rate"
          label={t('admin.blueprintsPage.laborRateLabel')}
          value={defaultLaborRate}
          onChange={(value) => onVisualChange('defaultLaborRate', value)}
        />
      </div>

      <BlueprintCoefficientGroup
        icon={<Sliders className="size-3.5 text-primary/60" />}
        title={t('admin.blueprintsPage.difficultySettings')}
        fields={[
          ['bp-diff-easy', t('admin.blueprintsPage.easyLabel'), diffEasy, 'diff_easy'],
          ['bp-diff-medium', t('admin.blueprintsPage.mediumLabel'), diffMedium, 'diff_medium'],
          ['bp-diff-difficult', t('admin.blueprintsPage.difficultLabel'), diffDifficult, 'diff_difficult'],
        ]}
        appliesId="diffApplies"
        appliesChecked={diffAppliesToMaterial}
        appliesField="diff_appliesToMaterial"
        onVisualChange={onVisualChange}
      />

      <BlueprintCoefficientGroup
        icon={<Play className="size-3.5 text-primary/60" />}
        title={t('admin.blueprintsPage.urgencySettings')}
        fields={[
          ['bp-urg-urgent', t('admin.blueprintsPage.urgentLabel'), urgUrgent, 'urg_urgent'],
          ['bp-urg-emergency', t('admin.blueprintsPage.emergencyLabel'), urgEmergency, 'urg_emergency'],
        ]}
        appliesId="urgApplies"
        appliesChecked={urgAppliesToMaterial}
        appliesField="urg_appliesToMaterial"
        onVisualChange={onVisualChange}
      />
    </div>
  );
}