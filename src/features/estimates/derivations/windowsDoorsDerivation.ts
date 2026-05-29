import { type PricingModifierOverrides, modifierFactor } from '../utils/pricingModifierOverrides';
import { readNumber, readBoolean, round2 } from '../utils/diagnosticReader';

export function resolveInstallationMultiplier(installationType: unknown, overrides?: PricingModifierOverrides): number {
  const n = String(installationType ?? 'standard').trim().toLowerCase().replace(/_/g, '-');
  if (n === 'warm-installation' || n === 'warm') return modifierFactor('okna.installationType.warm_installation', overrides, 35);
  if (n === 'renovation') return modifierFactor('okna.installationType.renovation', overrides, 20);
  return 1.0;
}

export type DerivedMeasurements = Record<string, number>;

export function deriveOknaDveriMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
  overrides?: PricingModifierOverrides,
): DerivedMeasurements {
  const m: DerivedMeasurements = {};
  if (!diagnostic) return m;

  m.windowCount = Math.max(0, readNumber(diagnostic, 'windowCount') ?? 0);
  m.doorCount = Math.max(0, readNumber(diagnostic, 'doorCount') ?? 0);

  const openingCount = m.windowCount + m.doorCount;
  m.foamTubes = Math.ceil(openingCount * 0.7);

  const sillCount = readNumber(diagnostic, 'sillCount') ?? m.windowCount;
  m.sillCount = sillCount;
  m.sillLengthM = round2(sillCount * 1.2);
  m.mosquitoNetCount = readNumber(diagnostic, 'mosquitoNetCount') ?? 0;

  const installationMultiplier = resolveInstallationMultiplier(diagnostic.installationType, overrides);
  m.installationMultiplier = installationMultiplier;
  m.windowCountLabor = round2(m.windowCount * installationMultiplier);
  m.doorCountLabor = round2(m.doorCount * installationMultiplier);

  m.oldRemovalQty = readBoolean(diagnostic, 'oldFrameRemoval') ? openingCount : 0;
  m.disposalQty = m.oldRemovalQty;

  const installationType = String(diagnostic.installationType ?? 'standard').toLowerCase();
  m.warmInstallationUnits =
    installationType === 'warm_installation' || installationType === 'warm-installation'
      ? openingCount
      : 0;

  m.measurementUnits = openingCount > 0 ? 1 : 0;
  m.slopesLengthM = m.sillLengthM;
  m.regulationUnits = openingCount;

  return m;
}