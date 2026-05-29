import { type PricingModifierOverrides, modifierFactor } from '../utils/pricingModifierOverrides';
import { readNumber, readBoolean, round2 } from '../utils/diagnosticReader';

function resolvePipeMaterialMultiplier(pipeMaterial: unknown, overrides?: PricingModifierOverrides): number {
  const normalized = String(pipeMaterial ?? 'ppr')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  if (normalized === 'cupru' || normalized === 'copper') return modifierFactor('santehnika.pipeMaterial.cupru', overrides, 45);
  if (normalized === 'pex') return modifierFactor('santehnika.pipeMaterial.pex', overrides, 20);
  if (normalized === 'multistrat') return modifierFactor('santehnika.pipeMaterial.multistrat', overrides, 15);
  return 1.0;
}

export type DerivedMeasurements = Record<string, number>;

export function deriveSantehnikaMeasurements(diagnostic: Record<string, unknown> | null | undefined, overrides?: PricingModifierOverrides): DerivedMeasurements {
  const measurements: DerivedMeasurements = {};

  if (!diagnostic) return measurements;

  const bathroomCount = Math.max(1, readNumber(diagnostic, 'bathroomCount') ?? 1);
  const kitchenPoints = readNumber(diagnostic, 'kitchenPoints') ?? 0;
  const bathroomPoints = readNumber(diagnostic, 'bathroomPoints') ?? 0;
  const replacePipes = readBoolean(diagnostic, 'replacePipes');
  const waterHeater = readBoolean(diagnostic, 'waterHeater');
  const filterSystem = readBoolean(diagnostic, 'filterSystem');
  const riserReplacement = readBoolean(diagnostic, 'riserReplacement');
  const drainReplacement = readBoolean(diagnostic, 'drainReplacement');
  const wallChasingM = readNumber(diagnostic, 'wallChasingM') ?? 0;

  measurements.bathroomCount = bathroomCount;
  measurements.kitchenPoints = kitchenPoints;
  measurements.bathroomPoints = bathroomPoints;

  measurements.plumbingPoints = Math.max(1, bathroomCount * 2 + kitchenPoints + bathroomPoints);

  const explicitPipeLength = readNumber(diagnostic, 'pipeLengthM');
  measurements.pipeLengthM =
    explicitPipeLength ?? Math.max(8, bathroomCount * 6) + (replacePipes ? 15 : 0);

  measurements.drainLengthM = Math.max(4, bathroomCount * 3 + kitchenPoints * 2);
  measurements.drainReplaceLengthM = drainReplacement ? Math.max(3, bathroomCount * 2 + kitchenPoints) : 0;
  measurements.waterHeaterCount = waterHeater ? 1 : 0;
  measurements.filterSystemCount = filterSystem ? 1 : 0;
  measurements.riserReplacementCount = riserReplacement ? 1 : 0;
  measurements.wallChasingM = wallChasingM > 0 ? wallChasingM : 0;
  measurements.fittingsQty = Math.ceil(measurements.pipeLengthM * 0.8);
  measurements.demolitionHours = replacePipes
    ? Math.max(2, bathroomCount)
    : Math.max(1, Math.ceil(bathroomCount / 2));

  const pipeMaterialMultiplier = resolvePipeMaterialMultiplier(diagnostic.pipeMaterial, overrides);
  measurements.pipeMaterialMultiplier = pipeMaterialMultiplier;
  measurements.pipeLengthMMaterial = round2(measurements.pipeLengthM * pipeMaterialMultiplier);

  measurements.pipeLengthMLabor = measurements.pipeLengthM;
  measurements.drainLengthMLabor = measurements.drainLengthM;
  measurements.plumbingPointsLabor = measurements.plumbingPoints;
  measurements.plumbingPointsMaterial = measurements.plumbingPoints;

  return measurements;
}