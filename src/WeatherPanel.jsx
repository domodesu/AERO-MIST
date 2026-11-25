import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CloudSun, Droplets, LocateFixed, MapPin, RefreshCw, Thermometer, Wind } from 'lucide-react';
import { createWeatherUrl, formatWeatherTime, weatherTimeZoneLabel, parseWeather } from './weather';

export default function WeatherPanel({ unit, locationControl }) {
  const { location, status, message, useCurrent, useDefault } = locationControl;
  const [result, setResult] = useState(null);
  const [loadingKey, setLoadingKey] = useState(location.key);
  const [errorKey, setErrorKey] = useState(null);
  const request = useRef(null);
  const mounted = useRef(false);
  const weather = result?.key === location.key ? result.weather : null;
  const loading = loadingKey === location.key;
  const error = errorKey === location.key;

  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
    setLoadingKey(location.key);
    try {
      const response = await fetch(createWeatherUrl(location), { signal: controller.signal });
      if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
      const parsed = parseWeather(await response.json());
      if (mounted.current && !controller.signal.aborted) { setResult({ key: location.key, weather: parsed }); setErrorKey(null); }
    } catch {
      if (mounted.current && (!controller.signal.aborted || timedOut)) setErrorKey(location.key);
    } finally {
      clearTimeout(timeout);
      if (mounted.current && request.current === controller) setLoadingKey(null);
    }
  }, [location]);

  useEffect(() => {
    mounted.current = true;
    refresh();
    const interval = setInterval(refresh, 15 * 60 * 1000);
    return () => { mounted.current = false; clearInterval(interval); request.current?.abort(); };
  }, [refresh]);

  const temperature = value => `${(unit === 'C' ? value : value * 9 / 5 + 32).toFixed(1)}°${unit}`;
  return <section className="weather-panel panel" aria-labelledby="weather-heading">
    <div className="weather-heading">
      <div><div className="section-kicker">OUTSIDE YOUR WINDOW</div><h2 id="weather-heading">Local weather <span className="heading-dot">●</span></h2><p><MapPin size={13}/> {location.label}</p></div>
      <button className="refresh-button weather-refresh" onClick={refresh} disabled={loading} aria-label={`Refresh weather for ${location.name}`}><RefreshCw size={15} className={loading ? 'spinning' : ''}/>{loading ? 'Updating' : 'Refresh'}</button>
    </div>
    <div className="location-control"><div className="location-control-copy"><strong><LocateFixed size={15}/> Weather location</strong><p>{location.source === 'current' ? 'Following your device’s approximate location for local weather.' : 'Using Las Piñas by default. Choose your location to follow this device.'}</p><small>With your permission, your location is shared with a weather provider.</small></div><div className="location-actions"><button type="button" onClick={useCurrent} disabled={status === 'requesting' || status === 'current'}>{status === 'requesting' ? 'Getting location…' : status === 'current' ? 'Location enabled' : 'Use my location'}</button>{(location.source === 'current' || status === 'requesting' || status === 'error') && <button type="button" onClick={useDefault}>Use Las Piñas</button>}</div></div>
    {message && <div className="location-message" role="status">{message}</div>}
    {weather ? <>
      <div className="weather-values">
        <div><span className="weather-icon mint"><Thermometer size={18}/></span><span><small>OUTDOOR TEMPERATURE</small><strong>{temperature(weather.temperature)}</strong></span></div>
        <div><span className="weather-icon blue"><Droplets size={18}/></span><span><small>OUTDOOR HUMIDITY</small><strong>{weather.humidity}%</strong></span></div>
        <div><span className="weather-icon peach"><Wind size={18}/></span><span><small>APPARENT TEMPERATURE</small><strong>{temperature(weather.apparent)}</strong></span></div>
      </div>
      <div className="weather-meta"><span><CloudSun size={14}/> Model time: {formatWeatherTime(weather.time, weather.timeZone)} ({weatherTimeZoneLabel(weather.timeZone)})</span><span>Refreshes every 15 min</span></div>
    </> : <div className="weather-empty" role="status">{loading || !error ? `Loading weather for ${location.name}…` : 'Weather is unavailable right now. Please try refreshing.'}</div>}
    {error && weather && <div className="weather-error" role="status">Couldn’t refresh weather. Showing the last available result, which may be outdated.</div>}
  </section>;
}
