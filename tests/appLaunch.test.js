import { test } from 'node:test';
import assert from 'node:assert/strict';
import { APP_SESSION_KEY, getInitialAppState } from '../src/appLaunch.js';
import { PROFILE_STORAGE_KEY } from '../src/systemProfile.js';

const appAgent = 'Mozilla/5.0 (Linux; Android 14; Pixel; wv) AppleWebKit/537.36 Version/4.0 Chrome/123.0 Mobile Safari/537.36';
const browserAgent = 'Mozilla/5.0 (Linux; Android 14; Pixel) AppleWebKit/537.36 Chrome/123.0 Mobile Safari/537.36';
function storage(entries = []) {
  const values = new Map(entries);
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
}

test('Android app launches to Environment and the actual device profile without clearing user data', () => {
  const local = storage([[PROFILE_STORAGE_KEY, 'sample'], ['sample-timer', '123'], ['sample-history', 'kept']]);
  const session = storage();
  const first = getInitialAppState({ userAgent: appAgent, sessionStorage: session, localStorage: local, hash: '#history' });
  assert.deepEqual(first, { tab: 'environment', profile: 'device', resetHash: true });
  assert.equal(session.getItem(APP_SESSION_KEY), 'started');
  assert.equal(local.getItem('sample-timer'), '123');
  assert.equal(local.getItem('sample-history'), 'kept');
  // After a user changes profile, a page update/reload should not reset it.
  const reload = getInitialAppState({ userAgent: appAgent, sessionStorage: session, localStorage: local, hash: '#history' });
  assert.deepEqual(reload, { tab: 'history', profile: 'sample', resetHash: false });
  // The native launcher loads a hashless URL even if the session marker remains.
  const relaunched = getInitialAppState({ userAgent: appAgent, sessionStorage: session, localStorage: local, hash: '' });
  assert.deepEqual(relaunched, { tab: 'environment', profile: 'device', resetHash: true });
  // A new WebView session should start fresh again.
  const reopened = getInitialAppState({ userAgent: appAgent, sessionStorage: storage(), localStorage: local, hash: '#system' });
  assert.deepEqual(reopened, { tab: 'environment', profile: 'device', resetHash: true });
});

test('regular browsers keep existing selection and hash navigation', () => {
  const local = storage([[PROFILE_STORAGE_KEY, 'sample']]);
  const session = storage();
  assert.deepEqual(getInitialAppState({ userAgent: browserAgent, sessionStorage: session, localStorage: local, hash: '#history' }), { tab: 'history', profile: 'sample', resetHash: false });
  assert.equal(session.values.size, 0);
});

test('falls back to the app startup defaults when session storage is unavailable', () => {
  const blocked = { getItem() { throw Error('blocked'); } };
  assert.deepEqual(getInitialAppState({ userAgent: appAgent, sessionStorage: blocked, localStorage: null, hash: '#history' }), { tab: 'environment', profile: 'device', resetHash: true });
});
