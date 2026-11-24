package com.aeromist.dashboard;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

public final class MainActivity extends Activity {
    private static final String HOME = "https://domodesu.github.io/AERO-MIST/";
    private static final String HOST = "domodesu.github.io";
    private static final int LOCATION_REQUEST = 17;
    private WebView webView;
    private View offline;
    private GeolocationPermissions.Callback pendingLocation;
    private String pendingOrigin;

    private static boolean trustedOrigin(Uri uri) {
        return uri != null && "https".equalsIgnoreCase(uri.getScheme()) && HOST.equalsIgnoreCase(uri.getHost())
            && (uri.getPort() == -1 || uri.getPort() == 443) && uri.getUserInfo() == null;
    }
    private static boolean trustedPage(Uri uri) {
        if (!trustedOrigin(uri)) return false;
        String path = uri.getPath();
        return path != null && (path.equals("/AERO-MIST") || path.startsWith("/AERO-MIST/"));
    }
    private boolean hasLocation() {
        return checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
            || checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }
    private void completeLocation(boolean allow) {
        if (pendingLocation != null) pendingLocation.invoke(pendingOrigin, allow, allow);
        pendingLocation = null;
        pendingOrigin = null;
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout container = new FrameLayout(this);
        // Android 15 may draw edge-to-edge; keep the web UI clear of system bars.
        container.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        // Always revalidate the live page on startup; the site checks for updates while open.
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (!trustedOrigin(Uri.parse(origin)) || !trustedPage(Uri.parse(webView.getUrl() == null ? "" : webView.getUrl()))) {
                    callback.invoke(origin, false, false);
                    return;
                }
                if (hasLocation()) {
                    callback.invoke(origin, true, true);
                } else if (pendingLocation == null) {
                    pendingLocation = callback;
                    pendingOrigin = origin;
                    requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, LOCATION_REQUEST);
                } else {
                    callback.invoke(origin, false, false);
                }
            }
            @Override public void onGeolocationPermissionsHidePrompt() { completeLocation(false); }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (trustedPage(uri)) return false;
                if ("https".equalsIgnoreCase(uri.getScheme())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (android.content.ActivityNotFoundException ignored) { }
                }
                return true;
            }
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                if (trustedPage(Uri.parse(url))) offline.setVisibility(View.GONE);
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) offline.setVisibility(View.VISIBLE);
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
                if (request.isForMainFrame() && response.getStatusCode() >= 400) offline.setVisibility(View.VISIBLE);
            }
        });
        container.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        LinearLayout error = new LinearLayout(this);
        error.setOrientation(LinearLayout.VERTICAL);
        error.setGravity(Gravity.CENTER);
        error.setPadding(40, 40, 40, 40);
        error.setBackgroundColor(Color.rgb(247, 249, 247));
        TextView title = new TextView(this);
        title.setText("Unable to connect");
        title.setTextColor(Color.rgb(32, 60, 51));
        title.setTextSize(22);
        title.setGravity(Gravity.CENTER);
        TextView detail = new TextView(this);
        detail.setText("AERO-MIST needs an internet connection to load the latest dashboard. Check your connection and try again.");
        detail.setTextColor(Color.rgb(85, 110, 95));
        detail.setTextSize(15);
        detail.setGravity(Gravity.CENTER);
        detail.setPadding(0, 16, 0, 20);
        Button retry = new Button(this);
        retry.setText("Try again");
        retry.setOnClickListener(v -> { offline.setVisibility(View.GONE); webView.loadUrl(HOME); });
        error.addView(title);
        error.addView(detail);
        error.addView(retry);
        offline = error;
        offline.setVisibility(View.GONE);
        container.addView(offline, new FrameLayout.LayoutParams(-1, -1));
        setContentView(container);
        webView.loadUrl(HOME);
    }
    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == LOCATION_REQUEST) completeLocation(hasLocation() && trustedPage(Uri.parse(webView.getUrl() == null ? "" : webView.getUrl())));
    }
    @Override public void onBackPressed() {
        if (offline.getVisibility() == View.VISIBLE) { finish(); return; }
        if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        completeLocation(false);
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
