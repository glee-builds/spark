// The rules that decide which starters fit. Plain rules, no AI.
// A "selection" is { who, purpose, medium, comfort, place } using ids from config.js.

import { DEPTHS, PURPOSES, findWho } from './config.js';

const LEVEL = { light: 0, casual: 1, personal: 2, deep: 3 };

// The deepest level (0 light, 1 casual, 2 personal, 3 deep) allowed for this selection.
// The person sets it. "More reserved" lowers it one step for anyone who
// isn't family or a close friend.
export function depthCeiling({ who, comfort }) {
  const person = findWho(who);
  const level = LEVEL[person.ceiling];
  if (comfort === 'reserved' && person.ceiling !== 'deep') return Math.max(0, level - 1);
  return level;
}

// The level shown first, set by the purpose: "Break the ice" starts light,
// "Check in" and most others start casual, "Go deeper" starts personal.
// Deep is never the starting point; it is one tap of "Deeper" away.
export function defaultLevel(selection) {
  const ceiling = depthCeiling(selection);
  const start = (PURPOSES[selection.purpose] || {}).level;
  if (start === 'max') return Math.min(LEVEL.personal, ceiling);
  if (start === 'casual') return Math.min(LEVEL.casual, ceiling);
  return 0;
}

// True when the starter touches a topic that is too risky for this person.
export function isRiskBlocked(starter, { who, comfort }) {
  const person = findWho(who);
  const careful = person.careful || person.ceiling === 'light'
    || (comfort === 'reserved' && person.ceiling !== 'deep');
  if (!careful) return false;
  return starter.riskTags.some((tag) => {
    if (tag === 'work' && person.workOk) return false;
    if (tag === 'children' && person.kidsOk) return false;
    return true;
  });
}

// True when the starter is tagged for this person, purpose, and medium, and
// suits where the user lives. medium "any" works both said and sent; a starter
// with no "places" works anywhere.
export function fits(starter, { who, purpose, medium, place = 'city' }) {
  return starter.who.includes(who)
    && starter.purposes.includes(purpose)
    && (starter.medium === 'any' || starter.medium === medium)
    && (!starter.places || starter.places.includes(place));
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
// - the first starter is an easy, light one when the set is deeper, so there
//   is always a low-effort way in
// - the rest prefer the chosen level, then lighter ones
// - prefers starters not seen recently
// - no two starters on the same main topic, when there are enough to choose from
// - at least one that is not a plain question, when one exists
// - starters marked "fell flat" come last; ones that "worked" get a small lift
// - "Direct" comfort: plain questions first, fewer guesses about feelings
export function pickSet(library, selection, options = {}) {
  const {
    level = defaultLevel(selection), seen = [], count = 4, random = Math.random, feedback = {},
  } = options;
  const pool = shuffled(candidates(library, selection, level), random);
  const marked = (s) => ({ flat: 200, worked: -4 }[feedback[s.id]] || 0);
  const indirect = (s) => (selection.comfort === 'direct'
    && (s.form === 'statement' || s.topics.includes('feelings')) ? 8 : 0);
  const base = (s) => (seen.includes(s.id) ? 100 : 0) + marked(s) + indirect(s);
  const rank = (s) => base(s) + (level - DEPTHS.indexOf(s.depth)) * 10;
  pool.sort((a, b) => rank(a) - rank(b));

  const picked = [];
  const topics = new Set();
  const add = (s) => { picked.push(s); topics.add(s.topics[0]); };

  if (level > 0) {
    const easy = pool.filter((s) => s.depth === 'light').sort((a, b) => base(a) - base(b))[0];
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

  // (Skipped for "Direct", which asks for plain questions.)
  const isQuestion = (s) => s.form === 'question';
  if (selection.comfort !== 'direct' && picked.length > 1 && picked.every(isQuestion)) {
    const other = pool.find((s) => !isQuestion(s) && !picked.includes(s));
    if (other) picked[picked.length - 1] = other;
  }
  return picked;
}
