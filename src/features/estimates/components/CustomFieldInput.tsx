import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { BlueprintCustomField } from '@/types/estimate-blueprint-config.types';
import {
  cabinetFieldClass,
  cabinetLabelClass,
  cabinetSelectClass,
} from '@/components/cabinet/cabinet-ui';
import { parseNumberInputValue } from '@/features/estimates/diagnosticValidation';
import { useTranslateOption } from '@/utils/translateOption';

type Props = {
  field: BlueprintCustomField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  warning?: string;
  disabled?: boolean;
};

export function CustomFieldInput({ field, value, onChange, error, warning, disabled }: Props) {
  const { t } = useTranslation();
  const translateOption = useTranslateOption();

  const labelNode = (
    <span className="flex items-center justify-between gap-2">
      <span>
        {field.label}
        {field.required && <span className="text-rose-500 ml-0.5">*</span>}
      </span>
      {field.unit && (
        <span className="text-[10px] font-medium uppercase text-gray-400 tracking-wide">
          {field.unit}
        </span>
      )}
    </span>
  );

  let inputNode: ReactElement;

  if (field.type === 'boolean') {
    inputNode = (
      <select
        value={value === true ? 'true' : value === false ? 'false' : ''}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? undefined : v === 'true');
        }}
        disabled={disabled}
        className={cabinetSelectClass}
      >
        <option value="">—</option>
        <option value="true">{t('company.estimateWizard.diagnosticStep.yes')}</option>
        <option value="false">{t('company.estimateWizard.diagnosticStep.no')}</option>
      </select>
    );
  } else if (field.type === 'select') {
    inputNode = (
      <select
        value={String(value ?? '')}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? undefined : v);
        }}
        disabled={disabled}
        className={cabinetSelectClass}
      >
        <option value="">—</option>
        {(field.options ?? []).map((opt) => (
          <option key={opt} value={opt}>
            {translateOption(opt)}
          </option>
        ))}
      </select>
    );
  } else if (field.type === 'number') {
    inputNode = (
      <input
        type="number"
        value={value == null || value === '' ? '' : String(value)}
        onChange={(e) => onChange(parseNumberInputValue(e.target.value))}
        placeholder={field.placeholder}
        min={field.validation?.min}
        max={field.validation?.max}
        disabled={disabled}
        className={cabinetFieldClass}
      />
    );
  } else {
    inputNode = (
      <input
        type="text"
        value={value == null ? '' : String(value)}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={field.placeholder}
        disabled={disabled}
        className={cabinetFieldClass}
      />
    );
  }

  return (
    <label className={cabinetLabelClass}>
      {labelNode}
      {inputNode}
      {field.helpText && !error && !warning && (
        <span className="text-[11px] text-gray-400 mt-1 leading-snug">{field.helpText}</span>
      )}
      {error && (
        <div className="mt-1.5 flex items-start gap-2 rounded-xl bg-rose-50/60 border border-rose-100/80 p-2.5 shadow-2xs animate-fade-in">
          <span className="text-rose-600 font-extrabold text-xs shrink-0">🚫</span>
          <span className="text-[11px] font-semibold text-rose-900 leading-relaxed">
            {error}
          </span>
        </div>
      )}
      {!error && warning && (
        <div className="mt-1.5 flex items-start gap-2 rounded-xl bg-amber-50/60 border border-amber-100 p-2.5 shadow-2xs animate-fade-in">
          <span className="text-amber-600 font-extrabold text-xs shrink-0">⚠️</span>
          <span className="text-[11px] font-semibold text-amber-950 leading-relaxed">
            {warning}
          </span>
        </div>
      )}
    </label>
  );
}
