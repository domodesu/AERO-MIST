import { isAndroidWebView } from './platform.js';
import { pageFromHash } from './navigation.js';
import { initialSystemProfile } from './systemProfile.js';

export const APP_SESSION_KEY = 'aero-mist-app-session-v1';

// The APK loads its home URL without a hash at launch. A session marker also
// preserves the user’s selection through reloads of the same WebView session.
export function getInitialAppState({ userAgent, sessionStorage, localStorage, hash, connected = false }) {
  let newAppSession = false;
  if (isAndroidWebView(userAgent)) {
    try {
      newAppSession = sessionStorage.getItem(APP_SESSION_KEY) !== 'started' || !hash;
      if (newAppSession) sessionStorage.setItem(APP_SESSION_KEY, 'started');
    } catch {
      // When session storage is blocked, prefer the requested safe startup view.
      newAppSession = true;
    }
  }
  return {
    tab: newAppSession ? 'environment' : pageFromHash(hash),
    profile: newAppSession ? 'device' : initialSystemProfile(localStorage, connected),
    resetHash: newAppSession,
  };
}
