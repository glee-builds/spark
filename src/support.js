// Picks the extra lines shown around the starters: a way to wrap up,
// what to say when someone is having a hard time, and a short reassurance.

// People whose lines need their own wording, so general lines skip them.
const OWN_EXITS = ['partner', 'teen', 'child', 'date'];
const OWN_HARD_TIME = ['partner', 'teen', 'child'];

function pickOne(list, random) {
  return list[Math.floor(random() * list.length)];
}

function shuffled(list, random) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function placeFits(item, where) {
  if (item.where.includes(where)) return true;
  return item.where.includes('any') && where !== 'text';
}

export function exitsFor(support, { who, where }) {
  return support.exits.filter((e) => e.where.includes(where)
    && (e.who === 'any' ? !OWN_EXITS.includes(who) : e.who.includes(who)));
}

// One line for wrapping up the conversation.
export function pickExit(support, selection, random = Math.random) {
  const options = exitsFor(support, selection);
  return options.length ? pickOne(options, random) : null;
}

export function hardTimeFor(support, { who, closeness, where }) {
  return support.hardTime.filter((h) => placeFits(h, where)
    && (h.who === 'any' ? !OWN_HARD_TIME.includes(who) : h.who.includes(who))
    && (h.closeness === 'any' || h.closeness.includes(closeness)));
}

// Up to four lines for someone having a hard time: being present first,
// then an invitation to talk, then one specific offer of help.
export function pickHardTime(support, selection, random = Math.random) {
  const options = shuffled(hardTimeFor(support, selection), random);
  const ofKind = (kind) => options.filter((h) => h.kind === kind);
  const picked = [
    ...ofKind('presence').slice(0, 2),
    ...ofKind('listen').slice(0, 1),
    ...ofKind('offer').slice(0, 1),
  ];
  return picked;
}

// A short, true reassurance shown above the starters.
export function pickReassurance(support, selection, random = Math.random) {
  const list = selection.where === 'text' || selection.closeness === 'lost-touch'
    ? support.reassurance.concat(support.reassuranceText)
    : support.reassurance;
  return pickOne(list, random);
}
