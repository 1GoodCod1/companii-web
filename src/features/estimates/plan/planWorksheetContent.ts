import type { Plan2dData } from '@/types/estimates';

export function planHasWorksheetContent(plan: Plan2dData | null | undefined): boolean {
  if (!plan) return false;
  if (plan.rooms.length > 0 || plan.points.length > 0) return true;

  const gp = plan.globalParameters;
  if (!gp) return false;

  const numericFields = [gp.baseArea, gp.wallHeight, gp.floorsCount, gp.roofSlope, gp.facadeArea];
  return numericFields.some((value) => typeof value === 'number' && Number.isFinite(value) && value > 0);
}

export function globalParamsHasValues(globalParams: NonNullable<Plan2dData['globalParameters']>): boolean {
  const numericFields = [
    globalParams.baseArea,
    globalParams.wallHeight,
    globalParams.floorsCount,
    globalParams.roofSlope,
    globalParams.facadeArea,
  ];
  return numericFields.some((value) => typeof value === 'number' && Number.isFinite(value) && value > 0);
}
