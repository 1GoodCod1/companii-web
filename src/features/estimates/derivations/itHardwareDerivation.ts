import { readNumber } from '../utils/diagnosticReader';

export type DerivedMeasurements = Record<string, number>;

export function deriveItHardwareMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
): DerivedMeasurements {
  const measurements: DerivedMeasurements = {};

  if (!diagnostic) return measurements;

  measurements.deviceCount = readNumber(diagnostic, 'deviceCount') ?? 1;

  measurements.simpleRepairCount = readNumber(diagnostic, 'simpleRepairCount') ?? 0;
  measurements.mediumRepairCount = readNumber(diagnostic, 'mediumRepairCount') ?? 0;
  measurements.complexRepairCount = readNumber(diagnostic, 'complexRepairCount') ?? 0;
  measurements.repairCount = measurements.simpleRepairCount + measurements.mediumRepairCount + measurements.complexRepairCount;

  measurements.assemblyCount = readNumber(diagnostic, 'assemblyCount') ?? 0;
  measurements.upgradeCount = readNumber(diagnostic, 'upgradeCount') ?? 0;
  measurements.cleaningHwCount = readNumber(diagnostic, 'cleaningHwCount') ?? 0;
  measurements.osInstallCount = readNumber(diagnostic, 'osInstallCount') ?? 0;

  const osTypeStr = String(diagnostic.osType ?? '').toLowerCase();
  const isFreeOs = osTypeStr.includes('linux') || osTypeStr.includes('macos');
  measurements.osLicenseCount = isFreeOs ? 0 : measurements.osInstallCount;

  measurements.logicRecoveryCount = readNumber(diagnostic, 'logicRecoveryCount') ?? 0;
  measurements.physicalRecoveryCount = readNumber(diagnostic, 'physicalRecoveryCount') ?? 0;
  measurements.severeRecoveryCount = readNumber(diagnostic, 'severeRecoveryCount') ?? 0;
  measurements.dataRecoveryCount = measurements.logicRecoveryCount + measurements.physicalRecoveryCount + measurements.severeRecoveryCount;

  measurements.peripheralCount = readNumber(diagnostic, 'peripheralCount') ?? 0;
  measurements.projectUnits = 1;

  return measurements;
}