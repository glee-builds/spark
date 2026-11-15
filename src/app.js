// The screens: Who, How well, Where, then the starters.
// One "state" object holds the choices; render() draws the current screen.

import { WHO, GROUPS, CLOSENESS, WHERE, DEPTHS, findWho, findWhere, findCloseness } from './config.js';
import { pickSet, defaultLevel } from './matching.js';
import { loadLibrary } from './library.js';
import { getSeen, addSeen } from './storage.js';

const root = document.getElementById('app');

const state = {
  step: 'who',        // who | how | where | results
  who: null,
  closeness: null,
  where: null,
  starters: [],
  library: [],
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

function whoScreen() {
  const groups = GROUPS.map((group) => `
    <h2 class="group">${esc(group)}</h2>
    <div class="chips">${WHO.filter((w) => w.group === group)
      .map((w) => chip('who', w.id, w.label)).join('')}</div>`).join('');
  return `${header('Who are you talking to?')}<div class="choices">${groups}</div>`;
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

function resultsScreen() {
  const sub = [findWho(state.who).label, findCloseness(state.closeness).label,
    findWhere(state.where).label].join(' · ');
  const cards = state.starters.length
    ? state.starters.map(starterCard).join('')
    : '<p class="empty">No starters for this combination yet.</p>';
  return `${header('Try one of these', sub)}
    <div class="cards">${cards}</div>
    <div class="bar">
      <button class="primary" data-action="shuffle">Shuffle</button>
      <button class="secondary" data-action="restart">Start over</button>
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
  state.starters = pickSet(state.library, selection(), {
    level: defaultLevel(selection()),
    seen: getSeen(),
  });
  addSeen(state.starters.map((s) => s.id));
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
    go('results');
  } else if (action === 'shuffle') {
    newSet();
    render();
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
  if (state.step === 'results' && !state.starters.length) newSet();
  render();
});

async function start() {
  history.replaceState(null, '', '#who');
  render();
  state.library = await loadLibrary();
}

start();
