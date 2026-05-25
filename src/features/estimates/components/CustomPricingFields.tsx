import { cabinetFieldClass, cabinetLabelClass } from '@/components/cabinet/cabinet-ui';
import type { CustomPricingValues } from '../customPricing';

type Props = {
  values: CustomPricingValues;
  onChange: (values: CustomPricingValues) => void;
  compact?: boolean;
};

function parseOptionalNumber(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return value;
}

export function CustomPricingFields({ values, onChange, compact }: Props) {
  return (
    <div className={compact ? 'space-y-3' : 'rounded-2xl border border-amber-100 bg-amber-50/40 p-4 space-y-4'}>
      {!compact ? (
        <div>
          <h4 className="font-bold text-gray-900">Tarife personalizate</h4>
          <p className="text-xs text-gray-600 mt-1">
            Opțional — suprascriu prețul / m², durata în zile, orele sau **prețul total fix pentru volumul întreg de manoperă** la calculul smetei.
          </p>
        </div>
      ) : null}

      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        <label className={cabinetLabelClass}>
          Preț personalizat / m² (MDL)
          <input
            type="number"
            min={0}
            step={1}
            placeholder="Ex: 180"
            value={values.customUnitPriceSqm ?? ''}
            onChange={(e) =>
              onChange({
                ...values,
                customUnitPriceSqm: parseOptionalNumber(e.target.value),
              })
            }
            className={cabinetFieldClass}
          />
        </label>

        <label className={cabinetLabelClass}>
          Preț total manoperă [Volum / Contract] (MDL)
          <input
            type="number"
            min={0}
            step={1}
            placeholder="Ex: 5000"
            value={values.customLaborTotal ?? ''}
            onChange={(e) =>
              onChange({
                ...values,
                customLaborTotal: parseOptionalNumber(e.target.value),
              })
            }
            className={cabinetFieldClass}
          />
        </label>

        <label className={cabinetLabelClass}>
          Durată estimată (zile)
          <input
            type="number"
            min={0}
            step={1}
            placeholder="Ex: 5"
            value={values.customDurationDays ?? ''}
            onChange={(e) =>
              onChange({
                ...values,
                customDurationDays: parseOptionalNumber(e.target.value),
              })
            }
            className={cabinetFieldClass}
          />
        </label>

        <label className={cabinetLabelClass}>
          Ore manoperă totală (opțional)
          <input
            type="number"
            min={0}
            step={0.5}
            placeholder="Ex: 24"
            value={values.customLaborHours ?? ''}
            onChange={(e) =>
              onChange({
                ...values,
                customLaborHours: parseOptionalNumber(e.target.value),
              })
            }
            className={cabinetFieldClass}
          />
        </label>
      </div>
    </div>
  );
}
