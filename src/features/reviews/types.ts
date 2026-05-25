export interface CompanyReviewDto {
  id: string;
  rating: number;
  comment: string | null;
  clientName: string | null;
  createdAt: string;
  companyId?: string;
  interventionId?: string;
  intervention: {
    id: string;
    number: string;
    type: string;
  };
}

export interface CompanyReviewsPageDto {
  items: CompanyReviewDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CanCreateReviewDto {
  canCreate: boolean;
  interventionId?: string;
  alreadyReviewed?: boolean;
  notReviewable?: boolean;
}

export interface CreateReviewPayload {
  companyId: string;
  interventionId: string;
  rating: number;
  comment?: string;
  clientName?: string;
}

export interface PortalInterventionReviewDto {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface PortalInterventionDto {
  id: string;
  companyId: string;
  customerId: string;
  number: string;
  type: string;
  description: string;
  address: string;
  status: string;
  scheduledAt?: string | null;
  estimatedPrice?: number | null;
  finalPrice?: number | null;
  createdAt: string;
  updatedAt: string;
  canReview: boolean;
  company?: {
    id: string;
    name: string;
    slug: string;
  };
  review?: PortalInterventionReviewDto | null;
}
