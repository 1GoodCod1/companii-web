import { readNumber, readBoolean } from '../utils/diagnosticReader';

type ProjectScope = 'small' | 'medium' | 'enterprise';

function normalizeScope(projectScope: unknown): ProjectScope {
  const normalized = String(projectScope ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  if (normalized.includes('enterprise') || normalized.includes('20+')) return 'enterprise';
  if (normalized.includes('mediu') || normalized.includes('medium') || normalized.includes('6-20')) {
    return 'medium';
  }
  return 'small';
}

function resolveAnalysisHours(projectScope: unknown): number {
  const scope = normalizeScope(projectScope);
  if (scope === 'enterprise') return 32;
  if (scope === 'medium') return 16;
  return 8;
}

function resolveBackendComplexityUnits(backendComplexity: unknown): number {
  const normalized = String(backendComplexity ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  if (normalized.includes('fara') || normalized.includes('fără') || normalized === '') return 0;
  if (normalized.includes('simplu')) return 1;
  if (normalized.includes('mediu')) return 1;
  if (normalized.includes('complex')) return 2;
  return 0;
}

export type DerivedMeasurements = Record<string, number>;

export function deriveItWebMeasurements(diagnostic: Record<string, unknown> | null | undefined): DerivedMeasurements {
  const measurements: DerivedMeasurements = {};

  if (!diagnostic) return measurements;

  const pagesCount = readNumber(diagnostic, 'pagesCount') ?? 0;
  measurements.pagesCount = pagesCount;
  measurements.hasBackendCount = resolveBackendComplexityUnits(diagnostic.backendComplexity);
  measurements.hasCmsCount = readBoolean(diagnostic, 'hasCMS') ? 1 : 0;
  measurements.hasEcommerceCount = readBoolean(diagnostic, 'hasEcommerce') ? 1 : 0;

  measurements.analysisHours = resolveAnalysisHours(diagnostic.projectScope);
  measurements.testingHours = Math.max(8, Math.ceil(pagesCount * 0.5));
  measurements.trainingHours = readBoolean(diagnostic, 'documentationRequired') ? 6 : 2;
  measurements.slaUnits = readBoolean(diagnostic, 'slaRequired') ? 1 : 0;
  measurements.migrationUnits = readBoolean(diagnostic, 'migrationRequired') ? 1 : 0;
  measurements.projectUnits = 1;

  measurements.requiresManualReview = normalizeScope(diagnostic.projectScope) === 'enterprise' ? 1 : 0;

  const designPages = readNumber(diagnostic, 'designPagesCount') ?? 0;
  const frontendPages = readNumber(diagnostic, 'frontendPagesCount') ?? 0;
  measurements.designPageCount = designPages > 0 ? designPages : pagesCount;
  measurements.frontendPageCount = frontendPages > 0 ? frontendPages : pagesCount;

  return measurements;
}
