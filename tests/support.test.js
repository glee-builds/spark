// Tests for the wrap-up lines and the reassurances. Run with: node --test

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WHO } from '../src/config.js';
import { exitsFor, pickReassurance } from '../src/support.js';

const support = JSON.parse(readFileSync(new URL('../data/support.json', import.meta.url), 'utf8'));

test('every person has a way to wrap up, in each medium they use', () => {
  const missing = [];
  for (const w of WHO) {
    for (const medium of w.media) {
      if (!exitsFor(support, { who: w.id, medium }).length) missing.push(`${w.id} / ${medium}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('no line uses a gendered pronoun', () => {
  const lines = support.exits.map((x) => x.line).concat(support.reassurance, support.reassuranceText);
  assert.deepEqual(lines.filter((line) => /\b(he|him|his|she|her|hers)\b/i.test(line)), []);
});

test('a reassurance is always available', () => {
  assert.ok(pickReassurance(support, { purpose: 'reconnect' }).length > 10);
});
