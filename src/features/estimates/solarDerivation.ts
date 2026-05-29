/**
 * Frontend mirror of backend derivePanouriSolareMeasurements (solar-measurements.util.ts).
 * Diagnostic-only (no plan2d). Closes the preview gap for structure/panel labor,
 * cabling, system power and protection-panel counts.
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

function normalizeRoofType(roofType: unknown): string {
  return String(roofType ?? 'metal').trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

function normalizeGridConnection(gridConnection: unknown): string {
  return String(gridConnection ?? 'on_grid').trim().toLowerCase().replace(/-/g, '_');
}

export function resolveRoofMultiplier(roofType: unknown): number {
  const n = normalizeRoofType(roofType);
  if (n === 'tile') return 1.15;
  if (n === 'flat') return 1.25;
  if (n === 'ground') return 1.35;
  return 1.0;
}

export type DerivedMeasurements = Record<string, number>;

export function derivePanouriSolareMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
): DerivedMeasurements {
  const m: DerivedMeasurements = {};
  if (!diagnostic) return m;

  const panelCount = Math.min(100, Math.max(1, readNumber(diagnostic, 'panelCount') ?? 1));
  m.panelCount = panelCount;
  m.inverterCount = readNumber(diagnostic, 'inverterCount') ?? 1;
  m.batteryCapacity = Math.max(0, readNumber(diagnostic, 'batteryCapacity') ?? 0);

  const panelWp = readNumber(diagnostic, 'panelWp');
  const manualSystemPowerKw = readNumber(diagnostic, 'systemPowerKw');
  if (manualSystemPowerKw != null && manualSystemPowerKw > 0) {
    m.systemPowerKw = round2(manualSystemPowerKw);
  } else if (panelWp != null && panelWp > 0) {
    m.systemPowerKw = round2((panelCount * panelWp) / 1000);
  } else {
    m.systemPowerKw = 0;
  }

  const roofMultiplier = resolveRoofMultiplier(diagnostic.roofType);
  m.roofMultiplier = roofMultiplier;
  m.structureQty = panelCount;
  m.structureLaborQty = round2(panelCount * roofMultiplier);
  m.panelLaborQty = round2(panelCount * roofMultiplier);
  m.optimizerCount = panelCount;
  m.evChargerCount = Math.max(0, readNumber(diagnostic, 'evChargerCount') ?? 0);

  const manualCableLengthM = readNumber(diagnostic, 'cableLengthM');
  m.cableLengthM =
    manualCableLengthM != null && manualCableLengthM > 0
      ? manualCableLengthM
      : round2(panelCount * 2.5);

  m.permitUnits = readBoolean(diagnostic, 'permitsRequired') ? 1 : 0;
  m.monitoringUnits = readBoolean(diagnostic, 'monitoringRequired') ? 1 : 0;
  m.gridConnectionUnits = normalizeGridConnection(diagnostic.gridConnection) === 'off_grid' ? 0 : 1;

  m.auditHours = 4;
  m.projectHours = 8;
  m.protectionPanelUnits = Math.max(1, Math.ceil(panelCount / 12));
  m.groundingUnits = 1;
  m.handoverUnits = 1;
  m.projectUnits = 1;
  m.requiresManualReview = panelCount > 30 || m.systemPowerKw > 15 ? 1 : 0;

  return m;
}
