export interface CatalogOptionDto {
  id: string;
  name: string;
  slug: string;
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
  city?: { id: string; name: string; slug: string } | null;
  category?: { id: string; name: string; slug: string } | null;
  galleryImages?: CompanyGalleryImageDto[];
}

export interface PublicCompanyDetailDto extends PublicCompanyListItemDto {
  legalName?: string;
  contactEmail?: string | null;
  isTvaPayer?: boolean;
  galleryImages?: CompanyGalleryImageDto[];
  packages?: Array<{
    id: string;
    title: string;
    description: string;
    price: number | string;
    currency?: string;
    durationMinutes: number;
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
  role?: 'OWNER' | 'MANAGER' | 'MEMBER';
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
