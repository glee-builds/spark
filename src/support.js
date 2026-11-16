// Picks the extra lines shown around the starters: ways to wrap up, and a
// short reassurance before the conversation.

// People whose wrap-up lines need their own wording, so general lines skip them.
const OWN_EXITS = ['partner', 'teen', 'child', 'date'];

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

export function exitsFor(support, { who, medium }) {
  return support.exits.filter((e) => e.medium.includes(medium)
    && (e.who === 'any' ? !OWN_EXITS.includes(who) : e.who.includes(who)));
}

// Up to three lines for wrapping up, so there is a choice.
export function pickExits(support, selection, random = Math.random) {
  return shuffled(exitsFor(support, selection), random).slice(0, 3);
}

// A short, true reassurance, shown while choosing what to do.
export function pickReassurance(support, { purpose } = {}, random = Math.random) {
  const list = purpose === 'reconnect'
    ? support.reassurance.concat(support.reassuranceText)
    : support.reassurance;
  return pickOne(list, random);
}
