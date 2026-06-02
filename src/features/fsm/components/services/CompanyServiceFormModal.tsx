import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppModal } from '@/shared/ui/AppModal';
import {
  AppSelect,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/widgets/cabinet/cabinet-ui';
import { DURATION_UNIT_OPTIONS } from '@/entities/fsm/model/services.constants';
import type { ServiceFormState } from '@/entities/fsm/model/serviceForm.types';

export function CompanyServiceFormModal({
  open,
  editing,
  form,
  defaultCategoryName,
  canUseInternalPricing,
  onClose,
  onSubmit,
  onFormChange,
}: {
  open: boolean;
  editing: boolean;
  form: ServiceFormState;
  defaultCategoryName: string;
  canUseInternalPricing: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onFormChange: (updater: (prev: ServiceFormState) => ServiceFormState) => void;
}) {
  const { t } = useTranslation();

  const durationUnitLabel = (value: ServiceFormState['durationUnit']) =>
    t(`company.fsm.services.form.durationUnits.${value}`);

  const durationUnitOptions = useMemo(
    () =>
      DURATION_UNIT_OPTIONS.map((option) => ({
        value: option.value,
        label: durationUnitLabel(option.value),
      })),
    [t],
  );

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={
        editing
          ? t('company.fsm.services.form.titleEdit')
          : t('company.fsm.services.form.titleCreate')
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <label className={cabinetLabelClass}>
          {t('company.fsm.services.form.fields.name')}
          <input
            value={form.name}
            onChange={(e) => onFormChange((f) => ({ ...f, name: e.target.value }))}
            className={cabinetFieldClass}
            required
          />
        </label>
        <label className={cabinetLabelClass}>
          {t('company.fsm.services.form.fields.description')}
          <textarea
            value={form.description}
            onChange={(e) => onFormChange((f) => ({ ...f, description: e.target.value }))}
            className={cabinetFieldClass}
            rows={3}
          />
        </label>
        <div className={cabinetLabelClass}>
          {t('company.fsm.services.form.fields.category')}
          <input
            value={defaultCategoryName}
            className={`${cabinetFieldClass} bg-gray-50 text-gray-600 cursor-not-allowed`}
            readOnly
            tabIndex={-1}
            aria-label={t('company.fsm.services.form.fields.category')}
          />
          <p className="text-[11px] font-medium text-gray-400 mt-1">
            {t('company.fsm.services.form.fields.categoryHint')}
          </p>
        </div>
        <label className={cabinetLabelClass}>
          {t('company.fsm.services.form.fields.price')}
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.defaultPrice}
            onChange={(e) => onFormChange((f) => ({ ...f, defaultPrice: e.target.value }))}
            className={cabinetFieldClass}
            required
          />
        </label>
        <div className={cabinetLabelClass}>
          {t('company.fsm.services.form.fields.duration')}
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              type="number"
              min={1}
              step={1}
              value={form.durationValue}
              onChange={(e) => onFormChange((f) => ({ ...f, durationValue: e.target.value }))}
              className={cabinetFieldClass}
              placeholder={t('company.fsm.services.form.fields.durationPlaceholder')}
              aria-label={t('company.fsm.services.form.fields.duration')}
            />
            <AppSelect
              value={form.durationUnit}
              onChange={(value) =>
                onFormChange((f) => ({
                  ...f,
                  durationUnit: value as ServiceFormState['durationUnit'],
                }))
              }
              options={durationUnitOptions}
              aria-label={t('company.fsm.services.form.fields.duration')}
              className="min-w-[100px]"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => onFormChange((f) => ({ ...f, isPublished: e.target.checked }))}
            className="rounded border-gray-300"
          />
          {t('company.fsm.services.form.fields.published')}
        </label>
        {canUseInternalPricing ? (
          <label className={cabinetLabelClass}>
            {t('company.fsm.services.form.fields.materialsCost')}
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.materialsCost}
              onChange={(e) => onFormChange((f) => ({ ...f, materialsCost: e.target.value }))}
              className={cabinetFieldClass}
            />
          </label>
        ) : (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
            {t('company.fsm.services.form.proHint')}
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <button type="submit" className={cabinetBtnPrimary}>
            {editing ? t('cabinet.common.save') : t('company.fsm.services.form.submitCreate')}
          </button>
          <button type="button" onClick={onClose} className={cabinetBtnSecondary}>
            {t('cabinet.common.cancel')}
          </button>
        </div>
      </form>
    </AppModal>
  );
}
