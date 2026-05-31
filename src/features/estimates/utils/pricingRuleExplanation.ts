import type {
  BlueprintPricingRule,
  EstimateBlueprintConfig,
} from '@/types/estimate-blueprint-config.types';
import type { EstimateLineDto, EstimateStageDto } from '@/types/estimates';

type MeasurementDto = {
  key: string;
  value: number;
  unit: string;
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

export function findPricingRuleForLine(
  config: EstimateBlueprintConfig | null | undefined,
  stage: Pick<EstimateStageDto, 'code'>,
  line: Pick<EstimateLineDto, 'description' | 'unit'>,
): BlueprintPricingRule | null {
  if (!config?.pricingRules?.length) return null;

  const description = normalizeText(line.description);
  const unit = normalizeText(line.unit);

  return (
    config.pricingRules.find(
      (rule) =>
        rule.stageCode === stage.code &&
        normalizeText(rule.description) === description &&
        normalizeText(rule.unit) === unit,
    ) ?? null
  );
}

export function formatPricingRuleExplanation(
  rule: BlueprintPricingRule | null,
  line: Pick<EstimateLineDto, 'qty' | 'unit' | 'unitPrice'>,
  measurements: MeasurementDto[] | null | undefined,
): string | null {
  if (!rule?.explanation) return null;

  const measurementByKey = new Map(
    (measurements ?? []).map((measurement) => [measurement.key, measurement]),
  );
  const sourceMeasurement = measurementByKey.get(rule.qtyKey);
  const sourceQty = sourceMeasurement?.value ?? line.qty;
  const sourceUnit = sourceMeasurement?.unit ?? rule.unit;
  const unitPrice = line.unitPrice ?? rule.unitPrice;
  const wasteLabel = rule.wastePct ? ` + ${rule.wastePct}% pierderi` : '';

  return `Calcul: ${rule.qtyKey} = ${sourceQty} ${sourceUnit}${wasteLabel}; ${line.qty} ${line.unit} × ${unitPrice} MDL/${line.unit}`;
}
