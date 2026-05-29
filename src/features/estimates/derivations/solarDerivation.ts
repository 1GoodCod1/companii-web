import { type PricingModifierOverrides, modifierFactor } from '../utils/pricingModifierOverrides';
import { readNumber, readBoolean, round2 } from '../utils/diagnosticReader';

function normalizeRoofType(roofType: unknown): string {
  return String(roofType ?? 'metal').trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

function normalizeGridConnection(gridConnection: unknown): string {
  return String(gridConnection ?? 'on_grid').trim().toLowerCase().replace(/-/g, '_');
}

export function resolveRoofMultiplier(roofType: unknown, overrides?: PricingModifierOverrides): number {
  const n = normalizeRoofType(roofType);
  if (n === 'tile') return modifierFactor('solar.roofType.tile', overrides, 15);
  if (n === 'flat') return modifierFactor('solar.roofType.flat', overrides, 25);
  if (n === 'ground') return modifierFactor('solar.roofType.ground', overrides, 35);
  return 1.0;
}

export type DerivedMeasurements = Record<string, number>;

export function derivePanouriSolareMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
  overrides?: PricingModifierOverrides,
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

  const roofMultiplier = resolveRoofMultiplier(diagnostic.roofType, overrides);
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