import type { EstimateBlueprintCategorySlug } from './estimateCategorySlugs.constants';
import { blueprintConstructionSpec } from './blueprintConstruction.spec';
import { blueprintFinishingSpec } from './blueprintFinishing.spec';
import { blueprintInteriorSpec } from './blueprintInterior.spec';
import { blueprintItSpec } from './blueprintIt.spec';
import { blueprintEnergySpec } from './blueprintEnergy.spec';

export const ESTIMATE_CATEGORY_BLUEPRINT_SPEC = {
  ...blueprintConstructionSpec,
  ...blueprintFinishingSpec,
  ...blueprintInteriorSpec,
  ...blueprintItSpec,
  ...blueprintEnergySpec,
} as Record<
  EstimateBlueprintCategorySlug,
  { customFieldKeys: readonly string[]; workModuleKeys: readonly string[] }
>;

export { blueprintConstructionSpec } from './blueprintConstruction.spec';
export { blueprintFinishingSpec } from './blueprintFinishing.spec';
export { blueprintInteriorSpec } from './blueprintInterior.spec';
export { blueprintItSpec } from './blueprintIt.spec';
export { blueprintEnergySpec } from './blueprintEnergy.spec';