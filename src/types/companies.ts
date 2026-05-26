import type { CompanyRole } from '@/types/roles';

export type CatalogTranslations = Record<string, { name?: string }>;

export interface CatalogOptionDto {
  id: string;
  name: string;
  slug: string;
  translations?: CatalogTranslations | null;
}

export interface CompanyGalleryImageDto {
  id: string;
  url: string;
  caption?: string | null;
  sortOrder: number;
}

export interface PublicCompanyListItemDto {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  rating: number | string;
  totalReviews: number;
  teamSize: number;
  contactPhone?: string | null;
  city?: { id: string; name: string; slug: string; translations?: CatalogTranslations | null } | null;
  category?: { id: string; name: string; slug: string; translations?: CatalogTranslations | null } | null;
  galleryImages?: CompanyGalleryImageDto[];
}

export interface PublicCompanyDetailDto extends PublicCompanyListItemDto {
  legalName?: string;
  contactEmail?: string | null;
  isTvaPayer?: boolean;
  galleryImages?: CompanyGalleryImageDto[];
  services?: Array<{
    id: string;
    name: string;
    description?: string;
    defaultPrice: number | string;
    currency?: string;
    durationMinutes?: number | null;
    category?: { id: string; name: string; slug?: string; translations?: CatalogTranslations | null } | null;
  }>;
  members?: unknown[];
  badges?: unknown[];
}

export interface CompaniesListResponse {
  items: PublicCompanyListItemDto[];
  total: number;
  page: number;
  limit: number;
}

export interface OwnedCompanyDto {
  id: string;
  name: string;
  legalName: string;
  idno: string;
  legalAddress: string;
  cityId: string;
  categoryId?: string | null;
  isTvaPayer: boolean;
  tvaCode?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  showPublicPhone?: boolean;
  showPublicEmail?: boolean;
  description?: string | null;
  slug?: string;
  isPublished?: boolean;
  isVerified?: boolean;
  logoUrl?: string | null;
  galleryImages?: CompanyGalleryImageDto[];
  subscription?: {
    plan?: {
      name: string;
      code?: string;
    };
  };
}

export interface CompanyMembershipDto {
  id?: string;
  companyId: string;
  role?: CompanyRole;
  company: OwnedCompanyDto;
}

export interface CompanyMeResponse {
  memberships: CompanyMembershipDto[];
  owned: OwnedCompanyDto[];
}

export function companyCoverImage(company: PublicCompanyListItemDto): string | null {
  return company.galleryImages?.[0]?.url ?? null;
}

export function companyInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
