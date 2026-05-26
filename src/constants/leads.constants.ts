import type { CompanyLeadDto } from '@/types/fsm';

export type { LeadSoftBadgeTone } from '@/types/lead';

export {
  CLOSED_LEAD_STATUSES,
  LEAD_STATUS,
  LEAD_STATUS_CODES,
  LEAD_STATUS_FILTERS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_OPTIONS,
  LEAD_STATUS_TONES,
} from '@/constants/leadStatus.constants';

export const LEAD_SOURCE_LABELS: Record<CompanyLeadDto['source'], string> = {
  SERVICE_REQUEST: 'Cerere serviciu',
  PROJECT_REQUEST: 'Cerere proiect',
  MANUAL: 'Manual',
  PHONE: 'Telefon',
  WEBSITE: 'Site',
};

/** Portal copy — differs for MANUAL label only. */
export const PORTAL_LEAD_SOURCE_LABELS: Record<CompanyLeadDto['source'], string> = {
  ...LEAD_SOURCE_LABELS,
  MANUAL: 'Cerere manuală',
};
