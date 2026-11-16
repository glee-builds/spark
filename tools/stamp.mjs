// Stamps sw.js with a fingerprint of every app file.
//
// Why: the phone keeps a saved copy of the app for offline use. It only
// fetches a new copy when sw.js itself changes. The fingerprint changes
// whenever any app file changes, so every update reaches the phone, and
// always as a complete set (never a mix of old and new files).
//
// Run after changing any app file:   node tools/stamp.mjs
// A test (tests/offline.test.js) fails if you forget.

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const root = new URL('../', import.meta.url);

// The files listed in sw.js, in order (without './').
export function listedFiles() {
  const sw = readFileSync(new URL('sw.js', root), 'utf8');
  return sw.slice(sw.indexOf('const FILES = ['), sw.indexOf('];'))
    .match(/'[^']+'/g).map((s) => s.slice(1, -1)).filter((f) => f !== './');
}

// A short fingerprint of the contents of every listed file.
export function fingerprint() {
  const hash = createHash('sha256');
  for (const file of listedFiles()) {
    hash.update(file);
    hash.update(readFileSync(new URL(file, root)));
  }
  return hash.digest('hex').slice(0, 12);
}

export function stampedVersion() {
  const sw = readFileSync(new URL('sw.js', root), 'utf8');
  const match = sw.match(/const VERSION = '([^']*)';/);
  return match ? match[1] : null;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = new URL('sw.js', root);
  const sw = readFileSync(path, 'utf8');
  const version = fingerprint();
  writeFileSync(path, sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`));
  console.log(`sw.js stamped with version ${version}`);
}
