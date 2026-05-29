import { type PricingModifierOverrides, modifierFactor } from '../utils/pricingModifierOverrides';
import { readNumber, readBoolean, round2 } from '../utils/diagnosticReader';

function resolveHardwareCostMultiplier(hardwareTier: unknown, overrides?: PricingModifierOverrides): number {
  const normalized = String(hardwareTier ?? 'basic')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  if (normalized === 'premium') return modifierFactor('mobila.hardwareTier.premium', overrides, 70);
  if (normalized === 'standard') return modifierFactor('mobila.hardwareTier.standard', overrides, 25);
  return 1.0;
}

function resolveMaterialMultiplier(materialType: unknown, overrides?: PricingModifierOverrides): number {
  const normalized = String(materialType ?? 'pal')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  if (normalized === 'hpl') return modifierFactor('mobila.materialType.hpl', overrides, 80);
  if (normalized === 'lemn') return modifierFactor('mobila.materialType.lemn', overrides, 60);
  if (normalized === 'mdf') return modifierFactor('mobila.materialType.mdf', overrides, 30);
  return 1.0;
}

export type DerivedMeasurements = Record<string, number>;

export function deriveMobilaMeasurements(diagnostic: Record<string, unknown> | null | undefined, overrides?: PricingModifierOverrides): DerivedMeasurements {
  const measurements: DerivedMeasurements = {};

  if (!diagnostic) return measurements;

  measurements.cabinetCount = Math.max(0, readNumber(diagnostic, 'cabinetCount') ?? 0);
  measurements.wardrobeCount = Math.max(0, readNumber(diagnostic, 'wardrobeCount') ?? 0);

  const manualLinearMeters = readNumber(diagnostic, 'linearMeters');
  measurements.linearMeters =
    manualLinearMeters ??
    round2(measurements.cabinetCount * 0.8 + measurements.wardrobeCount * 1.5);
  measurements.cuttingLinearM = measurements.linearMeters;

  measurements.drawerCount = readNumber(diagnostic, 'drawerCount') ?? measurements.cabinetCount * 2;
  measurements.hingeCount =
    readNumber(diagnostic, 'hingeCount') ?? measurements.cabinetCount * 4 + measurements.wardrobeCount * 6;

  const hardwareCostMultiplier = resolveHardwareCostMultiplier(diagnostic.hardwareTier, overrides);
  measurements.hardwareCostMultiplier = hardwareCostMultiplier;
  measurements.hardwareUnits = measurements.hingeCount + measurements.drawerCount;
  measurements.hardwareCostQty = round2(measurements.hardwareUnits * hardwareCostMultiplier);

  measurements.materialMultiplier = resolveMaterialMultiplier(diagnostic.materialType, overrides);
  measurements.cuttingMaterialMultiplier = measurements.materialMultiplier;

  measurements.countertopLengthM = readNumber(diagnostic, 'countertopLengthM') ?? 0;

  const deliveryRequired = readBoolean(diagnostic, 'deliveryRequired');
  const installationRequired = readBoolean(diagnostic, 'installationRequired');
  measurements.deliveryQty = deliveryRequired ? 1 : 0;
  measurements.installationQty = installationRequired
    ? measurements.cabinetCount + measurements.wardrobeCount
    : 0;

  measurements.designHours = measurements.cabinetCount + measurements.wardrobeCount > 0 ? 4 : 0;
  measurements.assemblyCabinetQty = measurements.cabinetCount;
  measurements.assemblyWardrobeQty = measurements.wardrobeCount;
  measurements.handoverUnits =
    measurements.cabinetCount + measurements.wardrobeCount > 0 ? 1 : 0;

  return measurements;
}