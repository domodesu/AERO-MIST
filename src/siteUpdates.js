// Reload when a newer deployed dashboard is available. Never reset locally stored data.
export const UPDATE_INTERVAL_MS = 60_000;
const RETRY_MS = 5 * 60_000;
const LAST_ATTEMPT_KEY = 'aero-mist-update-attempt-v1';

export function shouldReloadForVersion(current, remote, previousAttempt, now = Date.now()) {
  if (typeof remote !== 'string' || !remote || typeof current !== 'string' || remote === current) return false;
  return !previousAttempt || previousAttempt.version !== remote || !Number.isFinite(previousAttempt.time) || now - previousAttempt.time >= RETRY_MS;
}

export function startSiteUpdateChecks({ current, base, fetcher, location, storage, document, window }) {
  let busy = false;
  let stopped = false;
  let attempt = null;
  try { attempt = JSON.parse(storage?.getItem(LAST_ATTEMPT_KEY) || 'null'); } catch { /* Storage can be unavailable. */ }
  const check = async () => {
    if (busy || stopped || document.visibilityState === 'hidden') return;
    busy = true;
    try {
      const response = await fetcher(new URL(`${base}version.json`, location.origin), { cache: 'no-store' });
      if (!response.ok) return;
      const result = await response.json();
      if (!stopped && shouldReloadForVersion(current, result.version, attempt)) {
        attempt = { version: result.version, time: Date.now() };
        try { storage?.setItem(LAST_ATTEMPT_KEY, JSON.stringify(attempt)); } catch { /* In-memory fallback. */ }
        location.reload();
      }
    } catch { /* Offline or deployment in progress: keep the currently running dashboard. */ }
    finally { busy = false; }
  };
  const onVisible = () => { if (document.visibilityState === 'visible') check(); };
  const timer = window.setInterval(check, UPDATE_INTERVAL_MS);
  document.addEventListener('visibilitychange', onVisible);
  check();
  return () => { stopped = true; window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
}
