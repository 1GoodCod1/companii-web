import { ESTIMATE_STATUS } from '@/constants/estimateStatus.constants';
import type {
  BlueprintStageDef,
  EstimateBlueprintConfig,
} from '@/types/estimate-blueprint-config.types';
import type { Plan2dData, Plan2dRoofType, Plan2dRoomShapeType } from '@/types/estimate-plan2d.types';

export type {
  BlueprintCustomField,
  BlueprintDiagnosticQuestion,
  BlueprintPlanPointType,
  BlueprintPricingRule,
  BlueprintPricingRuleEnabledWhen,
  BlueprintSiteType,
  BlueprintStageDef,
  BlueprintWizardStep,
  BlueprintWorkModule,
  EstimateBlueprintConfig,
} from '@/types/estimate-blueprint-config.types';

export type { EstimateMeasurementUnit } from '@/constants/estimateMeasurementUnits.constants';
export { ESTIMATE_MEASUREMENT_UNITS, isEstimateMeasurementUnit, normalizeEstimateUnit } from '@/constants/estimateMeasurementUnits.constants';

export type {
  GlobalHouseParams,
  Plan2dData,
  Plan2dGlobalParameters,
  Plan2dPoint,
  Plan2dRoom,
  Plan2dRoofType,
  Plan2dRoomShapeType,
  Plan2dWorkContext,
} from '@/types/estimate-plan2d.types';

export type EstimateSoftBadgeTone = 'gray' | 'blue' | 'violet' | 'amber' | 'emerald';

export type EstimateProjectStatus =
  (typeof ESTIMATE_STATUS)[keyof typeof ESTIMATE_STATUS];

export type EstimateStageKind = BlueprintStageDef['kind'];

/** @deprecated Prefer Plan2dRoomShapeType */
export type RoomShapeType = Plan2dRoomShapeType;
/** @deprecated Prefer Plan2dRoofType */
export type RoofType = Plan2dRoofType;

export type EstimateDiagnosticAnswers = {
  enabledWorkModules?: string[];
  [key: string]: unknown;
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
  vatRate?: number | null;
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
  tvaRate?: number | null;
  tvaAmount?: number;
  grandTotalWithVat?: number;
  createdAt: string;
  customer: { id: string; fullName: string; phone: string };
  category: { id: string; name: string; slug: string };
  quote?: { id: string; number: string; status: string } | null;
  stages?: Array<{ id: string; name: string; sortOrder: number; stageTotal: number }>;
};

export type EstimateClientFeedbackKind = 'ACCEPT' | 'REJECT' | 'REQUEST_CHANGES';

export type EstimateClientFeedbackEntry = {
  kind: EstimateClientFeedbackKind;
  comment?: string;
  createdAt: string;
};

export type EstimateAccessDifficulty = 'easy' | 'medium' | 'difficult';
export type EstimateUrgency = 'normal' | 'urgent' | 'emergency';

export type EstimateSanityWarning = {
  key: string;
  severity: 'info' | 'warning';
  message: string;
};

export type EstimateProjectPhotoDto = {
  id: string;
  projectId: string;
  fileKey: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
};

export type EstimateProjectDto = Omit<EstimateProjectListDto, 'stages'> & {
  siteType?: string | null;
  address?: string | null;
  buildingYear?: number | null;
  siteFloor?: number | null;
  accessDifficulty?: EstimateAccessDifficulty | null;
  urgency?: EstimateUrgency | null;
  marginPct?: number;
  riskReservePct?: number;
  laborTotal: number;
  materialTotal: number;
  validUntil?: string | null;
  diagnosticAnswers?: EstimateDiagnosticAnswers | null;
  notes?: string | null;
  clientFeedback?: EstimateClientFeedbackEntry[] | null;
  blueprint?: { id: string; config: EstimateBlueprintConfig } | null;
  sitePlan?: { plan2d: Plan2dData; plan3d?: unknown } | null;
  measurements?: Array<{ key: string; label?: string; value: number; unit: string }>;
  photos?: EstimateProjectPhotoDto[];
  stages: EstimateStageDto[];
  interventions?: Array<{
    id: string;
    number: string;
    status: string;
    type: string;
    scheduledAt: string | null;
    technician: { fullName: string | null } | null;
  }>;
  sourceLead?: {
    id: string;
    serviceTitle?: string | null;
    estimatedBudget?: number | string | null;
    message?: string | null;
  } | null;
};

export type AssignedWorksheetDto = {
  intervention: {
    id: string;
    number: string;
    type: string;
    status: string;
    address: string;
    scheduledAt?: string | null;
  };
  customer: { fullName: string; phone: string } | null;
  project: {
    id: string;
    number: string;
    title: string;
    status: EstimateProjectStatus;
    category: { id: string; name: string; slug: string };
  } | null;
  stage: { id: string; name: string; code: string } | null;
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
  photos?: Array<{ id: string; fileKey: string; sortOrder: number; createdAt: string }>;
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

export interface EstimateVersionSummary {
  id: string;
  version: number;
  label: string | null;
  lineCount: number;
  grandTotal: number;
  createdAt: string;
}

export interface EstimateVersionDiff {
  versionA: number;
  versionB: number;
  lineCountDelta: number;
  grandTotalDelta: number;
  addedLines: string[];
  removedLines: string[];
}

export interface EstimateCommentDto {
  id: string;
  authorKind: 'CLIENT' | 'CONTRACTOR';
  authorId: string;
  body: string;
  createdAt: string;
}
