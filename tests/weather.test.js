import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseWeather, WEATHER_URL } from '../src/weather.js';

const response = { current: { time: '2026-11-25T01:00', temperature_2m: 27.7, relative_humidity_2m: 80, apparent_temperature: 31.8 } };

test('requests Las Piñas weather with Manila timezone', () => {
  const url = new URL(WEATHER_URL);
  assert.equal(url.searchParams.get('latitude'), '14.444546');
  assert.equal(url.searchParams.get('longitude'), '120.993874');
  assert.equal(url.searchParams.get('timezone'), 'Asia/Manila');
});

test('parses weather and interprets the model time in Manila', () => {
  const result = parseWeather(response);
  assert.equal(result.temperature, 27.7);
  assert.equal(result.humidity, 80);
  assert.equal(result.apparent, 31.8);
  assert.equal(result.time.toISOString(), '2026-11-24T17:00:00.000Z');
});

test('rejects missing, invalid or null readings rather than displaying zero', () => {
  for (const input of [null, {}, { current: { ...response.current, temperature_2m: null } }, { current: { ...response.current, relative_humidity_2m: 101 } }, { current: { ...response.current, time: 'invalid' } }]) {
    assert.throws(() => parseWeather(input));
  }
});
