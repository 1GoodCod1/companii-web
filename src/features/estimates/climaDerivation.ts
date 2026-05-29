/**
 * Frontend mirror of backend deriveClimaMeasurements (climate-measurements.util.ts).
 * Diagnostic-only (no plan2d). Closes the preview gap for acUnitsLabor, route
 * standard/extra split, drain labor and freon recharge.
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
export const CLIMATE_ROUTE_INCLUDED_M = 5;

export function resolveClimateHeightMultiplier(heightWork: unknown): number {
  return readBoolean({ heightWork }, 'heightWork') ? 1.25 : 1.0;
}

export type DerivedMeasurements = Record<string, number>;

export function deriveClimaMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
): DerivedMeasurements {
  const m: DerivedMeasurements = {};
  if (!diagnostic) return m;

  const manualIndoor = readNumber(diagnostic, 'indoorUnitCount');
  const manualOutdoor = readNumber(diagnostic, 'outdoorUnitCount');
  const manualAcUnits = readNumber(diagnostic, 'acUnits');

  const indoorUnitCount = manualIndoor ?? undefined;
  const acUnits = Math.max(1, Math.min(20, indoorUnitCount ?? manualAcUnits ?? 1));

  m.acUnits = acUnits;
  m.indoorUnitCount = indoorUnitCount ?? acUnits;
  m.outdoorUnitCount = manualOutdoor ?? acUnits;

  m.routeLengthM = readNumber(diagnostic, 'routeLengthM') ?? Math.max(2, acUnits * 5);
  m.drainLengthM = readNumber(diagnostic, 'drainLengthM') ?? m.routeLengthM;

  m.coreDrillingQty = readNumber(diagnostic, 'wallCoreDrillingCount') ?? acUnits;
  m.routeStandardLengthM = Math.min(m.routeLengthM, CLIMATE_ROUTE_INCLUDED_M);
  m.routeExtraLengthM = Math.max(0, m.routeLengthM - CLIMATE_ROUTE_INCLUDED_M);
  m.freonRechargeQty = m.routeExtraLengthM > 0 ? Math.ceil(m.routeExtraLengthM / 5) : 0;

  const heightWork = readBoolean(diagnostic, 'heightWork');
  const requiresPump = readBoolean(diagnostic, 'requiresPump');
  const equipmentIncluded = readBoolean(diagnostic, 'equipmentIncluded');
  const maintenancePackage = readBoolean(diagnostic, 'maintenancePackage');

  m.heightMultiplier = resolveClimateHeightMultiplier(heightWork);
  m.pumpCount = requiresPump ? acUnits : 0;
  m.maintenanceCount = maintenancePackage ? acUnits : 0;
  m.indoorEquipmentCount = equipmentIncluded ? m.indoorUnitCount : 0;
  m.outdoorEquipmentCount = equipmentIncluded ? m.outdoorUnitCount : 0;
  m.heightSurchargeUnits = heightWork ? acUnits : 0;

  m.acUnitsLabor = round2(acUnits * m.heightMultiplier);
  m.routeStandardLengthMLabor = round2(m.routeStandardLengthM * m.heightMultiplier);
  m.routeExtraLengthMLabor = round2(m.routeExtraLengthM * m.heightMultiplier);
  m.drainLengthMLabor = round2(m.drainLengthM * m.heightMultiplier);
  m.inspectionHours = Math.max(1, Math.ceil(acUnits / 2));

  return m;
}
