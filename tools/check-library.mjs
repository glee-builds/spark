// Checks starter files: the format of every starter, and that every
// person / purpose / medium the screens allow has enough starters.
//
// Usage:   node tools/check-library.mjs data/family.json [data/friends.json ...]
// With no files, checks the whole library.
// Coverage is checked only for the people whose starters live in the given files.

import { readFileSync } from 'node:fs';
import { WHO, PLACES, LIBRARY_FILES, allCombinations, purposeLabel } from '../src/config.js';
import { candidates, defaultLevel } from '../src/matching.js';
import { problems } from '../src/validate.js';

export const MIN_STARTERS = 4;          // at the level the purpose starts at
export const MIN_RESERVED = 3;          // under the "More reserved" comfort setting

const root = new URL('../', import.meta.url);
const args = process.argv.slice(2);
const files = args.length ? args : LIBRARY_FILES.map((f) => `data/${f}.json`);
const names = files.map((f) => f.replace(/^.*\//, '').replace(/\.json$/, ''));
const library = files.flatMap((f) => JSON.parse(readFileSync(new URL(f, root), 'utf8')));

let bad = 0;
const ids = new Set();
for (const s of library) {
  for (const p of problems(s)) { console.log(`FORMAT    ${p}`); bad += 1; }
  if (ids.has(s.id)) { console.log(`FORMAT    duplicate id ${s.id}`); bad += 1; }
  ids.add(s.id);
}

const people = new Set(WHO.filter((w) => names.includes(w.file)).map((w) => w.id));
// Every combination is checked for each "Where I live" setting.
const combos = allCombinations().filter((c) => people.has(c.who))
  .flatMap((c) => PLACES.map((p) => ({ ...c, place: p.id })));
for (const combo of combos) {
  const n = candidates(library, combo, defaultLevel(combo)).length;
  const reserved = { ...combo, comfort: 'reserved' };
  const r = candidates(library, reserved, defaultLevel(reserved)).length;
  const name = `${combo.who} / ${purposeLabel(combo.who, combo.purpose).label} (${combo.purpose}) / ${combo.medium} / ${combo.place}`;
  if (n < MIN_STARTERS) { console.log(`COVERAGE  ${name}: ${n} (need ${MIN_STARTERS})`); bad += 1; }
  else if (r < MIN_RESERVED) { console.log(`RESERVED  ${name}: ${r} under "More reserved" (need ${MIN_RESERVED})`); bad += 1; }
}

const notQuestions = library.filter((s) => s.form !== 'question').length;
console.log(`${library.length} starters, ${Math.round((100 * notQuestions) / Math.max(1, library.length))}% not plain questions, ${bad} problems`);
process.exit(bad ? 1 : 0);
