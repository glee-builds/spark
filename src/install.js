// Offline support and the "add to home screen" hint.

import { getFlag, setFlag } from './storage.js';

const HINT_KEY = 'spark.installHintDone';

let installEvent = null;   // Android and desktop Chrome hand us this when installable.

// Start the service worker (sw.js), which saves the app for offline use.
export function startOffline() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // No service worker (private mode, old browser). The app still works online.
    });
  }
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installEvent = event;
    document.dispatchEvent(new Event('spark-installable'));
  });
}

function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function isIphone() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Which hint to show on the first screen: 'ios', 'button', or null for none.
export function installHint() {
  if (isInstalled() || getFlag(HINT_KEY)) return null;
  if (installEvent) return 'button';
  if (isIphone()) return 'ios';
  return null;
}

export function dismissHint() {
  setFlag(HINT_KEY);
}

// Android and desktop: open the browser's own install dialog.
export async function install() {
  if (!installEvent) return;
  installEvent.prompt();
  await installEvent.userChoice;
  installEvent = null;
  setFlag(HINT_KEY);
}
