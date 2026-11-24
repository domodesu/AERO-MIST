import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE_HISTORY_KEY, SAMPLE_RETENTION_MS, pruneSampleHistory, parseSampleHistory, writeSampleHistory, sampleLocation, compareTemperatures, compareHumidity, formatDifference } from '../src/sampleHistory.js';

const sample = { id: 'sample-1', recordedAt: 10000000, temperature: 28.4, humidity: 64, phase: 'misting', outdoor: null };

test('sample snapshots expire individually at one hour', () => {
  const now = sample.recordedAt + SAMPLE_RETENTION_MS;
  const newer = { ...sample, id: 'sample-2', recordedAt: sample.recordedAt + 1 };
  assert.deepEqual(pruneSampleHistory([sample, newer], now), [newer]);
  assert.deepEqual(pruneSampleHistory([sample], now - 1), [sample]);
  assert.deepEqual(pruneSampleHistory([sample], sample.recordedAt - 1), []);
});

test('bad and missing sample data does not become history', () => {
  assert.deepEqual(parseSampleHistory('not json'), []);
  assert.deepEqual(pruneSampleHistory([{ ...sample, humidity: null }, { ...sample, phase: 'unknown' }], sample.recordedAt), []);
  assert.equal(SAMPLE_HISTORY_KEY, 'aero-mist-sample-history-v1');
});

test('comparisons use temperature differences and humidity percentage points', () => {
  assert.equal(formatDifference(compareTemperatures(30, 28, 'C'), '°C'), '+2.0 °C');
  assert.equal(formatDifference(compareTemperatures(30, 28, 'F'), '°F'), '+3.6 °F');
  assert.equal(formatDifference(compareHumidity(64, 80), 'percentage points'), '-16.0 percentage points');
  assert.equal(formatDifference(compareTemperatures(28, null), '°C'), 'Unavailable');
  assert.equal(formatDifference(compareHumidity(null, 80), 'pp'), 'Unavailable');
});

test('pruning sample snapshots never touches actual-system history', () => {
  const values = new Map([['aero-mist-actual-history', JSON.stringify([{ id: 'real-entry' }])]]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  writeSampleHistory(storage, [sample]);
  writeSampleHistory(storage, pruneSampleHistory([sample], sample.recordedAt + SAMPLE_RETENTION_MS));
  assert.equal(values.get(SAMPLE_HISTORY_KEY), '[]');
  assert.equal(values.get('aero-mist-actual-history'), JSON.stringify([{ id: 'real-entry' }]));
});

test('preserves the location of older sample snapshots', () => {
  assert.equal(sampleLocation(sample), 'Las Piñas');
  assert.equal(sampleLocation({ ...sample, location: 'Manila' }), 'Manila');
});
