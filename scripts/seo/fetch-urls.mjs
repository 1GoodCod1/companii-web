import {
  API_PREFIX,
  API_URL,
  SEO_API_PAGE_LIMIT,
  SEO_LOCALES,
  SEO_URL_KINDS,
  STATIC_ROUTES,
} from './config.mjs';

/**
 * Catalog "city × category" landing pages. Derived from published companies so
 * only non-empty combinations are emitted (no thin/empty pages in the sitemap).
 * @returns {Promise<Array<{ path: string }>>}
 */
async function fetchCatalogCombos() {
  const combos = new Set();
  let page = 1;
  let pages = 1;

  do {
    const url = new URL(`${API_PREFIX}/companies`, API_URL);
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(SEO_API_PAGE_LIMIT));

    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`[sitemap] companies page ${page} failed: ${res.status}`);

    const data = await res.json();
    const payload = data?.data ?? data;
    const items = payload?.items ?? [];
    const total = payload?.total ?? items.length;
    const limit = payload?.limit ?? SEO_API_PAGE_LIMIT;
    pages = Math.max(1, Math.ceil(total / limit));

    for (const item of items) {
      const citySlug = item?.city?.slug;
      const categorySlug = item?.category?.slug;
      if (citySlug && categorySlug) combos.add(`${citySlug}/${categorySlug}`);
    }

    page += 1;
  } while (page <= pages);

  const out = [];
  for (const combo of combos) {
    for (const locale of SEO_LOCALES) {
      out.push({ path: `/${locale}/companies/${combo}` });
    }
  }
  return out;
}

/**
 * @returns {Promise<Array<{ path: string, lastmod?: string }>>}
 */
export async function fetchAllSeoUrls() {
  const staticItems = STATIC_ROUTES.map((path) => ({ path }));
  const dynamic = [];

  for (const kind of SEO_URL_KINDS) {
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const url = new URL(`${API_PREFIX}/seo/urls`, API_URL);
      url.searchParams.set('kind', kind);
      url.searchParams.set('page', String(page));
      url.searchParams.set('limit', String(SEO_API_PAGE_LIMIT));

      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(
          `[sitemap] SEO API ${kind} page ${page} failed: ${res.status} ${body.slice(0, 200)}`,
        );
      }

      const data = await res.json();
      const payload = data?.data ?? data;
      const items = payload?.items ?? [];
      totalPages = payload?.totalPages ?? 1;

      for (const item of items) {
        if (item?.path) {
          dynamic.push({ path: item.path, lastmod: item.lastmod });
        }
      }

      page += 1;
    }
  }

  try {
    dynamic.push(...(await fetchCatalogCombos()));
  } catch (err) {
    console.warn('[sitemap] catalog city×category combos skipped:', err?.message ?? err);
  }

  const seen = new Set();
  const merged = [];
  for (const item of [...staticItems, ...dynamic]) {
    if (!item.path || seen.has(item.path)) continue;
    seen.add(item.path);
    merged.push(item);
  }

  return merged;
}
