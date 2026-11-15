// Tests for the starter library itself: the format of every starter.
// Run with: node --test

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LIBRARY_FILES } from '../src/library.js';
import { problems } from '../src/validate.js';

function load(name) {
  return JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
}

export const library = LIBRARY_FILES.flatMap(load);

test('every starter follows docs/starter-format.md', () => {
  const found = library.flatMap(problems);
  assert.deepEqual(found, []);
});

test('every starter has its own id', () => {
  const ids = library.map((s) => s.id);
  const repeats = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.deepEqual(repeats, []);
});
