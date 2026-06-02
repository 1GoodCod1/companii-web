import { describe, expect, it } from 'vitest';
import type { Plan2dData } from '@/entities/estimate/model/estimate-plan2d.types';
import type { EstimateBlueprintConfig } from '@/entities/estimate/model/estimate-blueprint-config.types';
import { deriveElektrikaMeasurements } from './elektrikaDerivation';
import {
  appendStageDefaultPreviewLines,
  isStageDefaultLaborChargeable,
} from '../preview/stageDefaultPreview';
import { computePreviewLines } from '../preview/previewEngine';

const elektrikaPreviewConfig: EstimateBlueprintConfig = {
  wizardSteps: ['object', 'diagnostic', 'stages', 'review'],
  siteTypes: [],
  planPointTypes: [],
  workModules: [
    {
      key: 'chasing',
      label: 'Ștrobire',
      defaultEnabled: true,
      stageCodes: ['trasee'],
      fieldKeys: [],
      requiresQtyKeys: ['wallChasingM'],
    },
    { key: 'cabling', label: 'Cablare', defaultEnabled: true, stageCodes: ['cablare'], fieldKeys: [] },
    { key: 'panel', label: 'Tablou', defaultEnabled: true, stageCodes: ['tablou'], fieldKeys: [] },
    { key: 'devices', label: 'Aparataj', defaultEnabled: true, stageCodes: ['aparataj'], fieldKeys: [] },
  ],
  customFields: [],
  diagnosticQuestions: [],
  defaultStages: [
    { code: 'trasee', name: 'Ștrobire & doze', kind: 'LABOR', defaultLaborHours: 5, moduleKey: 'chasing' },
  ],
  pricingRules: [
    {
      stageCode: 'trasee',
      description: 'Ștrobire pereți (cost ajustat material)',
      unit: 'm',
      qtyKey: 'wallChasingM',
      unitPrice: 95,
      kind: 'labor',
      moduleKey: 'chasing',
      laborUnitPriceMultiplierKey: 'materialMultiplier',
      enabledWhen: { moduleEnabled: 'chasing', anyQtyKeys: ['wallChasingM'] },
    },
    {
      stageCode: 'cablare',
      description: 'Cablu + tub (secțiune ajustabilă)',
      unit: 'm',
      qtyKey: 'cableMaterialM',
      unitPrice: 45,
      wastePct: 10,
      kind: 'material',
      moduleKey: 'cabling',
    },
    {
      stageCode: 'tablou',
      description: 'Module automate / RCD',
      unit: 'buc',
      qtyKey: 'panelModules',
      unitPrice: 85,
      kind: 'material',
      moduleKey: 'panel',
      enabledWhen: { anyQtyKeys: ['panelCount'] },
    },
    {
      stageCode: 'aparataj',
      description: 'Priză — material',
      unit: 'buc',
      qtyKey: 'socketCount',
      unitPrice: 85,
      kind: 'material',
      moduleKey: 'devices',
      materialUnitPriceMultiplierKey: 'deviceTierMultiplier',
    },
    {
      stageCode: 'aparataj',
      description: 'Întrerupător — material',
      unit: 'buc',
      qtyKey: 'switchCount',
      unitPrice: 85,
      kind: 'material',
      moduleKey: 'devices',
      materialUnitPriceMultiplierKey: 'deviceTierMultiplier',
    },
    {
      stageCode: 'aparataj',
      description: 'Punct lumină — material',
      unit: 'buc',
      qtyKey: 'lightPointCount',
      unitPrice: 85,
      kind: 'material',
      moduleKey: 'devices',
      materialUnitPriceMultiplierKey: 'deviceTierMultiplier',
    },
  ],
  defaultLaborRate: 185,
  defaultMarginPct: 20,
};

describe('elektrika derivation parity', () => {
  const planWithPoints: Plan2dData = {
    rooms: [],
    points: [
      { id: '1', type: 'socket' },
      { id: '2', type: 'socket' },
      { id: '3', type: 'switch' },
      { id: '4', type: 'light' },
      { id: '5', type: 'panel' },
    ],
  };

  it('matches plan-based point and panel counts', () => {
    const m = deriveElektrikaMeasurements({ roomCount: 2, newPanel: true }, planWithPoints);
    expect(m.socketCount).toBe(2);
    expect(m.switchCount).toBe(1);
    expect(m.lightPointCount).toBe(1);
    expect(m.electricPoints).toBe(4);
    expect(m.panelCount).toBe(2);
  });

  it('does not charge phantom trasee stage-default on new construction', () => {
    const measurements = deriveElektrikaMeasurements({ roomCount: 3, isNewConstruction: true }, null);
    expect(measurements.wallChasingM).toBe(0);

    expect(
      isStageDefaultLaborChargeable(
        elektrikaPreviewConfig.defaultStages[0],
        ['chasing'],
        elektrikaPreviewConfig,
        measurements,
      ),
    ).toBe(false);

    const lines = appendStageDefaultPreviewLines(
      elektrikaPreviewConfig,
      [],
      ['chasing'],
      measurements,
      1,
    );
    expect(lines.some((line) => line.stageCode === 'trasee')).toBe(false);
  });

  it('applies cable segment via cableMaterialM qty', () => {
    const base = deriveElektrikaMeasurements({ roomCount: 3, cableSegmentMm2: '2.5 mm²' }, null);
    const thick = deriveElektrikaMeasurements({ roomCount: 3, cableSegmentMm2: '6 mm²' }, null);

    const baseLines = computePreviewLines(
      elektrikaPreviewConfig,
      base,
      ['cabling'],
    );
    const thickLines = computePreviewLines(
      elektrikaPreviewConfig,
      thick,
      ['cabling'],
    );

    const baseCable = baseLines.find((l) => l.description.includes('Cablu'));
    const thickCable = thickLines.find((l) => l.description.includes('Cablu'));

    expect(thickCable!.lineTotal).toBeGreaterThan(baseCable!.lineTotal);
    expect(thickCable!.qty).toBeGreaterThan(baseCable!.qty);
  });

  it('does not bill panel modules without a panel', () => {
    const measurements = deriveElektrikaMeasurements({ roomCount: 2, newPanel: false, panelModules: 12 }, null);
    const lines = computePreviewLines(elektrikaPreviewConfig, measurements, ['panel']);
    expect(lines.some((l) => l.description.includes('Module automate'))).toBe(false);
  });

  it('applies device tier per point type with separate material lines', () => {
    const measurements = deriveElektrikaMeasurements(
      { roomCount: 2, deviceTier: 'standard', socketCount: 7, switchCount: 6, lightPointCount: 6 },
      null,
    );
    const lines = computePreviewLines(elektrikaPreviewConfig, measurements, ['devices']);

    const socketMaterial = lines.find((l) => l.description.includes('Priză — material'));
    const switchMaterial = lines.find((l) => l.description.includes('Întrerupător — material'));
    const lightMaterial = lines.find((l) => l.description.includes('Punct lumină — material'));

    expect(socketMaterial?.qty).toBe(7);
    expect(switchMaterial?.qty).toBe(6);
    expect(lightMaterial?.qty).toBe(6);
    expect(socketMaterial?.unitPrice).toBe(127.5);
  });

  it('explicit zero socket count stays zero (empty = auto)', () => {
    const auto = deriveElektrikaMeasurements({ roomCount: 3 }, null);
    const zero = deriveElektrikaMeasurements({ roomCount: 3, socketCount: 0 }, null);

    expect(auto.socketCount).toBe(6);
    expect(zero.socketCount).toBe(0);
  });

  it('explicit zero wall chasing skips auto-estimate', () => {
    const auto = deriveElektrikaMeasurements({ roomCount: 3 }, null);
    const zero = deriveElektrikaMeasurements({ roomCount: 3, wallChasingM: 0 }, null);

    expect(auto.wallChasingM).toBeGreaterThan(0);
    expect(zero.wallChasingM).toBe(0);
  });
});
