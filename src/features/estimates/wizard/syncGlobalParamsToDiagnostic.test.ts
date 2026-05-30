import { describe, expect, it } from 'vitest';
import { syncGlobalParamsToDiagnostic } from './syncGlobalParamsToDiagnostic';
import { ENABLED_WORK_MODULES_KEY } from '@/features/estimates/diagnostic/workModules';
import type { Plan2dData } from '@/types/estimate-plan2d.types';

function plan(partial: Partial<Plan2dData>): Plan2dData {
  return {
    rooms: [],
    points: [],
    ...partial,
  };
}

describe('syncGlobalParamsToDiagnostic — context-aware baseArea (I-01, I-02)', () => {
  it('roof context maps baseArea → roofArea only (not finishArea/builtArea)', () => {
    const result = syncGlobalParamsToDiagnostic(
      plan({ globalParameters: { workContext: 'roof', baseArea: 120 } }),
      {},
    );
    expect(result.roofArea).toBe(120);
    expect(result.baseArea).toBe(120);
    expect(result.finishArea).toBeUndefined();
    expect(result.cleanArea).toBeUndefined();
    expect(result.builtArea).toBeUndefined();
    expect(result.pavementArea).toBeUndefined();
  });

  it('indoor context maps baseArea → finishArea + cleanArea', () => {
    const result = syncGlobalParamsToDiagnostic(
      plan({ globalParameters: { workContext: 'indoor', baseArea: 60 } }),
      {},
    );
    expect(result.finishArea).toBe(60);
    expect(result.cleanArea).toBe(60);
    expect(result.roofArea).toBeUndefined();
    expect(result.builtArea).toBeUndefined();
  });

  it('general context maps baseArea → builtArea + pavementArea', () => {
    const result = syncGlobalParamsToDiagnostic(
      plan({ globalParameters: { workContext: 'general', baseArea: 200 } }),
      {},
    );
    expect(result.builtArea).toBe(200);
    expect(result.pavementArea).toBe(200);
    expect(result.roofArea).toBeUndefined();
    expect(result.finishArea).toBeUndefined();
  });

  it('facade context: facadeArea works, but baseArea does not bleed into floor keys', () => {
    const result = syncGlobalParamsToDiagnostic(
      plan({
        globalParameters: {
          workContext: 'facade',
          baseArea: 100,
          facadeArea: 240,
        },
      }),
      {},
    );
    expect(result.facadeArea).toBe(240);
    expect(result.scaffoldingArea).toBe(240);
    expect(result.baseArea).toBe(100);
    expect(result.finishArea).toBeUndefined();
    expect(result.cleanArea).toBeUndefined();
    expect(result.roofArea).toBeUndefined();
  });

  it('roofSlope written only when context = roof', () => {
    const roof = syncGlobalParamsToDiagnostic(
      plan({ globalParameters: { workContext: 'roof', roofSlope: 30 } }),
      {},
    );
    expect(roof.roofSlope).toBe(30);

    const facade = syncGlobalParamsToDiagnostic(
      plan({ globalParameters: { workContext: 'facade', roofSlope: 30 } }),
      {},
    );
    expect(facade.roofSlope).toBeUndefined();
  });

  it('facadeArea written only when context = facade', () => {
    const facade = syncGlobalParamsToDiagnostic(
      plan({ globalParameters: { workContext: 'facade', facadeArea: 240 } }),
      {},
    );
    expect(facade.facadeArea).toBe(240);

    const roof = syncGlobalParamsToDiagnostic(
      plan({ globalParameters: { workContext: 'roof', facadeArea: 240 } }),
      {},
    );
    expect(roof.facadeArea).toBeUndefined();
  });

  it('rooms area falls back into context-relevant key when baseArea missing', () => {
    const result = syncGlobalParamsToDiagnostic(
      plan({
        rooms: [
          { id: 'r1', name: 'Hol', width: 4, height: 5 },
          { id: 'r2', name: 'Bucătărie', width: 3, height: 4 },
        ],
        globalParameters: { workContext: 'indoor' },
      }),
      {},
    );
    expect(result.totalFloorArea).toBe(32);
    expect(result.roomCount).toBe(2);
    expect(result.finishArea).toBe(32);
    expect(result.cleanArea).toBe(32);
    expect(result.roofArea).toBeUndefined();
    expect(result.builtArea).toBeUndefined();
  });

  it('does not overwrite existing area if rooms-fallback would apply', () => {
    const result = syncGlobalParamsToDiagnostic(
      plan({
        rooms: [{ id: 'r1', name: 'A', width: 10, height: 10 }],
        globalParameters: { workContext: 'general' },
      }),
      { builtArea: 999 },
    );
    expect(result.totalFloorArea).toBe(100);
    expect(result.builtArea).toBe(999);
    expect(result.pavementArea).toBe(100); 
  });

  it('storyCount no longer hijacks roomCount (was bug pre-I-01)', () => {
    const result = syncGlobalParamsToDiagnostic(
      plan({ globalParameters: { workContext: 'general', floorsCount: 3 } }),
      {},
    );
    expect(result.storyCount).toBe(3);
    expect(result.roomCount).toBeUndefined();
  });
});

describe('syncGlobalParamsToDiagnostic — point counts (I-01)', () => {
  it('maps indoor (split) points to acUnits', () => {
    const result = syncGlobalParamsToDiagnostic(
      plan({ points: [
        { id: '1', type: 'indoor' },
        { id: '2', type: 'indoor' },
        { id: '3', type: 'indoor' },
      ]}),
      {},
    );
    expect(result.acUnits).toBe(3);
  });

  it('maps solar panel points to panelCount', () => {
    const result = syncGlobalParamsToDiagnostic(
      plan({ points: [
        { id: '1', type: 'solar_panel' },
        { id: '2', type: 'solar_panel' },
      ]}),
      {},
    );
    expect(result.panelCount).toBe(2);
  });

  it('window + sliding_door combine into doorCount', () => {
    const result = syncGlobalParamsToDiagnostic(
      plan({ points: [
        { id: '1', type: 'door' },
        { id: '2', type: 'sliding_door' },
        { id: '3', type: 'door' },
      ]}),
      {},
    );
    expect(result.doorCount).toBe(3);
  });
});

describe('syncGlobalParamsToDiagnostic — plan does NOT auto-enable work modules (I-03)', () => {
  it('does not set enabledWorkModules even with many points', () => {
    const result = syncGlobalParamsToDiagnostic(
      plan({
        points: [
          { id: '1', type: 'tile' },
          { id: '2', type: 'tile' },
          { id: '3', type: 'indoor' },
          { id: '4', type: 'solar_panel' },
        ],
        globalParameters: { workContext: 'indoor', baseArea: 50 },
      }),
      {},
    );
    expect(result[ENABLED_WORK_MODULES_KEY]).toBeUndefined();
  });

  it('preserves user-selected enabledWorkModules and never overwrites them', () => {
    const result = syncGlobalParamsToDiagnostic(
      plan({
        points: [{ id: '1', type: 'tile' }],
        globalParameters: { workContext: 'indoor', baseArea: 50 },
      }),
      { [ENABLED_WORK_MODULES_KEY]: ['paint'] },
    );
    expect(result[ENABLED_WORK_MODULES_KEY]).toEqual(['paint']);
  });

  it('paint-only smetă with tile points in plan → tile qty written but tile module stays off', () => {
    const result = syncGlobalParamsToDiagnostic(
      plan({
        rooms: [{ id: 'r1', name: 'A', width: 4, height: 4 }],
        points: [{ id: '1', type: 'tile' }],
        globalParameters: { workContext: 'indoor', baseArea: 16 },
      }),
      { [ENABLED_WORK_MODULES_KEY]: ['paint'], paintArea: 16 },
    );
    expect(result[ENABLED_WORK_MODULES_KEY]).toEqual(['paint']);
    expect(result.paintArea).toBe(16);
  });
});
