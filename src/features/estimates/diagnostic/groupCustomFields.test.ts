import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SECTION_KEY,
  DEFAULT_SECTION_LABEL,
  getCustomFieldKeys,
  groupVisibleCustomFields,
} from './groupCustomFields';
import { evaluateWarningRule, validateDiagnostic } from './diagnosticValidation';
import type { EstimateBlueprintConfig } from '@/entities/estimate/model/estimate-blueprint-config.types';

const config: EstimateBlueprintConfig = {
  wizardSteps: ['object', 'plan', 'diagnostic', 'stages', 'review'],
  siteTypes: [],
  planPointTypes: [],
  workModules: [
    { key: 'demolition', label: 'Demontare', defaultEnabled: true, stageCodes: [], fieldKeys: ['demolitionArea'] },
    { key: 'tile', label: 'Plăci', defaultEnabled: false, stageCodes: [], fieldKeys: ['tileArea'] },
    { key: 'paint', label: 'Vopsire', defaultEnabled: true, stageCodes: [], fieldKeys: ['paintArea', 'wallHeight'] },
  ],
  customFields: [
    { key: 'demolitionArea', label: 'Suprafață demontare', type: 'number', required: false, section: 'Pregătire' },
    { key: 'tileArea', label: 'Plăci', type: 'number', required: true, section: 'Finisaje' },
    { key: 'paintArea', label: 'Suprafață vopsire', type: 'number', required: true, section: 'Finisaje' },
    { key: 'wallHeight', label: 'Înălțime pereți', type: 'number', required: false }, // no section
    {
      key: 'insulationThicknessCm',
      label: 'Izolație (cm)',
      type: 'number',
      required: false,
      warningRules: [{ when: 'insulationThicknessCm < 5', message: 'Grosime mică, recomandăm ≥5cm' }],
    },
  ],
  diagnosticQuestions: [
    { key: 'tileArea', label: 'duplicate of customField', type: 'number' },
    { key: 'hasTerrace', label: 'Are terasă?', type: 'boolean' },
  ],
  defaultStages: [],
  pricingRules: [],
  defaultLaborRate: 100,
  defaultMarginPct: 20,
};

describe('groupVisibleCustomFields (H-02, H-04)', () => {
  it('groups by section preserving config order; default bucket last', () => {
    const sections = groupVisibleCustomFields(config, ['demolition', 'tile', 'paint']);
    expect(sections.map((s) => s.key)).toEqual([
      'Pregătire',
      'Finisaje',
      DEFAULT_SECTION_KEY,
    ]);
    expect(sections[2].label).toBe(DEFAULT_SECTION_LABEL);
  });

  it('omits fields whose module is disabled (H-04)', () => {
    const sections = groupVisibleCustomFields(config, ['demolition', 'paint']); // tile disabled
    const allKeys = sections.flatMap((s) => s.fields.map((f) => f.key));
    expect(allKeys).toContain('demolitionArea');
    expect(allKeys).toContain('paintArea');
    expect(allKeys).toContain('wallHeight');
    expect(allKeys).not.toContain('tileArea');
  });

  it('shows fields linked to multiple modules when any linked module is enabled', () => {
    const sharedConfig: EstimateBlueprintConfig = {
      ...config,
      workModules: [
        { key: 'devices', label: 'Aparataj', defaultEnabled: true, stageCodes: [], fieldKeys: ['socketCount'] },
        { key: 'testing', label: 'Testare', defaultEnabled: true, stageCodes: [], fieldKeys: ['socketCount'] },
      ],
      customFields: [
        { key: 'socketCount', label: 'Număr prize', type: 'number', required: false, section: 'Aparataj' },
      ],
    };

    const withTestingOnly = groupVisibleCustomFields(sharedConfig, ['testing']);
    expect(withTestingOnly.flatMap((s) => s.fields.map((f) => f.key))).toContain('socketCount');

    const withNeither = groupVisibleCustomFields(sharedConfig, ['demolition']);
    expect(withNeither.flatMap((s) => s.fields.map((f) => f.key))).not.toContain('socketCount');
  });

  it('keeps fields without a module (insulationThicknessCm has no module) always visible', () => {
    const sections = groupVisibleCustomFields(config, []); // nothing enabled
    const allKeys = sections.flatMap((s) => s.fields.map((f) => f.key));
    expect(allKeys).toContain('insulationThicknessCm');
    expect(allKeys).not.toContain('demolitionArea');
  });

  it('empty when no customFields', () => {
    const empty: EstimateBlueprintConfig = { ...config, customFields: [] };
    expect(groupVisibleCustomFields(empty, [])).toEqual([]);
  });
});

describe('getCustomFieldKeys (H-03)', () => {
  it('returns Set of all customField keys for dedup with diagnosticQuestions', () => {
    const keys = getCustomFieldKeys(config);
    expect(keys.has('tileArea')).toBe(true);
    expect(keys.has('paintArea')).toBe(true);
    expect(keys.has('hasTerrace')).toBe(false); 
  });
});

describe('evaluateWarningRule (H-05)', () => {
  it('numeric < comparison', () => {
    expect(evaluateWarningRule('insulationThicknessCm < 5', { insulationThicknessCm: 3 })).toBe(true);
    expect(evaluateWarningRule('insulationThicknessCm < 5', { insulationThicknessCm: 5 })).toBe(false);
  });
  it('string === comparison', () => {
    expect(evaluateWarningRule("roofShape === 'complex'", { roofShape: 'complex' })).toBe(true);
    expect(evaluateWarningRule("roofShape === 'complex'", { roofShape: 'rectangle' })).toBe(false);
  });
  it('returns false for missing or non-numeric left operand', () => {
    expect(evaluateWarningRule('insulationThicknessCm < 5', {})).toBe(false);
  });
});

describe('validateDiagnostic with warnings (H-05)', () => {
  it('emits warning when warningRule matches', () => {
    const result = validateDiagnostic(config, {
      enabledWorkModules: ['demolition', 'paint'],
      paintArea: 50,
      insulationThicknessCm: 3,
    });
    expect(result.ok).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'insulationThicknessCm', message: expect.stringContaining('5cm') }),
      ]),
    );
  });

  it('no warning when value passes the rule', () => {
    const result = validateDiagnostic(config, {
      enabledWorkModules: ['demolition', 'paint'],
      paintArea: 50,
      insulationThicknessCm: 10,
    });
    expect(result.warnings).toEqual([]);
  });
});
