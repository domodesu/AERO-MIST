import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAndroidWebView } from '../src/platform.js';

test('recognizes the current APK Android WebView but keeps download on standard browsers', () => {
  assert.equal(isAndroidWebView('Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/UQ1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/123.0.0.0 Mobile Safari/537.36'), true);
  assert.equal(isAndroidWebView('Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36'), false);
  assert.equal(isAndroidWebView('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'), false);
  assert.equal(isAndroidWebView('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36'), false);
  assert.equal(isAndroidWebView(null), false);
});
