export type PortalRequestSuccessType =
  | 'service'
  | 'booking'
  | 'booking-confirmed'
  | 'project';

export interface PortalRequestSuccessState {
  type: PortalRequestSuccessType;
  companyName: string;
  companySlug: string;
  serviceName?: string;
  projectTitle?: string;
  scheduledAt?: string | null;
  leadId: string;
  interventionId?: string | null;
}
