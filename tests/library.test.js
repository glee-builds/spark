// Tests for the starter library: the format of every starter, and that every
// choice the screens allow leads to enough starters. Run with: node --test

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LIBRARY_FILES, PLACES, allCombinations as everyCombination } from '../src/config.js';
import { problems } from '../src/validate.js';
import { candidates, defaultLevel, depthTop, pickSet } from '../src/matching.js';
import { DEPTHS } from '../src/config.js';

function load(name) {
  return JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
}

export const library = LIBRARY_FILES.flatMap(load);

// Every person / purpose / medium, for each "Where I live" setting.
function allCombinations() {
  return everyCombination().flatMap((c) => PLACES.map((p) => ({ ...c, place: p.id })));
}

test('every starter follows docs/starter-format.md', () => {
  assert.deepEqual(library.flatMap(problems), []);
});

test('every starter has its own id', () => {
  const ids = library.map((s) => s.id);
  assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), []);
});

test('every person, purpose, and medium has at least four starters where the purpose starts', () => {
  const thin = allCombinations().map((c) => [c, candidates(library, c, defaultLevel(c)).length])
    .filter(([, n]) => n < 4).map(([c, n]) => `${c.who} / ${c.purpose} / ${c.medium} / ${c.place}: ${n}`);
  assert.deepEqual(thin, []);
});

test('every combination still has at least three starters under "More reserved"', () => {
  const thin = allCombinations().map((c) => ({ ...c, comfort: 'reserved' }))
    .map((c) => [c, candidates(library, c, defaultLevel(c)).length])
    .filter(([, n]) => n < 3).map(([c, n]) => `${c.who} / ${c.purpose} / ${c.medium}: ${n}`);
  assert.deepEqual(thin, []);
});

test('every combination shows a full set', () => {
  const short = allCombinations().filter((c) => pickSet(library, c, { random: () => 0.5 }).length < 4)
    .map((c) => `${c.who} / ${c.purpose} / ${c.medium}`);
  assert.deepEqual(short, []);
});

test('at least a third of the library is not a plain question', () => {
  assert.ok(library.filter((s) => s.form !== 'question').length / library.length >= 1 / 3);
});

test('every level Deeper can reach has at least three starters at exactly that depth', () => {
  const thin = [];
  for (const c of allCombinations()) {
    for (let level = defaultLevel(c) + 1; level <= depthTop(c); level += 1) {
      const exact = candidates(library, c, level).filter((s) => DEPTHS.indexOf(s.depth) === level).length;
      if (exact < 3) thin.push(`${c.who} / ${c.purpose} / ${c.place} at ${DEPTHS[level]}: ${exact}`);
    }
  }
  assert.deepEqual(thin, []);
});
