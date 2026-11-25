import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currentLocation, DEFAULT_WEATHER_LOCATION, distanceMetres, shouldUpdateLocation, validCoordinates } from '../src/weatherLocation.js';

test('uses Las Piñas as the fallback and validates coordinates', () => {
  assert.equal(DEFAULT_WEATHER_LOCATION.name, 'Las Piñas');
  assert.equal(validCoordinates(14.4, 120.9), true);
  assert.equal(validCoordinates(91, 120), false);
  assert.equal(validCoordinates(14, NaN), false);
  assert.throws(() => currentLocation(120, 1));
});

test('ignores minor location changes but updates after a meaningful move', () => {
  const first = currentLocation(14.444, 120.993, 100);
  assert.equal(shouldUpdateLocation(DEFAULT_WEATHER_LOCATION, first), true);
  assert.equal(shouldUpdateLocation(first, { latitude: 14.445, longitude: 120.993, accuracy: 50 }), false);
  assert.equal(shouldUpdateLocation(first, { latitude: 14.46, longitude: 120.993, accuracy: 50 }), true);
  assert.equal(shouldUpdateLocation(first, { latitude: 14.46, longitude: 120.993, accuracy: 5000 }), false);
  assert.ok(distanceMetres(first, { latitude: 14.46, longitude: 120.993 }) > 1000);
});

test('does not include coordinates in the history location key', () => {
  const location = currentLocation(14.444, 120.993);
  assert.ok(location.key.startsWith('current-'));
  assert.equal(location.key.includes('14.444'), false);
  assert.equal(location.key.includes('120.993'), false);
});
