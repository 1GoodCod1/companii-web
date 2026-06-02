import type { QueryClient } from '@tanstack/react-query';
import type {
  CompanyGalleryImageDto,
  CompanyMeResponse,
} from '@/entities/company/model/companies.types';
import { queryKeys } from '@/shared/api/queryKeys';

function patchCompanyGallery(
  me: CompanyMeResponse,
  companyId: string,
  patch: (images: CompanyGalleryImageDto[]) => CompanyGalleryImageDto[],
): CompanyMeResponse {
  return {
    ...me,
    owned: me.owned.map((company) =>
      company.id === companyId
        ? { ...company, galleryImages: patch(company.galleryImages ?? []) }
        : company,
    ),
    memberships: me.memberships.map((membership) =>
      membership.companyId === companyId && membership.company
        ? {
            ...membership,
            company: {
              ...membership.company,
              galleryImages: patch(membership.company.galleryImages ?? []),
            },
          }
        : membership,
    ),
  };
}

export function appendGalleryImagesToCache(
  queryClient: QueryClient,
  companyId: string,
  images: CompanyGalleryImageDto[],
) {
  if (images.length === 0) return;

  queryClient.setQueryData<CompanyMeResponse>(queryKeys.companies.me, (current: CompanyMeResponse | undefined) => {
    if (!current) return current;
    return patchCompanyGallery(current, companyId, (existing) => [...existing, ...images]);
  });
}

export function removeGalleryImageFromCache(
  queryClient: QueryClient,
  companyId: string,
  imageId: string,
) {
  queryClient.setQueryData<CompanyMeResponse>(queryKeys.companies.me, (current: CompanyMeResponse | undefined) => {
    if (!current) return current;
    return patchCompanyGallery(current, companyId, (existing) =>
      existing.filter((image) => image.id !== imageId),
    );
  });
}

export function setGalleryImagesInCache(
  queryClient: QueryClient,
  companyId: string,
  images: CompanyGalleryImageDto[],
) {
  queryClient.setQueryData<CompanyMeResponse>(queryKeys.companies.me, (current: CompanyMeResponse | undefined) => {
    if (!current) return current;
    return patchCompanyGallery(current, companyId, () => images);
  });
}
