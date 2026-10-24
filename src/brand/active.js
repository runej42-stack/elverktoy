// Aktiv merkevareprofil. Under utvikling velges den med ?brand=noytral i adressen.
// Bygget (tools/build.mjs) bytter ut hele denne filen, så bare valgt profil kommer med.

import { brand as rhj } from './rhj.js';
import { brand as noytral } from './noytral.js';

const PROFILES = { rhj, noytral };

function pick() {
  if (typeof location !== 'undefined') {
    const id = new URLSearchParams(location.search).get('brand');
    if (id && PROFILES[id]) return PROFILES[id];
  }
  return rhj;
}

export const brand = pick();
