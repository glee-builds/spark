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
