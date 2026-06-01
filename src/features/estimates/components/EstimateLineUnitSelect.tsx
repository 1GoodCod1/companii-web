import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  ESTIMATE_MEASUREMENT_UNITS,
  normalizeEstimateUnit,
  type EstimateMeasurementUnit,
} from '@/constants/estimateMeasurementUnits.constants';
import {
  estimateLineFieldWrap,
  estimateLineUnitSelect,
} from './estimateLineTableStyles';

type Props = {
  value: string;
  onChange: (unit: EstimateMeasurementUnit) => void;
  disabled?: boolean;
  className?: string;
  allowedUnits?: readonly EstimateMeasurementUnit[];
  'aria-label'?: string;
};

export function EstimateLineUnitSelect({
  value,
  onChange,
  disabled,
  className,
  allowedUnits,
  'aria-label': ariaLabel,
}: Props) {
  const { t } = useTranslation();

  const normalizedValue = normalizeEstimateUnit(value) ?? value;

  const options = useMemo(() => {
    const baseUnits = allowedUnits?.length ? [...allowedUnits] : [...ESTIMATE_MEASUREMENT_UNITS];
    const units = [...baseUnits];
    if (normalizedValue && !units.includes(normalizedValue as EstimateMeasurementUnit)) {
      units.unshift(normalizedValue as EstimateMeasurementUnit);
    }
    return units.map((unit) => ({
      value: unit,
      title: t(`company.estimateWizard.unitsTitle.${unitKey(unit)}`, { defaultValue: unit }),
    }));
  }, [allowedUnits, normalizedValue, t]);

  const selectedTitle =
    options.find((option) => option.value === normalizedValue)?.title ?? normalizedValue;

  return (
    <div className={cn('relative', estimateLineFieldWrap, className)}>
      <select
        value={normalizedValue}
        disabled={disabled}
        aria-label={ariaLabel ?? t('company.estimateWizard.stagesStep.colUnit')}
        title={selectedTitle}
        onChange={(event) => {
          const unit = normalizeEstimateUnit(event.target.value);
          if (unit) onChange(unit);
        }}
        className={estimateLineUnitSelect}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} title={option.title}>
            {option.value}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
        aria-hidden
      />
    </div>
  );
}

function unitKey(unit: string): string {
  return unit.replace('²', '2').replace('³', '3');
}
