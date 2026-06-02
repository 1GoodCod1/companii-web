import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { AppSelect } from '@/widgets/cabinet/cabinet-ui';
import {
  ESTIMATE_MEASUREMENT_UNITS,
  normalizeEstimateUnit,
  type EstimateMeasurementUnit,
} from '@/entities/estimate/model/estimateMeasurementUnits.constants';
import { estimateLineFieldWrap } from './estimateLineTableStyles';

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
      label: unit,
      title: t(`company.estimateWizard.unitsTitle.${unitKey(unit)}`, { defaultValue: unit }),
    }));
  }, [allowedUnits, normalizedValue, t]);

  return (
    <AppSelect
      value={normalizedValue}
      onChange={(nextValue) => {
        const unit = normalizeEstimateUnit(nextValue);
        if (unit) onChange(unit);
      }}
      options={options}
      disabled={disabled}
      className={cn(
        estimateLineFieldWrap,
        '[&>button]:h-8 [&>button]:min-h-8 [&>button]:gap-0.5 [&>button]:rounded-lg [&>button]:border-gray-200 [&>button]:bg-white [&>button]:px-1.5 [&>button]:py-0 [&>button]:text-xs [&>button]:font-medium [&>button]:text-center [&>button]:shadow-xs [&>button]:focus:border-violet-500 [&>button]:focus:ring-2 [&>button]:focus:ring-violet-500/15 [&>button_span]:flex-1 [&_svg]:size-3',
        className,
      )}
      aria-label={ariaLabel ?? t('company.estimateWizard.stagesStep.colUnit')}
      maxVisibleItems={8}
      menuPortal
      menuMinWidth={112}
    />
  );
}

function unitKey(unit: string): string {
  return unit.replace('²', '2').replace('³', '3');
}
