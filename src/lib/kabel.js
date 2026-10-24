// Kabelberegninger: lederresistans og spenningsfall.
// Funksjonene tar et ctx (fra motoren eller `silent`) slik at hvert steg kan vises i «Vis utregning».

import { v, silent } from '../core/engine.js';
import { formatNumber } from '../core/number.js';
import { R20_CU, R20_CU_FLEX, R20_AL, ALPHA, SIZES } from '../data/ledere.js';

const lookup = (table, S) => {
  const row = table.find(([s]) => s === S);
  return row ? row[1] : null;
};

/** Resistans ved 20 °C i Ω/km, eller null hvis tverrsnittet ikke finnes i tabellen. */
export function r20(material, S, flexible = false) {
  if (material === 'Al') return lookup(R20_AL, S);
  return lookup(flexible ? R20_CU_FLEX : R20_CU, S);
}

export function sizesFor(material) {
  return SIZES[material === 'Al' ? 'Al' : 'Cu'];
}

/** Resistans ved ledertemperatur θ (Ω/km): R = R₂₀·(1 + α·(θ − 20)). */
export function resistanceAt({ material, S, flexible = false, theta }, ctx = silent) {
  const R20 = r20(material, S, flexible);
  if (R20 == null) throw new Error(`Mangler resistans for ${S} mm² ${material}`);
  return ctx.step('R', 'R₂₀·(1 + α·(θ − 20))', {
    'R₂₀': v(R20, 'Ω/km'),
    α: ALPHA[material === 'Al' ? 'Al' : 'Cu'],
    θ: theta,
  }, 'Ω/km', { text: `Lederresistans ved ${formatNumber(theta, { sig: 3 })} °C` });
}

/**
 * Spenningsfall i volt og prosent.
 * Enfase: ΔU = 2·I·L·(R·cos φ + X·sin φ). Trefase: ΔU = √3·I·L·(R·cos φ + X·sin φ).
 * R og X i Ω/km, L i meter (én vei), U i volt (enfase: 230 V, trefase: mellom faser).
 */
export function voltageDrop({ phases, U, I, L, R, X, cosphi }, ctx = silent) {
  const sinphi = Math.sqrt(Math.max(0, 1 - cosphi * cosphi));
  const vars = { I: v(I, 'A'), L: v(L, 'm'), R: v(R, 'Ω/km'), X: v(X, 'Ω/km'), cosφ: cosphi, sinφ: sinphi };
  const dU = phases === 3
    ? ctx.step('ΔU', '√3·I·L·(R·cosφ + X·sinφ)/1000', vars, 'V', { text: 'Spenningsfall, trefase' })
    : ctx.step('ΔU', '2·I·L·(R·cosφ + X·sinφ)/1000', vars, 'V', { text: 'Spenningsfall, enfase (fram og tilbake)' });
  const pct = ctx.step('ΔU %', 'ΔU/U·100', { ΔU: v(dU, 'V'), U: v(U, 'V') }, '%');
  return { dU, pct };
}

/** Største lengde (m) før spenningsfallet når grensen (%). */
export function maxLength({ phases, U, I, R, X, cosphi, limit }, ctx = silent) {
  const sinphi = Math.sqrt(Math.max(0, 1 - cosphi * cosphi));
  const dUmax = ctx.step('ΔUmaks', 'grense/100·U', { grense: v(limit, '%'), U: v(U, 'V') }, 'V', { text: 'Tillatt spenningsfall i volt' });
  const vars = { ΔUmaks: v(dUmax, 'V'), I: v(I, 'A'), R: v(R, 'Ω/km'), X: v(X, 'Ω/km'), cosφ: cosphi, sinφ: sinphi };
  return phases === 3
    ? ctx.step('Lmaks', 'ΔUmaks·1000/(√3·I·(R·cosφ + X·sinφ))', vars, 'm')
    : ctx.step('Lmaks', 'ΔUmaks·1000/(2·I·(R·cosφ + X·sinφ))', vars, 'm');
}

/** Minste standardtverrsnitt som holder spenningsfallet innenfor grensen. Gir null om ingen holder. */
export function minSizeForDrop({ phases, U, I, L, X, cosphi, limit, material, flexible = false, theta }) {
  for (const S of sizesFor(material)) {
    if (r20(material, S, flexible) == null) continue;
    const R = resistanceAt({ material, S, flexible, theta });
    const { pct } = voltageDrop({ phases, U, I, L, R, X, cosphi });
    if (pct <= limit) return S;
  }
  return null;
}
