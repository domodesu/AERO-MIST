import { DEFAULT_WEATHER_LOCATION, validCoordinates } from './weatherLocation.js';

// Open-Meteo returns modelled weather, not device sensor readings.
export function createWeatherUrl(location = DEFAULT_WEATHER_LOCATION) {
  if (!validCoordinates(location.latitude, location.longitude)) throw new Error('Invalid weather location');
  const params = new URLSearchParams({ latitude: String(location.latitude), longitude: String(location.longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature', timezone: 'auto', timeformat: 'unixtime', forecast_days: '1' });
  return `https://api.open-meteo.com/v1/forecast?${params}`;
}
export const WEATHER_URL = createWeatherUrl();

export function safeTimeZone(zone) {
  try { new Intl.DateTimeFormat('en', { timeZone: zone }).format(); return zone; } catch { return 'UTC'; }
}

export function formatWeatherTime(value, zone = 'Asia/Manila') {
  return new Intl.DateTimeFormat('en-PH', { timeZone: safeTimeZone(zone), month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export function parseWeather(data) {
  const current = data?.current;
  if (!current || !Number.isFinite(current.time) || !Number.isFinite(current.temperature_2m) ||
      !Number.isFinite(current.relative_humidity_2m) || current.relative_humidity_2m < 0 || current.relative_humidity_2m > 100 ||
      !Number.isFinite(current.apparent_temperature)) throw new Error('Incomplete weather data');
  const time = new Date(current.time * 1000);
  if (Number.isNaN(time.getTime())) throw new Error('Invalid weather time');
  return { temperature: current.temperature_2m, humidity: current.relative_humidity_2m, apparent: current.apparent_temperature,
    time, timeZone: safeTimeZone(data.timezone || 'UTC') };
}
