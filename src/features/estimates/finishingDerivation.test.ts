import { describe, expect, it } from 'vitest';
import { deriveFinisajMeasurements } from './finishingDerivation';
import {
  computePreviewLines,
  extractMeasurementsFromDiagnostic,
} from './previewEngine';
import type { EstimateBlueprintConfig } from '@/types/estimate-blueprint-config.types';

const round2 = (n: number) => Math.round(n * 100) / 100;

describe('finishingDerivation (frontend mirror of backend)', () => {
  it('auto-derives room-skin areas for default modules', () => {
    const m = deriveFinisajMeasurements({
      finishArea: 30,
      wallHeight: 2.7,
      enabledWorkModules: ['surface_preparation', 'putty', 'paint'],
    });
    expect(m.wallArea).toBe(75);
    expect(m.puttyArea).toBe(105);
    expect(m.preparationArea).toBe(105);
    expect(m.paintArea).toBe(105);
    expect(m.paintAreaLabor).toBe(105); // complexity 1.0
  });

  it('applies complexity multiplier to labor keys', () => {
    const m = deriveFinisajMeasurements({
      finishArea: 30,
      surfaceCondition: 'old',
      finishLevel: 'premium',
      enabledWorkModules: ['paint'],
    });
    expect(m.complexityMultiplier).toBe(1.3);
    expect(m.paintAreaLabor).toBe(round2(105 * 1.3));
  });

  it('honors company pricing-modifier overrides in the preview', () => {
    const diagnostic = {
      finishArea: 30,
      surfaceCondition: 'old',
      finishLevel: 'premium',
      enabledWorkModules: ['paint'],
    };
    const overridden = deriveFinisajMeasurements(diagnostic, {
      'finishing.surfaceCondition.old': 25,
      'finishing.finishLevel.premium': 30,
    });
    // 1.25 (old) + 0.30 (premium) = 1.55
    expect(overridden.complexityMultiplier).toBe(round2(1.25 + 0.3));
    expect(overridden.paintAreaLabor).toBe(round2(105 * 1.55));
  });
});

describe('extractMeasurementsFromDiagnostic — lucrari-finisaj parity (bug B)', () => {
  it('computes derived labor keys + auto paint area even when the raw field is 0', () => {
    // paintArea literal 0 in the diagnostic must NOT win over the auto-derived value.
    const out = extractMeasurementsFromDiagnostic(
      { finishArea: 30, paintArea: 0, enabledWorkModules: ['surface_preparation', 'putty', 'paint'] },
      'lucrari-finisaj',
    );
    expect(out.paintArea).toBe(105);
    expect(out.paintAreaLabor).toBe(105);
    expect(out.puttyAreaLabor).toBe(105);
    expect(out.preparationAreaLabor).toBe(105);
  });
});

describe('computePreviewLines includeMaterials', () => {
  const config: EstimateBlueprintConfig = {
    wizardSteps: ['object', 'diagnostic', 'stages', 'review'],
    siteTypes: [],
    planPointTypes: [],
    workModules: [
      { key: 'paint', label: 'Vopsire', defaultEnabled: true, stageCodes: ['v'], fieldKeys: ['paintArea'] },
    ],
    customFields: [],
    diagnosticQuestions: [],
    defaultStages: [],
    pricingRules: [
      { stageCode: 'v', description: 'Vopsea (material)', unit: 'm²', qtyKey: 'paintArea', unitPrice: 22, kind: 'material', moduleKey: 'paint' },
      { stageCode: 'v', description: 'Lucrări vopsire', unit: 'm²', qtyKey: 'paintAreaLabor', unitPrice: 38, kind: 'labor', moduleKey: 'paint' },
    ],
    defaultLaborRate: 185,
    defaultMarginPct: 12,
  };
  const measurements = { paintArea: 100, paintAreaLabor: 100 };

  it('drops material lines when includeMaterials=false', () => {
    const withMat = computePreviewLines(config, measurements, ['paint'], undefined, undefined, true);
    const laborOnly = computePreviewLines(config, measurements, ['paint'], undefined, undefined, false);
    expect(withMat.some((l) => l.kind === 'material')).toBe(true);
    expect(laborOnly.some((l) => l.kind === 'material')).toBe(false);
    expect(laborOnly.every((l) => l.kind === 'labor')).toBe(true);
  });
});
