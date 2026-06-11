import type { CompanyLeadDto } from '@/entities/fsm/model/types';

export type { LeadSoftBadgeTone } from '@/entities/fsm/model/lead.types';

export {
  CLOSED_LEAD_STATUSES,
  LEAD_STATUS,
  LEAD_STATUS_CODES,
  LEAD_STATUS_FILTERS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_OPTIONS,
  LEAD_STATUS_TONES,
} from '@/entities/fsm/model/leadStatus.constants';

export const LEAD_SOURCE_LABELS: Record<CompanyLeadDto['source'], string> = {
  SERVICE_REQUEST: 'Cerere serviciu',
  PROJECT_REQUEST: 'Cerere proiect',
  MANUAL: 'Manual',
  PHONE: 'Telefon',
  WEBSITE: 'Site',
  BOOKING: 'Programare online',
};

export const PORTAL_LEAD_SOURCE_LABELS: Record<CompanyLeadDto['source'], string> = {
  ...LEAD_SOURCE_LABELS,
  MANUAL: 'Cerere manuală',
};
