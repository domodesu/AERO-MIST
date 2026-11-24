import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDemoCycle, getDemoStartTime } from '../src/demoCycle.js';

test('persists the start time across reloads in the same browser', () => {
  let value = null;
  const storage = { getItem: () => value, setItem: (_key, v) => { value = v; } };
  assert.equal(getDemoStartTime(storage, 100000), 100000);
  assert.equal(getDemoStartTime(storage, 160000), 100000);
  assert.deepEqual(getDemoCycle(getDemoStartTime(storage, 160000), 160000), { phase: 'misting', seconds: 444 });
});

test('advances through cooldown and following cycles even after time away', () => {
  const start = 100000;
  assert.deepEqual(getDemoCycle(start, start + 504000), { phase: 'cooldown', seconds: 300 });
  assert.deepEqual(getDemoCycle(start, start + 804000), { phase: 'misting', seconds: 600 });
  assert.deepEqual(getDemoCycle(start, start + 1404000), { phase: 'cooldown', seconds: 300 });
});

test('falls back to memory when storage is unavailable', () => {
  const storage = { getItem() { throw new Error('blocked'); } };
  assert.equal(getDemoStartTime(storage, 100000), 100000);
});
