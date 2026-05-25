/**
 * Public catalog GET: dev — чаще refetch; prod — дольше staleTime, HTTP Cache-Control с API.
 */
export const isProductionBuild = import.meta.env.PROD;

const PATHS_BUST_HTTP = new Set([
  '/companies',
  '/subscriptions/plans',
]);

const DYNAMIC_PATH_PATTERNS: RegExp[] = [/^\/companies\/[^/]+$/];

export function shouldBustHttpCacheForPublicGetPath(pathWithoutQuery: string): boolean {
  if (PATHS_BUST_HTTP.has(pathWithoutQuery)) return true;
  return DYNAMIC_PATH_PATTERNS.some((re) => re.test(pathWithoutQuery));
}

export const publicCachePolicy = {
  listStaleTimeMs: isProductionBuild ? 120_000 : 60_000,
  listGcTimeMs: isProductionBuild ? 300_000 : 120_000,
  detailStaleTimeMs: isProductionBuild ? 300_000 : 60_000,
  detailGcTimeMs: isProductionBuild ? 600_000 : 300_000,
  plansStaleTimeMs: isProductionBuild ? 300_000 : 120_000,
  plansGcTimeMs: isProductionBuild ? 600_000 : 300_000,
  listRefetchOnFocus: !isProductionBuild,
  detailRefetchOnFocus: !isProductionBuild,
  plansRefetchOnFocus: false,
} as const;
