import type { EstimateBlueprintCategorySlug } from './estimateCategorySlugs.constants';

type CategorySpec = { customFieldKeys: readonly string[]; workModuleKeys: readonly string[] };

export const blueprintInteriorSpec = {
  mobila: {
    customFieldKeys: [
      'cabinetCount',
      'wardrobeCount',
      'linearMeters',
      'materialType',
      'frontMaterialType',
      'materialThickness',
      'finishType',
      'hasApplianceCutouts',
      'assemblyComplexity',
      'hardwareTier',
      'drawerCount',
      'hingeCount',
      'softClose',
      'countertopLengthM',
      'deliveryRequired',
      'installationRequired',
    ],
    workModuleKeys: ['design', 'cutting', 'hardware', 'assembly', 'countertop', 'delivery', 'installation'],
  },
  cleaning: {
    customFieldKeys: [
      'cleanArea',
      'cleaningType',
      'windowCount',
      'bathroomCount',
      'furniturePresent',
      'kitchenDeepClean',
      'trashRemoval',
      'afterRepairDustLevel',
    ],
    workModuleKeys: [
      'standard_cleaning',
      'windows',
      'kitchen',
      'bathrooms',
      'trash_removal',
    ],
  },
} satisfies Partial<Record<EstimateBlueprintCategorySlug, CategorySpec>>;