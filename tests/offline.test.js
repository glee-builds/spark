// Tests that the offline file list in sw.js matches the files in the repo.
// Run with: node --test

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const sw = readFileSync(new URL('sw.js', root), 'utf8');
const listed = sw.slice(sw.indexOf('const FILES = ['), sw.indexOf('];'))
  .match(/'[^']+'/g).map((s) => s.slice(1, -1)).filter((f) => f !== './');

test('every file in the offline list exists', () => {
  const missing = listed.filter((f) => !existsSync(new URL(f, root)));
  assert.deepEqual(missing, []);
});

test('every file the app loads is in the offline list', () => {
  const needed = [
    'index.html', 'styles.css', 'manifest.webmanifest',
    ...readdirSync(new URL('src/', root)).filter((f) => f !== 'validate.js').map((f) => `src/${f}`),
    ...readdirSync(new URL('data/', root)).map((f) => `data/${f}`),
    ...readdirSync(new URL('assets/', root)).map((f) => `assets/${f}`),
  ];
  const forgotten = needed.filter((f) => !listed.includes(f));
  assert.deepEqual(forgotten, []);
});

test('the manifest points at icons that exist', () => {
  const manifest = JSON.parse(readFileSync(new URL('manifest.webmanifest', root), 'utf8'));
  const missing = manifest.icons.filter((icon) => !existsSync(new URL(icon.src, root)));
  assert.deepEqual(missing, []);
  assert.equal(manifest.display, 'standalone');
});
