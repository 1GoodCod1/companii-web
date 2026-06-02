import type { Plan2dData } from '@/entities/estimate/model/estimate-plan2d.types';
import { type PricingModifierOverrides, modifierFactor } from '../utils/pricingModifierOverrides';
import { readNumber, readBoolean, readAutoNumber } from '../utils/diagnosticReader';

export const CLIMATE_ROUTE_INCLUDED_M = 5;

export function resolveClimateHeightMultiplier(heightWork: unknown, overrides?: PricingModifierOverrides): number {
  return readBoolean({ heightWork }, 'heightWork') ? modifierFactor('clima.heightWork', overrides, 25) : 1.0;
}

function isClimateHeightLaborActive(diagnostic: Record<string, unknown> | null | undefined): boolean {
  if (!readBoolean(diagnostic, 'heightWork')) return false;
  const raw = diagnostic?.enabledWorkModules;
  if (!Array.isArray(raw)) return false;
  return raw.some((key) => key === 'height_work');
}

export type DerivedMeasurements = Record<string, number>;

export function deriveClimaMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
  plan2d?: Plan2dData | null,
  overrides?: PricingModifierOverrides,
): DerivedMeasurements {
  const m: DerivedMeasurements = {};
  if (!diagnostic) return m;

  const pointsCount = (type: string) => plan2d?.points?.filter((point) => point.type === type).length ?? 0;
  const planIndoorCount = pointsCount('indoor');
  const planOutdoorCount = pointsCount('outdoor');
  const planRouteCount = pointsCount('route');

  const manualIndoor = readAutoNumber(diagnostic, 'indoorUnitCount');
  const manualOutdoor = readAutoNumber(diagnostic, 'outdoorUnitCount');
  const manualAcUnits = readNumber(diagnostic, 'acUnits');

  const indoorUnitCount = manualIndoor ?? (planIndoorCount > 0 ? planIndoorCount : undefined);
  const acUnits = Math.max(
    1,
    Math.min(20, indoorUnitCount ?? manualAcUnits ?? (planIndoorCount > 0 ? planIndoorCount : 1)),
  );

  m.acUnits = acUnits;
  m.indoorUnitCount = indoorUnitCount ?? acUnits;
  m.outdoorUnitCount =
    manualOutdoor ??
    (planOutdoorCount > 0 ? planOutdoorCount : acUnits > 1 ? 1 : acUnits);

  m.routeLengthM =
    readNumber(diagnostic, 'routeLengthM') ??
    Math.max(2, planRouteCount > 0 ? planRouteCount * 5 : acUnits * 5);
  m.drainLengthM = readAutoNumber(diagnostic, 'drainLengthM') ?? m.routeLengthM;

  m.coreDrillingQty = readAutoNumber(diagnostic, 'wallCoreDrillingCount') ?? acUnits;
  m.routeStandardLengthM = Math.min(m.routeLengthM, CLIMATE_ROUTE_INCLUDED_M);
  m.routeExtraLengthM = Math.max(0, m.routeLengthM - CLIMATE_ROUTE_INCLUDED_M);
  m.freonRechargeQty = m.routeExtraLengthM > 0 ? Math.ceil(m.routeExtraLengthM / 5) : 0;

  const requiresPump = readBoolean(diagnostic, 'requiresPump');
  const equipmentIncluded = readBoolean(diagnostic, 'equipmentIncluded');
  const maintenancePackage = readBoolean(diagnostic, 'maintenancePackage');

  m.heightMultiplier = isClimateHeightLaborActive(diagnostic)
    ? resolveClimateHeightMultiplier(true, overrides)
    : 1.0;
  m.pumpCount = requiresPump ? acUnits : 0;
  m.maintenanceCount = maintenancePackage ? acUnits : 0;
  m.indoorEquipmentCount = equipmentIncluded ? m.indoorUnitCount : 0;
  m.outdoorEquipmentCount = equipmentIncluded ? m.outdoorUnitCount : 0;
  m.inspectionHours = Math.max(1, Math.ceil(acUnits / 2));

  return m;
}
