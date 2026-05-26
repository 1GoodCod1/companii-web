import { SITE_URL } from './config.mjs';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * @param {Array<{ path: string, lastmod?: string }>} items
 */
export function buildUrlSetXml(items) {
  const urls = items
    .map((item) => {
      const loc = `${SITE_URL}${item.path.startsWith('/') ? item.path : `/${item.path}`}`;
      const lastmod = item.lastmod
        ? `<lastmod>${escapeXml(item.lastmod.slice(0, 10))}</lastmod>`
        : '';
      return `<url><loc>${escapeXml(loc)}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`;
}

/**
 * @param {string[]} sitemapPaths - paths relative to site root (e.g. /sitemap-pages-1.xml)
 */
export function buildSitemapIndexXml(sitemapPaths) {
  const entries = sitemapPaths
    .map((p) => {
      const loc = p.startsWith('http') ? p : `${SITE_URL}${p}`;
      return `<sitemap><loc>${escapeXml(loc)}</loc></sitemap>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</sitemapindex>\n`;
}
