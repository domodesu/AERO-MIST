export const THEME_STORAGE_KEY = 'aero-mist-theme';

export function readTheme(storage) {
  try {
    return storage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(storage, theme) {
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The current page still changes theme when storage is unavailable.
  }
}
