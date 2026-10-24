// Felles felt som går igjen i mange kalkulatorer.

import { defaultVoltage, networkOf } from '../core/settings.js';
import { SIZES } from '../data/ledere.js';

export const PHASE_OPTIONS = [
  { value: 1, label: '1-fase' },
  { value: 3, label: '3-fase' },
];

export const phasesField = (extra = {}) => ({
  id: 'phases', label: 'System', type: 'select', options: PHASE_OPTIONS, default: 1, ...extra,
});

/** Spenning som følger nettet i innstillingene: 230 V for enfase, U mellom faser for trefase. */
export const voltageField = (extra = {}) => ({
  id: 'U', label: 'Spenning', type: 'number', unit: 'V', min: 0, minExclusive: true,
  default: (s, x) => defaultVoltage(s, x.phases),
  help: (s, x) => (x.phases === 3
    ? `3-fase: spenning mellom faser. ${networkOf(s).label} gir ${networkOf(s).U} V.`
    : '1-fase: 230 V (fase–N i TN, fase–fase i IT).'),
  ...extra,
});

export const cosphiField = (extra = {}) => ({
  id: 'cosphi', label: 'Effektfaktor cos φ', type: 'number', min: 0, max: 1, minExclusive: true, default: 1,
  help: 'Ren varme og glødelys: 1. Motorer: ofte 0,8–0,9.', ...extra,
});

export const MATERIAL_OPTIONS = [
  { value: 'Cu', label: 'Kobber' },
  { value: 'Al', label: 'Aluminium' },
];

export const materialField = (extra = {}) => ({
  id: 'material', label: 'Ledermateriale', type: 'select', options: MATERIAL_OPTIONS,
  default: (s) => s.material || 'Cu', ...extra,
});

export const sizeOptions = (material) => SIZES[material === 'Al' ? 'Al' : 'Cu']
  .map((S) => ({ value: S, label: `${String(S).replace('.', ',')} mm²` }));

export const sizeField = (extra = {}) => ({
  id: 'S', label: 'Tverrsnitt', type: 'select', dropdown: true,
  options: (s, x) => sizeOptions(x.material),
  default: (s, x) => (x.material === 'Al' ? 16 : 2.5), ...extra,
});

export const TEMP_OPTIONS = [
  { value: 20, label: '20 °C' },
  { value: 70, label: '70 °C' },
  { value: 90, label: '90 °C' },
];

export const tempField = (extra = {}) => ({
  id: 'theta', label: 'Ledertemperatur', type: 'select', options: TEMP_OPTIONS,
  default: (s) => s.conductorTemp || 70, advanced: true,
  help: '70 °C: termoplast eller 70 °C-klemmer. 90 °C: termoherd med klemmer for 90 °C. 20 °C: kald leder.',
  ...extra,
});

export const reactanceField = (extra = {}) => ({
  id: 'X', label: 'Reaktans', type: 'number', unit: 'Ω/km', min: 0, max: 1,
  default: (s) => s.reactance ?? 0.08, advanced: true,
  help: 'Typisk 0,08 Ω/km for flerlederkabel. Har mest å si for store tverrsnitt.', ...extra,
});
