// Tests for the wrap-up lines, the hard-time lines, and the reassurances.
// Run with: node --test

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { allCombinations } from '../src/config.js';
import { exitsFor, hardTimeFor, pickHardTime, pickReassurance } from '../src/support.js';

const support = JSON.parse(readFileSync(new URL('../data/support.json', import.meta.url), 'utf8'));

test('every combination has a way to wrap up', () => {
  const missing = allCombinations().filter((c) => exitsFor(support, c).length === 0)
    .map((c) => `${c.who} / ${c.where}`);
  assert.deepEqual([...new Set(missing)], []);
});

test('every combination has hard-time lines of each kind it needs', () => {
  const missing = [];
  for (const combo of allCombinations()) {
    const kinds = new Set(hardTimeFor(support, combo).map((h) => h.kind));
    if (!kinds.has('presence') || !kinds.has('offer') || hardTimeFor(support, combo).length < 3) {
      missing.push(`${combo.who} / ${combo.closeness} / ${combo.where}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('a hard-time set starts with being present and includes one offer', () => {
  const set = pickHardTime(support, { who: 'friend', closeness: 'well', where: 'home' });
  assert.equal(set[0].kind, 'presence');
  assert.equal(set.filter((h) => h.kind === 'offer').length, 1);
});

test('hard-time lines never open with a status check', () => {
  const bad = support.hardTime.filter((h) => /how are you/i.test(h.line) && !/"/.test(h.line));
  assert.deepEqual(bad.map((h) => h.id), []);
});

test('no line uses a gendered pronoun', () => {
  const lines = [...support.exits, ...support.hardTime].map((x) => x.line)
    .concat(support.reassurance, support.reassuranceText);
  const bad = lines.filter((line) => /\b(he|him|his|she|her|hers)\b/i.test(line));
  assert.deepEqual(bad, []);
});

test('a reassurance is always available', () => {
  assert.ok(pickReassurance(support, { who: 'friend', closeness: 'lost-touch', where: 'text' }).length > 10);
});
