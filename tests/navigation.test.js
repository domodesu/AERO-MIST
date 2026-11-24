import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageFromHash } from '../src/navigation.js';

test('supports linkable dashboard tabs and defaults to the system', () => {
  assert.equal(pageFromHash('#history'), 'history');
  assert.equal(pageFromHash('#environment'), 'environment');
  assert.equal(pageFromHash('#system'), 'system');
  assert.equal(pageFromHash(''), 'system');
  assert.equal(pageFromHash('#unknown'), 'system');
});
