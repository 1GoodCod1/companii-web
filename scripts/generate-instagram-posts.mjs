import puppeteer from 'puppeteer';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../public/marketing/instagram');
const htmlPath = path.join(__dirname, 'instagram-posts/template.html');

const posts = [
  { id: 'post-01', file: 'instagram-01-hero-crm-fsm.png' },
  { id: 'post-02', file: 'instagram-02-crm-fsm-unificat.png' },
  { id: 'post-03', file: 'instagram-03-calendar-inteligent.png' },
  { id: 'post-04', file: 'instagram-04-smeta-inteligenta.png' },
  { id: 'post-05', file: 'instagram-05-facturare-automata.png' },
  { id: 'post-06', file: 'instagram-06-profil-public.png' },
];

fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 });
await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');

for (const post of posts) {
  const el = await page.$(`#${post.id}`);
  if (!el) {
    console.error(`Missing element #${post.id}`);
    continue;
  }
  await el.screenshot({
    path: path.join(outDir, post.file),
    type: 'png',
  });
  console.log(`Generated ${post.file}`);
}

await browser.close();
console.log(`Done → ${outDir}`);
