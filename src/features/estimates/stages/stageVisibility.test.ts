import { describe, expect, it } from 'vitest';
import { computeStageVisibility, filterStagesForClientDisplay, getHiddenStagesCount, getVisibleStages } from './stageVisibility';
import { buildScopeSummary, hasManualLines } from './scopeSummary';
import type { EstimateBlueprintConfig } from '@/entities/estimate/model/estimate-blueprint-config.types';
import type { EstimateStageDto } from '@/entities/estimate/model/estimates';

const config: EstimateBlueprintConfig = {
  wizardSteps: ['object', 'plan', 'diagnostic', 'stages', 'review'],
  siteTypes: [],
  planPointTypes: [],
  workModules: [
    { key: 'paint', label: 'Vopsire', defaultEnabled: true, stageCodes: ['vopsire'], fieldKeys: ['paintArea'] },
    { key: 'tile', label: 'Plăci', defaultEnabled: false, stageCodes: ['gresie_faianta'], fieldKeys: ['tileArea'] },
    { key: 'cleaning', label: 'Curățenie', defaultEnabled: false, stageCodes: ['curatenie'], fieldKeys: [] },
  ],
  customFields: [],
  diagnosticQuestions: [],
  defaultStages: [
    { code: 'demontare', name: 'Demontare', kind: 'LABOR' },
    { code: 'vopsire', name: 'Vopsire', kind: 'MIXED', moduleKey: 'paint' },
    { code: 'gresie_faianta', name: 'Plăci', kind: 'MIXED', optional: true, moduleKey: 'tile' },
    { code: 'curatenie', name: 'Curățenie', kind: 'LABOR', optional: true, moduleKey: 'cleaning' },
  ],
  pricingRules: [],
  defaultLaborRate: 100,
  defaultMarginPct: 20,
};

function makeStage(overrides: Partial<EstimateStageDto> & { code: string }): EstimateStageDto {
  return {
    id: `stage-${overrides.code}`,
    name: overrides.code,
    kind: 'MIXED',
    ...overrides,
  };
}

describe('computeStageVisibility (J-01)', () => {
  it('hides optional stage when its module is disabled and has no lines', () => {
    const stages: EstimateStageDto[] = [
      makeStage({ code: 'vopsire', lines: [{ id: 'l1', description: 'Vopsire', qty: 50, unit: 'm²', source: 'rule' }] }),
      makeStage({ code: 'gresie_faianta', lines: [] }),
      makeStage({ code: 'curatenie', lines: [] }),
    ];
    const result = computeStageVisibility(stages, config, ['paint']);
    const visMap = new Map(result.map((r) => [r.stage.code, r]));

    expect(visMap.get('vopsire')!.hidden).toBe(false);
    expect(visMap.get('gresie_faianta')!.hidden).toBe(true);
    expect(visMap.get('gresie_faianta')!.hiddenReason).toBe('optional-module-off');
    expect(visMap.get('curatenie')!.hidden).toBe(true);
  });

  it('keeps optional stage visible if it has meaningful lines', () => {
    const stages: EstimateStageDto[] = [
      makeStage({
        code: 'gresie_faianta',
        lines: [{ id: 'l1', description: 'Tile', qty: 10, unit: 'm²', source: 'manual' }],
      }),
    ];
    const result = computeStageVisibility(stages, config, ['paint']);
    expect(result[0].hidden).toBe(false);
    expect(result[0].meaningfulLineCount).toBe(1);
  });

  it('ignores stage-default lines when counting meaningful lines', () => {
    const stages: EstimateStageDto[] = [
      makeStage({
        code: 'curatenie',
        lines: [{ id: 'l1', description: 'Manoperă', qty: 4, unit: 'ore', source: 'stage-default' }],
      }),
    ];
    const result = computeStageVisibility(stages, config, ['paint']);
    expect(result[0].hidden).toBe(true);
  });

  it('non-optional stages without moduleKey always show even when empty', () => {
    const stages: EstimateStageDto[] = [makeStage({ code: 'demontare', lines: [] })];
    const result = computeStageVisibility(stages, config, []);
    expect(result[0].hidden).toBe(false);
  });

  it('hides non-optional stage when its module is disabled and has no lines', () => {
    const elektrikaLikeConfig: EstimateBlueprintConfig = {
      ...config,
      workModules: [
        { key: 'devices', label: 'Aparataj', defaultEnabled: true, stageCodes: ['aparataj'], fieldKeys: [] },
        { key: 'cabling', label: 'Cablare', defaultEnabled: true, stageCodes: ['cablare'], fieldKeys: [] },
      ],
      defaultStages: [
        { code: 'cablare', name: 'Cablare', kind: 'MIXED', moduleKey: 'cabling' },
        { code: 'aparataj', name: 'Montaj aparataj', kind: 'MIXED', moduleKey: 'devices' },
      ],
    };
    const stages: EstimateStageDto[] = [
      makeStage({ code: 'cablare', lines: [] }),
      makeStage({
        code: 'aparataj',
        lines: [{ id: 'l1', description: 'Material', qty: 38, unit: 'buc', source: 'rule' }],
      }),
    ];
    const result = computeStageVisibility(stages, elektrikaLikeConfig, ['devices']);
    const visMap = new Map(result.map((r) => [r.stage.code, r]));

    expect(visMap.get('cablare')!.hidden).toBe(true);
    expect(visMap.get('aparataj')!.hidden).toBe(false);
  });

  it('getVisibleStages + getHiddenStagesCount roundtrip', () => {
    const stages: EstimateStageDto[] = [
      makeStage({ code: 'vopsire', lines: [{ id: 'l1', description: 'V', qty: 1, unit: 'm²', source: 'rule' }] }),
      makeStage({ code: 'gresie_faianta', lines: [] }),
      makeStage({ code: 'curatenie', lines: [] }),
    ];
    const visible = getVisibleStages(stages, config, ['paint']);
    const hidden = getHiddenStagesCount(stages, config, ['paint']);
    expect(visible.map((s) => s.code)).toEqual(['vopsire']);
    expect(hidden).toBe(2);
  });
});

describe('buildScopeSummary (J-05)', () => {
  it('classifies modules by enabled+lineCount', () => {
    const stages: EstimateStageDto[] = [
      makeStage({
        code: 'vopsire',
        stageTotal: 1500,
        lines: [{ id: 'l1', description: 'V', qty: 50, unit: 'm²', source: 'rule' }],
      }),
      makeStage({ code: 'gresie_faianta', stageTotal: 0, lines: [] }),
      makeStage({ code: 'curatenie', stageTotal: 0, lines: [] }),
    ];
    const summary = buildScopeSummary(config, ['paint', 'cleaning'], stages);

    expect(summary.included.map((m) => m.key)).toEqual(['paint']);
    expect(summary.included[0].lineCount).toBe(1);
    expect(summary.included[0].amount).toBe(1500);
    expect(summary.includedAmount).toBe(1500);
    expect(summary.enabledWithoutLines.map((m) => m.key)).toEqual(['cleaning']);
    expect(summary.available.map((m) => m.key)).toEqual(['tile']);
  });

  it('empty result for blueprint without workModules', () => {
    const emptyConfig: EstimateBlueprintConfig = { ...config, workModules: [] };
    const summary = buildScopeSummary(emptyConfig, [], []);
    expect(summary.included).toEqual([]);
    expect(summary.available).toEqual([]);
    expect(summary.enabledWithoutLines).toEqual([]);
  });
});

describe('hasManualLines (J-03)', () => {
  it('true when any stage has at least one manual line', () => {
    const stages: EstimateStageDto[] = [
      makeStage({ code: 'a', lines: [{ id: 'l1', description: 'auto', qty: 1, unit: 'buc', source: 'rule' }] }),
      makeStage({ code: 'b', lines: [{ id: 'l2', description: 'mine', qty: 1, unit: 'buc', source: 'manual' }] }),
    ];
    expect(hasManualLines(stages)).toBe(true);
  });

  it('false when only rule/stage-default lines exist', () => {
    const stages: EstimateStageDto[] = [
      makeStage({
        code: 'a',
        lines: [
          { id: 'l1', description: 'auto', qty: 1, unit: 'buc', source: 'rule' },
          { id: 'l2', description: 'def', qty: 1, unit: 'ore', source: 'stage-default' },
        ],
      }),
    ];
    expect(hasManualLines(stages)).toBe(false);
  });
});

describe('filterStagesForClientDisplay', () => {
  it('drops empty stages without lines (client portal / PDF parity)', () => {
    const stages = [
      makeStage({ code: 'proiect', name: 'Proiect & traseu', lines: [], stageTotal: 0 }),
      makeStage({
        code: 'aparataj',
        name: 'Montaj aparataj',
        stageTotal: 7185,
        lines: [{ id: 'l1', description: 'Lucrări', qty: 6, unit: 'ore', source: 'manual' }],
      }),
    ];
    const filtered = filterStagesForClientDisplay(stages);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].code).toBe('aparataj');
  });
});
