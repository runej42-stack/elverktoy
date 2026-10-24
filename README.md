# ↯ Elverktøy

Calculators, reference and documentation for Norwegian electricians, based on the Norwegian wiring standard NEK 400:2026.
The app is in Norwegian. Made by [Rune Johansen](https://r-j.no).

*På norsk: [LES MEG.md](LES%20MEG.md).*

**Use the app:** [r-j.no/elverktoy](https://r-j.no/elverktoy/)
**Read more:** [r-j.no/spill.php](https://r-j.no/spill.php?sprak=en)
**Download a single file:** [Elverktoy.html](https://github.com/runej42-stack/elverktoy/releases/latest/download/Elverktoy.html) (works offline on a PC and Android)

## Getting started

Open [r-j.no/elverktoy](https://r-j.no/elverktoy/) on your phone and add it to the home screen
(Safari: Share → *Add to Home Screen*; Chrome: menu → *Install app*). It works offline once it has been opened,
and tells you when a new version is available. No account, no ads, no tracking. Everything you enter stays on the device.

## What is inside

* **Circuits and cables:** circuit sizing that checks all five requirements at once (Ib ≤ In ≤ Iz, I2, voltage drop,
  disconnection, breaking capacity), current-carrying capacity for installation methods A1–E including cable trays,
  ladders and several circuits in the ground, voltage drop, maximum length, cable data.
* **Short circuits and protection:** short-circuit currents through several cable sections, disconnection for B/C/D
  breakers and gG fuses, thermal withstand, PE, selectivity, RCDs, TT and IT systems.
* **Power, motors, heating, EV and solar:** Ohm's law, power, kVA, power factor correction, motor current and starting,
  heating cables, EV charging, solar strings.
* **Reference:** 68 formulas, 28 practical tips, key requirements and news in NEK 400:2026, cable designations, IP codes.
* **Jobs:** circuits and measurements with automatic assessment, final inspection, risk assessment and PDF reports.

Every calculator shows the working step by step, with the formula, your numbers and the source.

## Beta and disclaimer

The app is in beta. The current-carrying capacity tables are transcribed from public sources that reproduce
IEC 60364-5-52 Annex B and have not yet been checked against NEK 400:2026. The app is an aid and does not replace
the standard, design software or professional judgement.

## For developers

Plain HTML, CSS and JavaScript with no npm packages. Requires Node 22 or later.

```bash
node tools/serve.mjs      # development server on http://localhost:5173
node --test               # all tests, including the worked examples in every calculator
node tools/build.mjs      # builds dist/web (site with service worker) and dist/fil (single file)
```

More about structure, build and deployment (in Norwegian): [UTVIKLING.md](UTVIKLING.md).
