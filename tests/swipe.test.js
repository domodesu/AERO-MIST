import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isMenuOpenSwipe } from '../src/swipe.js';

test('opens only for a deliberate predominantly horizontal right swipe', () => {
  const start = { x: 20, y: 100 };
  assert.equal(isMenuOpenSwipe(start, { x: 110, y: 120 }), true);
  assert.equal(isMenuOpenSwipe(start, { x: 94, y: 100 }), false);
  assert.equal(isMenuOpenSwipe(start, { x: 5, y: 100 }), false);
  assert.equal(isMenuOpenSwipe(start, { x: 110, y: 240 }), false);
  assert.equal(isMenuOpenSwipe(start, { x: 110, y: 160 }), false);
});
