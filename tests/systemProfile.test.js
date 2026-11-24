import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialSystemProfile, saveSystemProfile, PROFILE_STORAGE_KEY } from '../src/systemProfile.js';

test('uses the saved profile while disconnected, but prioritizes a connected device', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  assert.equal(initialSystemProfile(storage, false), 'sample');
  saveSystemProfile(storage, 'device');
  assert.equal(values.get(PROFILE_STORAGE_KEY), 'device');
  assert.equal(initialSystemProfile(storage, false), 'device');
  saveSystemProfile(storage, 'sample');
  assert.equal(initialSystemProfile(storage, true), 'device');
});

test('defaults safely when storage is blocked', () => {
  const storage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(initialSystemProfile(storage, false), 'sample');
  assert.equal(initialSystemProfile(storage, true), 'device');
  assert.doesNotThrow(() => saveSystemProfile(storage, 'device'));
});
