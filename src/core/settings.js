// Innstillinger med standardverdier. Lagres i localStorage og varsler lyttere ved endring.

import { load, save } from './store.js';

/** Nettsystemene appen kjenner. U er spenningen mellom faser, U1f spenningen for enfaselast. */
export const NETWORKS = [
  { id: 'TN400', label: 'TN 400/230 V', short: 'TN 400 V', earthing: 'TN', U: 400, U1f: 230, neutral: true },
  { id: 'IT230', label: 'IT 230 V', short: 'IT 230 V', earthing: 'IT', U: 230, U1f: 230, neutral: false },
  { id: 'TT230', label: 'TT 230 V', short: 'TT 230 V', earthing: 'TT', U: 230, U1f: 230, neutral: false },
  { id: 'TT400', label: 'TT 400/230 V', short: 'TT 400 V', earthing: 'TT', U: 400, U1f: 230, neutral: true },
];

export const DEFAULTS = Object.freeze({
  network: 'TN400',
  material: 'Cu',
  conductorTemp: 70,
  vdLimit: 4,
  reactance: 0.08,
  cmax: 1.1,
  cmin: 0.95,
  netCos: 0.9,
  theme: 'auto',
  glove: false,
  accepted: 0,
});

/** Versjonen av ansvarsforbeholdet. Øk når teksten endres vesentlig, så det vises på nytt. */
export const DISCLAIMER_VERSION = 1;

let current = { ...DEFAULTS, ...load('settings', {}) };
const listeners = new Set();

export function getSettings() {
  return current;
}

export function setSetting(key, value) {
  current = { ...current, [key]: value };
  save('settings', current);
  for (const fn of listeners) fn(current, key);
}

export function onSettingsChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function networkOf(settings = current) {
  return NETWORKS.find((n) => n.id === settings.network) || NETWORKS[0];
}

/** Standard spenning for en last: enfase 230 V, trefase etter valgt nett. */
export function defaultVoltage(settings, phases) {
  return phases === 3 ? networkOf(settings).U : networkOf(settings).U1f;
}
