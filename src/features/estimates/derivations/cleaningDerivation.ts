import { type PricingModifierOverrides, modifierFactor } from '../utils/pricingModifierOverrides';
import { readNumber, readBoolean, round2 } from '../utils/diagnosticReader';


export function resolveCleaningTypeMultiplier(cleaningType: unknown, overrides?: PricingModifierOverrides): number {
  const n = String(cleaningType ?? 'standard').trim().toLowerCase().replace(/-/g, '_');
  if (n === 'post_construction') return modifierFactor('cleaning.cleaningType.post_construction', overrides, 65);
  if (n === 'deep') return modifierFactor('cleaning.cleaningType.deep', overrides, 35);
  if (n === 'move_out') return modifierFactor('cleaning.cleaningType.move_out', overrides, 25);
  return 1.0;
}

export function resolveDustMultiplier(afterRepairDustLevel: unknown, overrides?: PricingModifierOverrides): number {
  const n = String(afterRepairDustLevel ?? 'low').trim().toLowerCase();
  if (n === 'high') return modifierFactor('cleaning.dust.high', overrides, 35);
  if (n === 'medium') return modifierFactor('cleaning.dust.medium', overrides, 15);
  return 1.0;
}

export function resolveCombinedCleaningMultiplier(
  cleaningType: unknown,
  afterRepairDustLevel: unknown,
  furniturePresent?: boolean,
  overrides?: PricingModifierOverrides,
): number {
  let multiplier = resolveCleaningTypeMultiplier(cleaningType, overrides) * resolveDustMultiplier(afterRepairDustLevel, overrides);
  if (furniturePresent) multiplier *= 1.1;
  return round2(multiplier);
}

export type DerivedMeasurements = Record<string, number>;

export function deriveCleaningMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
  overrides?: PricingModifierOverrides,
): DerivedMeasurements {
  const m: DerivedMeasurements = {};
  if (!diagnostic) return m;

  const cleanArea = Math.max(1, readNumber(diagnostic, 'cleanArea') ?? 40);
  m.cleanArea = cleanArea;
  m.windowCleanCount = readNumber(diagnostic, 'windowCount') ?? 0;
  m.bathroomCount = readNumber(diagnostic, 'bathroomCount') ?? 0;
  m.kitchenDeepCleanUnits = readBoolean(diagnostic, 'kitchenDeepClean') ? 1 : 0;

  const cleaningType = diagnostic.cleaningType ?? 'standard';
  const furniturePresent = readBoolean(diagnostic, 'furniturePresent');
  m.complexityMultiplier = resolveCleaningTypeMultiplier(cleaningType, overrides);
  m.dustMultiplier = resolveDustMultiplier(diagnostic.afterRepairDustLevel, overrides);
  m.totalCleaningMultiplier = resolveCombinedCleaningMultiplier(
    cleaningType,
    diagnostic.afterRepairDustLevel,
    furniturePresent,
    overrides,
  );

  m.cleanAreaLabor = round2(cleanArea * m.totalCleaningMultiplier);
  const isPostConstruction = String(cleaningType).toLowerCase().replace(/-/g, '_') === 'post_construction';
  m.standardCleanAreaLabor = isPostConstruction ? 0 : m.cleanAreaLabor;
  m.postConstructionAreaLabor = isPostConstruction ? m.cleanAreaLabor : 0;

  m.chemistryUnits = Math.ceil(cleanArea / 40);
  m.trashRemovalUnits = readBoolean(diagnostic, 'trashRemoval') ? Math.ceil(cleanArea / 50) : 0;
  m.inspectionHours = Math.max(1, Math.ceil(cleanArea / 80));
  m.dryCleanAreaLabor = round2(cleanArea * 0.4 * m.totalCleaningMultiplier);
  m.wetCleanAreaLabor = m.cleanAreaLabor;
  m.bathroomCleanUnits = m.bathroomCount;
  m.specialCleanAreaLabor = m.postConstructionAreaLabor > 0 ? m.postConstructionAreaLabor : 0;

  return m;
}
