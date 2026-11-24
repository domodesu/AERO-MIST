# AERO-MIST

A responsive dashboard for monitoring an AERO-MIST cooling system. The sidebar separates outdoor weather (Environment) from sample temperature, humidity, heat index, battery, comfort, and misting/cooldown timers (AERO-MIST system). History offers a browser-local sample view and a separate actual-device view. Actual-device history requires a connected device and shared storage, neither of which is implemented yet.

## Run locally

```sh
npm install
npm run dev
```

Run `npm run build` to create a production build. Use the settings icon at the bottom of the sidebar to choose light or dark appearance; the choice is saved in your browser. On mobile, the header stays visible while scrolling and a right swipe opens the sidebar.

### Automatic updates in GitHub Codespaces

While `npm run dev` is running in a Codespace, the app checks the current branch's Git upstream every minute. It applies only fast-forward updates to a clean working tree, and Vite refreshes the app. If dependencies change, it runs `npm ci` and restarts the development server. Updates pause if there are local changes, untracked files, or divergent history; resolve those manually before automatic updates can continue. If dependency installation fails, run `npm ci` and `npm run dev` again. Changes to the update script itself take effect after restarting `npm run dev`.

The Codespace must be running and connected, and the branch must track a remote branch. To disable automatic updates, run `AERO_AUTO_UPDATE=0 npm run dev`. Outside Codespaces, `npm run dev` does not automatically change Git files.

The team’s draft temperature, humidity, and misting requirements are recorded in [docs/control-requirements.md](docs/control-requirements.md). They are not yet implemented or connected to the physical system.

## Data

The Local weather panel requests modelled outdoor temperature, relative humidity, and apparent temperature for Las Piñas (14.444546, 120.993874) from [Open-Meteo](https://open-meteo.com/). It refreshes on load, every 15 minutes while the page is open, and on request. The model time is shown in Manila time. These are weather model estimates, not AERO-MIST sensor measurements; apparent temperature is not heat index. They may differ from conditions at the device. Weather data is provided by Open-Meteo under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Its free API is for non-commercial use; check the provider's terms for other use.

The AERO-MIST system profile selector offers sample data and an actual-device view. The actual-device view currently shows unavailable readings and timers because no device service is connected. The profile choice is stored in the browser; a verified device connection is intended to select the actual device by default, but connection detection and live data are not yet implemented. The sample profile uses clearly labeled sample data. The refresh button resets the sample readings and updates the displayed time; the misting and cooldown timers are a local sample cycle. Its start time is saved in browser local storage so it continues across refreshes and app updates at the same URL. Each browser/device has its own sample cycle; clearing site data or using a different URL resets it. If browser storage is disabled, the cycle resets on refresh. No hardware or backend is connected, no actual device readings are stored, and the comfort label is illustrative rather than a calculated health or safety assessment. Connect a device/API and define the comfort and cycle logic before using the dashboard for real monitoring.

While the sample profile is selected and the app is open, sample history creates a snapshot on first use and at most every 15 minutes thereafter, or immediately after a change in location. It includes the sample temperature, humidity and cycle phase plus an Open-Meteo outdoor model reading where available. New snapshots record their outdoor location; older snapshots without a location are labelled Las Piñas, which was the previously configured location. Differences are sample minus outdoor; relative humidity differences are in percentage points. Historical comparisons are illustrative, use independently timed model estimates and are not evidence of cooling. Sample snapshots are stored under a separate browser-local key and expire individually one hour after creation. If the browser is closed, the expired records are removed on its next visit; blocked browser storage falls back to memory. The sample retention code does not read or delete actual-system history, for which no storage integration exists yet.

## Sharing from Codespaces

To temporarily share the app, run `npm run dev`, open the Codespace's **Ports** tab, right-click the Vite port (normally 5173), and choose **Port Visibility → Public**. Share its forwarded URL. Anyone with the URL can access the app without signing in, so do not expose sensitive data or secrets. GitHub may revert a public port to private when the Codespace restarts; the app is unavailable whenever the Codespace or server stops. A public port is a development preview, not permanent production hosting.

## Public website (GitHub Pages)

The deployment workflow builds the current development branch and publishes it with GitHub Pages. A repository administrator must first set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. After enabling Pages, rerun the latest **Deploy public dashboard** workflow from the Actions tab (or push another commit). When deployment succeeds, the site is available at `https://domodesu.github.io/AERO-MIST/`. All visitors can access the public site; do not include secrets or private data in the frontend. The public site is separate from the Codespace development server and may take a few minutes to update.
