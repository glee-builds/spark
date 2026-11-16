// Tests that the choices fit the screens: no screen has too many options.
// Run with: node --test

import test from 'node:test';
import assert from 'node:assert/strict';
import { WHO, GROUPS, PURPOSES, LIBRARY_FILES } from '../src/config.js';

test('every tile has at most 7 people, and every person belongs to a tile', () => {
  for (const g of GROUPS) assert.ok(WHO.filter((w) => w.group === g.id).length <= 7, g.id);
  for (const w of WHO) assert.ok(GROUPS.some((g) => g.id === w.group), w.id);
});

test('every person has at most 7 purposes, all known, no repeats', () => {
  for (const w of WHO) {
    assert.ok(w.purposes.length <= 7, w.id);
    assert.equal(new Set(w.purposes).size, w.purposes.length, w.id);
    for (const p of w.purposes) assert.ok(PURPOSES[p], `${w.id}: ${p}`);
    for (const p of Object.keys(w.labels || {})) assert.ok(w.purposes.includes(p), `${w.id} label for ${p}`);
  }
});

test('every person has a known data file and a medium', () => {
  for (const w of WHO) {
    assert.ok(LIBRARY_FILES.includes(w.file), w.id);
    assert.ok(w.media.length >= 1 && w.media.every((m) => ['in-person', 'message'].includes(m)), w.id);
  }
});

test('there are no more than 7 tiles on the first screen', () => {
  assert.ok(GROUPS.length <= 7);
});
