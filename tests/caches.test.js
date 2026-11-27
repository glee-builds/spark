// Tests that the service worker's activate step only deletes Spark's own old
// caches. Other apps on the same address keep their caches in the same browser.
// Run with: node --test

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const sw = readFileSync(new URL('sw.js', root), 'utf8');

test('activate deletes only old Spark caches, not other apps\' caches', async () => {
  const deleted = [];
  let activateHandler;
  let pending;
  const context = {
    Request: class { constructor(url) { this.url = url; } },
    URL,
    self: {
      location: { origin: 'https://example.test' },
      addEventListener: (type, fn) => { if (type === 'activate') activateHandler = fn; },
      skipWaiting() {},
      clients: { claim: async () => {} },
    },
    caches: {
      keys: async () => ['spark-oldversion', 'spark-currentversion', 'other-app-v1', 'notes-cache'],
      delete: async (name) => { deleted.push(name); return true; },
      open: async () => ({ addAll: async () => {} }),
    },
  };
  vm.createContext(context);
  // Stand-in for the real sw.js VERSION: the current cache is 'spark-currentversion'.
  vm.runInContext(sw.replace(/const VERSION = '[^']*';/, "const VERSION = 'currentversion';"), context);

  activateHandler({ waitUntil: (p) => { pending = p; } });
  await pending;
  assert.deepEqual(deleted, ['spark-oldversion']);
});
