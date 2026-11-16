// Tests for the starter library itself: the format of every starter, and
// that every choice the screens allow leads to enough starters.
// Run with: node --test

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LIBRARY_FILES } from '../src/library.js';
import { problems } from '../src/validate.js';
import { allCombinations } from '../src/config.js';
import { candidates, defaultLevel, pickSet } from '../src/matching.js';

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

test('every allowed combination has at least six starters at its default depth', () => {
  const thin = [];
  for (const combo of allCombinations()) {
    const count = candidates(library, combo, defaultLevel(combo)).length;
    if (count < 6) thin.push(`${combo.who} / ${combo.closeness} / ${combo.where}: ${count}`);
  }
  assert.deepEqual(thin, []);
});

test('every allowed combination shows a full, varied set', () => {
  const poor = [];
  for (const combo of allCombinations()) {
    const set = pickSet(library, combo, { random: () => 0.5 });
    const topics = new Set(set.map((s) => s.topics[0]));
    if (set.length < 4 || topics.size < 3) poor.push(`${combo.who} / ${combo.closeness} / ${combo.where}`);
  }
  assert.deepEqual(poor, []);
});

test('at least a third of the library is not a plain question', () => {
  const other = library.filter((s) => s.form !== 'question').length;
  assert.ok(other / library.length >= 1 / 3);
});

test('every combination still has at least four starters under each comfort setting', () => {
  const thin = [];
  for (const comfort of ['reserved', 'direct']) {
    for (const combo of allCombinations().map((c) => ({ ...c, comfort }))) {
      const count = candidates(library, combo, defaultLevel(combo)).length;
      if (count < 4) thin.push(`${comfort}: ${combo.who} / ${combo.closeness} / ${combo.where}: ${count}`);
    }
  }
  assert.deepEqual(thin, []);
});
