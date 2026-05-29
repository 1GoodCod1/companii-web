import { type PricingModifierOverrides, modifierFactor } from '../utils/pricingModifierOverrides';
import { readNumber, readBoolean, round2 } from '../utils/diagnosticReader';

export const CLIMATE_ROUTE_INCLUDED_M = 5;

export function resolveClimateHeightMultiplier(heightWork: unknown, overrides?: PricingModifierOverrides): number {
  return readBoolean({ heightWork }, 'heightWork') ? modifierFactor('clima.heightWork', overrides, 25) : 1.0;
}

export type DerivedMeasurements = Record<string, number>;

export function deriveClimaMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
  overrides?: PricingModifierOverrides,
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

  m.heightMultiplier = resolveClimateHeightMultiplier(heightWork, overrides);
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