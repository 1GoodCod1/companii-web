import { ESTIMATE_STATUS, ESTIMATE_STATUS_CODES } from '@/entities/estimate/model/estimateStatus.constants';
import type { EstimateProjectStatus } from '@/entities/estimate/model/estimates';

const ESTIMATE_STATUS_SET = new Set<string>(ESTIMATE_STATUS_CODES);

export function isEstimateStatus(value: unknown): value is EstimateProjectStatus {
  return typeof value === 'string' && ESTIMATE_STATUS_SET.has(value);
}

export { ESTIMATE_STATUS };
