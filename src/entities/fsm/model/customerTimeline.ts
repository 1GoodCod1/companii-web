import type { TFunction } from 'i18next';
import { ESTIMATE_STATUS_TONES } from '@/entities/estimate/model/estimateStatus.constants';
import { INTERVENTION_TIMELINE_STATUS_TONES } from '@/entities/fsm/model/interventionStatus.constants';
import type { EstimateProjectStatus } from '@/entities/estimate/model/estimates';
import type { InterventionStatus } from '@/entities/fsm/model/types';
import type { CustomerTimelineGroupDto, CustomerTimelineDto, CustomerTimelineItemDto } from '@/entities/fsm/model/types';
import { isEstimateStatus } from '@/entities/estimate/model/estimateStatus';
import { estimateStatusLabel } from '@/entities/estimate/model/i18nStatusLabels';
import {
  interventionStatusLabel,
  leadStatusLabel,
  paymentStatusLabel,
  quoteStatusLabel,
} from '@/entities/fsm/model/i18nStatusLabels';

export function timelineHref(item: CustomerTimelineItemDto): string | null {
  const meta = item.meta ?? {};
  if (item.type === 'intervention' && typeof meta.interventionId === 'string') {
    return `/company/lucrari?selectedId=${meta.interventionId}`;
  }
  if (item.type === 'quote' && typeof meta.quoteId === 'string') {
    return `/company/oferte?selectedId=${meta.quoteId}`;
  }
  if (item.type === 'estimate' && typeof meta.estimateId === 'string') {
    return `/company/smete/${meta.estimateId}`;
  }
  if (item.type === 'invoice' && typeof meta.invoiceId === 'string') {
    return `/company/facturi?selectedId=${meta.invoiceId}`;
  }
  return null;
}

export function timelineStepTypeLabel(type: string, t: TFunction): string {
  return t(`company.fsm.customers.detail.timeline.stepTypes.${type}`, {
    defaultValue: type.toUpperCase(),
  });
}

export function timelineGroupKindLabel(kind: CustomerTimelineGroupDto['kind'], t: TFunction): string {
  return t(`company.fsm.customers.detail.timeline.groupKinds.${kind}`);
}

export function timelineStatusLabel(item: CustomerTimelineItemDto): string | undefined {
  if (!item.status) return undefined;
  if (item.type === 'intervention') {
    return interventionStatusLabel(item.status as InterventionStatus);
  }
  if (item.type === 'lead') {
    return leadStatusLabel(item.status);
  }
  if (item.type === 'invoice') {
    return paymentStatusLabel(item.status);
  }
  if (item.type === 'quote') {
    return quoteStatusLabel(item.status);
  }
  if (item.type === 'estimate' && isEstimateStatus(item.status)) {
    return estimateStatusLabel(item.status);
  }
  return leadStatusLabel(item.status);
}

export function timelineGroupStatusLabel(group: CustomerTimelineGroupDto, t: TFunction): string | undefined {
  if (!group.status) return undefined;
  if (group.statusType === 'intervention') {
    return interventionStatusLabel(group.status as InterventionStatus, t);
  }
  if (group.statusType === 'lead') {
    return leadStatusLabel(group.status, t);
  }
  if (group.statusType === 'estimate' && isEstimateStatus(group.status)) {
    return estimateStatusLabel(group.status);
  }
  if (group.statusType === 'quote') {
    return quoteStatusLabel(group.status, t);
  }
  return leadStatusLabel(group.status, t);
}

export function timelineStatusTone(item: CustomerTimelineItemDto): 'gray' | 'violet' | 'blue' | 'amber' | 'emerald' {
  if (item.type === 'estimate' && isEstimateStatus(item.status)) {
    return ESTIMATE_STATUS_TONES[item.status as EstimateProjectStatus];
  }
  if (item.type === 'intervention' && item.status) {
    return INTERVENTION_TIMELINE_STATUS_TONES[item.status as InterventionStatus] ?? 'blue';
  }
  if (item.type === 'invoice' && item.status === 'PAID') {
    return 'emerald';
  }
  if (item.type === 'invoice' && item.status === 'OVERDUE') {
    return 'gray';
  }
  if (item.type === 'invoice' && item.status === 'CANCELLED') {
    return 'gray';
  }
  if (item.type === 'invoice' && item.status === 'PENDING_CONFIRMATION') {
    return 'amber';
  }
  if (item.type === 'lead' && item.status === 'CONVERTED') {
    return 'emerald';
  }
  return 'gray';
}

export function timelineGroupStatusTone(
  group: CustomerTimelineGroupDto,
): 'gray' | 'violet' | 'blue' | 'amber' | 'emerald' {
  if (group.statusType === 'intervention' && group.status) {
    return INTERVENTION_TIMELINE_STATUS_TONES[group.status as InterventionStatus] ?? 'blue';
  }
  if (group.statusType === 'lead' && group.status === 'CONVERTED') {
    return 'emerald';
  }
  if (group.statusType === 'estimate' && group.status && isEstimateStatus(group.status)) {
    return ESTIMATE_STATUS_TONES[group.status as EstimateProjectStatus];
  }
  return 'gray';
}

type LegacyCustomerTimelineDto = CustomerTimelineDto & {
  items?: CustomerTimelineItemDto[];
};

export function normalizeCustomerTimeline(data: LegacyCustomerTimelineDto): CustomerTimelineDto {
  if (Array.isArray(data.groups)) {
    return { customer: data.customer, groups: data.groups };
  }

  if (Array.isArray(data.items) && data.items.length > 0) {
    return {
      customer: data.customer,
      groups: data.items.map((item) => ({
        id: item.id,
        kind: item.type === 'intervention' ? 'work' : 'request',
        title: item.title,
        status: item.status,
        statusType: item.type,
        at: item.at,
        interventionId:
          item.type === 'intervention' && typeof item.meta?.interventionId === 'string'
            ? item.meta.interventionId
            : item.type === 'intervention'
              ? item.id
              : undefined,
        steps: [item],
      })),
    };
  }

  return { customer: data.customer, groups: [] };
}
