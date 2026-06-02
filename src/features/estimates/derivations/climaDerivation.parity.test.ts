import { describe, expect, it } from 'vitest';
import type { Plan2dData } from '@/entities/estimate/model/estimate-plan2d.types';
import type { EstimateBlueprintConfig } from '@/entities/estimate/model/estimate-blueprint-config.types';
import { deriveClimaMeasurements } from './climaDerivation';
import { computePreviewLines } from '../preview/previewEngine';

const climaPreviewConfig: EstimateBlueprintConfig = {
  wizardSteps: ['object', 'plan', 'diagnostic', 'stages', 'review'],
  siteTypes: [],
  planPointTypes: [],
  workModules: [
    { key: 'route', label: 'Traseu', defaultEnabled: true, stageCodes: ['traseu'], fieldKeys: [] },
    { key: 'indoor_outdoor_units', label: 'Unități', defaultEnabled: true, stageCodes: ['montaj'], fieldKeys: [] },
    { key: 'height_work', label: 'Înălțime', defaultEnabled: false, stageCodes: ['montaj'], fieldKeys: [] },
  ],
  customFields: [],
  diagnosticQuestions: [],
  defaultStages: [],
  pricingRules: [
    {
      stageCode: 'montaj',
      description: 'Lucrări instalare split AC',
      unit: 'buc',
      qtyKey: 'acUnits',
      unitPrice: 1200,
      kind: 'labor',
      moduleKey: 'indoor_outdoor_units',
      laborUnitPriceMultiplierKey: 'heightMultiplier',
    },
  ],
  defaultLaborRate: 185,
  defaultMarginPct: 20,
};

describe('clima derivation parity', () => {
  const planMultiSplit: Plan2dData = {
    rooms: [],
    points: [
      { id: '1', type: 'indoor' },
      { id: '2', type: 'indoor' },
      { id: '3', type: 'outdoor' },
    ],
  };

  it('matches plan-based indoor/outdoor counts', () => {
    const m = deriveClimaMeasurements({ routeLengthM: 6 }, planMultiSplit);
    expect(m.acUnits).toBe(2);
    expect(m.outdoorUnitCount).toBe(1);
    expect(m.routeExtraLengthM).toBe(1);
  });

  it('applies height via unitPrice multiplier with integer qty', () => {
    const measurements = deriveClimaMeasurements(
      {
        acUnits: 2,
        routeLengthM: 5,
        heightWork: true,
        enabledWorkModules: ['route', 'indoor_outdoor_units', 'height_work'],
      },
      null,
    );

    const lines = computePreviewLines(
      climaPreviewConfig,
      measurements,
      ['route', 'indoor_outdoor_units', 'height_work'],
    );

    const montaj = lines.find((l) => l.description.includes('instalare split'));
    expect(montaj?.qty).toBe(2);
    expect(montaj?.unitPrice).toBe(1500);
    expect(montaj?.lineTotal).toBe(3000);
  });
});
