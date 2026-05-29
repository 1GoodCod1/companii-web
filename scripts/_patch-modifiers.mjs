import fs from 'node:fs';

const DIR = 'src/features/estimates/';
const IMPORT = "import { type PricingModifierOverrides, modifierFactor } from './pricingModifierOverrides';\n";
const SIG_FIND = '  diagnostic: Record<string, unknown> | null | undefined,\n): DerivedMeasurements {';
const SIG_REPL = '  diagnostic: Record<string, unknown> | null | undefined,\n  overrides?: PricingModifierOverrides,\n): DerivedMeasurements {';
const errors = [];

function patch(file, pairs) {
  const path = DIR + file;
  let s = fs.readFileSync(path, 'utf8');
  s = IMPORT + s;
  for (const [find, repl] of pairs) {
    if (!s.includes(find)) { errors.push(`${file}: MISSING >>>${find}<<<`); continue; }
    s = s.replace(find, repl);
  }
  fs.writeFileSync(path, s);
}

patch('mobilaDerivation.ts', [
  ['resolveHardwareCostMultiplier(hardwareTier: unknown): number {', "resolveHardwareCostMultiplier(hardwareTier: unknown, overrides?: PricingModifierOverrides): number {"],
  ["  if (normalized === 'premium') return 1.7;", "  if (normalized === 'premium') return modifierFactor('mobila.hardwareTier.premium', overrides, 70);"],
  ["  if (normalized === 'standard') return 1.25;", "  if (normalized === 'standard') return modifierFactor('mobila.hardwareTier.standard', overrides, 25);"],
  ['resolveMaterialMultiplier(materialType: unknown): number {', "resolveMaterialMultiplier(materialType: unknown, overrides?: PricingModifierOverrides): number {"],
  ["  if (normalized === 'hpl') return 1.8;", "  if (normalized === 'hpl') return modifierFactor('mobila.materialType.hpl', overrides, 80);"],
  ["  if (normalized === 'lemn') return 1.6;", "  if (normalized === 'lemn') return modifierFactor('mobila.materialType.lemn', overrides, 60);"],
  ["  if (normalized === 'mdf') return 1.3;", "  if (normalized === 'mdf') return modifierFactor('mobila.materialType.mdf', overrides, 30);"],
  ['export function deriveMobilaMeasurements(diagnostic: Record<string, unknown> | null | undefined): DerivedMeasurements {', 'export function deriveMobilaMeasurements(diagnostic: Record<string, unknown> | null | undefined, overrides?: PricingModifierOverrides): DerivedMeasurements {'],
  ['resolveHardwareCostMultiplier(diagnostic.hardwareTier)', 'resolveHardwareCostMultiplier(diagnostic.hardwareTier, overrides)'],
  ['resolveMaterialMultiplier(diagnostic.materialType)', 'resolveMaterialMultiplier(diagnostic.materialType, overrides)'],
]);

patch('santehnikaDerivation.ts', [
  ['resolvePipeMaterialMultiplier(pipeMaterial: unknown): number {', "resolvePipeMaterialMultiplier(pipeMaterial: unknown, overrides?: PricingModifierOverrides): number {"],
  ["  if (normalized === 'cupru' || normalized === 'copper') return 1.45;", "  if (normalized === 'cupru' || normalized === 'copper') return modifierFactor('santehnika.pipeMaterial.cupru', overrides, 45);"],
  ["  if (normalized === 'pex') return 1.2;", "  if (normalized === 'pex') return modifierFactor('santehnika.pipeMaterial.pex', overrides, 20);"],
  ["  if (normalized === 'multistrat') return 1.15;", "  if (normalized === 'multistrat') return modifierFactor('santehnika.pipeMaterial.multistrat', overrides, 15);"],
  ['export function deriveSantehnikaMeasurements(diagnostic: Record<string, unknown> | null | undefined): DerivedMeasurements {', 'export function deriveSantehnikaMeasurements(diagnostic: Record<string, unknown> | null | undefined, overrides?: PricingModifierOverrides): DerivedMeasurements {'],
  ['resolvePipeMaterialMultiplier(diagnostic.pipeMaterial)', 'resolvePipeMaterialMultiplier(diagnostic.pipeMaterial, overrides)'],
]);

patch('elektrikaDerivation.ts', [
  ['resolveWallMaterialMultiplier(wallMaterial: unknown): number {', "resolveWallMaterialMultiplier(wallMaterial: unknown, overrides?: PricingModifierOverrides): number {"],
  ["  if (normalized === 'beton' || normalized === 'concrete') return 1.45;", "  if (normalized === 'beton' || normalized === 'concrete') return modifierFactor('elektrika.wallMaterial.beton', overrides, 45);"],
  ["  if (normalized === 'caramida' || normalized === 'brick') return 1.2;", "  if (normalized === 'caramida' || normalized === 'brick') return modifierFactor('elektrika.wallMaterial.caramida', overrides, 20);"],
  ["  if (normalized === 'bca' || normalized === 'aac') return 1.1;", "  if (normalized === 'bca' || normalized === 'aac') return modifierFactor('elektrika.wallMaterial.bca', overrides, 10);"],
  ['resolveCableSegmentMultiplier(segment: string): number {', 'resolveCableSegmentMultiplier(segment: string, overrides?: PricingModifierOverrides): number {'],
  ["  if (segment === '4 mm²') return 1.4;", "  if (segment === '4 mm²') return modifierFactor('elektrika.cableSegment.4', overrides, 40);"],
  ["  if (segment === '6 mm²') return 1.7;", "  if (segment === '6 mm²') return modifierFactor('elektrika.cableSegment.6', overrides, 70);"],
  ['resolveDeviceTierMultiplier(tier: string): number {', 'resolveDeviceTierMultiplier(tier: string, overrides?: PricingModifierOverrides): number {'],
  ["  if (tier === 'premium') return 2.5;", "  if (tier === 'premium') return modifierFactor('elektrika.deviceTier.premium', overrides, 150);"],
  ["  if (tier === 'standard') return 1.5;", "  if (tier === 'standard') return modifierFactor('elektrika.deviceTier.standard', overrides, 50);"],
  ['export function deriveElektrikaMeasurements(diagnostic: Record<string, unknown> | null | undefined): DerivedMeasurements {', 'export function deriveElektrikaMeasurements(diagnostic: Record<string, unknown> | null | undefined, overrides?: PricingModifierOverrides): DerivedMeasurements {'],
  ["resolveCableSegmentMultiplier(readSelect(diagnostic, 'cableSegmentMm2') || '2.5 mm²')", "resolveCableSegmentMultiplier(readSelect(diagnostic, 'cableSegmentMm2') || '2.5 mm²', overrides)"],
  ["resolveDeviceTierMultiplier(readSelect(diagnostic, 'deviceTier') || 'standard')", "resolveDeviceTierMultiplier(readSelect(diagnostic, 'deviceTier') || 'standard', overrides)"],
  ['resolveWallMaterialMultiplier(diagnostic.wallMaterial)', 'resolveWallMaterialMultiplier(diagnostic.wallMaterial, overrides)'],
]);

patch('windowsDoorsDerivation.ts', [
  ['resolveInstallationMultiplier(installationType: unknown): number {', 'resolveInstallationMultiplier(installationType: unknown, overrides?: PricingModifierOverrides): number {'],
  ["  if (n === 'warm-installation' || n === 'warm') return 1.35;", "  if (n === 'warm-installation' || n === 'warm') return modifierFactor('okna.installationType.warm_installation', overrides, 35);"],
  ["  if (n === 'renovation') return 1.2;", "  if (n === 'renovation') return modifierFactor('okna.installationType.renovation', overrides, 20);"],
  [SIG_FIND, SIG_REPL],
  ['resolveInstallationMultiplier(diagnostic.installationType)', 'resolveInstallationMultiplier(diagnostic.installationType, overrides)'],
]);

patch('pavajDerivation.ts', [
  ['resolvePatternMultiplier(patternComplexity: unknown): number {', 'resolvePatternMultiplier(patternComplexity: unknown, overrides?: PricingModifierOverrides): number {'],
  ["  if (n === 'decorative') return 1.3;", "  if (n === 'decorative') return modifierFactor('pavaj.patternComplexity.decorative', overrides, 30);"],
  ["  if (n === 'mixed') return 1.15;", "  if (n === 'mixed') return modifierFactor('pavaj.patternComplexity.mixed', overrides, 15);"],
  ['resolveLoadMultiplier(vehicleLoad: unknown): number {', 'resolveLoadMultiplier(vehicleLoad: unknown, overrides?: PricingModifierOverrides): number {'],
  ["  if (n === 'heavy') return 1.35;", "  if (n === 'heavy') return modifierFactor('pavaj.vehicleLoad.heavy', overrides, 35);"],
  ["  if (n === 'car') return 1.15;", "  if (n === 'car') return modifierFactor('pavaj.vehicleLoad.car', overrides, 15);"],
  [SIG_FIND, SIG_REPL],
  ['resolveLoadMultiplier(diagnostic.vehicleLoad)', 'resolveLoadMultiplier(diagnostic.vehicleLoad, overrides)'],
  ['resolvePatternMultiplier(diagnostic.patternComplexity)', 'resolvePatternMultiplier(diagnostic.patternComplexity, overrides)'],
]);

patch('roofingDerivation.ts', [
  ['resolveRoofShapeMultiplier(roofShape: unknown): number {', 'resolveRoofShapeMultiplier(roofShape: unknown, overrides?: PricingModifierOverrides): number {'],
  ["  if (n === 'complex') return 1.5;", "  if (n === 'complex') return modifierFactor('acoperis.roofShape.complex', overrides, 50);"],
  ["  if (n === 'l-shape' || n === 'l') return 1.2;", "  if (n === 'l-shape' || n === 'l') return modifierFactor('acoperis.roofShape.l-shape', overrides, 20);"],
  ["  if (n === 't-shape' || n === 'u-shape' || n === 't' || n === 'u') return 1.35;", "  if (n === 't-shape' || n === 't') return modifierFactor('acoperis.roofShape.t-shape', overrides, 35);\n  if (n === 'u-shape' || n === 'u') return modifierFactor('acoperis.roofShape.u-shape', overrides, 35);"],
  [SIG_FIND, SIG_REPL],
  ['resolveRoofShapeMultiplier(roofShape)', 'resolveRoofShapeMultiplier(roofShape, overrides)'],
]);

patch('cleaningDerivation.ts', [
  ['resolveCleaningTypeMultiplier(cleaningType: unknown): number {', 'resolveCleaningTypeMultiplier(cleaningType: unknown, overrides?: PricingModifierOverrides): number {'],
  ["  if (n === 'post_construction') return 1.65;", "  if (n === 'post_construction') return modifierFactor('cleaning.cleaningType.post_construction', overrides, 65);"],
  ["  if (n === 'deep') return 1.35;", "  if (n === 'deep') return modifierFactor('cleaning.cleaningType.deep', overrides, 35);"],
  ["  if (n === 'move_out') return 1.25;", "  if (n === 'move_out') return modifierFactor('cleaning.cleaningType.move_out', overrides, 25);"],
  ['resolveDustMultiplier(afterRepairDustLevel: unknown): number {', 'resolveDustMultiplier(afterRepairDustLevel: unknown, overrides?: PricingModifierOverrides): number {'],
  ["  if (n === 'high') return 1.35;", "  if (n === 'high') return modifierFactor('cleaning.dust.high', overrides, 35);"],
  ["  if (n === 'medium') return 1.15;", "  if (n === 'medium') return modifierFactor('cleaning.dust.medium', overrides, 15);"],
  ['  furniturePresent?: boolean,\n): number {\n  let multiplier = resolveCleaningTypeMultiplier(cleaningType) * resolveDustMultiplier(afterRepairDustLevel);',
   '  furniturePresent?: boolean,\n  overrides?: PricingModifierOverrides,\n): number {\n  let multiplier = resolveCleaningTypeMultiplier(cleaningType, overrides) * resolveDustMultiplier(afterRepairDustLevel, overrides);'],
  [SIG_FIND, SIG_REPL],
  ['resolveCleaningTypeMultiplier(cleaningType);', 'resolveCleaningTypeMultiplier(cleaningType, overrides);'],
  ['resolveDustMultiplier(diagnostic.afterRepairDustLevel);', 'resolveDustMultiplier(diagnostic.afterRepairDustLevel, overrides);'],
  ['    furniturePresent,\n  );', '    furniturePresent,\n    overrides,\n  );'],
]);

patch('facadeDerivation.ts', [
  ['resolveFacadeHeightMultiplier(buildingHeightM: unknown): number {', 'resolveFacadeHeightMultiplier(buildingHeightM: unknown, overrides?: PricingModifierOverrides): number {'],
  ['  return height > 9 ? 1.2 : 1.0;', "  return height > 9 ? modifierFactor('fatade.height.over9m', overrides, 20) : 1.0;"],
  [SIG_FIND, SIG_REPL],
  ['resolveFacadeHeightMultiplier(buildingHeightM)', 'resolveFacadeHeightMultiplier(buildingHeightM, overrides)'],
]);

patch('climaDerivation.ts', [
  ['resolveClimateHeightMultiplier(heightWork: unknown): number {', 'resolveClimateHeightMultiplier(heightWork: unknown, overrides?: PricingModifierOverrides): number {'],
  ["  return readBoolean({ heightWork }, 'heightWork') ? 1.25 : 1.0;", "  return readBoolean({ heightWork }, 'heightWork') ? modifierFactor('clima.heightWork', overrides, 25) : 1.0;"],
  [SIG_FIND, SIG_REPL],
  ['resolveClimateHeightMultiplier(heightWork)', 'resolveClimateHeightMultiplier(heightWork, overrides)'],
]);

if (errors.length) {
  console.error('MISSES:\n' + errors.join('\n'));
  process.exit(1);
}
console.log('All mirror patches applied.');
