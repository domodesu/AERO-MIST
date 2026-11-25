// Existing AERO-MIST APKs use the standard Android WebView user agent and do not
// identify themselves separately. This also matches some in-app browsers.
export function isAndroidWebView(userAgent = '') {
  return typeof userAgent === 'string' && /\bAndroid\b/i.test(userAgent) && /(?:^|[;\s(])wv(?:[;\s)]|$)/i.test(userAgent);
}
