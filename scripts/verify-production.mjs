import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const files = fs.readdirSync(dist, { recursive: true }).filter(file => /\.(?:js|css|html)$/.test(file));
assert.ok(files.some(file => file.endsWith('.js')), 'Build dist/ before verifying production');
const forbidden = ['gps.qa.progress.v1', 'gps.qa.theme.v1', 'mountLocalQa', 'createQaProgress', 'restartQaLesson', 'qa-bar', 'Очистить ответы этого урока', 'Локальная проверка · все уроки', 'stage06-unreleased', 'pk05-unreleased', 'diagnostic-bank-v1', 'diagnostic-bank-v2', 'fast-placement-v1', 'gps.adaptive.v1', 'pilot-form-a', 'pilot-form-b', 'diag-a-', 'diag-b-', 'fixture-ui', 'Fixture key'];
for (const file of files) {
  const content = fs.readFileSync(path.join(dist, file), 'utf8');
  for (const marker of forbidden) assert.equal(content.includes(marker), false, `Development-only marker ${marker} in ${file}`);
  assert.equal(/(?:^|\/)qa[-.]/.test(file), false, `Development QA asset: ${file}`);
}
console.log(`Production isolation verified: ${files.length} HTML/JS/CSS files contain no local QA, pilot, or diagnostic bank markers.`);

// Follow only static imports from the entry: new rich units and replay keys must
// remain separate lazy chunks, including Vite's dependency preload graph.
const manifest = JSON.parse(fs.readFileSync(path.join(dist, '.vite/manifest.json'), 'utf8'));
assert.equal(Object.keys(manifest).some(key => /AdaptivePage|AdaptiveRoot|adaptivePilot|adaptive\/fast\/|content\/diagnostic\//.test(key)), false,
  'Unapproved adaptive pilot must stay out of production entries');
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
