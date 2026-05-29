import fs from 'node:fs';
const path = 'src/features/estimates/previewEngine.ts';
let s = fs.readFileSync(path, 'utf8');
const fns = [
  'deriveMobilaMeasurements',
  'deriveElektrikaMeasurements',
  'deriveSantehnikaMeasurements',
  'deriveFatadeMeasurements',
  'deriveAcoperisMeasurements',
  'deriveClimaMeasurements',
  'deriveOknaDveriMeasurements',
  'derivePanouriSolareMeasurements',
  'derivePavajMeasurements',
  'deriveCleaningMeasurements',
];
const errors = [];
for (const fn of fns) {
  const find = `${fn}(diagnostic))`;
  const repl = `${fn}(diagnostic, pricingOverrides))`;
  if (!s.includes(find)) { errors.push(`MISSING ${find}`); continue; }
  s = s.replace(find, repl);
}
fs.writeFileSync(path, s);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('previewEngine branches patched.');
