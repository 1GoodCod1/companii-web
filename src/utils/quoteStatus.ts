import {
  QUOTE_STATUS_BADGE_CLASSES,
  QUOTE_STATUS_CODES,
  QUOTE_STATUS_DEFAULT_BADGE_CLASS,
} from '@/constants/quoteStatus.constants';
import type { QuoteStatus } from '@/types/fsm';

const QUOTE_STATUS_SET = new Set<string>(QUOTE_STATUS_CODES);

export function isQuoteStatus(value: unknown): value is QuoteStatus {
  return typeof value === 'string' && QUOTE_STATUS_SET.has(value);
}

export function getQuoteStatusStyle(status: string): string {
  return QUOTE_STATUS_BADGE_CLASSES[status] ?? QUOTE_STATUS_DEFAULT_BADGE_CLASS;
}
