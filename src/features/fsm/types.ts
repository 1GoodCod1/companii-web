export type InterventionStatus =
  | 'NEW'
  | 'SCHEDULED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'INVOICED'
  | 'PAID'
  | 'CANCELLED';

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED';

export type InvoicePaymentStatus = 'UNPAID' | 'PAID' | 'OVERDUE';

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
  role: 'OWNER' | 'MANAGER' | 'MEMBER';
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

export interface InterventionDto {
  id: string;
  companyId: string;
  customerId: string;
  technicianId?: string | null;
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

export type CompanyLeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
export type CompanyLeadSource = 'SERVICE_REQUEST' | 'MANUAL' | 'PHONE' | 'WEBSITE';

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
  scheduledAt?: string | null;
  notes?: string | null;
  convertedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; slug?: string } | null;
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

export interface CustomerTimelineDto {
  customer: CustomerDto;
  items: CustomerTimelineItemDto[];
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
  dueDate?: string | null;
  pdfFileKey?: string | null;
  issuedAt: string;
  intervention?: InterventionDto;
}
