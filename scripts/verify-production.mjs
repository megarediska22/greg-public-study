import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const files = fs.readdirSync(dist, { recursive: true }).filter(file => /\.(?:js|css|html)$/.test(file));
assert.ok(files.some(file => file.endsWith('.js')), 'Build dist/ before verifying production');
const forbidden = ['gps.qa.progress.v1', 'gps.qa.theme.v1', 'mountLocalQa', 'createQaProgress', 'restartQaLesson', 'qa-bar', 'Очистить ответы этого урока', 'Локальная проверка · все уроки'];
for (const file of files) {
  const content = fs.readFileSync(path.join(dist, file), 'utf8');
  for (const marker of forbidden) assert.equal(content.includes(marker), false, `Development-only marker ${marker} in ${file}`);
  assert.equal(/(?:^|\/)qa[-.]/.test(file), false, `Development QA asset: ${file}`);
}
console.log(`Production isolation verified: ${files.length} HTML/JS/CSS files contain no local QA implementation or keys.`);
