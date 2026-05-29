/**
 * Frontend mirror of backend deriveCleaningMeasurements (cleaning-measurements.util.ts).
 * Diagnostic-only (no plan2d). Closes the preview gap for the cleaning-type/dust
 * multiplier and the derived clean-area labor split.
 */

function readNumber(source: Record<string, unknown> | null | undefined, key: string): number | undefined {
  const value = source?.[key];
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function readBoolean(source: Record<string, unknown> | null | undefined, key: string): boolean {
  const value = source?.[key];
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return false;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function resolveCleaningTypeMultiplier(cleaningType: unknown): number {
  const n = String(cleaningType ?? 'standard').trim().toLowerCase().replace(/-/g, '_');
  if (n === 'post_construction') return 1.65;
  if (n === 'deep') return 1.35;
  if (n === 'move_out') return 1.25;
  return 1.0;
}

export function resolveDustMultiplier(afterRepairDustLevel: unknown): number {
  const n = String(afterRepairDustLevel ?? 'low').trim().toLowerCase();
  if (n === 'high') return 1.35;
  if (n === 'medium') return 1.15;
  return 1.0;
}

export function resolveCombinedCleaningMultiplier(
  cleaningType: unknown,
  afterRepairDustLevel: unknown,
  furniturePresent?: boolean,
): number {
  let multiplier = resolveCleaningTypeMultiplier(cleaningType) * resolveDustMultiplier(afterRepairDustLevel);
  if (furniturePresent) multiplier *= 1.1;
  return round2(multiplier);
}

export type DerivedMeasurements = Record<string, number>;

export function deriveCleaningMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
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
  m.complexityMultiplier = resolveCleaningTypeMultiplier(cleaningType);
  m.dustMultiplier = resolveDustMultiplier(diagnostic.afterRepairDustLevel);
  m.totalCleaningMultiplier = resolveCombinedCleaningMultiplier(
    cleaningType,
    diagnostic.afterRepairDustLevel,
    furniturePresent,
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
