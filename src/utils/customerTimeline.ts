import { ESTIMATE_STATUS_TONES } from '@/constants/estimateStatus.constants';
import { INTERVENTION_TIMELINE_STATUS_TONES } from '@/constants/interventionStatus.constants';
import type { EstimateProjectStatus } from '@/types/estimates';
import type { InterventionStatus } from '@/types/fsm';
import type { CustomerTimelineItemDto } from '@/types/fsm';
import { isEstimateStatus } from '@/utils/estimateStatus';
import { estimateStatusLabel, interventionStatusLabel } from '@/utils/i18nStatusLabels';

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
