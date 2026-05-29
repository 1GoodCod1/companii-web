/**
 * Frontend mirror of backend deriveItHardwareMeasurements.
 * Used by previewEngine to compute derived measurements client-side.
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

type RepairComplexity = 'simple' | 'medium' | 'complex';
type RecoverySeverity = 'logic' | 'physical' | 'severe';

function normalizeRepairComplexity(raw: unknown): RepairComplexity {
  const normalized = String(raw ?? '').trim().toLowerCase();
  if (normalized.includes('simpl')) return 'simple';
  if (normalized.includes('medi')) return 'medium';
  if (normalized.includes('complex')) return 'complex';
  return 'simple';
}

function normalizeRecoverySeverity(raw: unknown): RecoverySeverity {
  const normalized = String(raw ?? '').trim().toLowerCase();
  if (normalized.includes('logic') || normalized.includes('sterg') || normalized.includes('șterg')) {
    return 'logic';
  }
  if (normalized.includes('usoar') || normalized.includes('ușoar')) return 'physical';
  if (normalized.includes('grav')) return 'severe';
  return 'logic';
}

export type DerivedMeasurements = Record<string, number>;

export function deriveItHardwareMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
): DerivedMeasurements {
  const measurements: DerivedMeasurements = {};

  if (!diagnostic) return measurements;

  measurements.deviceCount = readNumber(diagnostic, 'deviceCount') ?? 1;
  measurements.repairCount = readNumber(diagnostic, 'repairCount') ?? 0;
  measurements.assemblyCount = readNumber(diagnostic, 'assemblyCount') ?? 0;
  measurements.upgradeCount = readNumber(diagnostic, 'upgradeCount') ?? 0;
  measurements.cleaningHwCount = readNumber(diagnostic, 'cleaningHwCount') ?? 0;
  measurements.osInstallCount = readNumber(diagnostic, 'osInstallCount') ?? 0;
  measurements.dataRecoveryCount = readNumber(diagnostic, 'dataRecoveryCount') ?? 0;
  measurements.peripheralCount = readNumber(diagnostic, 'peripheralCount') ?? 0;

  const complexity = normalizeRepairComplexity(diagnostic.repairComplexity);
  measurements.simpleRepairCount = complexity === 'simple' ? measurements.repairCount : 0;
  measurements.mediumRepairCount = complexity === 'medium' ? measurements.repairCount : 0;
  measurements.complexRepairCount = complexity === 'complex' ? measurements.repairCount : 0;

  measurements.osLicenseCount = measurements.osInstallCount;

  const severity = normalizeRecoverySeverity(diagnostic.recoverySeverity);
  measurements.logicRecoveryCount = severity === 'logic' ? measurements.dataRecoveryCount : 0;
  measurements.physicalRecoveryCount = severity === 'physical' ? measurements.dataRecoveryCount : 0;
  measurements.severeRecoveryCount = severity === 'severe' ? measurements.dataRecoveryCount : 0;

  measurements.projectUnits = 1;

  return measurements;
}