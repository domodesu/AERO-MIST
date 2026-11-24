export const PROFILE_STORAGE_KEY = 'aero-mist-system-profile';

// A connected device should be the initial profile. Until then, honor the user's choice.
export function initialSystemProfile(storage, connected) {
  if (connected) return 'device';
  try {
    return storage.getItem(PROFILE_STORAGE_KEY) === 'device' ? 'device' : 'sample';
  } catch {
    return 'sample';
  }
}

export function saveSystemProfile(storage, profile) {
  try { storage.setItem(PROFILE_STORAGE_KEY, profile); } catch { /* The current selection still works without storage. */ }
}
