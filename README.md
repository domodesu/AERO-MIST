# AERO-MIST

A responsive dashboard for monitoring an AERO-MIST cooling system. It displays temperature, humidity, heat index, battery, comfort, and misting/cooldown timers.

## Run locally

```sh
npm install
npm run dev
```

Run `npm run build` to create a production build.

### Automatic updates in GitHub Codespaces

While `npm run dev` is running in a Codespace, the app checks the current branch's Git upstream every minute. It applies only fast-forward updates to a clean working tree, and Vite refreshes the app. If dependencies change, it runs `npm ci` and restarts the development server. Updates pause if there are local changes, untracked files, or divergent history; resolve those manually before automatic updates can continue. If dependency installation fails, run `npm ci` and `npm run dev` again. Changes to the update script itself take effect after restarting `npm run dev`.

The Codespace must be running and connected, and the branch must track a remote branch. To disable automatic updates, run `AERO_AUTO_UPDATE=0 npm run dev`. Outside Codespaces, `npm run dev` does not automatically change Git files.

## Data

The Local weather panel requests modelled outdoor temperature, relative humidity, and apparent temperature for Las Piñas (14.444546, 120.993874) from [Open-Meteo](https://open-meteo.com/). It refreshes on load, every 15 minutes while the page is open, and on request. The model time is shown in Manila time. These are weather model estimates, not AERO-MIST sensor measurements; apparent temperature is not heat index. They may differ from conditions at the device. Weather data is provided by Open-Meteo under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Its free API is for non-commercial use; check the provider's terms for other use.

The device dashboard currently uses clearly labeled sample data. The refresh button resets the sample readings and updates the displayed time; the misting and cooldown timers are a local demo cycle. Its start time is saved in browser local storage so it continues across refreshes and app updates at the same URL. Each browser/device has its own demo cycle; clearing site data or using a different URL resets it. If browser storage is disabled, the cycle resets on refresh. No hardware or backend is connected, no readings are stored, and the comfort label is illustrative rather than a calculated health or safety assessment. Connect a device/API and define the comfort and cycle logic before using the dashboard for real monitoring.

## Sharing from Codespaces

To temporarily share the app, run `npm run dev`, open the Codespace's **Ports** tab, right-click the Vite port (normally 5173), and choose **Port Visibility → Public**. Share its forwarded URL. Anyone with the URL can access the app without signing in, so do not expose sensitive data or secrets. GitHub may revert a public port to private when the Codespace restarts; the app is unavailable whenever the Codespace or server stops. A public port is a development preview, not permanent production hosting.

## Public website (GitHub Pages)

The deployment workflow builds the current development branch and publishes it with GitHub Pages. A repository administrator must first set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. After enabling Pages, rerun the latest **Deploy public dashboard** workflow from the Actions tab (or push another commit). When deployment succeeds, the site is available at `https://domodesu.github.io/AERO-MIST/`. All visitors can access the public site; do not include secrets or private data in the frontend. The public site is separate from the Codespace development server and may take a few minutes to update.
