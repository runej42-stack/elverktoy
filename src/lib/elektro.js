// Grunnleggende effekt- og strømformler for enfase og trefase.
// Trefase bruker spenningen mellom faser: 400 V i TN, 230 V i IT/TT 230 V.

import { v, silent } from '../core/engine.js';

export const SQRT3 = Math.sqrt(3);

export const sinOf = (cosphi) => Math.sqrt(Math.max(0, 1 - cosphi * cosphi));

/** Tilsynelatende effekt S (kVA) fra strøm. */
export function apparentFromCurrent({ phases, U, I }, ctx = silent) {
  const vars = { U: v(U, 'V'), I: v(I, 'A') };
  return phases === 3
    ? ctx.step('S', '√3·U·I/1000', vars, 'kVA', { text: 'Tilsynelatende effekt, trefase' })
    : ctx.step('S', 'U·I/1000', vars, 'kVA', { text: 'Tilsynelatende effekt, enfase' });
}

/** Strøm (A) fra tilsynelatende effekt S (kVA). */
export function currentFromApparent({ phases, U, S }, ctx = silent) {
  const vars = { S: v(S, 'kVA'), U: v(U, 'V') };
  return phases === 3
    ? ctx.step('I', 'S·1000/(√3·U)', vars, 'A')
    : ctx.step('I', 'S·1000/U', vars, 'A');
}

/** Strøm (A) fra aktiv effekt P (kW). */
export function currentFromActive({ phases, U, P, cosphi }, ctx = silent) {
  const vars = { P: v(P, 'kW'), U: v(U, 'V'), cosφ: cosphi };
  return phases === 3
    ? ctx.step('I', 'P·1000/(√3·U·cosφ)', vars, 'A')
    : ctx.step('I', 'P·1000/(U·cosφ)', vars, 'A');
}

export function activeFromApparent({ S, cosphi }, ctx = silent) {
  return ctx.step('P', 'S·cosφ', { S: v(S, 'kVA'), cosφ: cosphi }, 'kW', { text: 'Aktiv effekt' });
}

export function apparentFromActive({ P, cosphi }, ctx = silent) {
  return ctx.step('S', 'P/cosφ', { P: v(P, 'kW'), cosφ: cosphi }, 'kVA', { text: 'Tilsynelatende effekt' });
}

export function reactiveFrom({ S, P }, ctx = silent) {
  return ctx.step('Q', '√(S² − P²)', { S: v(S, 'kVA'), P: v(P, 'kW') }, 'kvar', { text: 'Reaktiv effekt' });
}
