import {
  type PricingModifierOverrides,
  modifierFactor,
  modifierPct as sharedModifierPct,
} from '../utils/pricingModifierOverrides';
import { readNumber, round2 } from '../utils/diagnosticReader';

export type { PricingModifierOverrides };
export const ENABLED_WORK_MODULES_KEY = 'enabledWorkModules';

function readEnabledModuleKeys(diagnostic: Record<string, unknown> | null | undefined): Set<string> {
  const raw = diagnostic?.[ENABLED_WORK_MODULES_KEY];
  if (!Array.isArray(raw)) return new Set();
  return new Set(raw.filter((key): key is string => typeof key === 'string'));
}

function resolveModuleQuantity(
  diagnostic: Record<string, unknown> | null | undefined,
  key: string,
  moduleKey: string,
  enabledModules: Set<string>,
  computedWhenEnabled?: number,
): number {
  const explicit = readNumber(diagnostic, key);
  if (explicit != null) return Math.max(0, explicit);
  if (enabledModules.has(moduleKey) && computedWhenEnabled != null) return computedWhenEnabled;
  return 0;
}

function estimatePerimeterM(floorArea: number): number {
  return round2(4 * Math.sqrt(floorArea));
}

export function resolveSurfaceConditionMultiplier(
  surfaceCondition: unknown,
  overrides?: PricingModifierOverrides,
): number {
  const normalized = String(surfaceCondition ?? 'new')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  if (normalized === 'very_bad' || normalized === 'foarte_proasta' || normalized === 'foarte proasta') {
    return modifierFactor('finishing.surfaceCondition.very_bad', overrides, 35);
  }
  if (normalized === 'old' || normalized === 'vechi') {
    return modifierFactor('finishing.surfaceCondition.old', overrides, 15);
  }
  return 1.0;
}

export function resolveFinishLevelPremiumAdd(
  finishLevel: unknown,
  overrides?: PricingModifierOverrides,
): number {
  const normalized = String(finishLevel ?? 'standard')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  return normalized === 'premium'
    ? sharedModifierPct('finishing.finishLevel.premium', overrides, 15) / 100
    : 0;
}

export function resolveFinisajComplexityMultiplier(
  surfaceCondition: unknown,
  finishLevel: unknown,
  overrides?: PricingModifierOverrides,
): number {
  return round2(
    resolveSurfaceConditionMultiplier(surfaceCondition, overrides) +
      resolveFinishLevelPremiumAdd(finishLevel, overrides),
  );
}

export type DerivedMeasurements = Record<string, number>;

export function deriveFinisajMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
  overrides?: PricingModifierOverrides,
): DerivedMeasurements {
  const m: DerivedMeasurements = {};
  if (!diagnostic) return m;

  const floorArea = Math.max(1, readNumber(diagnostic, 'finishArea') ?? 30);
  const wallHeight = readNumber(diagnostic, 'wallHeight') ?? 2.7;

  m.finishArea = floorArea;
  m.wallHeight = wallHeight;
  m.roomPerimeterM = estimatePerimeterM(floorArea);

  const computedWallArea = round2(m.roomPerimeterM * wallHeight);
  const computedCeilingArea = readNumber(diagnostic, 'ceilingArea') ?? floorArea;
  const skinArea = computedWallArea; // Putty, Paint, Prep default strictly to walls
  const enabledModules = readEnabledModuleKeys(diagnostic);

  m.wallArea = computedWallArea;
  m.ceilingArea = resolveModuleQuantity(diagnostic, 'ceilingArea', 'ceiling', enabledModules, computedCeilingArea);
  m.demolitionArea = resolveModuleQuantity(diagnostic, 'demolitionArea', 'demolition', enabledModules);
  m.plasterArea = resolveModuleQuantity(diagnostic, 'plasterArea', 'plaster', enabledModules, computedWallArea);
  m.puttyArea = resolveModuleQuantity(diagnostic, 'puttyArea', 'putty', enabledModules, skinArea);
  m.tileArea = resolveModuleQuantity(diagnostic, 'tileArea', 'tile', enabledModules);
  m.flooringArea = resolveModuleQuantity(diagnostic, 'flooringArea', 'flooring', enabledModules);
  m.parquetArea = resolveModuleQuantity(diagnostic, 'parquetArea', 'parquet', enabledModules);
  m.screedArea = resolveModuleQuantity(diagnostic, 'screedArea', 'screed', enabledModules);
  m.drywallArea = resolveModuleQuantity(diagnostic, 'drywallArea', 'drywall', enabledModules);
  m.partitionArea = resolveModuleQuantity(diagnostic, 'partitionArea', 'partition', enabledModules);
  m.stretchCeilingArea = resolveModuleQuantity(diagnostic, 'stretchCeilingArea', 'stretch_ceiling', enabledModules, floorArea);
  m.decorativePlasterArea = resolveModuleQuantity(diagnostic, 'decorativePlasterArea', 'decorative_plaster', enabledModules);
  m.waterproofingArea = resolveModuleQuantity(diagnostic, 'waterproofingArea', 'waterproofing', enabledModules);
  m.wallpaperArea = resolveModuleQuantity(diagnostic, 'wallpaperArea', 'wallpaper', enabledModules);

  const paintDefault = round2(Math.max(0, skinArea - m.wallpaperArea - m.decorativePlasterArea));
  m.paintArea = resolveModuleQuantity(diagnostic, 'paintArea', 'paint', enabledModules, paintDefault);

  m.preparationArea = resolveModuleQuantity(diagnostic, 'preparationArea', 'surface_preparation', enabledModules, skinArea);
  m.baseboardLengthM = resolveModuleQuantity(diagnostic, 'baseboardLengthM', 'baseboards', enabledModules, m.roomPerimeterM);
  m.doorSlopeLengthM = resolveModuleQuantity(diagnostic, 'doorSlopeLengthM', 'slopes', enabledModules);

  const complexityMultiplier = resolveFinisajComplexityMultiplier(
    diagnostic.surfaceCondition,
    diagnostic.finishLevel,
    overrides,
  );
  m.complexityMultiplier = complexityMultiplier;
  m.surfaceConditionMultiplier = resolveSurfaceConditionMultiplier(
    diagnostic.surfaceCondition,
    overrides,
  );

  const withLabor = (area: number) => round2(area * complexityMultiplier);
  m.demolitionAreaLabor = withLabor(m.demolitionArea);
  m.plasterAreaLabor = withLabor(m.plasterArea);
  m.puttyAreaLabor = withLabor(m.puttyArea);
  m.paintAreaLabor = withLabor(m.paintArea);
  m.wallpaperAreaLabor = withLabor(m.wallpaperArea);
  m.decorativePlasterAreaLabor = withLabor(m.decorativePlasterArea);
  m.drywallAreaLabor = withLabor(m.drywallArea);
  m.partitionAreaLabor = withLabor(m.partitionArea);
  m.ceilingAreaLabor = withLabor(m.ceilingArea);
  m.stretchCeilingAreaLabor = withLabor(m.stretchCeilingArea);
  m.tileAreaLabor = withLabor(m.tileArea);
  m.waterproofingAreaLabor = withLabor(m.waterproofingArea);
  m.flooringAreaLabor = withLabor(m.flooringArea);
  m.parquetAreaLabor = withLabor(m.parquetArea);
  m.screedAreaLabor = withLabor(m.screedArea);
  m.preparationAreaLabor = withLabor(m.preparationArea);
  m.cleaningArea = enabledModules.has('cleaning') ? floorArea : 0;

  return m;
}