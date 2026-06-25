import type { CompanyRole } from '@/entities/company/model/roles.types';
import { INTERVENTION_STATUS } from '@/entities/fsm/model/interventionStatus.constants';
import { INVOICE_PAYMENT_STATUS } from '@/entities/fsm/model/invoicePaymentStatus.constants';
import { QUOTE_STATUS } from '@/entities/fsm/model/quoteStatus.constants';
import { LEAD_STATUS } from '@/entities/fsm/model/leadStatus.constants';

export type InterventionStatus =
  (typeof INTERVENTION_STATUS)[keyof typeof INTERVENTION_STATUS];

export type QuoteStatus = (typeof QUOTE_STATUS)[keyof typeof QUOTE_STATUS];

export type InvoicePaymentStatus =
  (typeof INVOICE_PAYMENT_STATUS)[keyof typeof INVOICE_PAYMENT_STATUS];

export interface CustomerDto {
  id: string;
  companyId: string;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  portalUserId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyMemberDto {
  id: string;
  companyId: string;
  userId: string;
  role: CompanyRole;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt?: string;
  joinedAt?: string | null;
  fullName?: string;
  phone?: string | null;
  email?: string | null;
  specialization?: string | null;
  isActive?: boolean;
  user?: {
    id: string;
    email: string;
    phone?: string | null;
    firstName?: string;
    lastName?: string;
  };
  _count?: {
    interventions?: number;
  };
}

export interface InterventionNoteDto {
  id: string;
  interventionId: string;
  authorMemberId: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author?: {
    id: string;
    fullName?: string;
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
    };
  };
}

export interface InterventionHistoryDto {
  id: string;
  interventionId: string;
  fromStatus?: InterventionStatus | null;
  toStatus: InterventionStatus;
  changedByMemberId: string;
  note?: string | null;
  changedAt: string;
  changedBy?: {
    id: string;
    fullName?: string;
    user?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

export interface InterventionAssignmentDto {
  memberId: string;
  isLead: boolean;
  member: {
    id: string;
    fullName: string | null;
    phone?: string | null;
    email?: string | null;
    specialization?: string | null;
  };
}

export interface InterventionCrewDto {
  id: string;
  name: string;
  color: string | null;
}

export interface InterventionDto {
  id: string;
  companyId: string;
  customerId: string;
  technicianId?: string | null;
  crewId?: string | null;
  number: string;
  type: string;
  description: string;
  address: string;
  status: InterventionStatus;
  scheduledAt?: string | null;
  estimatedPrice?: number | null;
  finalPrice?: number | null;
  internalNotes?: string | null;
  estimateProjectId?: string | null;
  estimateStageId?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: CustomerDto;
  technician?: CompanyMemberDto;
  assignments?: InterventionAssignmentDto[];
  crew?: InterventionCrewDto | null;
  notes?: InterventionNoteDto[];
  history?: InterventionHistoryDto[];
  quotes?: QuoteDto[];
  invoice?: InvoiceDto;
  photos?: InterventionPhotoDto[];
  checklistProgress?: Record<string, boolean>;
}

export type InterventionPhotoDto = {
  id: string;
  interventionId: string;
  fileKey: string;
  sortOrder: number;
};

export type CompanyLeadStatus = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];
export type CompanyLeadSource =
  | 'SERVICE_REQUEST'
  | 'PROJECT_REQUEST'
  | 'MANUAL'
  | 'PHONE'
  | 'WEBSITE'
  | 'BOOKING';

export interface CompanyLeadDto {
  id: string;
  companyId: string;
  customerId?: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail?: string | null;
  message?: string | null;
  address?: string | null;
  status: CompanyLeadStatus;
  source: CompanyLeadSource;
  categoryId?: string | null;
  serviceTitle?: string | null;
  estimatedBudget?: number | null;
  estimateProjectId?: string | null;
  estimateProject?: {
    id: string;
    number: string;
    title: string;
    status: string;
  } | null;
  scheduledAt?: string | null;
  notes?: string | null;
  convertedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; slug?: string } | null;
  interventions?: {
    id: string;
    number: string;
    type: string;
  }[];
}

export interface CompanyServiceDto {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  defaultPrice: number;
  currency?: string;
  durationMinutes?: number | null;
  categoryId?: string | null;
  category?: { id: string; name: string; slug?: string } | null;
  materialsCost?: number | null;
  vatRate?: number | null;
  isPublished?: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerTimelineItemDto {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  status?: string;
  at: string;
  meta?: Record<string, unknown>;
}

export interface CustomerTimelineGroupDto {
  id: string;
  kind: 'work' | 'request';
  title: string;
  status?: string;
  statusType?: string;
  at: string;
  interventionId?: string;
  steps: CustomerTimelineItemDto[];
}

export interface CustomerTimelineDto {
  customer: CustomerDto;
  groups: CustomerTimelineGroupDto[];
}

export interface CalendarBoardDto {
  scheduled: InterventionDto[];
  unscheduled: InterventionDto[];
  openLeads: CompanyLeadDto[];
}

export interface QuoteLineDto {
  id: string;
  quoteId: string;
  companyServiceId?: string | null;
  description: string;
  qty: number;
  unitPrice: number;
  vatRate?: number | null;
}

export interface QuoteDto {
  id: string;
  companyId: string;
  customerId: string;
  interventionId?: string | null;
  number: string;
  status: QuoteStatus;
  total: number;
  validUntil?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: CustomerDto;
  lines?: QuoteLineDto[];
  intervention?: InterventionDto;
}

export interface InvoiceDto {
  id: string;
  companyId: string;
  interventionId?: string | null;
  number: string;
  amount: number;
  tvaAmount: number;
  tvaRate: number;
  paymentStatus: InvoicePaymentStatus;
  paidAmount?: number;
  dueDate?: string | null;
  pdfFileKey?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  issuedAt: string;
  paymentProofFileKey?: string | null;
  paymentProofSubmittedAt?: string | null;
  paymentProofConfirmedAt?: string | null;
  paymentProofRejectedReason?: string | null;
  paymentProofRejectedAt?: string | null;
  intervention?: InterventionDto;
}
