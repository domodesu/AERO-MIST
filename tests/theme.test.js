import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readTheme, saveTheme, THEME_STORAGE_KEY } from '../src/theme.js';

test('defaults to light and restores the selected appearance', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  assert.equal(readTheme(storage), 'light');
  saveTheme(storage, 'dark');
  assert.equal(values.get(THEME_STORAGE_KEY), 'dark');
  assert.equal(readTheme(storage), 'dark');
  saveTheme(storage, 'light');
  assert.equal(readTheme(storage), 'light');
});

test('works safely when storage is unavailable', () => {
  const storage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(readTheme(storage), 'light');
  assert.doesNotThrow(() => saveTheme(storage, 'dark'));
});
