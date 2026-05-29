import type { Plan2dData, Plan2dGlobalParameters, Plan2dWorkContext } from '@/types/estimate-plan2d.types';
import { ENABLED_WORK_MODULES_KEY } from '@/features/estimates/diagnostic/workModules';

/**
 * Синхронизирует plan2d.globalParameters → diagnosticAnswers.
 * Логика зеркалит backend: utils/sync-global-params-to-diagnostic.util.ts (A-03).
 *
 * **I-01/I-02 (context-aware mapping):**
 * `baseArea` теперь маппится по `workContext`, а не во все 5 area-ключей сразу:
 *  - roof → roofArea
 *  - facade → не мапит в floor-ключи (facadeArea отдельно)
 *  - indoor → finishArea, cleanArea
 *  - general → builtArea, pavementArea
 *
 * **I-03 (plan не auto-enables modules):**
 * Sync **никогда** не трогает `enabledWorkModules` — модули включаются только
 * явным toggle в DiagnosticStep. Plan лишь заполняет qty-hints.
 */
export function syncGlobalParamsToDiagnostic(
  plan: Plan2dData,
  currentDiag: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...currentDiag };
  const params: Partial<Plan2dGlobalParameters> = plan.globalParameters ?? {};
  const ctx: Plan2dWorkContext = params.workContext ?? 'general';

  if (params.baseArea != null) {
    next.baseArea = params.baseArea;
    applyBaseAreaForContext(next, ctx, params.baseArea);
  }
  if (params.wallHeight != null) {
    next.wallHeight = params.wallHeight;
  }
  if (params.floorsCount != null) {
    next.storyCount = params.floorsCount;
  }
  if (params.roofSlope != null && ctx === 'roof') {
    next.roofSlope = params.roofSlope;
  }
  if (params.facadeArea != null && ctx === 'facade') {
    next.facadeArea = params.facadeArea;
    next.scaffoldingArea = params.facadeArea;
  }

  if (plan.rooms?.length) {
    const totalArea = plan.rooms.reduce((acc, r) => acc + r.width * r.height, 0);
    next.totalFloorArea = totalArea;
    next.roomCount = plan.rooms.length;
    applyBaseAreaForContext(next, ctx, totalArea, { onlyIfMissing: true });
  }

  const pointsCount = (type: string) => plan.points?.filter((p) => p.type === type).length ?? 0;

  // Clima
  const splitCount = pointsCount('indoor');
  if (splitCount > 0) next.acUnits = splitCount;
  const routeCount = pointsCount('route');
  if (routeCount > 0) next.routeLengthM = routeCount * 5;

  // Okna-dveri
  const windowCount = pointsCount('window');
  if (windowCount > 0) next.windowCount = windowCount;
  const doorCount = pointsCount('door') + pointsCount('sliding_door');
  if (doorCount > 0) next.doorCount = doorCount;

  // Mobila
  const cabinetCount = pointsCount('kitchen_cabinet') + pointsCount('table');
  if (cabinetCount > 0) next.cabinetCount = cabinetCount;
  const wardrobeCount = pointsCount('wardrobe') + pointsCount('bed');
  if (wardrobeCount > 0) next.wardrobeCount = wardrobeCount;

  // Elektrika
  const elekSocketCount = pointsCount('socket');
  if (elekSocketCount > 0) next.socketCount = elekSocketCount;
  const elekSwitchCount = pointsCount('switch');
  if (elekSwitchCount > 0) next.switchCount = elekSwitchCount;
  const elekLightCount = pointsCount('light');
  if (elekLightCount > 0) next.lightPointCount = elekLightCount;
  const elekPanelCount = pointsCount('panel');
  if (elekPanelCount > 0) next.panelCount = elekPanelCount;
  const junctionBoxCount = pointsCount('junction_box');
  if (junctionBoxCount > 0) next.junctionBoxCount = junctionBoxCount;
  const dedicatedLinePoints = pointsCount('dedicated_line');
  if (dedicatedLinePoints > 0) next.dedicatedLinesCount = dedicatedLinePoints;

  // Santehnika
  const waterPoints = pointsCount('water');
  const drainPlanPoints = pointsCount('drain');
  const mixerPoints = pointsCount('mixer');
  const toiletPoints = pointsCount('toilet');
  if (waterPoints > 0) next.bathroomPoints = waterPoints;
  if (drainPlanPoints > 0) next.drainPlanPoints = drainPlanPoints;
  if (mixerPoints > 0) next.mixerCount = mixerPoints;
  if (toiletPoints > 0) next.toiletCount = toiletPoints;

  // Cleaning
  const cleanWindows = pointsCount('window_clean');
  if (cleanWindows > 0) next.windowCount = cleanWindows;

  // IT networks
  const netPoints = pointsCount('ethernet');
  if (netPoints > 0) next.networkPoints = netPoints;
  const apPoints = pointsCount('ap');
  if (apPoints > 0) next.apCount = apPoints;
  const camPoints = pointsCount('camera');
  if (camPoints > 0) next.cameraCount = camPoints;

  // Solar panels
  const panelPoints = pointsCount('solar_panel');
  if (panelPoints > 0) next.panelCount = panelPoints;

  // Acoperis
  const gutterPoints = pointsCount('gutter');
  if (gutterPoints > 0) next.gutterLengthM = gutterPoints * 6;

  if (ctx === 'roof') {
    const chimneyPoints = pointsCount('chimney');
    if (chimneyPoints > 0 && (next.chimneyCount == null || next.chimneyCount === 0)) {
      next.chimneyCount = chimneyPoints;
    }
  }

  // Pavaj
  const borderPoints = pointsCount('border');
  if (borderPoints > 0) next.borderLengthM = borderPoints * 8;

  // Fațadă: glafuri ferestre (≈ 1.8 m perimetru per fereastră standard).
  // Auto-fill only if the user hasn't set a value yet — preserves manual override.
  if (ctx === 'facade') {
    const windowSlopePoints = pointsCount('window_slope');
    if (windowSlopePoints > 0 && (next.windowSlopeLengthM == null || next.windowSlopeLengthM === 0)) {
      next.windowSlopeLengthM = windowSlopePoints * 1.8;
    }
  }

  // I-03 safety: never touch enabled modules from plan.
  delete (next as Record<string, unknown>)[ENABLED_WORK_MODULES_KEY + '__fromPlan'];

  return next;
}

function applyBaseAreaForContext(
  target: Record<string, unknown>,
  ctx: Plan2dWorkContext,
  area: number,
  options: { onlyIfMissing?: boolean } = {},
) {
  const set = (key: string) => {
    if (options.onlyIfMissing && target[key] != null) return;
    target[key] = area;
  };

  switch (ctx) {
    case 'roof':
      set('roofArea');
      break;
    case 'facade':
      // facadeArea приходит отдельно через params.facadeArea
      break;
    case 'indoor':
      set('finishArea');
      set('cleanArea');
      break;
    case 'general':
    default:
      set('builtArea');
      set('pavementArea');
      break;
  }
}
