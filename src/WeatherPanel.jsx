import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CloudSun, Droplets, MapPin, RefreshCw, Thermometer, Wind } from 'lucide-react';
import { parseWeather, WEATHER_URL } from './weather';

const manilaTime = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function WeatherPanel({ unit }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const request = useRef(null);
  const mounted = useRef(false);

  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
    setLoading(true);
    try {
      const response = await fetch(WEATHER_URL, { signal: controller.signal });
      if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
      const result = parseWeather(await response.json());
      if (mounted.current && !controller.signal.aborted) { setWeather(result); setError(false); }
    } catch (err) {
      if (mounted.current && (!controller.signal.aborted || timedOut)) setError(true);
    } finally {
      clearTimeout(timeout);
      if (mounted.current && request.current === controller) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    const interval = setInterval(refresh, 15 * 60 * 1000);
    return () => { mounted.current = false; clearInterval(interval); request.current?.abort(); };
  }, [refresh]);

  const temperature = value => `${(unit === 'C' ? value : value * 9 / 5 + 32).toFixed(1)}°${unit}`;
  return <section className="weather-panel panel" aria-labelledby="weather-heading">
    <div className="weather-heading">
      <div><div className="section-kicker">OUTSIDE YOUR WINDOW</div><h2 id="weather-heading">Local weather <span className="heading-dot">●</span></h2><p><MapPin size={13}/> Las Piñas, Metro Manila</p></div>
      <button className="refresh-button weather-refresh" onClick={refresh} disabled={loading} aria-label="Refresh Las Piñas weather"><RefreshCw size={15} className={loading ? 'spinning' : ''}/>{loading ? 'Updating' : 'Refresh'}</button>
    </div>
    {weather ? <>
      <div className="weather-values">
        <div><span className="weather-icon mint"><Thermometer size={18}/></span><span><small>OUTDOOR TEMPERATURE</small><strong>{temperature(weather.temperature)}</strong></span></div>
        <div><span className="weather-icon blue"><Droplets size={18}/></span><span><small>OUTDOOR HUMIDITY</small><strong>{weather.humidity}%</strong></span></div>
        <div><span className="weather-icon peach"><Wind size={18}/></span><span><small>APPARENT TEMPERATURE</small><strong>{temperature(weather.apparent)}</strong></span></div>
      </div>
      <div className="weather-meta"><span><CloudSun size={14}/> Model time: {manilaTime.format(weather.time)} (Manila)</span><span>Refreshes every 15 min</span></div>
    </> : <div className="weather-empty" role="status">{loading ? 'Loading weather for Las Piñas…' : 'Weather is unavailable right now. Please try refreshing.'}</div>}
    {error && weather && <div className="weather-error" role="status">Couldn’t refresh weather. Showing the last available result, which may be outdated.</div>}
    <div className="weather-source">Outdoor model estimates, not AERO-MIST sensor readings. Apparent temperature is not the heat index. Data: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></div>
  </section>;
}
