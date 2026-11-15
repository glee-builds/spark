// Tests for the matching rules. Run with: node --test

import test from 'node:test';
import assert from 'node:assert/strict';
import { depthCeiling, defaultLevel, isRiskBlocked, fits, candidates, pickSet } from '../src/matching.js';

function starter(overrides = {}) {
  return {
    id: 'te-001', line: 'A test line to say.', form: 'question',
    followUps: ['A follow-up?'], shareBack: 'Offer one thing, then ask again.',
    deliveryCue: null, depth: 'light', who: ['colleague'],
    closeness: ['just-met', 'a-little', 'well', 'very-close'], where: ['any'],
    goals: ['break-ice'], topics: ['plans'], riskTags: [], basis: 'expert-opinion',
    ...overrides,
  };
}

test('closeness sets the depth ceiling', () => {
  assert.equal(depthCeiling({ who: 'friend', closeness: 'a-little', where: 'party' }), 1);
  assert.equal(depthCeiling({ who: 'friend', closeness: 'very-close', where: 'party' }), 2);
  assert.equal(depthCeiling({ who: 'colleague', closeness: 'just-met', where: 'party' }), 0);
});

test('the place moves the ceiling one step', () => {
  assert.equal(depthCeiling({ who: 'friend', closeness: 'well', where: 'car' }), 2);
  assert.equal(depthCeiling({ who: 'colleague', closeness: 'a-little', where: 'networking' }), 0);
  assert.equal(depthCeiling({ who: 'colleague', closeness: 'just-met', where: 'networking' }), 0);
});

test('bosses, clients, and in-laws never go above medium', () => {
  assert.equal(depthCeiling({ who: 'in-law', closeness: 'very-close', where: 'home' }), 1);
  assert.equal(depthCeiling({ who: 'boss', closeness: 'well', where: 'work-meeting' }), 1);
  assert.equal(depthCeiling({ who: 'client', closeness: 'well', where: 'party' }), 1);
});

test('the default level is one notch above light when allowed', () => {
  assert.equal(defaultLevel({ who: 'partner', closeness: 'very-close', where: 'home' }), 1);
  assert.equal(defaultLevel({ who: 'event-contact', closeness: 'just-met', where: 'party' }), 0);
});

test('risky topics are hidden for people not known well', () => {
  const money = starter({ riskTags: ['money'] });
  assert.equal(isRiskBlocked(money, { who: 'friend', closeness: 'a-little', where: 'party' }), true);
  assert.equal(isRiskBlocked(money, { who: 'friend', closeness: 'well', where: 'party' }), false);
  assert.equal(isRiskBlocked(money, { who: 'in-law', closeness: 'very-close', where: 'home' }), true);
});

test('work questions are allowed at work and with work people', () => {
  const work = starter({ riskTags: ['work'] });
  assert.equal(isRiskBlocked(work, { who: 'event-contact', closeness: 'just-met', where: 'networking' }), false);
  assert.equal(isRiskBlocked(work, { who: 'event-contact', closeness: 'just-met', where: 'party' }), true);
  assert.equal(isRiskBlocked(work, { who: 'boss', closeness: 'a-little', where: 'party' }), false);
});

test('questions about kids are allowed with other parents', () => {
  const kids = starter({ riskTags: ['children'] });
  assert.equal(isRiskBlocked(kids, { who: 'other-parent', closeness: 'just-met', where: 'party' }), false);
  assert.equal(isRiskBlocked(kids, { who: 'neighbor', closeness: 'just-met', where: 'party' }), true);
});

test('"any" place covers everything except text', () => {
  const s = starter();
  assert.equal(fits(s, { who: 'colleague', closeness: 'well', where: 'party' }), true);
  assert.equal(fits(s, { who: 'colleague', closeness: 'well', where: 'text' }), false);
  assert.equal(fits(starter({ where: ['text'] }), { who: 'colleague', closeness: 'well', where: 'text' }), true);
  assert.equal(fits(s, { who: 'boss', closeness: 'well', where: 'party' }), false);
  assert.equal(fits(s, { who: 'colleague', closeness: 'lost-touch', where: 'party' }), false);
});

test('candidates never go above the ceiling', () => {
  const library = [starter({ id: 'te-001' }), starter({ id: 'te-002', depth: 'deep' })];
  const found = candidates(library, { who: 'colleague', closeness: 'a-little', where: 'party' });
  assert.deepEqual(found.map((s) => s.id), ['te-001']);
});

test('a set covers different topics and includes a non-question', () => {
  const topics = ['plans', 'food', 'work', 'hobbies', 'travel', 'week'];
  const library = topics.map((topic, i) => starter({ id: `te-00${i}`, topics: [topic] }));
  library.push(starter({ id: 'te-100', topics: ['plans'], form: 'statement' }));
  const set = pickSet(library, { who: 'colleague', closeness: 'well', where: 'party' }, { count: 4 });
  assert.equal(set.length, 4);
  assert.ok(set.some((s) => s.form !== 'question'));
  const questionTopics = set.filter((s) => s.form === 'question').map((s) => s.topics[0]);
  assert.equal(new Set(questionTopics).size, questionTopics.length);
});

test('starters seen recently come last', () => {
  const library = ['plans', 'food', 'work', 'hobbies', 'travel', 'week', 'home', 'sports']
    .map((topic, i) => starter({ id: `te-00${i}`, topics: [topic] }));
  const seen = ['te-000', 'te-001', 'te-002', 'te-003'];
  const set = pickSet(library, { who: 'colleague', closeness: 'well', where: 'party' }, { seen, count: 4 });
  assert.ok(set.every((s) => !seen.includes(s.id)));
});

test('a set opens with an easy light starter, then prefers the chosen level', () => {
  const library = [
    starter({ id: 'te-001', depth: 'light', topics: ['plans'] }),
    starter({ id: 'te-002', depth: 'medium', topics: ['work'] }),
    starter({ id: 'te-003', depth: 'medium', topics: ['hobbies'] }),
    starter({ id: 'te-004', depth: 'light', topics: ['food'] }),
  ];
  const set = pickSet(library, { who: 'colleague', closeness: 'well', where: 'party' }, { level: 1, count: 3 });
  assert.deepEqual(set.map((s) => s.depth), ['light', 'medium', 'medium']);
});

test('the easy opener is one written for this place when there is one', () => {
  const library = [
    starter({ id: 'te-001', depth: 'light', topics: ['plans'] }),
    starter({ id: 'te-002', depth: 'light', topics: ['setting'], where: ['party'] }),
    starter({ id: 'te-003', depth: 'medium', topics: ['work'] }),
  ];
  const set = pickSet(library, { who: 'colleague', closeness: 'well', where: 'party' }, { level: 1, count: 2 });
  assert.equal(set[0].id, 'te-002');
});
