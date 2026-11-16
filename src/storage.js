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

// The last few person / purpose choices, newest first, so a repeat
// situation is one tap from the first screen. Only category ids are stored.
// (Entries saved by the older flow have no purpose; they are ignored.)
const RECENT_KEY = 'spark.recent';
const RECENT_LIMIT = 2;

export function getRecent() {
  return read(RECENT_KEY, []).filter((r) => r && r.who && r.purpose);
}

export function addRecent(choice) {
  const same = (r) => r.who === choice.who && r.purpose === choice.purpose;
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

// The comfort setting: 'standard', 'reserved', or 'direct'.
const COMFORT_KEY = 'spark.comfort';

export function getComfort() {
  return read(COMFORT_KEY, 'standard');
}

export function setComfort(value) {
  write(COMFORT_KEY, value);
}

// "Start fresh" buttons on the settings screen.
export function clearSeen() {
  write(SEEN_KEY, []);
}

export function clearRecent() {
  write(RECENT_KEY, []);
}

// How a starter went, marked by the user: { id: 'worked' | 'flat' }.
const FEEDBACK_KEY = 'spark.feedback';

export function getFeedback() {
  return read(FEEDBACK_KEY, {});
}

// Sets the mark, or clears it when the same mark is tapped again.
export function markFeedback(id, mark) {
  const feedback = getFeedback();
  if (feedback[id] === mark) delete feedback[id];
  else feedback[id] = mark;
  write(FEEDBACK_KEY, feedback);
}

export function clearFeedback() {
  write(FEEDBACK_KEY, {});
}

// The last "In person or call / Message" choice, used as the starting point.
const MEDIUM_KEY = 'spark.medium';

export function getMedium() {
  return read(MEDIUM_KEY, 'in-person');
}

export function setMedium(value) {
  write(MEDIUM_KEY, value);
}
