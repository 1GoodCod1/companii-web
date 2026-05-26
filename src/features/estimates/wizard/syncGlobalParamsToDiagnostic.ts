import type { GlobalHouseParams, Plan2dData } from '@/types/estimates';

export function syncGlobalParamsToDiagnostic(
  plan: Plan2dData,
  currentDiag: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...currentDiag };
  const params: Partial<GlobalHouseParams> = plan.globalParameters ?? {};

  // 1. Map global parameters if set by user
  if (params.baseArea != null) {
    next.baseArea = params.baseArea;
    next.roofArea = params.baseArea;
    next.builtArea = params.baseArea;
    next.pavementArea = params.baseArea;
    next.cleanArea = params.baseArea;
    next.finishArea = params.baseArea;
  }
  if (params.wallHeight != null) {
    next.wallHeight = params.wallHeight;
  }
  if (params.floorsCount != null) {
    next.storyCount = params.floorsCount;
    next.roomCount = params.floorsCount;
  }
  if (params.roofSlope != null) {
    next.roofSlope = params.roofSlope;
  }
  if (params.facadeArea != null) {
    next.facadeArea = params.facadeArea;
    next.scaffoldingArea = params.facadeArea;
  }

  // 2. Map Room counts & calculated area
  if (plan.rooms && plan.rooms.length > 0) {
    const totalArea = plan.rooms.reduce((acc, r) => acc + r.width * r.height, 0);
    next.totalFloorArea = totalArea;
    next.roomCount = plan.rooms.length;

    // Set fallbacks if not set
    if (next.roofArea == null) next.roofArea = totalArea;
    if (next.builtArea == null) next.builtArea = totalArea;
    if (next.pavementArea == null) next.pavementArea = totalArea;
    if (next.cleanArea == null) next.cleanArea = totalArea;
    if (next.finishArea == null) next.finishArea = totalArea;
  }

  // 3. Map point counts dynamically to diagnostic answers
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

  // Pavaj
  const borderPoints = pointsCount('border');
  if (borderPoints > 0) next.borderLengthM = borderPoints * 8;

  return next;
}
