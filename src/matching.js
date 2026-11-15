// The rules that decide which starters fit. Plain rules, no AI.
// A "selection" is { who, closeness, where } using ids from config.js.

import { DEPTHS, findWho, findWhere } from './config.js';

const BASE_CEILING = {
  'just-met': 0, 'a-little': 1, 'well': 1, 'very-close': 2, 'lost-touch': 1,
};

const WORK_PEOPLE = ['colleague', 'boss', 'client', 'mentor'];
const WORK_PLACES = ['networking', 'work-meeting', 'video-call'];
const CAREFUL_PEOPLE = ['boss', 'client', 'in-law'];

function clamp(n, low, high) { return Math.max(low, Math.min(high, n)); }

// The deepest level (0 light, 1 medium, 2 deep) allowed for this selection.
// Closeness sets it, the place moves it one step, and some roles cap it.
export function depthCeiling({ who, closeness, where }) {
  const place = findWhere(where);
  let level = clamp(BASE_CEILING[closeness] + (place ? place.adjust : 0), 0, 2);
  const person = findWho(who);
  if (person && person.cap) level = Math.min(level, DEPTHS.indexOf(person.cap));
  return level;
}

// The level shown first: one notch above light when the ceiling allows it.
export function defaultLevel(selection) {
  return Math.min(depthCeiling(selection), 1);
}

// True when the starter touches a topic that is too risky for this person.
export function isRiskBlocked(starter, { who, closeness, where }) {
  const careful = closeness === 'just-met' || closeness === 'a-little'
    || CAREFUL_PEOPLE.includes(who);
  if (!careful) return false;
  return starter.riskTags.some((tag) => {
    if (tag === 'work' && (WORK_PEOPLE.includes(who) || WORK_PLACES.includes(where))) return false;
    if (tag === 'children' && (who === 'other-parent' || where === 'kids-activity')) return false;
    return true;
  });
}

// True when the starter is tagged for this person, closeness, and place.
// "any" place means every situation except text, which needs its own wording.
export function fits(starter, { who, closeness, where }) {
  if (!starter.who.includes(who)) return false;
  if (!starter.closeness.includes(closeness)) return false;
  if (starter.where.includes(where)) return true;
  return starter.where.includes('any') && where !== 'text';
}

// Every starter that may be shown for this selection, up to the given level.
export function candidates(library, selection, level = depthCeiling(selection)) {
  const max = Math.min(level, depthCeiling(selection));
  return library.filter((s) => fits(s, selection)
    && !isRiskBlocked(s, selection)
    && DEPTHS.indexOf(s.depth) <= max);
}

function shuffled(list, random) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Choose a small, varied set to show.
// - the first starter is an easy, light one, written for this place when possible,
//   so there is always a low-effort way in
// - the rest prefer the chosen level, then lighter ones
// - prefers starters not seen recently
// - prefers starters written for this exact place over general ones
// - no two starters on the same main topic, when there are enough to choose from
// - at least one that is not a plain question, when one exists
export function pickSet(library, selection, options = {}) {
  const { level = defaultLevel(selection), seen = [], count = 4, random = Math.random } = options;
  const pool = shuffled(candidates(library, selection, level), random);
  const rank = (s) => (seen.includes(s.id) ? 100 : 0)
    + (level - DEPTHS.indexOf(s.depth)) * 10
    + (s.where.includes(selection.where) ? 0 : 3);
  pool.sort((a, b) => rank(a) - rank(b));

  const picked = [];
  const topics = new Set();
  const add = (s) => { picked.push(s); topics.add(s.topics[0]); };

  if (level > 0) {
    const easyRank = (s) => (seen.includes(s.id) ? 100 : 0)
      + (s.where.includes(selection.where) ? 0 : 3);
    const easy = pool.filter((s) => s.depth === 'light')
      .sort((a, b) => easyRank(a) - easyRank(b))[0];
    if (easy) add(easy);
  }

  for (const s of pool) {
    if (picked.length === count) break;
    if (picked.includes(s) || topics.has(s.topics[0])) continue;
    add(s);
  }
  for (const s of pool) {
    if (picked.length === count) break;
    if (!picked.includes(s)) picked.push(s);
  }

  const isQuestion = (s) => s.form === 'question';
  if (picked.length > 1 && picked.every(isQuestion)) {
    const other = pool.find((s) => !isQuestion(s) && !picked.includes(s));
    if (other) picked[picked.length - 1] = other;
  }
  return picked;
}
