const STORAGE_KEY = 'aero-mist-demo-cycle-start-v1';
const FIRST_MIST_SECONDS = 8 * 60 + 24;
const MIST_SECONDS = 10 * 60;
const COOLDOWN_SECONDS = 5 * 60;

// This is a browser-local demo, not a reading from an AERO-MIST device.
export function getDemoStartTime(storage, now = Date.now()) {
  try {
    const stored = Number(storage.getItem(STORAGE_KEY));
    if (Number.isFinite(stored) && stored > 0 && stored <= now) return stored;
    storage.setItem(STORAGE_KEY, String(now));
  } catch {
    // The demo still works in memory if browser storage is blocked.
  }
  return now;
}

export function getDemoCycle(start, now = Date.now()) {
  const elapsed = Math.max(0, Math.floor((now - start) / 1000));
  if (elapsed < FIRST_MIST_SECONDS) return { phase: 'misting', seconds: FIRST_MIST_SECONDS - elapsed };
  const afterFirst = (elapsed - FIRST_MIST_SECONDS) % (COOLDOWN_SECONDS + MIST_SECONDS);
  if (afterFirst < COOLDOWN_SECONDS) return { phase: 'cooldown', seconds: COOLDOWN_SECONDS - afterFirst };
  return { phase: 'misting', seconds: MIST_SECONDS - (afterFirst - COOLDOWN_SECONDS) };
}
