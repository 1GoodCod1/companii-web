import { describe, expect, it } from 'vitest';
import type { EstimateBlueprintConfig } from '@/entities/estimate/model/estimate-blueprint-config.types';
import { deriveConstructiiMeasurements } from './constructiiDerivation';
import { computePreviewLines } from '../preview/previewEngine';
import {
  appendStageDefaultPreviewLines,
  isStageDefaultLaborChargeable,
} from '../preview/stageDefaultPreview';
import {
  CONSTRUCTII_PARITY_VECTORS,
  assertNoNaNInMeasurements,
} from '../../../../../companii-api/src/modules/estimates/pricing/category/constructii/constructii-parity.vectors';

const constructiiPreviewConfig: EstimateBlueprintConfig = {
  wizardSteps: ['object', 'diagnostic', 'stages', 'review'],
  siteTypes: [],
  planPointTypes: [],
  workModules: [
    {
      key: 'slab',
      label: 'Plăci beton',
      defaultEnabled: true,
      stageCodes: ['placa'],
      fieldKeys: [],
      requiresQtyKeys: ['slabAreaTotal'],
    },
    { key: 'stairs', label: 'Scări', defaultEnabled: true, stageCodes: ['scari'], fieldKeys: [] },
  ],
  customFields: [],
  diagnosticQuestions: [],
  defaultStages: [
    {
      code: 'placa',
      name: 'Plăci beton armat',
      kind: 'MIXED',
      defaultLaborHours: 24,
      moduleKey: 'slab',
    },
  ],
  pricingRules: [
    {
      stageCode: 'placa',
      description: 'Beton placă (C20/25 — preț ajustat tip)',
      unit: 'm²',
      qtyKey: 'slabAreaTotal',
      unitPrice: 250,
      kind: 'material',
      moduleKey: 'slab',
      materialUnitPriceMultiplierKey: 'slabTypeMultiplier',
      enabledWhen: { anyQtyKeys: ['slabAreaTotal'] },
    },
    {
      stageCode: 'placa',
      description: 'Manoperă cofrare & turnare placă (preț ajustat tip)',
      unit: 'm²',
      qtyKey: 'slabAreaTotal',
      unitPrice: 170,
      kind: 'labor',
      moduleKey: 'slab',
      laborUnitPriceMultiplierKey: 'slabTypeMultiplier',
      enabledWhen: { anyQtyKeys: ['slabAreaTotal'] },
    },
    {
      stageCode: 'scari',
      description: 'Construcție scară interioară',
      unit: 'buc',
      qtyKey: 'stairFlightCount',
      unitPrice: 6500,
      kind: 'labor',
      moduleKey: 'stairs',
      enabledWhen: { anyQtyKeys: ['stairFlightCount'] },
    },
  ],
  defaultLaborRate: 185,
  defaultMarginPct: 20,
};

describe('constructii derivation parity', () => {
  it('matches shared parity vectors from API module', () => {
    for (const scenario of CONSTRUCTII_PARITY_VECTORS) {
      const result = deriveConstructiiMeasurements(scenario.diagnostic);
      for (const [key, value] of Object.entries(scenario.expected)) {
        expect(result[key]).toBe(value);
      }
      assertNoNaNInMeasurements(result);
    }
  });

  it('preview slab lines use real area qty with multiplier in unitPrice', () => {
    const measurements = deriveConstructiiMeasurements({ builtArea: 50, storyCount: 1 });
    const lines = computePreviewLines(constructiiPreviewConfig, measurements, ['slab']);

    const material = lines.find((line) => line.description.includes('Beton placă'));
    const labor = lines.find((line) => line.description.includes('Manoperă cofrare'));
    expect(material?.qty).toBe(50);
    expect(labor?.qty).toBe(50);
    expect((material?.lineTotal ?? 0) + (labor?.lineTotal ?? 0)).toBe(21000);
  });

  it('does not charge phantom placa stage-default when rule lines exist', () => {
    const measurements = deriveConstructiiMeasurements({ builtArea: 50, storyCount: 1 });
    const ruleLines = computePreviewLines(constructiiPreviewConfig, measurements, ['slab']);

    expect(
      isStageDefaultLaborChargeable(
        constructiiPreviewConfig.defaultStages[0],
        ['slab'],
        constructiiPreviewConfig,
        measurements,
      ),
    ).toBe(true);

    const withFallback = appendStageDefaultPreviewLines(
      constructiiPreviewConfig,
      ruleLines,
      ['slab'],
      measurements,
      1,
    );
    expect(withFallback.some((line) => line.source === 'stage-default')).toBe(false);
  });

  it('does not charge placa stage-default when slabAreaTotal is zero', () => {
    expect(
      isStageDefaultLaborChargeable(
        constructiiPreviewConfig.defaultStages[0],
        ['slab'],
        constructiiPreviewConfig,
        { slabAreaTotal: 0 },
      ),
    ).toBe(false);
  });

  it('auto-includes stairs for multi-story via stairFlightCount', () => {
    const twoStory = deriveConstructiiMeasurements({ builtArea: 80, storyCount: 2 });
    expect(twoStory.stairFlightCount).toBe(1);

    const lines = computePreviewLines(constructiiPreviewConfig, twoStory, ['stairs']);
    const stairLine = lines.find((line) => line.description.includes('scară'));
    expect(stairLine?.qty).toBe(1);
    expect(stairLine?.lineTotal).toBe(6500);
  });
});
