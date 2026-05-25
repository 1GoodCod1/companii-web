export const CUSTOM_PRICING_KEYS = {
  unitPriceSqm: 'customUnitPriceSqm',
  durationDays: 'customDurationDays',
  laborHours: 'customLaborHours',
} as const;

export type CustomPricingValues = {
  customUnitPriceSqm?: number;
  customDurationDays?: number;
  customLaborHours?: number;
};

export function readCustomPricing(
  diagnostic: Record<string, unknown> | null | undefined,
): CustomPricingValues {
  return {
    customUnitPriceSqm: readPositiveNumber(diagnostic?.[CUSTOM_PRICING_KEYS.unitPriceSqm]),
    customDurationDays: readPositiveNumber(diagnostic?.[CUSTOM_PRICING_KEYS.durationDays]),
    customLaborHours: readPositiveNumber(diagnostic?.[CUSTOM_PRICING_KEYS.laborHours]),
  };
}

export function mergeCustomPricing(
  diagnostic: Record<string, unknown>,
  values: CustomPricingValues,
): Record<string, unknown> {
  const next = { ...diagnostic };
  setOptionalNumber(next, CUSTOM_PRICING_KEYS.unitPriceSqm, values.customUnitPriceSqm);
  setOptionalNumber(next, CUSTOM_PRICING_KEYS.durationDays, values.customDurationDays);
  setOptionalNumber(next, CUSTOM_PRICING_KEYS.laborHours, values.customLaborHours);
  return next;
}

function readPositiveNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return undefined;
  return value;
}

function setOptionalNumber(
  target: Record<string, unknown>,
  key: string,
  value: number | undefined,
) {
  if (value != null && value > 0) {
    target[key] = value;
    return;
  }
  delete target[key];
}
