// Small things remembered on this phone only, in localStorage.
// Nothing here identifies a person: only starter ids and category ids.

const SEEN_KEY = 'spark.seen';
const SEEN_LIMIT = 60;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or switched off. The app still works without it.
  }
}

// Ids of starters shown recently, oldest first.
export function getSeen() {
  return read(SEEN_KEY, []);
}

export function addSeen(ids) {
  const seen = getSeen().filter((id) => !ids.includes(id)).concat(ids);
  write(SEEN_KEY, seen.slice(-SEEN_LIMIT));
}

// Simple yes/no memory, for example "the install hint was dismissed".
export function getFlag(key) {
  return read(key, false) === true;
}

export function setFlag(key) {
  write(key, true);
}

// The last few person / closeness / place choices, newest first, so a repeat
// situation is one tap from the first screen. Only category ids are stored.
const RECENT_KEY = 'spark.recent';
const RECENT_LIMIT = 2;

export function getRecent() {
  return read(RECENT_KEY, []);
}

export function addRecent(choice) {
  const same = (r) => r.who === choice.who && r.closeness === choice.closeness && r.where === choice.where;
  const recent = [choice, ...getRecent().filter((r) => !same(r))];
  write(RECENT_KEY, recent.slice(0, RECENT_LIMIT));
}

// Starters the user saved, by id, newest first.
const SAVED_KEY = 'spark.saved';

export function getSaved() {
  return read(SAVED_KEY, []);
}

// Saves or unsaves one starter. Returns true if it is now saved.
export function toggleSaved(id) {
  const saved = getSaved();
  const now = !saved.includes(id);
  write(SAVED_KEY, now ? [id, ...saved] : saved.filter((x) => x !== id));
  return now;
}
