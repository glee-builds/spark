// The screens and what happens on each tap.
//
// The flow is a few short screens, each one fitting on the phone without scrolling:
//   group (Partner or family, Friends, ...) -> who -> "Right now I want to..." -> starters -> detail
// The starters screen has an "In person or call / Message" switch at the top.
// One "state" object holds the choices; render() draws the current screen.

import {
  WHO, GROUPS, MEDIA, DEPTHS, COMFORT, findWho, findGroup, purposeLabel,
} from './config.js';
import { pickSet, defaultLevel, depthCeiling } from './matching.js';
import { pickExits, pickReassurance } from './support.js';
import { loadLibrary, loadSupport } from './library.js';
import {
  getSeen, addSeen, getRecent, addRecent, getSaved, toggleSaved,
  getComfort, setComfort, clearSeen, clearRecent, getFeedback, markFeedback, clearFeedback,
  getMedium, setMedium,
} from './storage.js';
import {
  startOffline, installHint, dismissHint, install, updateReady, checkForUpdate,
} from './install.js';

const root = document.getElementById('app');

const state = {
  step: 'group',     // group | who | purpose | results | detail | saved | settings | notes
  group: null,
  who: null,
  purpose: null,
  medium: 'in-person',
  level: 0,          // 0 light, 1 medium, 2 deep
  starters: [],
  exits: [],
  detail: null,      // { kind: 'starter' | 'exit', index, from: 'results' | 'saved' | 'notes' }
  savedView: [],     // the saved starters, as they were when the Saved screen opened
  notesView: [],     // starters marked worked, then fell flat, as they were when Your notes opened
  freshSet: false,   // true until a new set has been fitted and marked as seen
  notice: '',        // a short confirmation on the settings screen
  library: [],
  support: null,
};

// Short labels that say what kind of line each one is, so the list scans fast.
const FORM_LABEL = {
  question: 'Ask', statement: 'Observe', compliment: 'Compliment',
  share: 'Share', advice: 'Ask advice', reachout: 'Reach out',
};

// Turn text into safe HTML, so nothing in the data can break the page.
function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function selection() {
  return { who: state.who, purpose: state.purpose, medium: state.medium, comfort: getComfort() };
}

function summary() {
  return `${findWho(state.who).label} · ${purposeLabel(state.who, state.purpose).label}`;
}

// ---------- Pieces shared by several screens ----------

function header({ title = '', sub = '', back = true, right = '' } = {}) {
  const left = back
    ? '<button class="back" data-action="back">&#8249; Back</button>'
    : '<span class="brand">Spark</span>';
  return `<header class="top">
    <div class="top-row">${left}${right}</div>
    ${title ? `<h1 class="title" tabindex="-1">${esc(title)}</h1>` : ''}
    ${sub ? `<p class="sub">${esc(sub)}</p>` : ''}
  </header>`;
}

function choice(action, id, label, hint, pressed) {
  const aria = pressed === undefined ? '' : ` aria-pressed="${pressed}"`;
  return `<button class="chip" data-action="${action}" data-id="${esc(id)}"${aria}>
    <span class="chip-label">${pressed ? '&#10003; ' : ''}${esc(label)}</span>
    ${hint ? `<span class="chip-hint">${esc(hint)}</span>` : ''}
  </button>`;
}

function depthDots(level) {
  return DEPTHS.map((_, i) => (i <= level ? '●' : '○')).join('');
}

function levelName(level) {
  const name = DEPTHS[level];
  return name[0].toUpperCase() + name.slice(1);
}

// Shown once on the first screen until the app is on the home screen.
function installCard() {
  const hint = installHint();
  if (!hint) return '';
  const body = hint === 'ios'
    ? '<p class="hint-text">Keep Spark one tap away: tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>. It works offline from there.</p>'
    : '<p class="hint-text">Keep Spark one tap away. It works offline once installed.</p>';
  const installButton = hint === 'button'
    ? '<button class="hint-button strong" data-action="install">Install</button>' : '';
  return `<aside class="hint">${body}
    <div class="hint-row">${installButton}
      <button class="hint-button" data-action="dismiss-hint">${hint === 'ios' ? 'Got it' : 'Not now'}</button>
    </div></aside>`;
}

// Shown on the first screen when a new version has been saved.
function updateCard() {
  if (!updateReady()) return '';
  return `<aside class="hint update" role="status">
    <p class="hint-text">A new version of Spark is ready.</p>
    <div class="hint-row"><button class="hint-button strong" data-action="refresh">Refresh</button></div>
  </aside>`;
}

// ---------- Choosing who ----------

function topLinks() {
  const saved = getSaved().length;
  const savedLink = saved ? `<button class="top-link" data-action="saved">&#9733; Saved (${saved})</button>` : '';
  return `<span class="top-links">${savedLink}
    <button class="top-link" data-action="settings">Settings</button></span>`;
}

// Up to two recent situations, each one tap from the starters.
function recentRows() {
  const recent = getRecent().filter((r) => findWho(r.who) && findWho(r.who).purposes.includes(r.purpose));
  if (!recent.length) return '';
  const rows = recent.map((r, i) => `
    <button class="recent" data-action="recent" data-index="${i}">
      <span>${esc(findWho(r.who).label)} · ${esc(purposeLabel(r.who, r.purpose).label)}</span>
      <span class="chev" aria-hidden="true">&#8250;</span>
    </button>`).join('');
  return `<div class="recents"><p class="label">Again</p>${rows}</div>`;
}

function groupScreen() {
  const tiles = GROUPS.map((g) => `
    <button class="tile" data-action="group" data-id="${esc(g.id)}">
      <span class="tile-label">${esc(g.label)}</span>
      <span class="tile-hint">${esc(g.hint)}</span>
    </button>`).join('');
  return `${header({ title: 'Who are you talking to?', back: false, right: topLinks() })}
    ${updateCard() || installCard()}
    <div class="choices">${recentRows()}<div class="tiles">${tiles}</div></div>`;
}

function whoScreen() {
  const group = findGroup(state.group);
  const people = WHO.filter((w) => w.group === state.group);
  return `${header({ title: group.id === 'group' ? 'Which group?' : 'Who exactly?', sub: group.label })}
    <div class="choices">${people.map((w) => choice('who', w.id, w.label)).join('')}</div>`;
}

// ---------- Choosing what you want ----------

function purposeScreen() {
  const person = findWho(state.who);
  const reassure = state.support
    ? `<p class="reassure">${esc(pickReassurance(state.support, {}))}</p>` : '';
  const options = person.purposes.map((p) => {
    const { label, hint } = purposeLabel(state.who, p);
    return choice('purpose', p, label, hint);
  }).join('');
  return `${header({ title: 'Right now I want to…', sub: person.label })}
    ${reassure}
    <div class="choices">${options}</div>`;
}

// ---------- The starters list ----------

function row(kind, index, label, text, from = 'results') {
  return `<button class="row" data-action="open" data-kind="${kind}" data-index="${index}" data-from="${from}">
    <span class="row-text">
      <span class="row-label">${esc(label)}</span>
      <span class="row-line">${esc(text)}</span>
    </span>
    <span class="chev" aria-hidden="true">&#8250;</span>
  </button>`;
}

function starterLabel(s, index, from = 'results') {
  // pickSet puts one light line first when the set is deeper: call it out.
  if (from === 'results' && index === 0 && s.depth === 'light' && state.level > 0) return 'Easy opener';
  return FORM_LABEL[s.form];
}

function mediumSwitch() {
  const person = findWho(state.who);
  if (person.media.length < 2) return '';
  const buttons = MEDIA.map((m) => `<button class="seg" data-action="medium" data-id="${m.id}"
    aria-pressed="${state.medium === m.id}">${esc(m.label)}</button>`).join('');
  return `<div class="segs" role="group" aria-label="In person or message">${buttons}</div>`;
}

function resultsScreen() {
  const rows = state.starters.map((s, i) => row('starter', i, starterLabel(s, i), s.line));
  const empty = rows.length ? '' : '<p class="empty">No starters for this yet. Try the other switch above, or go back.</p>';
  const wrap = state.purpose === 'goodbye' || !state.exits.length ? '' : `
    <button class="row wrap" data-action="open" data-kind="exit" data-index="0">
      <span class="row-text"><span class="row-line small">Wrap up: when it's time to go</span></span>
      <span class="chev" aria-hidden="true">&#8250;</span>
    </button>`;
  const ceiling = depthCeiling(selection());
  const lighterOff = state.level === 0 ? 'disabled' : '';
  const deeperOff = state.level >= ceiling ? 'disabled' : '';
  return `${header({ sub: summary(), right: '<button class="top-link" data-action="restart">Start over</button>' })}
    ${mediumSwitch()}
    <div class="rows">${rows.join('')}${empty}</div>
    ${wrap}
    <div class="bar">
      <p class="depth-now" aria-live="polite">${depthDots(state.level)} ${levelName(state.level)}</p>
      <div class="bar-row">
        <button class="secondary" data-action="lighter" ${lighterOff}>Lighter</button>
        <button class="primary" data-action="shuffle">&#8635; New set</button>
        <button class="secondary" data-action="deeper" ${deeperOff}>Deeper</button>
      </div>
    </div>`;
}

// ---------- Saved starters ----------

function savedScreen() {
  const rows = state.savedView.map((s, i) => row('starter', i, FORM_LABEL[s.form], s.line, 'saved'));
  const empty = rows.length ? ''
    : '<p class="empty">Nothing saved yet. Open a starter and tap &#9734; Save to keep it here.</p>';
  return `${header({ title: 'Saved' })}
    <div class="rows">${rows.join('')}${empty}</div>`;
}

// ---------- Your notes (what worked, what fell flat) ----------

function notesScreen() {
  const feedback = getFeedback();
  const section = (mark, title) => {
    const rows = state.notesView.map((s, i) => [s, i]).filter(([s]) => feedback[s.id] === mark)
      .map(([s, i]) => row('starter', i, FORM_LABEL[s.form], s.line, 'notes'));
    return rows.length ? `<p class="label">${title} (${rows.length})</p><div class="rows">${rows.join('')}</div>` : '';
  };
  const body = state.notesView.length
    ? `${section('worked', 'Worked')}${section('flat', 'Fell flat')}
       <button class="link" data-action="clear-feedback">Clear all marks</button>`
    : '<p class="empty">After a conversation, open the starter you used and tap Worked or Fell flat. They collect here.</p>';
  return `${header({ title: 'Your notes' })}${body}`;
}

// ---------- Settings ----------

function settingsScreen() {
  const current = getComfort();
  const comfort = COMFORT.map((c) => choice('comfort', c.id, c.label, c.hint, c.id === current)).join('');
  return `${header({ title: 'Settings' })}
    <p class="label">Comfort</p>
    <div class="settings-group">${comfort}</div>
    <p class="label">Start fresh</p>
    <div class="settings-group">
      <button class="chip" data-action="clear-seen"><span class="chip-label">Show starters I've seen again</span></button>
      <button class="chip" data-action="clear-recent"><span class="chip-label">Clear the "Again" list</span></button>
    </div>
    <p class="label">Updates</p>
    <div class="settings-group">
      <button class="chip" data-action="check-update">
        <span class="chip-label">${updateReady() ? 'Refresh to the new version' : 'Check for updates'}</span>
        <span class="chip-hint">Spark also checks each time you open it</span>
      </button>
    </div>
    <p class="label">Review</p>
    <div class="settings-group">
      <button class="chip" data-action="notes"><span class="chip-label">Your notes: what worked and what fell flat</span></button>
    </div>
    ${state.notice ? `<p class="note" role="status">${esc(state.notice)}</p>` : ''}
    <p class="about">Starters follow published conversation research and coaching advice.
      Nothing you tap leaves this phone.</p>`;
}

// ---------- One starter, in full ----------

// The list the open detail belongs to, for the arrows.
function currentList() {
  if (state.detail.from === 'saved') return state.savedView;
  if (state.detail.from === 'notes') return state.notesView;
  return state.starters;
}

function detailSub() {
  return { saved: 'Saved', notes: 'Your notes' }[state.detail.from] || summary();
}

function detailBar(count) {
  const { index } = state.detail;
  const prev = index > 0 ? '' : 'disabled';
  const next = index < count - 1 ? '' : 'disabled';
  const arrows = count > 1;
  return `<div class="bar"><div class="bar-row">
    ${arrows ? `<button class="secondary" data-action="prev" aria-label="Previous" ${prev}>&#8249;</button>` : ''}
    <button class="primary" data-action="back">Back to the list</button>
    ${arrows ? `<button class="secondary" data-action="next" aria-label="Next" ${next}>&#8250;</button>` : ''}
  </div></div>`;
}

function exitDetail() {
  const lines = state.exits.map((e) => `<p class="say small">${esc(e.line)}</p>`).join('');
  return `${header({ title: "When it's time to go", sub: summary() })}
    <div class="detail">
      ${lines}
      <p class="tipbox">Say you're heading off, mention something they said, and leave warmly.</p>
    </div>
    ${detailBar(1)}`;
}

// After using a line: mark how it went. Fell-flat lines stop coming up.
function feedbackButtons(s) {
  const mark = getFeedback()[s.id];
  const button = (value, label) => `<button class="mark" data-action="mark" data-id="${value}"
    aria-pressed="${mark === value}">${mark === value ? '&#10003; ' : ''}${label}</button>`;
  return `<p class="label">Used it? How did it go?</p>
    <div class="marks">${button('worked', 'Worked')}${button('flat', 'Fell flat')}</div>`;
}

function starterDetail() {
  const { index, from } = state.detail;
  const s = currentList()[index];
  const isSaved = getSaved().includes(s.id);
  const save = `<button class="top-link save" data-action="save" aria-pressed="${isSaved}">
    ${isSaved ? '&#9733; Saved' : '&#9734; Save'}</button>`;
  const tip = s.deliveryCue ? `<p class="tipbox"><strong>Tip</strong> ${esc(s.deliveryCue)}</p>` : '';
  const follows = s.followUps.map((f) => `<li>${esc(f)}</li>`).join('');
  return `${header({ sub: detailSub(), right: save })}
    <div class="detail">
      <p class="row-label">${esc(starterLabel(s, index, from))}</p>
      <p class="say">${esc(s.line)}</p>
      ${tip}
      <p class="label">Then ask</p>
      <ul class="follows">${follows}</ul>
      <p class="label">Your turn</p>
      <p class="plain">${esc(s.shareBack)}</p>
      ${feedbackButtons(s)}
      <p class="depth">${depthDots(DEPTHS.indexOf(s.depth))} ${levelName(DEPTHS.indexOf(s.depth))}</p>
    </div>
    ${detailBar(currentList().length)}`;
}

function detailScreen() {
  return state.detail.kind === 'exit' ? exitDetail() : starterDetail();
}

// ---------- Drawing ----------

// If the list is taller than the screen, drop starters from the end until it
// fits, so the whole set can be read without scrolling. Never fewer than two.
function fitToScreen() {
  const tooTall = () => root.scrollHeight > window.innerHeight + 1;
  while (tooTall() && state.starters.length > 2) {
    state.starters.pop();
    const rows = root.querySelectorAll('.rows .row');
    rows[rows.length - 1].remove();
  }
  if (state.freshSet) {
    addSeen(state.starters.map((s) => s.id));
    state.freshSet = false;
  }
}

function render() {
  const screens = {
    group: groupScreen, who: whoScreen, purpose: purposeScreen, results: resultsScreen,
    detail: detailScreen, saved: savedScreen, settings: settingsScreen, notes: notesScreen,
  };
  root.innerHTML = screens[state.step]();
  root.dataset.step = state.step;
  // A short slide-in, so moving between screens feels like turning a page.
  root.classList.remove('enter');
  void root.offsetWidth;
  root.classList.add('enter');
  window.scrollTo(0, 0);
  if (state.step === 'results') {
    fitToScreen();
    // Check again once the browser has finished laying out the page.
    requestAnimationFrame(() => { if (state.step === 'results') fitToScreen(); });
  }
  const title = root.querySelector('.title');
  if (title) title.focus({ preventScroll: true });
}

// ---------- Moving between screens ----------

function newSet() {
  state.starters = pickSet(state.library, selection(), {
    level: state.level, seen: getSeen(), feedback: getFeedback(),
  });
  state.freshSet = true;
  state.exits = pickExits(state.support, selection());
}

// Where the In person / Message switch starts: messages for follow-ups and
// plans, the only option when there is one, otherwise the last one used.
function startingMedium() {
  const person = findWho(state.who);
  if (person.media.length === 1) return person.media[0];
  const followUp = state.purpose === 'reconnect' && person.labels && person.labels.reconnect;
  if (state.purpose === 'plans' || followUp) return 'message';
  return getMedium();
}

// A fresh person or purpose starts again at the purpose's depth.
function startResults() {
  state.medium = startingMedium();
  state.level = defaultLevel(selection());
  newSet();
  addRecent({ who: state.who, purpose: state.purpose });
}

// Each screen gets its own entry in the browser history, so the phone's
// back gesture and the Back button both step back one screen.
function go(step) {
  // A new version is ready: load it now, at the start, where nothing is lost.
  if (step === 'group' && updateReady()) {
    location.replace(`${location.pathname}#group`);
    location.reload();
    return;
  }
  state.step = step;
  history.pushState(null, '', `#${step}`);
  render();
}

function chooseWho(id) {
  state.who = id;
  go('purpose');
}

function openDetail(kind, index, from) {
  state.detail = { kind, index, from };
  go('detail');
}

function openSavedView() {
  const byId = new Map(state.library.map((s) => [s.id, s]));
  state.savedView = getSaved().map((id) => byId.get(id)).filter(Boolean);
}

function openNotesView() {
  const byId = new Map(state.library.map((s) => [s.id, s]));
  const feedback = getFeedback();
  const ids = Object.keys(feedback);
  state.notesView = ['worked', 'flat'].flatMap((mark) => ids.filter((id) => feedback[id] === mark))
    .map((id) => byId.get(id)).filter(Boolean);
}

function stepDetail(delta) {
  const list = currentList();
  const index = state.detail.index + delta;
  if (index < 0 || index >= list.length) return;
  state.detail.index = index;
  history.replaceState(null, '', '#detail');
  render();
}

root.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const { action, id } = button.dataset;
  if (action === 'group') {
    state.group = id;
    const people = WHO.filter((w) => w.group === id);
    // A tile with one person (Someone new, Date or match) goes straight on.
    if (people.length === 1) chooseWho(people[0].id);
    else go('who');
  } else if (action === 'who') {
    chooseWho(id);
  } else if (action === 'purpose') {
    state.purpose = id;
    startResults();
    go('results');
  } else if (action === 'recent') {
    const r = getRecent()[Number(button.dataset.index)];
    Object.assign(state, { group: findWho(r.who).group, who: r.who, purpose: r.purpose });
    startResults();
    go('results');
  } else if (action === 'medium') {
    if (state.medium === id) return;
    state.medium = id;
    setMedium(id);
    newSet();
    render();
  } else if (action === 'open') {
    openDetail(button.dataset.kind, Number(button.dataset.index), button.dataset.from);
  } else if (action === 'prev' || action === 'next') {
    stepDetail(action === 'next' ? 1 : -1);
  } else if (action === 'shuffle') {
    newSet();
    render();
  } else if (action === 'lighter' || action === 'deeper') {
    const next = state.level + (action === 'deeper' ? 1 : -1);
    state.level = Math.max(0, Math.min(depthCeiling(selection()), next));
    newSet();
    render();
  } else if (action === 'saved') {
    openSavedView();
    go('saved');
  } else if (action === 'save') {
    toggleSaved(currentList()[state.detail.index].id);
    render();
  } else if (action === 'settings') {
    state.notice = '';
    go('settings');
  } else if (action === 'comfort') {
    setComfort(id);
    state.notice = 'Saved. New starters will follow this setting.';
    render();
  } else if (action === 'notes') {
    openNotesView();
    go('notes');
  } else if (action === 'mark') {
    markFeedback(currentList()[state.detail.index].id, id);
    render();
  } else if (action === 'clear-feedback') {
    clearFeedback();
    openNotesView();
    render();
  } else if (action === 'clear-seen') {
    clearSeen();
    state.notice = 'Done. Starters you have seen can come up again.';
    render();
  } else if (action === 'clear-recent') {
    clearRecent();
    state.notice = 'Done. The "Again" list is empty.';
    render();
  } else if (action === 'refresh') {
    location.replace(`${location.pathname}#group`);
    location.reload();
  } else if (action === 'check-update') {
    if (updateReady()) {
      location.replace(`${location.pathname}#group`);
      location.reload();
      return;
    }
    state.notice = 'Checking…';
    render();
    checkForUpdate().then((result) => {
      state.notice = {
        ready: 'A new version is ready. Tap the button above to refresh.',
        current: "You're on the latest version.",
        offline: "Couldn't check: no connection. Spark still works offline.",
      }[result];
      if (state.step === 'settings') render();
    });
  } else if (action === 'dismiss-hint') {
    dismissHint();
    render();
  } else if (action === 'install') {
    install().then(render);
  } else if (action === 'restart') {
    go('group');
  } else if (action === 'back') {
    history.back();
  }
});

// The phone's own back button or swipe, and the Back buttons.
window.addEventListener('popstate', () => {
  const step = location.hash.slice(1) || 'group';
  const chosen = state.who && state.purpose;
  const ready = {
    group: true,
    who: Boolean(state.group),
    purpose: Boolean(state.who),
    results: Boolean(chosen),
    saved: true,
    settings: true,
    notes: true,
    detail: Boolean(state.detail && ({ saved: state.savedView.length, notes: state.notesView.length }[state.detail.from]
      ?? chosen)),
  };
  state.step = ready[step] ? step : 'group';
  // Coming back to Saved or Your notes: show the list as it is now.
  if (state.step === 'saved') openSavedView();
  if (state.step === 'notes') openNotesView();
  if (state.step === 'results' && !state.starters.length) startResults();
  render();
});

// A new version finished downloading: show the Refresh note if on the first screen.
document.addEventListener('spark-update', () => {
  if (state.step === 'group' || state.step === 'settings') render();
});

// Android tells us a moment after loading that the app can be installed.
document.addEventListener('spark-installable', () => {
  if (state.step === 'group') render();
});

async function start() {
  startOffline();
  history.replaceState(null, '', '#group');
  render();
  [state.library, state.support] = await Promise.all([loadLibrary(), loadSupport()]);
}

start();
