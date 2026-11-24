import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { act, create } from 'react-test-renderer';
import useWeatherLocation from '../src/useWeatherLocation.js';
import { LOCATION_PREFERENCE_KEY } from '../src/weatherLocation.js';

function setup({ preference, permission = 'prompt', geolocation = true } = {}) {
  const store = new Map(preference ? [[LOCATION_PREFERENCE_KEY, preference]] : []);
  const watches = [];
  const cleared = [];
  const api = { watchPosition: (success, error) => { watches.push({ success, error }); return watches.length; }, clearWatch: id => cleared.push(id) };
  globalThis.window = { localStorage: { setItem: (key, value) => store.set(key, value), getItem: key => store.get(key) ?? null } };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { geolocation: geolocation ? api : undefined, permissions: { query: async () => ({ state: permission }) } } });
  let hook;
  function Harness() { hook = useWeatherLocation(); return null; }
  return { store, watches, cleared, get hook() { return hook; }, mount: async () => { let root; await act(async () => { root = create(React.createElement(Harness)); }); return root; } };
}
const position = (latitude, longitude, accuracy = 50) => ({ coords: { latitude, longitude, accuracy } });

test('asks only on selection, follows movement, and ignores callbacks after switching to Las Piñas', async () => {
  const env = setup();
  const root = await env.mount();
  assert.equal(env.watches.length, 0);
  await act(async () => env.hook.useCurrent());
  assert.equal(env.hook.status, 'requesting');
  await act(async () => env.watches[0].success(position(14.44, 120.99)));
  const first = env.hook.location;
  assert.equal(first.source, 'current');
  assert.equal(env.store.get(LOCATION_PREFERENCE_KEY), 'current');
  await act(async () => env.watches[0].success(position(14.4401, 120.99)));
  assert.equal(env.hook.location.key, first.key);
  await act(async () => env.watches[0].success(position(14.46, 120.99)));
  assert.notEqual(env.hook.location.key, first.key);
  await act(async () => env.hook.useDefault());
  assert.equal(env.hook.location.name, 'Las Piñas');
  assert.deepEqual(env.cleared, [1]);
  await act(async () => env.watches[0].success(position(15, 121)));
  assert.equal(env.hook.location.name, 'Las Piñas');
  await act(async () => root.unmount());
});

test('handles denial and unsupported location with a clear fallback', async () => {
  const env = setup();
  const root = await env.mount();
  await act(async () => env.hook.useCurrent());
  await act(async () => env.watches[0].error({ code: 1 }));
  assert.equal(env.hook.status, 'error');
  assert.match(env.hook.message, /denied/);
  assert.equal(env.hook.location.name, 'Las Piñas');
  assert.equal(env.store.get(LOCATION_PREFERENCE_KEY), 'default');
  await act(async () => root.unmount());
  const unsupported = setup({ geolocation: false });
  const other = await unsupported.mount();
  await act(async () => unsupported.hook.useCurrent());
  assert.equal(unsupported.hook.status, 'error');
  assert.match(unsupported.hook.message, /not available/);
  assert.equal(unsupported.hook.location.name, 'Las Piñas');
  await act(async () => other.unmount());
});

test('on refresh resumes only an already-granted location preference', async () => {
  const granted = setup({ preference: 'current', permission: 'granted' });
  const first = await granted.mount();
  assert.equal(granted.watches.length, 1);
  await act(async () => granted.watches[0].success(position(14.44, 120.99)));
  assert.equal(granted.hook.location.source, 'current');
  await act(async () => first.unmount());
  assert.deepEqual(granted.cleared, [1]);
  const prompt = setup({ preference: 'current', permission: 'prompt' });
  const second = await prompt.mount();
  assert.equal(prompt.watches.length, 0);
  assert.equal(prompt.hook.location.name, 'Las Piñas');
  await act(async () => second.unmount());
});
