import { describe, expect, it } from 'vitest';
import { extractMeasurementsFromDiagnostic } from '../preview/previewEngine';

describe('extractMeasurementsFromDiagnostic — derived-key parity', () => {
  it('fatade: derives insulation volume, mesh, dowels and height-adjusted labor', () => {
    const m = extractMeasurementsFromDiagnostic(
      { facadeArea: 100, insulationThicknessCm: 10, buildingHeightM: 6 },
      'fatade',
    );
    expect(m.insulationVolumeM3).toBe(10);
    expect(m.meshArea).toBe(110);
    expect(m.dowelQty).toBe(600);
    expect(m.facadeAreaLabor).toBe(100); 
    expect(m.paintingArea).toBe(100);
  });

  it('fatade: applies the >9m height multiplier to labor', () => {
    const m = extractMeasurementsFromDiagnostic(
      { facadeArea: 100, buildingHeightM: 12 },
      'fatade',
    );
    expect(m.heightMultiplier).toBe(1.2);
    expect(m.facadeAreaLabor).toBe(120);
  });

  it('acoperis: roof area expands with slope; rectangle labor = area', () => {
    const m = extractMeasurementsFromDiagnostic(
      { baseArea: 100, roofSlope: 30, roofShape: 'rectangle' },
      'acoperis',
    );
    expect(m.roofArea).toBeGreaterThan(100);
    expect(m.roofAreaLabor).toBe(m.roofArea); 
    expect(m.timberVolumeM3).toBeGreaterThan(0);
  });

  it('acoperis: mirrors backend plan-derived roof quantities', () => {
    const m = extractMeasurementsFromDiagnostic(
      { baseArea: 100, roofSlope: 30 },
      'acoperis',
      null,
      {
        rooms: [
          { id: '1', name: 'Corp A', width: 10, height: 8, unit: 'm', roofType: 'gable' },
          { id: '2', name: 'Corp B', width: 4, height: 6, unit: 'm', roofType: 'gable' },
        ],
        points: [
          { id: 'g1', type: 'gutter' },
          { id: 'g2', type: 'gutter' },
          { id: 'c1', type: 'chimney' },
          { id: 's1', type: 'skylight' },
        ],
      },
    );

    expect(m.wallIntersectionLengthM).toBe(8);
    expect(m.gutterLengthM).toBe(39.2);
    expect(m.ridgeLengthM).toBe(10.8);
    expect(m.chimneyCount).toBe(1);
    expect(m.skylightCount).toBe(1);
    expect(m.requiresInteractiveDrawing).toBe(1);
  });

  it('clima: derives height multiplier and route split with real unit counts', () => {
    const m = extractMeasurementsFromDiagnostic(
      {
        acUnits: 2,
        routeLengthM: 10,
        heightWork: true,
        enabledWorkModules: ['route', 'indoor_outdoor_units', 'height_work'],
      },
      'clima',
    );
    expect(m.acUnits).toBe(2);
    expect(m.heightMultiplier).toBe(1.25);
    expect(m.routeStandardLengthM).toBe(5);
    expect(m.routeExtraLengthM).toBe(5);
    expect(m.freonRechargeQty).toBe(1);
  });

  it('panouri-solare: derives roof-adjusted structure/panel labor', () => {
    const m = extractMeasurementsFromDiagnostic(
      { panelCount: 10, roofType: 'flat' },
      'panouri-solare',
    );
    expect(m.structureLaborQty).toBe(12.5); 
    expect(m.panelLaborQty).toBe(12.5);
    expect(m.cableLengthM).toBe(25);
    expect(m.optimizerCount).toBe(10); 
  });

  it('panouri-solare: computes system power from panel count × Wp', () => {
    const m = extractMeasurementsFromDiagnostic(
      { panelCount: 8, panelWp: 450, evChargerCount: 1 },
      'panouri-solare',
    );
    expect(m.systemPowerKw).toBe(3.6); 
    expect(m.evChargerCount).toBe(1);
  });

  it('okna-dveri: derives install-labor counts from opening counts', () => {
    const m = extractMeasurementsFromDiagnostic(
      { windowCount: 4, doorCount: 2, installationType: 'warm_installation' },
      'okna-dveri',
    );
    expect(m.installationMultiplier).toBe(1.35);
    expect(m.windowCountLabor).toBe(5.4); 
    expect(m.warmInstallationUnits).toBe(6);
  });

  it('pavaj: derives excavation/gravel volumes and pattern-adjusted labor', () => {
    const m = extractMeasurementsFromDiagnostic(
      { pavementArea: 50, patternComplexity: 'decorative', vehicleLoad: 'car' },
      'pavaj',
    );
    expect(m.excavationVolumeM3).toBeGreaterThan(0);
    expect(m.pavementLaborQty).toBe(Math.round(50 * 1.3 * 1.15 * 100) / 100);
  });

  it('pavaj: reads optional add-on quantities (concrete base, manholes, steps)', () => {
    const m = extractMeasurementsFromDiagnostic(
      { pavementArea: 60, concreteBaseArea: 60, manholeCount: 2, stepsLengthM: 4 },
      'pavaj',
    );
    expect(m.concreteBaseArea).toBe(60);
    expect(m.manholeCount).toBe(2);
    expect(m.stepsLengthM).toBe(4);
  });

  it('cleaning: derives combined multiplier and clean-area labor', () => {
    const m = extractMeasurementsFromDiagnostic(
      { cleanArea: 100, cleaningType: 'post_construction', afterRepairDustLevel: 'high' },
      'cleaning',
    );
    expect(m.totalCleaningMultiplier).toBe(Math.round(1.65 * 1.35 * 100) / 100);
    expect(m.postConstructionAreaLabor).toBe(100);
    expect(m.standardCleanAreaLabor).toBe(0);
    expect(m.deepCleanAreaLabor).toBe(0);
  });

  it('cleaning: deep type uses deepCleanAreaLabor only', () => {
    const m = extractMeasurementsFromDiagnostic(
      { cleanArea: 40, cleaningType: 'deep' },
      'cleaning',
    );
    expect(m.standardCleanAreaLabor).toBe(0);
    expect(m.deepCleanAreaLabor).toBe(40);
  });

  it('mobila: derives premium material line and plan counts like backend', () => {
    const m = extractMeasurementsFromDiagnostic(
      { materialType: 'mdf', hardwareTier: 'premium', deliveryRequired: true, installationRequired: true },
      'mobila',
      null,
      {
        rooms: [],
        points: [
          { id: 'c1', type: 'kitchen_cabinet' },
          { id: 'c2', type: 'kitchen_cabinet' },
          { id: 'w1', type: 'wardrobe' },
        ],
      },
    );

    expect(m.cabinetCount).toBe(2);
    expect(m.wardrobeCount).toBe(1);
    expect(m.linearMeters).toBe(Math.round((2 * 0.8 + 1 * 1.5) * 100) / 100);
    expect(m.cuttingMaterialPremiumM).toBe(Math.round(m.cuttingLinearM * 0.3 * 100) / 100);
    expect(m.hardwareCostMultiplier).toBe(1.7);
    expect(m.deliveryQty).toBe(1);
    expect(m.installationQty).toBe(3);
  });

  it('mobila: prices furniture-specific material, hardware and assembly fields', () => {
    const m = extractMeasurementsFromDiagnostic(
      {
        cabinetCount: 4,
        wardrobeCount: 1,
        materialType: 'pal',
        frontMaterialType: 'mdf',
        materialThickness: '18 mm',
        finishType: 'Lucios',
        hardwareTier: 'standard',
        softClose: true,
        hasApplianceCutouts: true,
        assemblyComplexity: 'Mediu (sertare multiple)',
      },
      'mobila',
    );

    expect(m.materialMultiplier).toBe(Math.round(1.3 * 1.05 * 1.1 * 100) / 100);
    expect(m.cuttingMaterialPremiumM).toBeGreaterThan(0);
    expect(m.hardwareCostMultiplier).toBe(Math.round(1.25 * 1.1 * 100) / 100);
    expect(m.applianceCutoutUnits).toBe(2);
    expect(m.assemblyCabinetQty).toBe(Math.round(4 * 1.2 * 100) / 100);
    expect(m.assemblyWardrobeQty).toBe(Math.round(1 * 1.2 * 100) / 100);
  });

  it('constructii: splits foundation vs structural concrete and always flags manual review', () => {
    const m = extractMeasurementsFromDiagnostic(
      { builtArea: 50, storyCount: 1, foundationType: 'strip' },
      'constructii',
    );
    expect(m.foundationConcreteM3).toBe(7);
    expect(m.structuralConcreteM3).toBe(2);
    expect(m.foundationRebarKg).toBe(630);
    expect(m.rebarKg).toBe(810);
    expect(m.requiresManualReview).toBe(1);
    expect(m.preliminaryEstimate).toBe(1);
    for (const value of Object.values(m)) {
      expect(Number.isNaN(value)).toBe(false);
    }
  });
});

describe('extractMeasurementsFromDiagnostic — company pricing-modifier overrides', () => {
  it('solar: override roofType.tile changes structure/panel labor', () => {
    const base = extractMeasurementsFromDiagnostic({ panelCount: 10, roofType: 'tile' }, 'panouri-solare');
    expect(base.panelLaborQty).toBe(11.5);
    const over = extractMeasurementsFromDiagnostic(
      { panelCount: 10, roofType: 'tile' },
      'panouri-solare',
      { 'solar.roofType.tile': 30 },
    );
    expect(over.panelLaborQty).toBe(13); 
  });

  it('pavaj: override vehicleLoad.heavy + patternComplexity.decorative changes labor qty', () => {
    const over = extractMeasurementsFromDiagnostic(
      { pavementArea: 50, vehicleLoad: 'heavy', patternComplexity: 'decorative' },
      'pavaj',
      { 'pavaj.vehicleLoad.heavy': 50, 'pavaj.patternComplexity.decorative': 40 },
    );
    expect(over.pavementLaborQty).toBe(Math.round(50 * 1.4 * 1.5 * 100) / 100);
  });

  it('okna-dveri: override installationType.warm_installation changes window labor', () => {
    const over = extractMeasurementsFromDiagnostic(
      { windowCount: 4, installationType: 'warm_installation' },
      'okna-dveri',
      { 'okna.installationType.warm_installation': 50 },
    );
    expect(over.windowCountLabor).toBe(6); 
  });

  it('cleaning: override cleaningType.post_construction changes total multiplier', () => {
    const over = extractMeasurementsFromDiagnostic(
      { cleanArea: 100, cleaningType: 'post_construction', afterRepairDustLevel: 'high' },
      'cleaning',
      { 'cleaning.cleaningType.post_construction': 80 },
    );
    expect(over.totalCleaningMultiplier).toBe(Math.round(1.8 * 1.35 * 100) / 100);
  });

  it('empty overrides keep registry defaults', () => {
    const a = extractMeasurementsFromDiagnostic({ panelCount: 10, roofType: 'tile' }, 'panouri-solare');
    const b = extractMeasurementsFromDiagnostic({ panelCount: 10, roofType: 'tile' }, 'panouri-solare', {});
    expect(a.panelLaborQty).toBe(b.panelLaborQty);
  });
});

describe('extractMeasurementsFromDiagnostic — IT categories', () => {
  it('it-web: derives pagesCount, design/front page counts, and software hours baseline', () => {
    const m = extractMeasurementsFromDiagnostic(
      {
        pagesCount: 8,
        projectScope: 'Mediu (6-20 pagini / 1-2 săptămâni)',
        documentationRequired: true,
        slaRequired: true,
      },
      'it-web',
    );
    expect(m.pagesCount).toBe(8);
    expect(m.analysisHours).toBe(16);
    expect(m.testingHours).toBe(8);
    expect(m.trainingHours).toBe(6);
    expect(m.slaUnits).toBe(1);
    expect(m.designPageCount).toBe(8);
    expect(m.frontendPageCount).toBe(8);
  });

  it('it-networks: derives cabling quantities, separates workstation/servers, and defaults hours to 0', () => {
    const m = extractMeasurementsFromDiagnostic(
      {
        networkPoints: 12,
        avgCableLengthPerPort: 25,
        serversToConfigure: 2,
        serversToAssemble: 1,
        workstationsToConfigure: 5,
        workstationsToAssemble: 5,
        siteSurveyRequired: true,
        commissioningRequired: false,
      },
      'it-networks',
    );
    expect(m.networkCableM).toBe(300);
    expect(m.serversToConfigure).toBe(2);
    expect(m.serversToAssemble).toBe(1);
    expect(m.workstationsToConfigure).toBe(5);
    expect(m.workstationsToAssemble).toBe(5);
    expect(m.analysisHours).toBe(8); 
    expect(m.testingHours).toBe(0);
    expect(m.trainingHours).toBe(0);
  });

  it('it-hardware: aggregates split repair/recovery counts and sets conditional OS licensing', () => {
    const mWindows = extractMeasurementsFromDiagnostic(
      {
        deviceCount: 3,
        simpleRepairCount: 2,
        mediumRepairCount: 2,
        complexRepairCount: 1,
        osInstallCount: 2,
        osType: 'Windows 10/11',
      },
      'it-hardware',
    );
    expect(mWindows.repairCount).toBe(5);
    expect(mWindows.osLicenseCount).toBe(2);

    const mLinux = extractMeasurementsFromDiagnostic(
      {
        deviceCount: 1,
        osInstallCount: 3,
        osType: 'Linux (Ubuntu/Debian)',
      },
      'it-hardware',
    );
    expect(mLinux.osLicenseCount).toBe(0);
  });
});
