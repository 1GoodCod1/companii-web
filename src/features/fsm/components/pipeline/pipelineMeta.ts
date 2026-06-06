import type { TFunction } from 'i18next';
import {
  leadStatusLabel,
  interventionStatusLabel,
  quoteStatusLabel,
  paymentStatusLabel,
} from '@/entities/fsm/model/i18nStatusLabels';
import { LEAD_STATUS } from '@/entities/fsm/model/leadStatus.constants';
import { INTERVENTION_STATUS } from '@/entities/fsm/model/interventionStatus.constants';
import { QUOTE_STATUS } from '@/entities/fsm/model/quoteStatus.constants';
import type { KanbanTone, PipelineEntity } from './pipeline.types';

export const PIPELINE_TABS: ReadonlyArray<{ key: PipelineEntity; labelKey: string }> = [
  { key: 'leads', labelKey: 'company.fsm.pipeline.tabs.leads' },
  { key: 'interventions', labelKey: 'company.fsm.pipeline.tabs.interventions' },
  { key: 'quotes', labelKey: 'company.fsm.pipeline.tabs.quotes' },
  { key: 'invoices', labelKey: 'company.fsm.pipeline.tabs.invoices' },
];

export const COLUMN_TONES: Record<PipelineEntity, Record<string, KanbanTone>> = {
  leads: {
    NEW: 'amber',
    CONTACTED: 'blue',
    QUALIFIED: 'violet',
    IN_PROGRESS: 'indigo',
    CONVERTED: 'emerald',
    LOST: 'gray',
  },
  interventions: {
    NEW: 'gray',
    SCHEDULED: 'violet',
    EN_ROUTE: 'indigo',
    IN_PROGRESS: 'amber',
    COMPLETED: 'emerald',
    INVOICED: 'blue',
    PAID: 'emerald',
    CANCELLED: 'red',
  },
  quotes: {
    DRAFT: 'gray',
    SENT: 'blue',
    ACCEPTED: 'emerald',
    REJECTED: 'red',
    CONVERTED: 'violet',
  },
  invoices: {
    UNPAID: 'amber',
    PENDING_CONFIRMATION: 'blue',
    PAID: 'emerald',
    OVERDUE: 'red',
    CANCELLED: 'gray',
  },
};

export function columnTone(entity: PipelineEntity, status: string): KanbanTone {
  return COLUMN_TONES[entity][status] ?? 'gray';
}

export function columnLabel(entity: PipelineEntity, status: string, t: TFunction): string {
  switch (entity) {
    case 'leads':
      return leadStatusLabel(status, t);
    case 'interventions':
      return interventionStatusLabel(status, t);
    case 'quotes':
      return quoteStatusLabel(status, t);
    case 'invoices':
      return paymentStatusLabel(status, t);
  }
}

// ── Transition maps (mirror companii-api status-transitions.ts + service guards) ──

const LEAD_OPEN: string[] = [
  LEAD_STATUS.NEW,
  LEAD_STATUS.CONTACTED,
  LEAD_STATUS.QUALIFIED,
  LEAD_STATUS.IN_PROGRESS,
];

const INTERVENTION_TRANSITIONS: Record<string, string[]> = {
  [INTERVENTION_STATUS.NEW]: [INTERVENTION_STATUS.SCHEDULED, INTERVENTION_STATUS.CANCELLED],
  [INTERVENTION_STATUS.SCHEDULED]: [INTERVENTION_STATUS.EN_ROUTE, INTERVENTION_STATUS.CANCELLED],
  [INTERVENTION_STATUS.EN_ROUTE]: [INTERVENTION_STATUS.IN_PROGRESS, INTERVENTION_STATUS.CANCELLED],
  [INTERVENTION_STATUS.IN_PROGRESS]: [INTERVENTION_STATUS.COMPLETED, INTERVENTION_STATUS.CANCELLED],
};

const QUOTE_TRANSITIONS: Record<string, string[]> = {
  [QUOTE_STATUS.DRAFT]: [QUOTE_STATUS.ACCEPTED, QUOTE_STATUS.REJECTED],
  [QUOTE_STATUS.SENT]: [QUOTE_STATUS.ACCEPTED, QUOTE_STATUS.REJECTED],
};

/** Valid drop-target statuses from a given status. Empty = card is locked. */
export function allowedTargets(entity: PipelineEntity, from: string): string[] {
  switch (entity) {
    case 'leads':
      return LEAD_OPEN.includes(from) ? [...LEAD_OPEN, LEAD_STATUS.LOST].filter((s) => s !== from) : [];
    case 'interventions':
      return INTERVENTION_TRANSITIONS[from] ?? [];
    case 'quotes':
      return QUOTE_TRANSITIONS[from] ?? [];
    case 'invoices':
      return [];
  }
}

/** i18n key for a whole-pipeline read-only hint, or null when fully draggable. */
export function readOnlyHintKey(entity: PipelineEntity): string | null {
  if (entity === 'quotes') return 'company.fsm.pipeline.quotesHint';
  if (entity === 'invoices') return 'company.fsm.pipeline.invoicesHint';
  return null;
}
