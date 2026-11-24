// Sample history has its own browser-only key. Never touch device history here.
export const SAMPLE_HISTORY_KEY = 'aero-mist-sample-history-v1';
export const SAMPLE_RETENTION_MS = 60 * 60 * 1000;
export const SAMPLE_INTERVAL_MS = 15 * 60 * 1000;

export function pruneSampleHistory(records, now = Date.now()) {
  if (!Array.isArray(records)) return [];
  return records.filter(record => record && typeof record.id === 'string' && Number.isFinite(record.recordedAt) &&
    record.recordedAt <= now && now - record.recordedAt < SAMPLE_RETENTION_MS &&
    Number.isFinite(record.temperature) && Number.isFinite(record.humidity) &&
    record.humidity >= 0 && record.humidity <= 100 && ['misting', 'cooldown'].includes(record.phase))
    .sort((a, b) => b.recordedAt - a.recordedAt);
}

export function parseSampleHistory(raw, now = Date.now()) {
  try { return pruneSampleHistory(JSON.parse(raw || '[]'), now); } catch { return []; }
}

export function writeSampleHistory(storage, records) {
  const serialized = JSON.stringify(records);
  if (storage.getItem(SAMPLE_HISTORY_KEY) !== serialized) storage.setItem(SAMPLE_HISTORY_KEY, serialized);
}

export function compareTemperatures(system, outside, unit = 'C') {
  if (!Number.isFinite(system) || !Number.isFinite(outside)) return null;
  return (system - outside) * (unit === 'F' ? 9 / 5 : 1);
}

export function compareHumidity(system, outside) {
  if (!Number.isFinite(system) || !Number.isFinite(outside)) return null;
  return system - outside;
}

export function formatDifference(value, suffix) {
  if (value === null || !Number.isFinite(value)) return 'Unavailable';
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? '+' : ''}${(Object.is(rounded, -0) ? 0 : rounded).toFixed(1)} ${suffix}`;
}
