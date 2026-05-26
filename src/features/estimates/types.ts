export type EstimateProjectStatus =
  | 'DRAFT'
  | 'MEASURED'
  | 'CALCULATED'
  | 'APPROVED'
  | 'SENT'
  | 'ACCEPTED'
  | 'IN_EXECUTION'
  | 'DONE'
  | 'CANCELLED';

export type EstimateStageKind = 'LABOR' | 'MATERIAL' | 'MIXED';

export type RoomShapeType = 'rectangle' | 'l-shape' | 't-shape' | 'u-shape';
export type RoofType = 'flat' | 'gable' | 'hip';

export type GlobalHouseParams = {
  workContext: 'indoor' | 'roof' | 'facade' | 'general';
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
  shapeType?: RoomShapeType;
  roofType?: RoofType;
  roofPitch?: number; // e.g. degrees, 0 for flat
  connectedRoomIds?: string[]; // IDs of other rooms combined with this one
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
  globalParameters?: GlobalHouseParams;
};

export type BlueprintDiagnosticQuestion = {
  key: string;
  label: string;
  type: 'boolean' | 'number' | 'select';
  options?: string[];
};

export type EstimateBlueprintConfig = {
  wizardSteps: Array<'object' | 'plan' | 'diagnostic' | 'stages' | 'review'>;
  siteTypes: Array<{ value: string; label: string }>;
  planPointTypes: Array<{ type: string; label: string; color: string }>;
  diagnosticQuestions: BlueprintDiagnosticQuestion[];
  defaultStages: Array<{ code: string; name: string; kind: EstimateStageKind }>;
  defaultMarginPct: number;
  defaultLaborRate: number;
};

export type EstimateBlueprintDto = {
  id: string;
  name: string;
  version: number;
  config: EstimateBlueprintConfig;
  category: { id: string; name: string; slug: string };
};

export type EstimateLineDto = {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice?: number;
  lineTotal?: number;
  source: string;
  materialStore?: string | null;
  receiptFileKey?: string | null;
};

export type EstimateStageDto = {
  id: string;
  code: string;
  name: string;
  kind: EstimateStageKind;
  description?: string | null;
  laborHours?: number | null;
  laborRate?: number | null;
  laborCost?: number;
  materialCost?: number;
  stageTotal?: number;
  durationDays?: number | null;
  checklist?: string[] | null;
  lines?: EstimateLineDto[];
};

export type EstimateProjectListDto = {
  id: string;
  number: string;
  title: string;
  status: EstimateProjectStatus;
  grandTotal: number;
  createdAt: string;
  customer: { id: string; fullName: string; phone: string };
  category: { id: string; name: string; slug: string };
  quote?: { id: string; number: string; status: string } | null;
  stages?: Array<{ id: string; name: string; sortOrder: number; stageTotal: number }>;
};

export type EstimateProjectDto = EstimateProjectListDto & {
  siteType?: string | null;
  address?: string | null;
  marginPct: number;
  laborTotal: number;
  materialTotal: number;
  validUntil?: string | null;
  diagnosticAnswers?: Record<string, unknown> | null;
  notes?: string | null;
  blueprint?: { id: string; config: EstimateBlueprintConfig } | null;
  sitePlan?: { plan2d: Plan2dData; plan3d?: unknown } | null;
  measurements?: Array<{ key: string; label?: string; value: number; unit: string }>;
  stages: EstimateStageDto[];
  sourceLead?: {
    id: string;
    estimatedBudget?: number | string | null;
    message?: string | null;
  } | null;
};

export type WorkSheetDto = {
    intervention?: {
    id: string;
    number: string;
    type: string;
    description: string;
    address: string;
    status: string;
    checklistProgress?: Record<string, boolean>;
  };
  customer?: { fullName: string; phone: string; address: string };
  project: {
    id: string;
    number: string;
    title: string;
    category: { id: string; name: string; slug: string };
    customer?: { fullName: string; phone: string };
    address?: string | null;
    status?: EstimateProjectStatus;
    laborTotal?: number;
    materialTotal?: number;
    grandTotal?: number;
  };
  sitePlan?: { plan2d: Plan2dData; plan3d?: unknown } | null;
  stages: Array<{
    id: string;
    code: string;
    name: string;
    description?: string | null;
    laborHours?: number | null;
    durationDays?: number | null;
    checklist?: string[] | null;
    materials: Array<{ description: string; qty: number; unit: string; unitPrice?: number; lineTotal?: number }>;
    laborCost?: number;
    materialCost?: number;
    stageTotal?: number;
  }>;
};
