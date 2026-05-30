/**
 * One-time helper to split monolithic i18n files into modules.
 * Run: node scripts/split-i18n-translations.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src', 'i18n');

function extractExportBody(source, exportName) {
  const marker = `export const ${exportName} = `;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Export ${exportName} not found`);
  const braceStart = source.indexOf('{', start + marker.length);
  const body = extractBalanced(source, braceStart);
  const suffix = source.slice(braceStart + body.length).trimStart();
  const asConst = suffix.startsWith('as const') ? ' as const' : '';
  return { body, asConst };
}

function extractBalanced(source, openIdx) {
  let depth = 0;
  let inString = null;
  let escape = false;

  for (let i = openIdx; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === inString) {
        inString = null;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i++;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      inString = ch;
      continue;
    }

    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return source.slice(openIdx, i + 1);
    }
  }

  throw new Error('Unbalanced braces');
}

function skipWhitespaceAndComments(inner, start) {
  let i = start;
  while (i < inner.length) {
    if (/[\s,]/.test(inner[i])) {
      i++;
      continue;
    }
    if (inner[i] === '/' && inner[i + 1] === '/') {
      while (i < inner.length && inner[i] !== '\n') i++;
      continue;
    }
    if (inner[i] === '/' && inner[i + 1] === '*') {
      i += 2;
      while (i < inner.length && !(inner[i] === '*' && inner[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    break;
  }
  return i;
}

function extractValue(inner, i) {
  if (inner[i] === '{') return extractBalanced(inner, i);

  if (inner[i] === "'" || inner[i] === '"' || inner[i] === '`') {
    const quote = inner[i];
    let escape = false;
    for (let j = i + 1; j < inner.length; j++) {
      if (escape) {
        escape = false;
        continue;
      }
      if (inner[j] === '\\') {
        escape = true;
        continue;
      }
      if (inner[j] === quote) return inner.slice(i, j + 1);
    }
    throw new Error('Unclosed string literal');
  }

  const match = inner.slice(i).match(/^[^,\n\r]+/);
  if (!match) throw new Error(`Unable to parse value at ${i}`);
  return match[0].trim();
}

function splitTopLevelEntries(objectLiteral) {
  const inner = objectLiteral.slice(1, -1);
  const entries = [];
  let i = 0;

  while (i < inner.length) {
    i = skipWhitespaceAndComments(inner, i);
    if (i >= inner.length) break;

    const keyMatch = inner.slice(i).match(/^([A-Za-z0-9_]+|['"][^'"]+['"])\s*:/);
    if (!keyMatch) break;
    const key = keyMatch[1].replace(/^['"]|['"]$/g, '');
    i += keyMatch[0].length;

    while (i < inner.length && /\s/.test(inner[i])) i++;
    const value = extractValue(inner, i);
    entries.push({ key, value });
    i += value.length;
  }

  return entries;
}

function writeModule(dir, name, exportName, entries, asConst) {
  fs.mkdirSync(dir, { recursive: true });
  const body = entries.map(({ key, value }) => `  ${key}: ${value}`).join(',\n\n');
  const content = `export const ${exportName} = {\n${body},\n}${asConst};\n`;
  fs.writeFileSync(path.join(dir, `${name}.ts`), content, 'utf8');
}

function writeIndex(dir, exportName, imports) {
  const importLines = imports
    .map(({ file, constName }) => `import { ${constName} } from './${file}';`)
    .join('\n');
  const spreads = imports.map(({ constName }) => `  ...${constName},`).join('\n');
  const content = `${importLines}\n\nexport const ${exportName} = {\n${spreads}\n};\n`;
  fs.writeFileSync(path.join(dir, 'index.ts'), content, 'utf8');
}

function splitPublic(lang) {
  const srcPath = path.join(root, 'translations', `public.${lang}.ts`);
  const source = fs.readFileSync(srcPath, 'utf8');
  const exportName = `public${lang === 'ro' ? 'Ro' : 'Ru'}`;
  if (source.includes(`from './public/${lang}'`)) {
    console.log(`public.${lang} already split, skipping`);
    return;
  }
  const { body, asConst } = extractExportBody(source, exportName);
  const entries = splitTopLevelEntries(body);
  const outDir = path.join(root, 'translations', 'public', lang);
  const prefix = `public${lang === 'ro' ? 'Ro' : 'Ru'}`;

  const groups = {
    shared: ['seo', 'footer', 'cookieConsent', 'serviceDuration'],
    landing: ['landing', 'landingMocks'],
    companies: ['companies', 'companyCard', 'companyDetail'],
    marketing: ['contacts', 'howItWorks', 'faqPage', 'legal'],
    subscriptions: ['subscriptions'],
  };

  const byKey = Object.fromEntries(entries.map((e) => [e.key, e]));
  const indexImports = [];

  for (const [file, keys] of Object.entries(groups)) {
    const constName = `${prefix}${file[0].toUpperCase()}${file.slice(1)}`;
    const groupEntries = keys.map((k) => {
      if (!byKey[k]) throw new Error(`Missing key ${k} in public.${lang}`);
      return byKey[k];
    });
    writeModule(outDir, file, constName, groupEntries, asConst);
    indexImports.push({ file, constName });
  }

  writeIndex(outDir, prefix, indexImports);

  const reexport = `export { ${prefix} } from './public/${lang}';\n`;
  fs.writeFileSync(srcPath, reexport, 'utf8');
}

function splitCompanii(lang) {
  const exportName = lang === 'ro' ? 'companiiRo' : 'companiiRu';
  const srcPath = path.join(root, `companii.${lang}.ts`);
  const source = fs.readFileSync(srcPath, 'utf8');
  if (source.includes(`from './translations/companii/${lang}'`)) {
    console.log(`companii.${lang} already split, skipping`);
    return;
  }
  const { body, asConst } = extractExportBody(source, exportName);
  const entries = splitTopLevelEntries(body);
  const outDir = path.join(root, 'translations', 'companii', lang);
  const prefix = lang === 'ro' ? 'companiiRo' : 'companiiRu';

  const topGroups = {
    nav: ['nav'],
    auth: ['auth'],
    cabinet: ['cabinet'],
    portal: ['portal'],
    admin: ['admin'],
    settings: ['settings'],
    misc: ['versions', 'comments'],
  };

  const byKey = Object.fromEntries(entries.map((e) => [e.key, e]));
  const indexImports = [];

  for (const [file, keys] of Object.entries(topGroups)) {
    const constName = `${prefix}${file[0].toUpperCase()}${file.slice(1)}`;
    const groupEntries = keys.map((k) => {
      if (!byKey[k]) throw new Error(`Missing top-level key ${k} in ${exportName}`);
      return byKey[k];
    });
    writeModule(outDir, file, constName, groupEntries, asConst);
    indexImports.push({ file, constName });
  }

  // Split company subtree
  const companyEntry = byKey.company;
  const companyEntries = splitTopLevelEntries(companyEntry.value);
  const companyByKey = Object.fromEntries(companyEntries.map((e) => [e.key, e]));
  const companyDir = path.join(outDir, 'company');

  const companyGroups = {
    shell: [
      'dashboard',
      'profile',
      'team',
      'servicii',
      'cereri',
      'clienti',
      'lucrari',
      'calendar',
      'oferte',
      'smete',
      'smeteTemplates',
      'facturi',
      'recenzii',
      'subscription',
      'settings',
      'audit',
      'sections',
      'roles',
      'dashboardPage',
    ],
    crm: ['leadsPage', 'customersPage'],
    estimates: ['estimatesPage', 'estimatesTemplatesPage', 'estimateWizardPage', 'estimateWizard'],
    fsm: ['fsm'],
    team: ['branding', 'reviewsUi', 'teamPage', 'gates', 'profilePage', 'profileEditor', 'teamInvitePage'],
    operations: [
      'calendarPage',
      'interventionsPage',
      'subscriptionPage',
      'auditPage',
      'servicesPage',
      'reviewsPage',
      'quotesPage',
      'invoicesPage',
      'workSheetPage',
      'myWorksheets',
    ],
  };

  const companyImports = [];
  for (const [file, keys] of Object.entries(companyGroups)) {
    const constName = `${prefix}Company${file[0].toUpperCase()}${file.slice(1)}`;
    const groupEntries = keys.map((k) => {
      if (!companyByKey[k]) throw new Error(`Missing company.${k} in companii.${lang}`);
      return companyByKey[k];
    });
    writeModule(companyDir, file, constName, groupEntries, asConst);
    companyImports.push({ file, constName });
  }

  const companyImportLines = companyImports
    .map(({ file, constName }) => `import { ${constName} } from './company/${file}';`)
    .join('\n');
  const companySpreads = companyImports.map(({ constName }) => `    ...${constName},`).join('\n');
  const companyIndex = `${companyImportLines}\n\nexport const ${prefix}Company = {\n  company: {\n${companySpreads}\n  },\n};\n`;
  fs.writeFileSync(path.join(outDir, 'company.ts'), companyIndex, 'utf8');
  indexImports.push({ file: 'company', constName: `${prefix}Company` });

  writeIndex(outDir, exportName, indexImports);

  const reexport = `export { ${exportName} } from './translations/companii/${lang}';\n`;
  fs.writeFileSync(srcPath, reexport, 'utf8');
}

for (const lang of ['ro', 'ru']) {
  splitPublic(lang);
  splitCompanii(lang);
}

console.log('i18n split complete');
