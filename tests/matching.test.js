// Tests for the matching rules. Run with: node --test

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  depthCeiling, depthTop, defaultLevel, availableLevels, isRiskBlocked, fits, candidates, pickSet,
} from '../src/matching.js';

function starter(overrides = {}) {
  return {
    id: 'te-001', line: 'A test line to say.', form: 'question',
    followUps: ['A follow-up?'], shareBack: 'Offer one thing, then ask again.',
    deliveryCue: null, depth: 'light', who: ['colleague', 'work-friend', 'close-friend', 'other-parent', 'boss'],
    purposes: ['ice', 'checkin', 'deeper'], medium: 'any',
    topics: ['plans'], riskTags: [], basis: 'expert-opinion',
    ...overrides,
  };
}

const COLLEAGUE = { who: 'colleague', purpose: 'checkin', medium: 'in-person' };

test('the person sets the depth ceiling', () => {
  assert.equal(depthCeiling({ who: 'partner' }), 3);
  assert.equal(depthCeiling({ who: 'colleague' }), 2);
  assert.equal(depthCeiling({ who: 'recruiter' }), 0);
});

test('"More reserved" lowers the ceiling except for family and close friends', () => {
  assert.equal(depthCeiling({ who: 'friend', comfort: 'reserved' }), 1);
  assert.equal(depthCeiling({ who: 'close-friend', comfort: 'reserved' }), 3);
});

test('the purpose sets where a set starts, and deep is never the start', () => {
  assert.equal(defaultLevel({ who: 'partner', purpose: 'ice' }), 0);
  assert.equal(defaultLevel({ who: 'partner', purpose: 'checkin' }), 1);
  assert.equal(defaultLevel({ who: 'partner', purpose: 'deeper' }), 2);
  assert.equal(defaultLevel({ who: 'colleague', purpose: 'deeper' }), 2);
  assert.equal(defaultLevel({ who: 'colleague', purpose: 'deeper', comfort: 'reserved' }), 1);
  assert.equal(defaultLevel({ who: 'recruiter', purpose: 'revive' }), 0);
});

test('risky topics are hidden for careful people', () => {
  const money = starter({ riskTags: ['money'] });
  assert.equal(isRiskBlocked(money, { who: 'colleague' }), true);
  assert.equal(isRiskBlocked(money, { who: 'close-friend' }), false);
  assert.equal(isRiskBlocked(money, { who: 'friend', comfort: 'reserved' }), true);
});

test('work questions are fine with work people; kids questions with other parents', () => {
  assert.equal(isRiskBlocked(starter({ riskTags: ['work'] }), { who: 'boss' }), false);
  assert.equal(isRiskBlocked(starter({ riskTags: ['work'] }), { who: 'neighbor' }), true);
  assert.equal(isRiskBlocked(starter({ riskTags: ['children'] }), { who: 'other-parent' }), false);
});

test('a starter fits only its people, purposes, and medium', () => {
  assert.equal(fits(starter(), COLLEAGUE), true);
  assert.equal(fits(starter(), { ...COLLEAGUE, purpose: 'goodbye' }), false);
  assert.equal(fits(starter(), { ...COLLEAGUE, who: 'partner' }), false);
  assert.equal(fits(starter({ medium: 'message' }), COLLEAGUE), false);
  assert.equal(fits(starter({ medium: 'message' }), { ...COLLEAGUE, medium: 'message' }), true);
  assert.equal(fits(starter({ medium: 'any' }), { ...COLLEAGUE, medium: 'message' }), true);
});

test('candidates never go above the ceiling', () => {
  const library = [starter({ id: 'te-001' }), starter({ id: 'te-002', depth: 'deep' })];
  assert.deepEqual(candidates(library, COLLEAGUE).map((s) => s.id), ['te-001']);
});

test('a set covers different topics and includes a non-question', () => {
  const topics = ['plans', 'food', 'work', 'hobbies', 'travel', 'week'];
  const library = topics.map((topic, i) => starter({ id: `te-00${i}`, topics: [topic] }));
  library.push(starter({ id: 'te-100', topics: ['plans'], form: 'statement' }));
  const set = pickSet(library, COLLEAGUE, { count: 4, level: 0 });
  assert.equal(set.length, 4);
  assert.ok(set.some((s) => s.form !== 'question'));
});

test('starters seen recently come last', () => {
  const library = ['plans', 'food', 'work', 'hobbies', 'travel', 'week', 'home', 'sports']
    .map((topic, i) => starter({ id: `te-00${i}`, topics: [topic] }));
  const seen = ['te-000', 'te-001', 'te-002', 'te-003'];
  const set = pickSet(library, COLLEAGUE, { seen, count: 4, level: 0 });
  assert.ok(set.every((s) => !seen.includes(s.id)));
});

test('a deeper set opens with an easy light starter, then the chosen level', () => {
  const library = [
    starter({ id: 'te-001', depth: 'light', topics: ['plans'] }),
    starter({ id: 'te-002', depth: 'casual', topics: ['work'] }),
    starter({ id: 'te-003', depth: 'casual', topics: ['hobbies'] }),
    starter({ id: 'te-004', depth: 'light', topics: ['food'] }),
  ];
  const set = pickSet(library, COLLEAGUE, { level: 1, count: 3 });
  assert.deepEqual(set.map((s) => s.depth), ['light', 'casual', 'casual']);
});

test('starters marked "fell flat" come last', () => {
  const library = ['plans', 'food', 'work'].map((topic, i) => starter({ id: `te-00${i}`, topics: [topic] }));
  const set = pickSet(library, COLLEAGUE, { level: 0, count: 2, feedback: { 'te-000': 'flat' } });
  assert.ok(set.every((s) => s.id !== 'te-000'));
});

test('"Direct" puts plain questions ahead of guesses about feelings', () => {
  const library = [
    starter({ id: 'te-001', form: 'statement', topics: ['feelings'] }),
    starter({ id: 'te-002', form: 'question', topics: ['plans'] }),
    starter({ id: 'te-003', form: 'question', topics: ['hobbies'] }),
  ];
  const set = pickSet(library, { ...COLLEAGUE, comfort: 'direct' }, { level: 0, count: 2 });
  assert.ok(set.every((s) => s.form === 'question'));
});

test('a starter tagged for some places shows only there; untagged starters show everywhere', () => {
  const yard = starter({ places: ['suburb', 'rural'] });
  assert.equal(fits(yard, { ...COLLEAGUE, place: 'city' }), false);
  assert.equal(fits(yard, { ...COLLEAGUE, place: 'suburb' }), true);
  assert.equal(fits(starter(), { ...COLLEAGUE, place: 'city' }), true);
});

test('each purpose has a cap: a quick hello stays light, only "Go deeper" reaches deep', () => {
  assert.equal(depthTop({ who: 'partner', purpose: 'quick' }), 0);
  assert.equal(depthTop({ who: 'partner', purpose: 'checkin' }), 2);
  assert.equal(depthTop({ who: 'partner', purpose: 'deeper' }), 3);
  assert.equal(depthTop({ who: 'colleague', purpose: 'deeper' }), 2);
});

test('Deeper only offers levels that add starters at that depth', () => {
  const sel = { who: 'close-friend', purpose: 'checkin', medium: 'in-person' };
  const library = [
    starter({ id: 'te-001', depth: 'light' }),
    starter({ id: 'te-002', depth: 'casual' }),
  ];
  assert.deepEqual(availableLevels(library, sel), [0, 1]);
  library.push(starter({ id: 'te-003', depth: 'personal' }));
  assert.deepEqual(availableLevels(library, sel), [0, 1, 2]);
});
