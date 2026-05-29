import { describe, expect, it } from 'vitest';
import { extractMeasurementsFromDiagnostic } from './previewEngine';

/**
 * Bug B parity: categories whose pricing rules reference derived `*Labor` /
 * multiplier keys must have those keys computed client-side, otherwise the live
 * preview shows 0 for every labor line. These guard against the wiring breaking
 * (all values would silently fall back to 0) and gross derivation drift.
 */
describe('extractMeasurementsFromDiagnostic — derived-key parity', () => {
  it('fatade: derives insulation volume, mesh, dowels and height-adjusted labor', () => {
    const m = extractMeasurementsFromDiagnostic(
      { facadeArea: 100, insulationThicknessCm: 10, buildingHeightM: 6 },
      'fatade',
    );
    expect(m.insulationVolumeM3).toBe(10);
    expect(m.meshArea).toBe(110);
    expect(m.dowelQty).toBe(600);
    expect(m.facadeAreaLabor).toBe(100); // height 6 → ×1.0
    expect(m.paintingArea).toBe(100);
  });

  it('fatade: applies the >9m height multiplier to labor', () => {
    const m = extractMeasurementsFromDiagnostic(
      { facadeArea: 100, buildingHeightM: 12 },
      'fatade',
    );
    expect(m.heightMultiplier).toBe(1.2);
    expect(m.facadeAreaLabor).toBe(120);
  });

  it('acoperis: roof area expands with slope; rectangle labor = area', () => {
    const m = extractMeasurementsFromDiagnostic(
      { baseArea: 100, roofSlope: 30, roofShape: 'rectangle' },
      'acoperis',
    );
    expect(m.roofArea).toBeGreaterThan(100);
    expect(m.roofAreaLabor).toBe(m.roofArea); // rectangle ×1.0
    expect(m.timberVolumeM3).toBeGreaterThan(0);
  });

  it('clima: derives height-adjusted unit labor and route split', () => {
    const m = extractMeasurementsFromDiagnostic({ acUnits: 2, heightWork: true }, 'clima');
    expect(m.acUnitsLabor).toBe(2.5); // 2 × 1.25
    expect(m.routeStandardLengthM).toBe(5);
    expect(m.routeExtraLengthM).toBe(5); // 10 − 5 included
    expect(m.freonRechargeQty).toBe(1);
  });

  it('panouri-solare: derives roof-adjusted structure/panel labor', () => {
    const m = extractMeasurementsFromDiagnostic(
      { panelCount: 10, roofType: 'flat' },
      'panouri-solare',
    );
    expect(m.structureLaborQty).toBe(12.5); // 10 × 1.25
    expect(m.panelLaborQty).toBe(12.5);
    expect(m.cableLengthM).toBe(25);
    expect(m.optimizerCount).toBe(10); // one per panel
  });

  it('panouri-solare: computes system power from panel count × Wp', () => {
    const m = extractMeasurementsFromDiagnostic(
      { panelCount: 8, panelWp: 450, evChargerCount: 1 },
      'panouri-solare',
    );
    expect(m.systemPowerKw).toBe(3.6); // 8 × 450 / 1000
    expect(m.evChargerCount).toBe(1);
  });

  it('okna-dveri: derives install-labor counts from opening counts', () => {
    const m = extractMeasurementsFromDiagnostic(
      { windowCount: 4, doorCount: 2, installationType: 'warm_installation' },
      'okna-dveri',
    );
    expect(m.installationMultiplier).toBe(1.35);
    expect(m.windowCountLabor).toBe(5.4); // 4 × 1.35
    expect(m.warmInstallationUnits).toBe(6);
  });

  it('pavaj: derives excavation/gravel volumes and pattern-adjusted labor', () => {
    const m = extractMeasurementsFromDiagnostic(
      { pavementArea: 50, patternComplexity: 'decorative', vehicleLoad: 'car' },
      'pavaj',
    );
    expect(m.excavationVolumeM3).toBeGreaterThan(0);
    expect(m.pavementLaborQty).toBe(Math.round(50 * 1.3 * 1.15 * 100) / 100);
  });

  it('pavaj: reads optional add-on quantities (concrete base, manholes, steps)', () => {
    const m = extractMeasurementsFromDiagnostic(
      { pavementArea: 60, concreteBaseArea: 60, manholeCount: 2, stepsLengthM: 4 },
      'pavaj',
    );
    expect(m.concreteBaseArea).toBe(60);
    expect(m.manholeCount).toBe(2);
    expect(m.stepsLengthM).toBe(4);
  });

  it('cleaning: derives combined multiplier and clean-area labor', () => {
    const m = extractMeasurementsFromDiagnostic(
      { cleanArea: 100, cleaningType: 'post_construction', afterRepairDustLevel: 'high' },
      'cleaning',
    );
    expect(m.totalCleaningMultiplier).toBe(Math.round(1.65 * 1.35 * 100) / 100);
    expect(m.postConstructionAreaLabor).toBeGreaterThan(0);
    expect(m.standardCleanAreaLabor).toBe(0);
  });
});
