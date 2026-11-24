# AERO-MIST

A responsive dashboard for monitoring an AERO-MIST cooling system. It displays temperature, humidity, heat index, battery, comfort, and misting/cooldown timers.

## Run locally

```sh
npm install
npm run dev
```

Run `npm run build` to create a production build.

## Data

The dashboard currently uses clearly labeled sample data. The refresh button resets the sample readings and updates the displayed time; the misting timer is a local demo countdown. No hardware or backend is connected, no readings are stored, and the comfort label is illustrative rather than a calculated health or safety assessment. Connect a device/API and define the comfort and cycle logic before using the dashboard for real monitoring.
