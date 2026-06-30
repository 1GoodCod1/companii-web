import { describe, expect, it } from 'vitest';
import type { EstimateBlueprintConfig } from '@/entities/estimate/model/estimate-blueprint-config.types';
import { deriveCleaningMeasurements } from './cleaningDerivation';
import { readCleaningEnabledWorkModules } from '../diagnostic/cleaningWorkModules';
import { computePreviewLines } from '../preview/previewEngine';
import {
  appendStageDefaultPreviewLines,
  isStageDefaultLaborChargeable,
} from '../preview/stageDefaultPreview';
import {
  CLEANING_PARITY_VECTORS,
  assertNoNaNInMeasurements,
} from './parity/cleaning-parity.vectors';

const cleaningPreviewConfig: EstimateBlueprintConfig = {
  wizardSteps: ['object', 'diagnostic', 'stages', 'review'],
  siteTypes: [],
  planPointTypes: [],
  workModules: [
    {
      key: 'standard_cleaning',
      label: 'Standard',
      defaultEnabled: true,
      stageCodes: ['inspectie', 'uscata', 'umeda', 'predare'],
      fieldKeys: ['cleaningType', 'cleanArea'],
    },
    {
      key: 'windows',
      label: 'Geamuri',
      defaultEnabled: false,
      stageCodes: ['geamuri'],
      fieldKeys: ['windowCount'],
      requiresQtyKeys: ['windowCleanCount'],
    },
    {
      key: 'bathrooms',
      label: 'Băi',
      defaultEnabled: false,
      stageCodes: ['bucatarie_bai'],
      fieldKeys: ['bathroomCount'],
      requiresQtyKeys: ['bathroomCleanUnits'],
    },
    {
      key: 'trash_removal',
      label: 'Gunoi',
      defaultEnabled: false,
      stageCodes: ['special'],
      fieldKeys: ['trashRemoval'],
      requiresQtyKeys: ['trashRemovalUnits'],
    },
  ],
  customFields: [],
  diagnosticQuestions: [],
  defaultStages: [
    {
      code: 'bucatarie_bai',
      name: 'Bucătărie & băi',
      kind: 'MIXED',
      defaultLaborHours: 3,
      optional: true,
      moduleKey: 'bathrooms',
    },
    {
      code: 'geamuri',
      name: 'Geamuri',
      kind: 'LABOR',
      defaultLaborHours: 3,
      optional: true,
      moduleKey: 'windows',
    },
    {
      code: 'special',
      name: 'Special',
      kind: 'MIXED',
      defaultLaborHours: 4,
      optional: true,
      moduleKey: 'trash_removal',
    },
  ],
  pricingRules: [
    {
      stageCode: 'umeda',
      description: 'Lucrări curățenie standard',
      unit: 'm²',
      qtyKey: 'standardCleanAreaLabor',
      unitPrice: 30,
      kind: 'labor',
      moduleKey: 'standard_cleaning',
      laborUnitPriceMultiplierKey: 'totalCleaningMultiplier',
      enabledWhen: { anyQtyKeys: ['standardCleanAreaLabor'] },
    },
    {
      stageCode: 'umeda',
      description: 'Lucrări curățenie profundă',
      unit: 'm²',
      qtyKey: 'deepCleanAreaLabor',
      unitPrice: 42,
      kind: 'labor',
      moduleKey: 'standard_cleaning',
      laborUnitPriceMultiplierKey: 'totalCleaningMultiplier',
      enabledWhen: { anyQtyKeys: ['deepCleanAreaLabor'] },
    },
    {
      stageCode: 'special',
      description: 'Curățenie post-șantier',
      unit: 'm²',
      qtyKey: 'postConstructionAreaLabor',
      unitPrice: 55,
      kind: 'labor',
      moduleKey: 'standard_cleaning',
      laborUnitPriceMultiplierKey: 'totalCleaningMultiplier',
      enabledWhen: { anyQtyKeys: ['postConstructionAreaLabor'] },
    },
  ],
  defaultLaborRate: 185,
  defaultMarginPct: 20,
};

describe('cleaning derivation parity', () => {
  it('matches shared backend parity vectors', () => {
    for (const scenario of CLEANING_PARITY_VECTORS) {
      const result = deriveCleaningMeasurements(scenario.diagnostic);
      for (const [key, value] of Object.entries(scenario.expected)) {
        expect(result[key]).toBe(value);
      }
      assertNoNaNInMeasurements(result);
    }
  });

  it('does not charge phantom stage-default on default 40 m² standard clean', () => {
    const diagnostic = { cleanArea: 40, cleaningType: 'standard' };
    const measurements = deriveCleaningMeasurements(diagnostic);
    const enabled = readCleaningEnabledWorkModules(diagnostic, cleaningPreviewConfig);
    const defByCode = new Map(cleaningPreviewConfig.defaultStages.map((s) => [s.code, s]));

    for (const code of ['bucatarie_bai', 'geamuri', 'special']) {
      expect(
        isStageDefaultLaborChargeable(defByCode.get(code), enabled, cleaningPreviewConfig, measurements),
      ).toBe(false);
    }

    const ruleLines = computePreviewLines(cleaningPreviewConfig, measurements, enabled);
    const withFallback = appendStageDefaultPreviewLines(
      cleaningPreviewConfig,
      ruleLines,
      enabled,
      measurements,
    );

    expect(withFallback.some((line) => line.stageCode === 'geamuri')).toBe(false);
    expect(withFallback.some((line) => line.stageCode === 'bucatarie_bai')).toBe(false);
    expect(withFallback.some((line) => line.stageCode === 'special')).toBe(false);
  });

  it('post_construction type gets area lines without module mismatch', () => {
    const diagnostic = { cleanArea: 60, cleaningType: 'post_construction' };
    const measurements = deriveCleaningMeasurements(diagnostic);
    const enabled = readCleaningEnabledWorkModules(diagnostic, cleaningPreviewConfig);
    const lines = computePreviewLines(cleaningPreviewConfig, measurements, enabled);

    expect(lines.some((line) => line.description.includes('post-șantier'))).toBe(true);
    expect(measurements.postConstructionAreaLabor).toBe(60);
  });
});
