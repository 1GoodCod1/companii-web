import type { EstimateBlueprintCategorySlug } from './estimateCategorySlugs.constants';

type CategorySpec = { customFieldKeys: readonly string[]; workModuleKeys: readonly string[] };

export const blueprintEnergySpec = {
  'panouri-solare': {
    customFieldKeys: [
      'panelCount',
      'systemPowerKw',
      'roofType',
      'gridConnection',
      'panelWp',
      'inverterCount',
      'batteryCapacity',
      'cableLengthM',
      'evChargerCount',
      'permitsRequired',
      'monitoringRequired',
    ],
    workModuleKeys: [
      'audit',
      'project',
      'permits',
      'mounts',
      'panels',
      'optimizers',
      'inverter',
      'batteries',
      'protection',
      'ev_charger',
      'grid_connection',
      'monitoring',
    ],
  },
} satisfies Partial<Record<EstimateBlueprintCategorySlug, CategorySpec>>;