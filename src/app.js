// The screens: Who, How well, Where, then the starters.
// One "state" object holds the choices; render() draws the current screen.

import { WHO, GROUPS, CLOSENESS, WHERE, DEPTHS, findWho, findWhere, findCloseness } from './config.js';
import { pickSet, defaultLevel, depthCeiling } from './matching.js';
import { pickExit, pickHardTime, pickReassurance } from './support.js';
import { loadLibrary, loadSupport } from './library.js';
import { getSeen, addSeen } from './storage.js';
import { startOffline, installHint, dismissHint, install } from './install.js';

const root = document.getElementById('app');

const state = {
  step: 'who',        // who | how | where | results
  who: null,
  closeness: null,
  where: null,
  level: 0,          // 0 light, 1 medium, 2 deep
  hardTime: false,   // "They're having a hard time" switch
  starters: [],
  supportLines: [],  // shown instead of starters when hardTime is on
  exit: null,
  reassurance: '',
  library: [],
  support: null,
};

// Turn text into safe HTML, so nothing in the data can break the page.
function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function selection() {
  return { who: state.who, closeness: state.closeness, where: state.where };
}

function chip(action, id, label, hint) {
  return `<button class="chip" data-action="${action}" data-id="${esc(id)}">
    <span class="chip-label">${esc(label)}</span>
    ${hint ? `<span class="chip-hint">${esc(hint)}</span>` : ''}
  </button>`;
}

function header(title, sub) {
  const back = state.step === 'who' ? '' :
    '<button class="back" data-action="back" aria-label="Back">&#8249; Back</button>';
  return `<header class="top">
    <div class="top-row"><span class="brand">Spark</span>${back}</div>
    <h1 class="title" tabindex="-1">${esc(title)}</h1>
    ${sub ? `<p class="sub">${esc(sub)}</p>` : ''}
  </header>`;
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

function whoScreen() {
  const groups = GROUPS.map((group) => `
    <h2 class="group">${esc(group)}</h2>
    <div class="chips">${WHO.filter((w) => w.group === group)
      .map((w) => chip('who', w.id, w.label)).join('')}</div>`).join('');
  return `${header('Who are you talking to?')}${installCard()}<div class="choices">${groups}</div>`;
}

function howScreen() {
  const person = findWho(state.who);
  const options = CLOSENESS.filter((c) => person.closeness.includes(c.id));
  return `${header('How well do you know them?', person.label)}
    <div class="choices"><div class="chips one">${options
      .map((c) => chip('closeness', c.id, c.label, c.hint)).join('')}</div></div>`;
}

function whereScreen() {
  const person = findWho(state.who);
  const options = WHERE.filter((w) => person.where.includes(w.id));
  const sub = `${person.label} · ${findCloseness(state.closeness).label}`;
  return `${header('Where are you?', sub)}
    <div class="choices"><div class="chips one">${options
      .map((w) => chip('where', w.id, w.label)).join('')}</div></div>`;
}

function depthTag(depth) {
  const level = DEPTHS.indexOf(depth);
  const dots = DEPTHS.map((_, i) => (i <= level ? '●' : '○')).join('');
  const name = depth[0].toUpperCase() + depth.slice(1);
  return `<span class="depth" aria-label="Depth: ${name}">${dots} ${name}</span>`;
}

function starterCard(s) {
  const more = s.followUps.slice(1).map((f) => `<p class="follow">${esc(f)}</p>`).join('');
  const cue = s.deliveryCue ? `<p class="label">Tip</p><p class="cue">${esc(s.deliveryCue)}</p>` : '';
  return `<article class="card">
    <p class="line">${esc(s.line)}</p>
    <p class="label">Then ask</p>
    <p class="follow">${esc(s.followUps[0])}</p>
    <details>
      <summary>More</summary>
      ${more}
      <p class="label">Your turn</p>
      <p class="share">${esc(s.shareBack)}</p>
      ${cue}
      ${depthTag(s.depth)}
    </details>
  </article>`;
}

function supportCard(h) {
  const tip = h.tip ? `<p class="label">Tip</p><p class="cue">${esc(h.tip)}</p>` : '';
  return `<article class="card support">
    <p class="line">${esc(h.line)}</p>
    ${tip}
  </article>`;
}

function exitCard() {
  // No wrap-up line in hard-time mode: staying matters more than leaving well.
  if (!state.exit || state.hardTime) return '';
  return `<article class="card exit">
    <p class="label">When it's time to go</p>
    <p class="exit-line">${esc(state.exit.line)}</p>
  </article>`;
}

function levelName(level) {
  const name = DEPTHS[level];
  return name[0].toUpperCase() + name.slice(1);
}

function resultsScreen() {
  const sub = [findWho(state.who).label, findCloseness(state.closeness).label,
    findWhere(state.where).label].join(' · ');
  const ceiling = depthCeiling(selection());
  let cards;
  let note;
  if (state.hardTime) {
    cards = state.supportLines.map(supportCard).join('');
    note = 'Skip "How are you?", advice, and "at least". Being there and listening is enough.';
  } else {
    cards = state.starters.length
      ? state.starters.map(starterCard).join('')
      : '<p class="empty">No starters for this combination yet.</p>';
    note = state.reassurance;
  }
  const lighterOff = state.hardTime || state.level === 0 ? 'disabled' : '';
  const deeperOff = state.hardTime || state.level >= ceiling ? 'disabled' : '';
  const dots = DEPTHS.map((_, i) => (i <= state.level ? '●' : '○')).join('');
  const depthNow = state.hardTime ? '' :
    `<p class="depth-now" aria-live="polite">${dots} ${levelName(state.level)}</p>`;
  return `${header(state.hardTime ? 'Be there first' : 'Try one of these', sub)}
    <button class="switch" data-action="hard-time" aria-pressed="${state.hardTime}">
      <span class="switch-box" aria-hidden="true">${state.hardTime ? '✓' : ''}</span>
      <span>They're having a hard time</span>
    </button>
    <p class="note">${esc(note)}</p>
    <div class="cards">${cards}${exitCard()}</div>
    <button class="link" data-action="restart">Start over</button>
    <div class="bar">
      ${depthNow}
      <div class="bar-row">
        <button class="secondary" data-action="lighter" ${lighterOff}>Lighter</button>
        <button class="primary" data-action="shuffle">Shuffle</button>
        <button class="secondary" data-action="deeper" ${deeperOff}>Deeper</button>
      </div>
    </div>`;
}

function render() {
  const screens = { who: whoScreen, how: howScreen, where: whereScreen, results: resultsScreen };
  root.innerHTML = screens[state.step]();
  root.dataset.step = state.step;
  window.scrollTo(0, 0);
  const title = root.querySelector('.title');
  if (title) title.focus({ preventScroll: true });
}

function newSet() {
  if (state.hardTime) {
    state.supportLines = pickHardTime(state.support, selection());
  } else {
    state.starters = pickSet(state.library, selection(), { level: state.level, seen: getSeen() });
    addSeen(state.starters.map((s) => s.id));
  }
  state.exit = pickExit(state.support, selection());
  state.reassurance = pickReassurance(state.support, selection());
}

// A fresh person or place starts again at the default depth, switch off.
function startResults() {
  state.level = defaultLevel(selection());
  state.hardTime = false;
}

function go(step) {
  state.step = step;
  if (step === 'results') newSet();
  if (location.hash !== `#${step}`) history.pushState(null, '', `#${step}`);
  render();
}

function back() {
  const person = findWho(state.who);
  const skipHow = person && person.closeness.length === 1;
  const previous = { how: 'who', where: skipHow ? 'who' : 'how', results: 'where' }[state.step];
  go(previous || 'who');
}

root.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'who') {
    state.who = id;
    const person = findWho(id);
    if (person.closeness.length === 1) {
      // Only one answer makes sense, so skip the "How well" step.
      state.closeness = person.closeness[0];
      go('where');
    } else {
      go('how');
    }
  } else if (action === 'closeness') {
    state.closeness = id;
    go('where');
  } else if (action === 'where') {
    state.where = id;
    startResults();
    go('results');
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
    go('who');
  } else if (action === 'back') {
    back();
  }
});

// The phone's own back button or swipe.
window.addEventListener('popstate', () => {
  const step = location.hash.slice(1) || 'who';
  const ready = { who: true, how: state.who, where: state.who && state.closeness,
    results: state.who && state.closeness && state.where };
  state.step = ready[step] ? step : 'who';
  if (state.step === 'results' && !state.starters.length) { startResults(); newSet(); }
  render();
});

// Android tells us a moment after loading that the app can be installed.
document.addEventListener('spark-installable', () => {
  if (state.step === 'who') render();
});

async function start() {
  startOffline();
  history.replaceState(null, '', '#who');
  render();
  [state.library, state.support] = await Promise.all([loadLibrary(), loadSupport()]);
}

start();
