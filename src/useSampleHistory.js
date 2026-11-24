import { useCallback, useEffect, useRef, useState } from 'react';
import { getDemoCycle } from './demoCycle';
import { createWeatherUrl, parseWeather } from './weather';
import { parseSampleHistory, pruneSampleHistory, writeSampleHistory, shouldCaptureSample, SAMPLE_HISTORY_KEY, SAMPLE_RETENTION_MS } from './sampleHistory';

function storage() {
  try { return window.localStorage; } catch { return null; }
}
function load(fallback, memoryOnly = false) {
  if (memoryOnly) return pruneSampleHistory(fallback);
  try { const store = storage(); return store ? parseSampleHistory(store.getItem(SAMPLE_HISTORY_KEY)) : pruneSampleHistory(fallback); }
  catch { return pruneSampleHistory(fallback); }
}

// Sample snapshots stay local to this browser; actual device history is never read or modified here.
export default function useSampleHistory(active, readings, cycleStart, location) {
  const [records, setRecords] = useState(() => load([]));
  const current = useRef(records);
  const memoryOnly = useRef(false);
  const request = useRef(null);
  const mounted = useRef(false);
  const commit = useCallback(next => {
    const safe = pruneSampleHistory(next);
    current.current = safe;
    if (mounted.current) setRecords(safe);
    try {
      const store = storage();
      if (!store) memoryOnly.current = true;
      else if (!memoryOnly.current) writeSampleHistory(store, safe);
    } catch { memoryOnly.current = true; /* Fall back to in-memory records when storage is blocked. */ }
    return safe;
  }, []);
  const prune = useCallback(() => commit(load(current.current, memoryOnly.current)), [commit]);

  useEffect(() => {
    mounted.current = true;
    prune();
    const onStorage = event => {
      if (!memoryOnly.current && event.key === SAMPLE_HISTORY_KEY) {
        const next = parseSampleHistory(event.newValue);
        current.current = next;
        setRecords(next);
      }
    };
    const onVisible = () => { if (document.visibilityState === 'visible') prune(); };
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisible);
    return () => { mounted.current = false; request.current?.abort(); window.removeEventListener('storage', onStorage); document.removeEventListener('visibilitychange', onVisible); };
  }, [prune]);

  // Delete at each record's one-hour expiry. A sleeping/closed browser is cleaned on return.
  useEffect(() => {
    if (!records.length) return;
    const nextExpiry = Math.min(...records.map(record => record.recordedAt + SAMPLE_RETENTION_MS));
    const id = setTimeout(prune, Math.max(0, nextExpiry - Date.now()));
    return () => clearTimeout(id);
  }, [records, prune]);

  useEffect(() => {
    if (!active) return;
    const captureIfDue = async () => {
      if (document.visibilityState === 'hidden') return;
      const now = Date.now();
      const existing = load(current.current, memoryOnly.current);
      if (!shouldCaptureSample(existing, location.key, now)) return;
      const id = `${now}-${Math.random().toString(36).slice(2)}`;
      const record = { id, recordedAt: now, location: location.name, locationKey: location.key, temperature: readings.temperature, humidity: readings.humidity, phase: getDemoCycle(cycleStart, now).phase, outdoor: null };
      commit([record, ...existing]);
      request.current?.abort();
      const controller = new AbortController();
      request.current = controller;
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(createWeatherUrl(location), { signal: controller.signal });
        if (!response.ok) throw new Error('Weather unavailable');
        const weather = parseWeather(await response.json());
        if (mounted.current && !controller.signal.aborted) {
          const latest = load(current.current, memoryOnly.current);
          if (latest.some(item => item.id === id)) {
            commit(latest.map(item => item.id === id ? { ...item, outdoor: { temperature: weather.temperature, humidity: weather.humidity, time: weather.time.getTime(), timeZone: weather.timeZone } } : item));
          }
        }
      } catch { /* Leave outdoor comparison unavailable instead of inventing data. */ }
      finally { clearTimeout(timeout); if (request.current === controller) request.current = null; }
    };
    captureIfDue();
    const id = setInterval(captureIfDue, 60000);
    const onVisible = () => { if (document.visibilityState === 'visible') captureIfDue(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, [active, readings.temperature, readings.humidity, cycleStart, commit, location]);
  return records;
}
