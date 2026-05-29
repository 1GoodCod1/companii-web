/**
 * Frontend mirror of backend deriveElektrikaMeasurements (electrical-measurements.util.ts).
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

function readBoolean(source: Record<string, unknown> | null | undefined, key: string): boolean {
  const value = source?.[key];
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return false;
}

function readSelect(source: Record<string, unknown> | null | undefined, key: string): string {
  const value = source?.[key];
  if (typeof value === 'string' && value.trim() !== '') return value.trim();
  return '';
}

function resolveWallMaterialMultiplier(wallMaterial: unknown): number {
  const normalized = String(wallMaterial ?? 'gips')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  if (normalized === 'beton' || normalized === 'concrete') return 1.45;
  if (normalized === 'caramida' || normalized === 'brick') return 1.2;
  if (normalized === 'bca' || normalized === 'aac') return 1.1;
  return 1.0;
}

function resolveCableSegmentMultiplier(segment: string): number {
  if (segment === '4 mm²') return 1.4;
  if (segment === '6 mm²') return 1.7;
  return 1.0;
}

function resolveDeviceTierMultiplier(tier: string): number {
  if (tier === 'premium') return 2.5;
  if (tier === 'standard') return 1.5;
  return 1.0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export type DerivedMeasurements = Record<string, number>;

export function deriveElektrikaMeasurements(diagnostic: Record<string, unknown> | null | undefined): DerivedMeasurements {
  const measurements: DerivedMeasurements = {};

  if (!diagnostic) return measurements;

  const roomCount = Math.max(1, readNumber(diagnostic, 'roomCount') ?? 1);
  const cableReplace = readBoolean(diagnostic, 'cableReplace');
  const newPanel = readBoolean(diagnostic, 'newPanel');
  const smartHomeRequired = readBoolean(diagnostic, 'smartHomeRequired');
  const groundingRequired = readBoolean(diagnostic, 'groundingRequired');
  const voltageStabilizer = readBoolean(diagnostic, 'voltageStabilizer');
  const isNewConstruction = readBoolean(diagnostic, 'isNewConstruction');
  const dedicatedLinesCount = readNumber(diagnostic, 'dedicatedLinesCount') ?? 0;
  const wallChasingM = readNumber(diagnostic, 'wallChasingM') ?? 0;
  const panelModules = readNumber(diagnostic, 'panelModules') ?? 12;

  measurements.roomCount = roomCount;

  const manualSocketCount = readNumber(diagnostic, 'socketCount');
  const manualSwitchCount = readNumber(diagnostic, 'switchCount');
  const manualLightCount = readNumber(diagnostic, 'lightPointCount');

  measurements.socketCount = manualSocketCount ?? Math.max(0, roomCount * 2);
  measurements.switchCount = manualSwitchCount ?? Math.max(0, roomCount);
  measurements.lightPointCount = manualLightCount ?? Math.max(0, roomCount);

  measurements.electricPoints =
    measurements.socketCount + measurements.switchCount + measurements.lightPointCount;

  measurements.panelCount = newPanel ? 1 : 0;
  measurements.panelModules = panelModules;
  measurements.dedicatedLinesCount = dedicatedLinesCount;

  measurements.cableLengthM =
    Math.max(15, roomCount * 12) +
    (cableReplace ? 25 : 0) +
    dedicatedLinesCount * 12;

  const cableSegmentMultiplier = resolveCableSegmentMultiplier(readSelect(diagnostic, 'cableSegmentMm2') || '2.5 mm²');
  measurements.cableSegmentMultiplier = cableSegmentMultiplier;
  const deviceTierMultiplier = resolveDeviceTierMultiplier(readSelect(diagnostic, 'deviceTier') || 'standard');
  measurements.deviceTierMultiplier = deviceTierMultiplier;

  measurements.wallChasingM = wallChasingM > 0 ? wallChasingM : 0;
  const materialMultiplier = resolveWallMaterialMultiplier(diagnostic.wallMaterial);
  measurements.materialMultiplier = materialMultiplier;
  measurements.wallChasingCostM = isNewConstruction ? 0 : round2(measurements.wallChasingM * materialMultiplier);
  measurements.cableLengthMLabor = round2(measurements.cableLengthM);
  measurements.electricPointsLabor = round2(measurements.electricPoints);

  measurements.smartHomeCount = smartHomeRequired ? 1 : 0;
  measurements.lowVoltageLineCount = dedicatedLinesCount;
  measurements.groundingUnits = groundingRequired ? 1 : 0;
  measurements.stabilizerCount = voltageStabilizer ? 1 : 0;
  measurements.demolitionHours = cableReplace ? Math.max(2, roomCount) : 0;
  measurements.projectHours = Math.max(2, Math.ceil(roomCount / 2));
  measurements.testingPointCount = measurements.electricPoints;
  measurements.electricPointsMaterial = round2(measurements.electricPoints * deviceTierMultiplier);
  measurements.cableMaterialM = round2(measurements.cableLengthM * cableSegmentMultiplier);

  return measurements;
}