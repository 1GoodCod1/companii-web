export type PricingModifierOverrides = Record<string, number> | null | undefined;

export function modifierPct(
  key: string,
  overrides: PricingModifierOverrides,
  fallbackPct: number,
): number {
  const v = overrides?.[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : fallbackPct;
}

export function modifierFactor(
  key: string,
  overrides: PricingModifierOverrides,
  fallbackPct: number,
): number {
  return 1 + modifierPct(key, overrides, fallbackPct) / 100;
}