export {
  ESTIMATE_STATUS,
  ESTIMATE_STATUS_CODES,
  ESTIMATE_STATUS_LABELS,
  ESTIMATE_STATUS_TONES,
  PORTAL_ESTIMATE_ACTION,
} from '@/entities/estimate/model/estimateStatus.constants';
export type { PortalEstimateActionStatus } from '@/entities/estimate/model/estimateStatus.constants';

export const WIZARD_STEP_LABELS: Record<string, string> = {
  object: 'Obiect',
  plan: 'Dimensiuni & Dotări',
  diagnostic: 'Diagnostic',
  stages: 'Etape & preț',
  review: 'Revizuire',
};
