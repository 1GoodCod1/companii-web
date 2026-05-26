import type { Plan2dData } from '@/types/estimates';

export const EMPTY_PLAN: Plan2dData = { rooms: [], points: [] };

export const DUPLICATE_DIAGNOSTIC_KEYS = [
  'roofArea',
  'gutterLengthM',
  'roomCount',
  'acUnits',
  'finishArea',
  'wallHeight',
  'windowCount',
  'doorCount',
  'cabinetCount',
  'wardrobeCount',
  'cleanArea',
  'networkPoints',
  'apCount',
  'cameraCount',
  'panelCount',
  'builtArea',
  'storyCount',
  'pavementArea',
  'borderLengthM',
  'facadeArea',
  'scaffoldingArea',
] as const;
