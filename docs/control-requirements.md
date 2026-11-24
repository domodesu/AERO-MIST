# AERO-MIST control requirements (draft)

These are the project team's stated requirements for the future ESP32 system. **They are not implemented in firmware or connected to the dashboard.** The website still displays demo device readings and browser-local demo timers. Do not use this document as a tested operating or safety procedure.

## Temperature and humidity

- Start misting when the area temperature reaches **40°C**.
- Once cooling has started, continue cooling toward **38°C** rather than stopping as soon as the temperature drops below 40°C. Stop cooling at 38°C or below, subject to the humidity lockout below.
- When relative humidity (RH) rises **above 80%**, stop misting and lock it out. Keep the lockout until RH is **75% or lower**. This lockout takes priority over temperature.

## Misting patterns

Each cycle is five minutes long. Choose the pattern based on RH:

| Relative humidity | Mist on | Mist off |
| --- | --- | --- |
| 70% or lower, including below 50% | 15 seconds | 20 seconds |
| Above 70% to 80% inclusive | 5 seconds | 15 seconds |
| Above 80% | Locked out | Locked out |

When a five-minute cycle finishes, wait before another cycle even if cooling is still needed and there is no humidity lockout. The waiting period and conditions for starting the next cycle have not yet been specified. This wait is separate from the off periods within each misting pattern.

## Questions to settle before implementing

- How long should the system wait between five-minute cycles, and under what conditions should the next cycle start?
- If humidity lockout clears while temperature is between 38°C and 40°C, should cooling resume immediately if it was active before lockout, or wait for temperature to reach 40°C again?
- How should an in-progress mist pulse respond if RH moves from one pattern range to the other?
- Which temperature and humidity sensors, pump/valve and power setup will be used, and how will the ESP32 connect to the internet?
- What should the controller do on sensor faults, lost connectivity, power loss and restart? A fail-safe that turns the misting output off on invalid or missing sensor readings should be considered and tested.

The eventual public dashboard will need a shared service to receive actual ESP32 state and timestamps. GitHub Pages is static hosting and cannot itself receive or store device updates. No live timer should be claimed until the hardware, firmware, service, and connection have been implemented and tested together.
