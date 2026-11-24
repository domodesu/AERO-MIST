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

The dashboard currently uses clearly labeled sample data. The refresh button resets the sample readings and updates the displayed time; the misting timer is a local demo countdown. No hardware or backend is connected, no readings are stored, and the comfort label is illustrative rather than a calculated health or safety assessment. Connect a device/API and define the comfort and cycle logic before using the dashboard for real monitoring.
