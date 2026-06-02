import { ESTIMATE_STATUS_TONES } from '@/entities/estimate/model/estimateStatus.constants';
import { INTERVENTION_TIMELINE_STATUS_TONES } from '@/entities/fsm/model/interventionStatus.constants';
import type { EstimateProjectStatus } from '@/entities/estimate/model/estimates';
import type { InterventionStatus } from '@/entities/fsm/model/types';
import type { CustomerTimelineItemDto } from '@/entities/fsm/model/types';
import { isEstimateStatus } from '@/entities/estimate/model/estimateStatus';
import { estimateStatusLabel } from '@/entities/estimate/model/i18nStatusLabels';
import { interventionStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';

export function timelineHref(item: CustomerTimelineItemDto): string | null {
  const meta = item.meta ?? {};
  if (item.type === 'intervention' && typeof meta.interventionId === 'string') {
    return '/company/lucrari';
  }
  if (item.type === 'quote' && typeof meta.quoteId === 'string') {
    return '/company/oferte';
  }
  if (item.type === 'estimate' && typeof meta.estimateId === 'string') {
    return `/company/smete/${meta.estimateId}`;
  }
  if (item.type === 'invoice' && typeof meta.invoiceId === 'string') {
    return '/company/facturi';
  }
  return null;
}

export function timelineStatusLabel(item: CustomerTimelineItemDto): string | undefined {
  if (!item.status) return undefined;
  if (item.type === 'intervention') {
    return interventionStatusLabel(item.status as InterventionStatus);
  }
  if (item.type === 'estimate' && isEstimateStatus(item.status)) {
    return estimateStatusLabel(item.status);
  }
  return item.status;
}

export function timelineStatusTone(item: CustomerTimelineItemDto): 'gray' | 'violet' | 'blue' | 'amber' | 'emerald' {
  if (item.type === 'estimate' && isEstimateStatus(item.status)) {
    return ESTIMATE_STATUS_TONES[item.status as EstimateProjectStatus];
  }
  if (item.type === 'intervention' && item.status) {
    return INTERVENTION_TIMELINE_STATUS_TONES[item.status as InterventionStatus] ?? 'blue';
  }
  return 'violet';
}
