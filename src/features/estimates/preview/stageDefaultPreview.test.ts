import { describe, expect, it } from 'vitest';
import type { EstimateBlueprintConfig } from '@/types/estimate-blueprint-config.types';
import { appendStageDefaultPreviewLines, isStageDefaultLaborChargeable } from './stageDefaultPreview';

const config: EstimateBlueprintConfig = {
  wizardSteps: ['object', 'plan', 'diagnostic', 'stages', 'review'],
  siteTypes: [],
  planPointTypes: [],
  defaultLaborRate: 185,
  workModules: [
    { key: 'route', label: 'Traseu', defaultEnabled: true, stageCodes: ['inspectie'], fieldKeys: [] },
    { key: 'maintenance', label: 'Service', defaultEnabled: false, stageCodes: ['mentenanta'], fieldKeys: [], requiresQtyKeys: ['maintenanceCount'] },
  ],
  customFields: [],
  diagnosticQuestions: [],
  defaultStages: [
    { code: 'inspectie', name: 'Inspecție', kind: 'LABOR', defaultLaborHours: 1, moduleKey: 'route' },
    { code: 'mentenanta', name: 'Mentenanță', kind: 'LABOR', defaultLaborHours: 1, optional: true, moduleKey: 'maintenance' },
  ],
  pricingRules: [],
  defaultMarginPct: 20,
};

describe('stageDefaultPreview', () => {
  it('blocks stage-default when module is disabled', () => {
    expect(
      isStageDefaultLaborChargeable(
        config.defaultStages[0],
        [],
        config,
        {},
      ),
    ).toBe(false);
  });

  it('adds stage-default lines only for stages without rule lines', () => {
    const lines = appendStageDefaultPreviewLines(
      config,
      [],
      ['route'],
      {},
      1,
    );

    expect(lines).toHaveLength(1);
    expect(lines[0]?.stageCode).toBe('inspectie');
    expect(lines[0]?.lineTotal).toBe(185);
  });
});
