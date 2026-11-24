import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWeatherUrl, formatWeatherTime, parseWeather, safeTimeZone, weatherTimeZoneLabel, WEATHER_URL } from '../src/weather.js';

const response = { timezone: 'Asia/Manila', current: { time: 1795539600, temperature_2m: 27.7, relative_humidity_2m: 80, apparent_temperature: 31.8 } };

test('requests Las Piñas by default and supports current coordinates', () => {
  const url = new URL(WEATHER_URL);
  assert.equal(url.searchParams.get('latitude'), '14.444546');
  assert.equal(url.searchParams.get('longitude'), '120.993874');
  assert.equal(url.searchParams.get('timezone'), 'auto');
  assert.equal(url.searchParams.get('timeformat'), 'unixtime');
  const current = new URL(createWeatherUrl({ latitude: 35.68, longitude: 139.69 }));
  assert.equal(current.searchParams.get('latitude'), '35.68');
  assert.equal(current.searchParams.get('longitude'), '139.69');
  assert.throws(() => createWeatherUrl({ latitude: 91, longitude: 0 }));
});

test('uses absolute API timestamps and the model location timezone', () => {
  const result = parseWeather(response);
  assert.equal(result.temperature, 27.7);
  assert.equal(result.humidity, 80);
  assert.equal(result.apparent, 31.8);
  assert.equal(result.time.getTime(), 1795539600000);
  assert.equal(result.timeZone, 'Asia/Manila');
  assert.equal(safeTimeZone('Not/AZone'), 'UTC');
  assert.doesNotThrow(() => formatWeatherTime(result.time, 'Not/AZone'));
});

test('rejects missing, invalid or null readings rather than displaying zero', () => {
  for (const input of [null, {}, { current: { ...response.current, temperature_2m: null } }, { current: { ...response.current, relative_humidity_2m: 101 } }, { current: { ...response.current, time: 'invalid' } }]) {
    assert.throws(() => parseWeather(input));
  }
});

test('labels the Philippine time zone without mistaking it for the weather location', () => {
  assert.equal(weatherTimeZoneLabel('Asia/Manila'), 'Philippine time');
  assert.equal(weatherTimeZoneLabel('Asia/Tokyo'), 'Asia/Tokyo');
  assert.equal(weatherTimeZoneLabel('Invalid/Zone'), 'UTC');
});
