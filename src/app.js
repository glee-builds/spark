// The screens and what happens on each tap.
//
// The flow is a few short screens, each one fitting on the phone without scrolling:
//   group (Family, Friends, ...) -> who -> how well -> where -> starters -> detail
// One "state" object holds the choices; render() draws the current screen.

import {
  WHO, GROUPS, CLOSENESS, WHERE, DEPTHS, GOAL_LABELS, COMFORT, findWho, findWhere, findCloseness,
} from './config.js';
import { pickSet, defaultLevel, depthCeiling, availableGoals } from './matching.js';
import { pickExits, pickHardTime, pickReassurance } from './support.js';
import { loadLibrary, loadSupport } from './library.js';
import {
  getSeen, addSeen, getRecent, addRecent, getSaved, toggleSaved,
  getComfort, setComfort, clearSeen, clearRecent, getFeedback, markFeedback, clearFeedback,
} from './storage.js';
import { startOffline, installHint, dismissHint, install, updateReady } from './install.js';

const root = document.getElementById('app');

const state = {
  step: 'group',     // group | who | how | where | results | aim | detail | saved | settings | notes
  group: null,
  who: null,
  closeness: null,
  where: null,
  level: 0,          // 0 light, 1 medium, 2 deep
  goal: null,        // the chosen aim, or null for any
  hardTime: false,   // "They're having a hard time" switch
  starters: [],
  supportLines: [],  // shown instead of starters when hardTime is on
  exits: [],
  detail: null,      // { kind: 'starter' | 'support' | 'exit', index, from: 'results' | 'saved' | 'notes' }
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
const KIND_LABEL = { presence: 'Be there', listen: 'Invite', offer: 'Offer help' };

// Turn text into safe HTML, so nothing in the data can break the page.
function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function selection() {
  return { who: state.who, closeness: state.closeness, where: state.where, comfort: getComfort() };
}

function summary() {
  return [findWho(state.who).label, findCloseness(state.closeness).label,
    findWhere(state.where).label].join(' · ');
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

function choice(action, id, label, hint) {
  return `<button class="chip" data-action="${action}" data-id="${esc(id)}">
    <span class="chip-label">${esc(label)}</span>
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

// ---------- The choice screens ----------

// Up to two recent situations, each one tap from the starters.
function recentRows() {
  const recent = getRecent().filter((r) => findWho(r.who) && findWhere(r.where) && findCloseness(r.closeness));
  if (!recent.length) return '';
  const rows = recent.map((r, i) => `
    <button class="recent" data-action="recent" data-index="${i}">
      <span>${esc(findWho(r.who).label)} · ${esc(findWhere(r.where).label)}</span>
      <span class="chev" aria-hidden="true">&#8250;</span>
    </button>`).join('');
  return `<div class="recents"><p class="label">Again</p>${rows}</div>`;
}

function topLinks() {
  const saved = getSaved().length;
  const savedLink = saved ? `<button class="top-link" data-action="saved">&#9733; Saved (${saved})</button>` : '';
  return `<span class="top-links">${savedLink}
    <button class="top-link" data-action="settings">Settings</button></span>`;
}

function groupScreen() {
  const tiles = GROUPS.map((g) => `
    <button class="tile" data-action="group" data-id="${esc(g.id)}">
      <span class="tile-label">${esc(g.id)}</span>
      <span class="tile-hint">${esc(g.hint)}</span>
      <span class="chev" aria-hidden="true">&#8250;</span>
    </button>`).join('');
  return `${header({ title: 'Who are you talking to?', back: false, right: topLinks() })}
    ${installCard()}
    <div class="choices">${recentRows()}${tiles}</div>`;
}

function whoScreen() {
  const people = WHO.filter((w) => w.group === state.group);
  return `${header({ title: 'Who exactly?', sub: state.group })}
    <div class="choices">${people.map((w) => choice('who', w.id, w.label)).join('')}</div>`;
}

function howScreen() {
  const person = findWho(state.who);
  const options = CLOSENESS.filter((c) => person.closeness.includes(c.id));
  return `${header({ title: 'How well do you know them?', sub: person.label })}
    <div class="choices">${options.map((c) => choice('closeness', c.id, c.label, c.hint)).join('')}</div>`;
}

function whereScreen() {
  const person = findWho(state.who);
  const options = WHERE.filter((w) => person.where.includes(w.id));
  const sub = `${person.label} · ${findCloseness(state.closeness).label}`;
  const reassure = state.support
    ? `<p class="reassure">${esc(pickReassurance(state.support, { closeness: state.closeness }))}</p>` : '';
  return `${header({ title: 'Where are you?', sub })}
    ${reassure}
    <div class="choices">${options.map((w) => choice('where', w.id, w.label)).join('')}</div>`;
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

function resultsScreen() {
  const rows = state.hardTime
    ? state.supportLines.map((h, i) => row('support', i, KIND_LABEL[h.kind], h.line))
    : state.starters.map((s, i) => row('starter', i, starterLabel(s, i), s.line));
  const empty = rows.length ? '' : '<p class="empty">No starters for this combination yet.</p>';
  const note = state.hardTime
    ? '<p class="note">Skip "How are you?" and advice. Being there is enough.</p>' : '';
  // No wrap-up line in hard-time mode: staying matters more than leaving well.
  const wrap = state.hardTime || !state.exits.length ? '' : `
    <button class="row wrap" data-action="open" data-kind="exit" data-index="0">
      <span class="row-text"><span class="row-line small">Wrap up: when it's time to go</span></span>
      <span class="chev" aria-hidden="true">&#8250;</span>
    </button>`;
  const ceiling = depthCeiling(selection());
  const lighterOff = state.hardTime || state.level === 0 ? 'disabled' : '';
  const deeperOff = state.hardTime || state.level >= ceiling ? 'disabled' : '';
  const depth = state.hardTime ? 'Be there first'
    : `${depthDots(state.level)} ${levelName(state.level)}`;
  return `${header({ sub: summary(), right: '<button class="top-link" data-action="restart">Start over</button>' })}
    <div class="tools">
      <button class="aim" data-action="aim" ${state.hardTime ? 'disabled' : ''}>
        Aim: <strong>${esc(state.goal ? GOAL_LABELS[state.goal] : 'Any')}</strong>
        <span class="chev" aria-hidden="true">&#8250;</span>
      </button>
      <button class="toggle" data-action="hard-time" aria-pressed="${state.hardTime}"
        aria-label="They're having a hard time">
        <span class="toggle-box" aria-hidden="true">${state.hardTime ? '&#10003;' : ''}</span>
        Hard time
      </button>
    </div>
    ${note}
    <div class="rows">${rows.join('')}${empty}</div>
    ${wrap}
    <div class="bar">
      <p class="depth-now" aria-live="polite">${depth}</p>
      <div class="bar-row">
        <button class="secondary" data-action="lighter" ${lighterOff}>Lighter</button>
        <button class="primary" data-action="shuffle">Shuffle</button>
        <button class="secondary" data-action="deeper" ${deeperOff}>Deeper</button>
      </div>
    </div>`;
}

// ---------- Choosing an aim ----------

function aimScreen() {
  const goals = availableGoals(state.library, selection());
  const options = [choice('goal', '', 'Any', 'A mix, picked for the person and place')]
    .concat(goals.map((g) => choice('goal', g, GOAL_LABELS[g])));
  return `${header({ title: 'What are you going for?', sub: summary() })}
    <div class="choices">${options.join('')}</div>`;
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
  const comfort = COMFORT.map((c) => `
    <button class="chip" data-action="comfort" data-id="${c.id}" aria-pressed="${c.id === current}">
      <span class="chip-label">${c.id === current ? '&#10003; ' : ''}${esc(c.label)}</span>
      <span class="chip-hint">${esc(c.hint)}</span>
    </button>`).join('');
  return `${header({ title: 'Settings' })}
    <p class="label">Comfort</p>
    <div class="settings-group">${comfort}</div>
    <p class="label">Start fresh</p>
    <div class="settings-group">
      <button class="chip" data-action="clear-seen"><span class="chip-label">Show starters I've seen again</span></button>
      <button class="chip" data-action="clear-recent"><span class="chip-label">Clear the "Again" list</span></button>
    </div>
    ${state.notice ? `<p class="note" role="status">${esc(state.notice)}</p>` : ''}
    <p class="label">Review</p>
    <div class="settings-group">
      <button class="chip" data-action="notes"><span class="chip-label">Your notes: what worked and what fell flat</span></button>
    </div>
    <p class="about">Starters follow published conversation research and coaching advice.
      Nothing you tap leaves this phone.</p>`;
}

// ---------- One starter, in full ----------

// The list the open detail belongs to, for the arrows.
function currentList() {
  if (state.detail.kind === 'support') return state.supportLines;
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

function supportDetail() {
  const h = state.supportLines[state.detail.index];
  const tip = h.tip ? `<p class="tipbox"><strong>Tip</strong> ${esc(h.tip)}</p>` : '';
  return `${header({ sub: summary() })}
    <div class="detail">
      <p class="row-label">${esc(KIND_LABEL[h.kind])}</p>
      <p class="say">${esc(h.line)}</p>
      ${tip}
      <p class="label">Then</p>
      <p class="plain">Listen. Let silence be okay. Skip advice unless they ask.</p>
    </div>
    ${detailBar(state.supportLines.length)}`;
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
  const views = { exit: exitDetail, support: supportDetail, starter: starterDetail };
  return views[state.detail.kind]();
}

// ---------- Drawing ----------

// If the list is taller than the screen, drop starters from the end until it
// fits, so the whole set can be read without scrolling. Never fewer than two.
function fitToScreen() {
  const tooTall = () => root.scrollHeight > window.innerHeight + 1;
  const list = state.hardTime ? state.supportLines : state.starters;
  while (tooTall() && list.length > 2) {
    list.pop();
    const rows = root.querySelectorAll('.rows .row');
    rows[rows.length - 1].remove();
  }
  if (state.freshSet && !state.hardTime) {
    addSeen(state.starters.map((s) => s.id));
    state.freshSet = false;
  }
}

function render() {
  const screens = {
    group: groupScreen, who: whoScreen, how: howScreen, where: whereScreen,
    results: resultsScreen, aim: aimScreen, detail: detailScreen, saved: savedScreen,
    settings: settingsScreen, notes: notesScreen,
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
  if (state.hardTime) {
    state.supportLines = pickHardTime(state.support, selection());
  } else {
    state.starters = pickSet(state.library, selection(), {
      level: state.level, seen: getSeen(), goal: state.goal, feedback: getFeedback(),
    });
    state.freshSet = true;
  }
  state.exits = pickExits(state.support, selection());
}

// A fresh person or place starts again at the default depth, switch off.
function startResults() {
  state.level = defaultLevel(selection());
  state.hardTime = false;
  state.goal = null;
  newSet();
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
  const person = findWho(id);
  if (person.closeness.length === 1) {
    // Only one answer makes sense, so skip the "How well" step.
    state.closeness = person.closeness[0];
    go('where');
  } else {
    go('how');
  }
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

function openSaved() {
  openSavedView();
  go('saved');
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
    // A group with one person (Friends) goes straight past the "Who exactly" step.
    if (people.length === 1) chooseWho(people[0].id);
    else go('who');
  } else if (action === 'who') {
    chooseWho(id);
  } else if (action === 'closeness') {
    state.closeness = id;
    go('where');
  } else if (action === 'where') {
    state.where = id;
    addRecent(selection());
    startResults();
    go('results');
  } else if (action === 'recent') {
    const r = getRecent()[Number(button.dataset.index)];
    Object.assign(state, { group: findWho(r.who).group, who: r.who, closeness: r.closeness, where: r.where });
    addRecent(selection());
    startResults();
    go('results');
  } else if (action === 'aim') {
    go('aim');
  } else if (action === 'goal') {
    state.goal = id || null;
    newSet();
    history.back();
  } else if (action === 'open') {
    openDetail(button.dataset.kind, Number(button.dataset.index), button.dataset.from);
  } else if (action === 'saved') {
    openSaved();
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
  } else if (action === 'save') {
    toggleSaved(currentList()[state.detail.index].id);
    render();
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
  } else if (action === 'hard-time') {
    state.hardTime = !state.hardTime;
    newSet();
    render();
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
  const chosen = state.who && state.closeness && state.where;
  const ready = {
    group: true,
    who: Boolean(state.group),
    how: Boolean(state.who),
    where: Boolean(state.who && state.closeness),
    results: Boolean(chosen),
    aim: Boolean(chosen),
    saved: true,
    settings: true,
    notes: true,
    detail: Boolean(state.detail && ({ saved: state.savedView.length, notes: state.notesView.length }[state.detail.from]
      ?? chosen)),
  };
  state.step = ready[step] ? step : 'group';
  // Coming back to Saved: show the list as it is now.
  if (state.step === 'saved') openSavedView();
  if (state.step === 'notes') openNotesView();
  if (state.step === 'results' && !state.starters.length && !state.supportLines.length) startResults();
  render();
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
