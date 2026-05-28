/**
 * Контракт Plan2dData — синхронизирован с
 * companii-api/src/modules/estimates/pricing/plan2d.types.ts (задача A-03).
 *
 * `globalParameters` сохраняется в plan2d и синхронизируется в diagnosticAnswers
 * при save plan (см. syncGlobalParamsToDiagnostic).
 */

export type Plan2dWorkContext = 'indoor' | 'roof' | 'facade' | 'general';

export type Plan2dRoomShapeType = 'rectangle' | 'l-shape' | 't-shape' | 'u-shape';

export type Plan2dRoofType = 'flat' | 'gable' | 'hip';

/** @deprecated Prefer Plan2dGlobalParameters — alias for backward compatibility. */
export type GlobalHouseParams = Plan2dGlobalParameters;

export type Plan2dGlobalParameters = {
  workContext: Plan2dWorkContext;
  baseArea?: number;
  wallHeight?: number;
  floorsCount?: number;
  roofSlope?: number;
  facadeArea?: number;
};

export type Plan2dRoom = {
  id: string;
  name: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  unit?: string;
  shapeType?: Plan2dRoomShapeType;
  roofType?: Plan2dRoofType;
  roofPitch?: number;
  connectedRoomIds?: string[];
};

export type Plan2dPoint = {
  id: string;
  roomId?: string;
  type: string;
  label?: string;
  x?: number;
  y?: number;
  elevation?: number;
};

export type Plan2dData = {
  rooms: Plan2dRoom[];
  points: Plan2dPoint[];
  globalParameters?: Plan2dGlobalParameters;
};
