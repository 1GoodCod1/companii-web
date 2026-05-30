import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src', 'i18n');

function extractBalanced(source, openIdx) {
  let depth = 0;
  let inString = null;
  let escape = false;
  for (let i = openIdx; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];
    if (inString) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '/' && next === '/') { while (i < source.length && source[i] !== '\n') i++; continue; }
    if (ch === '/' && next === '*') { i += 2; while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i++; i++; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { inString = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return source.slice(openIdx, i + 1); }
  }
  throw new Error('Unbalanced');
}

function extractExportBody(source, exportName) {
  const marker = `export const ${exportName} = `;
  const start = source.indexOf(marker);
  const braceStart = source.indexOf('{', start + marker.length);
  return extractBalanced(source, braceStart);
}

function skipWhitespaceAndComments(inner, start) {
  let i = start;
  while (i < inner.length) {
    if (/[\s,]/.test(inner[i])) { i++; continue; }
    if (inner[i] === '/' && inner[i + 1] === '/') { while (i < inner.length && inner[i] !== '\n') i++; continue; }
    if (inner[i] === '/' && inner[i + 1] === '*') { i += 2; while (i < inner.length && !(inner[i] === '*' && inner[i + 1] === '/')) i++; i += 2; continue; }
    break;
  }
  return i;
}

function splitTopLevelEntries(objectLiteral) {
  const inner = objectLiteral.slice(1, -1);
  const entries = [];
  let i = 0;
  while (i < inner.length) {
    i = skipWhitespaceAndComments(inner, i);
    if (i >= inner.length) break;
    const keyMatch = inner.slice(i).match(/^([A-Za-z0-9_]+|['"][^'"]+['"])\s*:/);
    if (!keyMatch) { console.log('STOP at', i, JSON.stringify(inner.slice(i, i + 80))); break; }
    const key = keyMatch[1].replace(/^['"]|['"]$/g, '');
    i += keyMatch[0].length;
    while (i < inner.length && /\s/.test(inner[i])) i++;
    const value = extractBalanced(inner, i);
    entries.push(key);
    i += value.length;
  }
  return entries;
}

const source = fs.readFileSync(path.join(root, 'companii.ro.ts'), 'utf8');
const body = extractExportBody(source, 'companiiRo');
console.log(splitTopLevelEntries(body));
