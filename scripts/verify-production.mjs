import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const beta = process.argv.includes('--beta');
const dist = path.join(root, beta ? 'dist-beta' : 'dist');
const files = fs.readdirSync(dist, { recursive: true }).filter(file => /\.(?:js|css|html)$/.test(file));
assert.ok(files.some(file => file.endsWith('.js')), 'Build the requested artifact before verifying it');
const forbidden = ['gps.qa.progress.v1', 'gps.qa.theme.v1', 'mountLocalQa', 'createQaProgress', 'restartQaLesson', 'qa-bar',
  'Очистить ответы этого урока', 'Локальная проверка · все уроки', 'stage06-unreleased', 'pk05-unreleased',
  'diagnostic-bank-v1', 'diagnostic-bank-v2', 'pilot-form-a', 'pilot-form-b', 'fixture-ui', 'Fixture key'];
if (!beta) forbidden.push('fast-placement-v1', 'fast-placement-bank-v1', 'gps.adaptive.v1', 'diag-a-', 'diag-b-', 'online-beta-v1', 'gps.beta.');
for (const file of files) {
  const content = fs.readFileSync(path.join(dist, file), 'utf8');
  for (const marker of forbidden) assert.equal(content.includes(marker), false, `Excluded marker ${marker} in ${file}`);
  assert.equal(/(?:^|\/)qa[-.]/.test(file), false, `Development QA asset: ${file}`);
}
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
assert.ok(html.includes(beta ? "localStorage.getItem('gps.beta.theme.v1')" : "localStorage.getItem('gps.theme.v1')"),
  'Restore the theme from the selected edition before loading the app');

// Follow only static imports from the entry: rich units and replay keys stay
// deferred. Beta uses the projected fast bank and excludes the legacy bank.
const manifest = JSON.parse(fs.readFileSync(path.join(dist, '.vite/manifest.json'), 'utf8'));
const entries = Object.keys(manifest);
assert.equal(entries.some(key => /adaptivePilot|content\/diagnostic\//.test(key)), false, 'Localhost pilot and R/P bank must stay out of releases');
if (beta) {
  assert.ok(html.includes('src="/greg-public-study/beta/assets/'), 'Beta assets must use the dedicated Pages base');
  assert.ok(entries.some(key => /AdaptivePage/.test(key)) && entries.some(key => /content\/onlineBeta/.test(key)),
    'Beta must include the adaptive host and fast placement entry');
  const betaAssets = files.filter(file => file.endsWith('.js')).map(file => fs.readFileSync(path.join(dist, file), 'utf8')).join('');
  for (const marker of ['online-beta-v1', 'fast-placement-bank-v1', 'gps.beta.progress.v1', 'gps.beta.adaptive.v1', 'gps.beta.theme.v1'])
    assert.ok(betaAssets.includes(marker), `Missing Beta entry or key ${marker}`);
} else {
  assert.equal(entries.some(key => /AdaptivePage|AdaptiveRoot|onlineBeta|adaptive\/fast\/|content\/fast-placement\//.test(key)), false,
    'Stable build must exclude both diagnostic banks and the Beta host');
}
console.log(`${beta ? 'Beta' : 'Stable production'} isolation verified across ${files.length} HTML/JS/CSS files.`);

const initial = new Set();
function visit(key) {
  if (initial.has(key)) return;
  initial.add(key);
  for (const dependency of manifest[key]?.imports ?? []) visit(dependency);
}
for (const [key, chunk] of Object.entries(manifest)) if (chunk.isEntry) visit(key);
const generatedCatalog = fs.readFileSync(path.join(root, 'src/content/extension/generated/catalog.ts'), 'utf8');
const authoredNumbers = [...generatedCatalog.matchAll(/"id": "unit-(\d{3})"/g)].map(match => match[1]);
for (const number of authoredNumbers) {
  for (const key of [`src/content/extension/units/${number}.json`, `src/content/extension/generated/replay-unit-${number}.ts`]) {
    assert.ok(manifest[key], `Missing independent extension chunk: ${key}`);
  }
}
const deferred = Object.entries(manifest).filter(([key]) => /extension\/(?:units\/\d{3}\.json|generated\/replay-unit-)/.test(key));
for (const [key, chunk] of deferred) {
  assert.equal(initial.has(key), false, `Extension content eagerly imported: ${key}`);
  assert.equal(chunk.isDynamicEntry, true, `Extension content lacks a lazy entry: ${key}`);
}
const initialBytes = [...initial].reduce((sum, key) => sum + fs.statSync(path.join(dist, manifest[key].file)).size, 0);
console.log(`Lazy loading verified: ${deferred.length} deferred unit/replay chunks; initial JavaScript ${initialBytes} bytes.`);
