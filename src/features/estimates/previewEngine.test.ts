import { describe, expect, it } from 'vitest';
import {
  computePreviewLines,
  computePreviewTotals,
  extractMeasurementsFromDiagnostic,
} from './previewEngine';
import type { EstimateBlueprintConfig } from '@/types/estimate-blueprint-config.types';

const config: EstimateBlueprintConfig = {
  wizardSteps: ['object', 'plan', 'diagnostic', 'stages', 'review'],
  siteTypes: [],
  planPointTypes: [],
  workModules: [
    { key: 'paint', label: 'Vopsire', defaultEnabled: true, stageCodes: ['vopsire'], fieldKeys: ['paintArea'] },
    { key: 'tile', label: 'Plăci', defaultEnabled: false, stageCodes: ['gresie_faianta'], fieldKeys: ['tileArea'] },
  ],
  customFields: [],
  diagnosticQuestions: [],
  defaultStages: [],
  pricingRules: [
    {
      stageCode: 'vopsire',
      description: 'Vopsire pereți',
      unit: 'm²',
      qtyKey: 'paintArea',
      unitPrice: 80,
      kind: 'labor',
      moduleKey: 'paint',
    },
    {
      stageCode: 'gresie_faianta',
      description: 'Plăci',
      unit: 'm²',
      qtyKey: 'tileArea',
      unitPrice: 250,
      wastePct: 10,
      kind: 'material',
      moduleKey: 'tile',
    },
  ],
  defaultLaborRate: 100,
  defaultMarginPct: 20,
};

describe('computePreviewLines (L-01)', () => {
  it('filters out rules of disabled modules', () => {
    const lines = computePreviewLines(config, { paintArea: 50, tileArea: 20 }, ['paint']);
    expect(lines).toHaveLength(1);
    expect(lines[0].stageCode).toBe('vopsire');
    expect(lines[0].lineTotal).toBe(4000); // 50 * 80
    expect(lines[0].kind).toBe('labor');
  });

  it('includes enabled module with positive qty', () => {
    const lines = computePreviewLines(config, { paintArea: 50, tileArea: 20 }, ['paint', 'tile']);
    expect(lines).toHaveLength(2);
    const tile = lines.find((l) => l.stageCode === 'gresie_faianta')!;
    // wastePct 10% → qty 22, lineTotal 22 * 250 = 5500
    expect(tile.qty).toBe(22);
    expect(tile.lineTotal).toBe(5500);
  });

  it('skips rule when qty is 0 or missing', () => {
    expect(computePreviewLines(config, { paintArea: 0 }, ['paint'])).toEqual([]);
    expect(computePreviewLines(config, {}, ['paint'])).toEqual([]);
  });

  it('returns empty array when config has no pricing rules', () => {
    const empty: EstimateBlueprintConfig = { ...config, pricingRules: [] };
    expect(computePreviewLines(empty, { paintArea: 50 }, ['paint'])).toEqual([]);
  });
});

describe('computePreviewTotals (L-01)', () => {
  it('sums labor + material then applies margin', () => {
    const lines = computePreviewLines(config, { paintArea: 50, tileArea: 20 }, ['paint', 'tile']);
    const totals = computePreviewTotals(lines, 20);
    expect(totals.laborTotal).toBe(4000);
    expect(totals.materialTotal).toBe(5500);
    expect(totals.subtotal).toBe(9500);
    expect(totals.marginAmount).toBe(1900); // 20% of 9500
    expect(totals.grandTotal).toBe(11400);
    expect(totals.hasContent).toBe(true);
    expect(totals.lineCount).toBe(2);
  });

  it('respects customLaborTotal override (E-04/J-06)', () => {
    const lines = computePreviewLines(config, { paintArea: 50 }, ['paint']);
    const totals = computePreviewTotals(lines, 0, { customLaborTotal: 9000 });
    expect(totals.laborTotal).toBe(9000); // override, not 4000
    expect(totals.grandTotal).toBe(9000);
  });

  it('returns hasContent=false on empty input', () => {
    const totals = computePreviewTotals([], 20);
    expect(totals.hasContent).toBe(false);
    expect(totals.grandTotal).toBe(0);
    expect(totals.lineCount).toBe(0);
  });

  it('handles non-finite margin gracefully', () => {
    const lines = computePreviewLines(config, { paintArea: 50 }, ['paint']);
    const totals = computePreviewTotals(lines, NaN);
    expect(totals.marginAmount).toBe(0);
    expect(totals.grandTotal).toBe(totals.subtotal);
  });

  it('applies risk reserve before margin (compound)', () => {
    const lines = computePreviewLines(config, { paintArea: 50, tileArea: 20 }, ['paint', 'tile'])
    const totals = computePreviewTotals(lines, 20, undefined, 10);
    expect(totals.subtotal).toBe(9500);
    expect(totals.riskReserveAmount).toBe(950);
    expect(totals.marginAmount).toBe(2090);
    expect(totals.grandTotal).toBe(12540);
  });

  it('riskReservePct=0 keeps grandTotal identical to no-reserve case', () => {
    const lines = computePreviewLines(config, { paintArea: 50 }, ['paint']);
    const withZeroReserve = computePreviewTotals(lines, 15, undefined, 0);
    const withoutArg = computePreviewTotals(lines, 15);
    expect(withZeroReserve.grandTotal).toBe(withoutArg.grandTotal);
    expect(withZeroReserve.riskReserveAmount).toBe(0);
  });
});

describe('extractMeasurementsFromDiagnostic (L-01)', () => {
  it('passes numeric values through', () => {
    expect(extractMeasurementsFromDiagnostic({ paintArea: 50, wallHeight: 2.7 })).toEqual({
      paintArea: 50,
      wallHeight: 2.7,
    });
  });

  it('coerces booleans to 0/1 for boolean-keyed rules', () => {
    expect(extractMeasurementsFromDiagnostic({ waterHeater: true, drainReplacement: false })).toEqual({
      waterHeater: 1,
      drainReplacement: 0,
    });
  });

  it('excludes enabledWorkModules and non-numeric fields', () => {
    const out = extractMeasurementsFromDiagnostic({
      enabledWorkModules: ['paint'],
      paintArea: 50,
      finishLevel: 'standard',
    });
    expect(out).toEqual({ paintArea: 50 });
    expect(out.enabledWorkModules).toBeUndefined();
    expect(out.finishLevel).toBeUndefined();
  });

  it('handles null/undefined input', () => {
    expect(extractMeasurementsFromDiagnostic(null)).toEqual({});
    expect(extractMeasurementsFromDiagnostic(undefined)).toEqual({});
  });
});
