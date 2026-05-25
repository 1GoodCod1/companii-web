import { publicCachePolicy } from '@/config/publicCache';

export const cabinetQueryDefaults = {
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: true,
} as const;

export const publicListQueryOptions = {
  staleTime: publicCachePolicy.listStaleTimeMs,
  gcTime: publicCachePolicy.listGcTimeMs,
  refetchOnWindowFocus: publicCachePolicy.listRefetchOnFocus,
} as const;

export const publicDetailQueryOptions = {
  staleTime: publicCachePolicy.detailStaleTimeMs,
  gcTime: publicCachePolicy.detailGcTimeMs,
  refetchOnWindowFocus: publicCachePolicy.detailRefetchOnFocus,
} as const;

export const publicPlansQueryOptions = {
  staleTime: publicCachePolicy.plansStaleTimeMs,
  gcTime: publicCachePolicy.plansGcTimeMs,
  refetchOnWindowFocus: publicCachePolicy.plansRefetchOnFocus,
} as const;
