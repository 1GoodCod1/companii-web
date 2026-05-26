import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITEMAP_CHUNK_SIZE, STATIC_ROUTES } from './seo/config.mjs';
import { fetchAllSeoUrls } from './seo/fetch-urls.mjs';
import { buildSitemapIndexXml, buildUrlSetXml } from './seo/xml.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = process.env.DIST_DIR
  ? path.resolve(process.cwd(), process.env.DIST_DIR)
  : path.join(rootDir, 'dist');

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out.length ? out : [[]];
}

async function main() {
  console.log('[sitemap] Fetching URLs from API…');
  let urls;
  try {
    urls = await fetchAllSeoUrls();
  } catch (err) {
    console.warn(
      '[sitemap] API unavailable — falling back to static routes only:',
      err?.message ?? err,
    );
    urls = STATIC_ROUTES.map((p) => ({ path: p }));
  }
  console.log(`[sitemap] ${urls.length} unique URLs`);

  await fs.mkdir(distDir, { recursive: true });

  const chunks = chunk(urls, SITEMAP_CHUNK_SIZE);
  const sitemapFiles = [];

  for (let i = 0; i < chunks.length; i++) {
    const name =
      chunks.length === 1 ? 'sitemap-pages.xml' : `sitemap-pages-${i + 1}.xml`;
    const filePath = path.join(distDir, name);
    await fs.writeFile(filePath, buildUrlSetXml(chunks[i]), 'utf8');
    sitemapFiles.push(`/${name}`);
    console.log(`[sitemap] Wrote ${name} (${chunks[i].length} URLs)`);
  }

  const indexXml = buildSitemapIndexXml(sitemapFiles);
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), indexXml, 'utf8');
  console.log('[sitemap] Wrote sitemap.xml index');
}

main().catch((err) => {
  console.error('[sitemap] Failed:', err);
  process.exit(1);
});
