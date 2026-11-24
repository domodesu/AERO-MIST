import { useCallback, useEffect, useRef, useState } from 'react';
import { currentLocation, DEFAULT_WEATHER_LOCATION, LOCATION_PREFERENCE_KEY, shouldUpdateLocation, validCoordinates } from './weatherLocation.js';

function savePreference(value) { try { window.localStorage.setItem(LOCATION_PREFERENCE_KEY, value); } catch {} }
function readPreference() { try { return window.localStorage.getItem(LOCATION_PREFERENCE_KEY); } catch { return null; } }

export default function useWeatherLocation() {
  const [location, setLocation] = useState(DEFAULT_WEATHER_LOCATION);
  const [status, setStatus] = useState('default');
  const [message, setMessage] = useState('');
  const current = useRef(DEFAULT_WEATHER_LOCATION);
  const watch = useRef(null);
  const generation = useRef(0);
  const mounted = useRef(false);

  const stop = useCallback(() => {
    generation.current += 1;
    if (watch.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watch.current);
    watch.current = null;
  }, []);
  const useDefault = useCallback(() => {
    stop();
    current.current = DEFAULT_WEATHER_LOCATION;
    setLocation(DEFAULT_WEATHER_LOCATION);
    setStatus('default');
    setMessage('');
    savePreference('default');
  }, [stop]);
  const useCurrent = useCallback(() => {
    stop();
    if (!navigator.geolocation) {
      current.current = DEFAULT_WEATHER_LOCATION;
      setLocation(DEFAULT_WEATHER_LOCATION);
      setStatus('error');
      setMessage('Location is not available in this browser. Showing Las Piñas instead.');
      savePreference('default');
      return;
    }
    const token = generation.current;
    setStatus('requesting');
    setMessage('');
    try {
      watch.current = navigator.geolocation.watchPosition(position => {
        if (!mounted.current || generation.current !== token) return;
        const { latitude, longitude, accuracy } = position.coords;
        if (!validCoordinates(latitude, longitude)) return;
        if (shouldUpdateLocation(current.current, { latitude, longitude, accuracy: Number.isFinite(accuracy) && accuracy > 0 ? accuracy : 0 })) {
          const next = currentLocation(latitude, longitude, accuracy);
          current.current = next;
          setLocation(next);
        }
        setStatus('current');
        setMessage('');
        savePreference('current');
      }, error => {
        if (!mounted.current || generation.current !== token) return;
        stop();
        current.current = DEFAULT_WEATHER_LOCATION;
        setLocation(DEFAULT_WEATHER_LOCATION);
        setStatus('error');
        setMessage(error.code === 1 ? 'Location permission was denied. Showing Las Piñas; allow location in your browser settings to try again.' : 'Could not get your location. Showing Las Piñas instead; you can try again.');
        savePreference('default');
      }, { enableHighAccuracy: false, maximumAge: 60000, timeout: 15000 });
    } catch {
      current.current = DEFAULT_WEATHER_LOCATION;
      setLocation(DEFAULT_WEATHER_LOCATION);
      setStatus('error');
      setMessage('Could not get your location. Showing Las Piñas instead; you can try again.');
      savePreference('default');
    }
  }, [stop]);

  useEffect(() => {
    mounted.current = true;
    // Do not trigger a new permission prompt on page load. Resume only if already granted.
    if (readPreference() === 'current' && navigator.permissions?.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(permission => {
        if (mounted.current && readPreference() === 'current' && permission.state === 'granted' && watch.current === null) useCurrent();
      }).catch(() => {});
    }
    return () => { mounted.current = false; stop(); };
  }, [stop, useCurrent]);
  return { location, status, message, useCurrent, useDefault };
}
