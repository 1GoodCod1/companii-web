import { describe, expect, it } from 'vitest';
import { resolveLaborUnits, DEFAULT_LABOR_UNITS } from '@/entities/estimate/model/estimateMeasurementUnits.constants';
import { isEstimateLaborLine } from './estimateLaborLine';

describe('isEstimateLaborLine', () => {
  it('detects Cost Lucrări custom override lines', () => {
    expect(
      isEstimateLaborLine({
        unit: 'buc',
        description: 'Cost Lucrări (Volum / Contract) — Montaj aparataj',
      }),
    ).toBe(true);
  });

  it('does not treat material lines as labor', () => {
    expect(
      isEstimateLaborLine({
        unit: 'buc',
        description: 'Priză — material',
        kind: 'material',
      }),
    ).toBe(false);
  });

  it('detects IT service keywords as labor', () => {
    expect(
      isEstimateLaborLine({
        unit: 'buc',
        description: 'Dezvoltare frontend per pagină',
      }),
    ).toBe(true);
    expect(
      isEstimateLaborLine({
        unit: 'buc',
        description: 'Design UI/UX Premium',
      }),
    ).toBe(true);
  });

  it('respects stageKind LABOR or MATERIAL', () => {
    expect(
      isEstimateLaborLine({
        unit: 'buc',
        description: 'Any random description',
        stageKind: 'LABOR',
      }),
    ).toBe(false);
    expect(
      isEstimateLaborLine({
        unit: 'buc',
        description: 'Componente PC (material)',
        stageKind: 'LABOR',
      }),
    ).toBe(false);
    expect(
      isEstimateLaborLine({
        unit: 'buc',
        description: 'Asamblare PC (lucrări)',
        stageKind: 'LABOR',
      }),
    ).toBe(true);
    expect(
      isEstimateLaborLine({
        unit: 'ore',
        description: 'lucrări',
        stageKind: 'MATERIAL',
      }),
    ).toBe(true);
  });
});

describe('resolveLaborUnits', () => {
  it('returns elektrika-specific units when configured on blueprint', () => {
    expect(
      resolveLaborUnits({ laborUnits: ['buc', 'm', 'm²', 'ore'] }),
    ).toEqual(['buc', 'm', 'm²', 'ore']);
  });

  it('falls back to default labor units', () => {
    expect(resolveLaborUnits(null)).toEqual(DEFAULT_LABOR_UNITS);
    expect(DEFAULT_LABOR_UNITS).not.toContain('kg');
    expect(DEFAULT_LABOR_UNITS).not.toContain('kWh');
  });
});
