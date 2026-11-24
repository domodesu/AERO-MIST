// Las Piñas city centre. Open-Meteo returns modelled weather, not device sensor readings.
export const WEATHER_LOCATION = 'Las Piñas';
export const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=14.444546&longitude=120.993874&current=temperature_2m,relative_humidity_2m,apparent_temperature&timezone=Asia%2FManila&forecast_days=1';

export function parseWeather(data) {
  const current = data?.current;
  if (!current || typeof current.time !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(current.time) ||
      !Number.isFinite(current.temperature_2m) || !Number.isFinite(current.relative_humidity_2m) ||
      current.relative_humidity_2m < 0 || current.relative_humidity_2m > 100 || !Number.isFinite(current.apparent_temperature)) {
    throw new Error('Incomplete weather data');
  }
  const time = new Date(`${current.time}:00+08:00`);
  if (Number.isNaN(time.getTime())) throw new Error('Invalid weather time');
  return { temperature: current.temperature_2m, humidity: current.relative_humidity_2m, apparent: current.apparent_temperature, time };
}
