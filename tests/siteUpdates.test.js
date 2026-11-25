import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldReloadForVersion, startSiteUpdateChecks } from '../src/siteUpdates.js';

test('only reloads for a new valid version and throttles retries', () => {
  assert.equal(shouldReloadForVersion('a', 'a', null, 500_000), false);
  assert.equal(shouldReloadForVersion('a', undefined, null, 500_000), false);
  assert.equal(shouldReloadForVersion('a', 'b', null, 500_000), true);
  assert.equal(shouldReloadForVersion('a', 'b', { version: 'b', time: 450_000 }, 500_000), false);
  assert.equal(shouldReloadForVersion('a', 'b', { version: 'b', time: 100_000 }, 500_000), true);
  assert.equal(shouldReloadForVersion('a', 'c', { version: 'b', time: 450_000 }, 500_000), true);
});

test('checks deployed base path and reloads without clearing app storage', async () => {
  let reloaded = 0, requested;
  const storage = new Map();
  const doc = { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} };
  const win = { setInterval: () => 1, clearInterval() {} };
  const stop = startSiteUpdateChecks({ current: 'old', base: '/AERO-MIST/', document: doc, window: win,
    location: { origin: 'https://domodesu.github.io', reload() { reloaded++; } },
    storage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    fetcher: async url => { requested = url.href; return { ok: true, json: async () => ({ version: 'new' }) }; } });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested, 'https://domodesu.github.io/AERO-MIST/version.json');
  assert.equal(reloaded, 1);
  assert.equal(storage.size, 1);
  stop();
});
