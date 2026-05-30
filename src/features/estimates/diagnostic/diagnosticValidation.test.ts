import { describe, expect, it } from 'vitest';
import { parseNumberInputValue, validateDiagnostic } from './diagnosticValidation';
import {
  isCustomFieldActive,
  isCustomFieldRequired,
  readEnabledWorkModules,
  toggleWorkModule,
} from './workModules';
import { mergeCustomPricing, readCustomPricing } from '../utils/customPricing';
import type { EstimateBlueprintConfig } from '@/types/estimate-blueprint-config.types';

const config: EstimateBlueprintConfig = {
  wizardSteps: ['object', 'plan', 'diagnostic', 'stages', 'review'],
  siteTypes: [{ value: 'apartment', label: 'Apartament' }],
  planPointTypes: [],
  workModules: [
    { key: 'tile', label: 'Plăci', defaultEnabled: false, stageCodes: [], fieldKeys: ['tileArea'] },
    { key: 'paint', label: 'Vopsire', defaultEnabled: true, stageCodes: [], fieldKeys: ['paintArea'] },
  ],
  customFields: [
    {
      key: 'tileArea',
      label: 'Suprafață plăci',
      type: 'number',
      required: true,
      unit: 'm²',
      validation: { min: 0, max: 1000 },
    },
    {
      key: 'paintArea',
      label: 'Suprafață vopsire',
      type: 'number',
      required: true,
      unit: 'm²',
      validation: { min: 0, max: 1000 },
    },
    {
      key: 'finishLevel',
      label: 'Nivel finisaj',
      type: 'select',
      required: false,
      options: ['economic', 'standard', 'premium'],
    },
  ],
  diagnosticQuestions: [],
  defaultStages: [],
  pricingRules: [],
  defaultLaborRate: 100,
  defaultMarginPct: 20,
};

describe('parseNumberInputValue (G-03)', () => {
  it('returns undefined for empty string (not 0)', () => {
    expect(parseNumberInputValue('')).toBeUndefined();
  });
  it('returns undefined for partial sign-only input', () => {
    expect(parseNumberInputValue('-')).toBeUndefined();
    expect(parseNumberInputValue('.')).toBeUndefined();
  });
  it('returns undefined for non-numeric input', () => {
    expect(parseNumberInputValue('abc')).toBeUndefined();
  });
  it('parses valid numbers', () => {
    expect(parseNumberInputValue('1.5')).toBe(1.5);
    expect(parseNumberInputValue('0')).toBe(0);
    expect(parseNumberInputValue('-42')).toBe(-42);
  });
});

describe('toggleWorkModule (G-01)', () => {
  it('adds a module when enabling', () => {
    expect(toggleWorkModule(['paint'], 'tile', true)).toEqual(['paint', 'tile']);
  });
  it('removes a module when disabling', () => {
    expect(toggleWorkModule(['paint', 'tile'], 'tile', false)).toEqual(['paint']);
  });
  it('does not duplicate when already enabled', () => {
    expect(toggleWorkModule(['paint'], 'paint', true)).toEqual(['paint']);
  });
});

describe('isCustomFieldActive / isCustomFieldRequired (G-01)', () => {
  it('field of disabled module is inactive', () => {
    const tileField = config.customFields![0];
    expect(isCustomFieldActive(tileField, config, ['paint'])).toBe(false);
    expect(isCustomFieldRequired(tileField, config, ['paint'])).toBe(false);
  });
  it('field of enabled module is active and required if required', () => {
    const paintField = config.customFields![1];
    expect(isCustomFieldActive(paintField, config, ['paint'])).toBe(true);
    expect(isCustomFieldRequired(paintField, config, ['paint'])).toBe(true);
  });
});

describe('readEnabledWorkModules (G-02)', () => {
  it('returns defaults when diagnostic empty', () => {
    expect(readEnabledWorkModules({}, config)).toEqual(['paint']);
  });
  it('reads explicit list from diagnostic', () => {
    expect(readEnabledWorkModules({ enabledWorkModules: ['tile'] }, config)).toEqual(['tile']);
  });
  it('preserves empty enabledWorkModules array when explicitly empty', () => {
    expect(readEnabledWorkModules({ enabledWorkModules: [] }, config)).toEqual([]);
  });
});

describe('validateDiagnostic (G-01)', () => {
  it('ok when only enabled module fields are filled', () => {
    const result = validateDiagnostic(config, {
      enabledWorkModules: ['paint'],
      paintArea: 50,
    });
    expect(result.ok).toBe(true);
    expect(result.fieldErrors).toEqual({});
  });

  it('errors on required field of enabled module when empty', () => {
    const result = validateDiagnostic(config, {
      enabledWorkModules: ['paint'],
    });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.paintArea).toContain('obligatoriu');
  });

  it('does NOT error on required field of disabled module (G-01 conditional)', () => {
    const result = validateDiagnostic(config, {
      enabledWorkModules: ['paint'],
      paintArea: 50,
      // tileArea is required but tile module disabled
    });
    expect(result.ok).toBe(true);
    expect(result.fieldErrors.tileArea).toBeUndefined();
  });

  it('errors on out-of-range number', () => {
    const result = validateDiagnostic(config, {
      enabledWorkModules: ['paint'],
      paintArea: 9999,
    });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.paintArea).toContain('Maxim');
  });

  it('errors on invalid select option', () => {
    const result = validateDiagnostic(config, {
      enabledWorkModules: ['paint'],
      paintArea: 50,
      finishLevel: 'luxury',
    });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.finishLevel).toContain('invalidă');
  });
});

describe('CustomPricing separation from blueprint customFields (G-04)', () => {
  it('reads custom pricing keys without conflicting with blueprint keys', () => {
    const diagnostic = {
      paintArea: 50,
      enabledWorkModules: ['paint'],
      customUnitPriceSqm: 25,
      customLaborHours: 16,
    };
    const pricing = readCustomPricing(diagnostic);
    expect(pricing.customUnitPriceSqm).toBe(25);
    expect(pricing.customLaborHours).toBe(16);
    // blueprint custom fields not surfaced as pricing
    expect((pricing as Record<string, unknown>).paintArea).toBeUndefined();
  });

  it('mergeCustomPricing preserves blueprint customFields untouched', () => {
    const diagnostic: Record<string, unknown> = {
      paintArea: 50,
      enabledWorkModules: ['paint'],
    };
    const merged = mergeCustomPricing(diagnostic, { customUnitPriceSqm: 25 });
    expect(merged.paintArea).toBe(50);
    expect(merged.enabledWorkModules).toEqual(['paint']);
    expect(merged.customUnitPriceSqm).toBe(25);
  });

  it('drops zero/undefined custom pricing values when merging', () => {
    const merged = mergeCustomPricing(
      { paintArea: 50, customUnitPriceSqm: 10 },
      { customUnitPriceSqm: undefined },
    );
    expect(merged).not.toHaveProperty('customUnitPriceSqm');
    expect(merged.paintArea).toBe(50);
  });
});
