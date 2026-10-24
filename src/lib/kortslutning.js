// Kortslutningsberegning for lavspenningsinstallasjoner, etter samme opplegg som NELFO og
// CENELEC TR 50480 / IEC 60909 bruker:
//
//  - Nettets impedans regnes ut fra kortslutningsstrømmene nettselskapet oppgir ved inntaket.
//  - Ik3 maks: c_maks, ledere ved 20 °C. Nettimpedansen deles i R og X med cos φk, og
//    impedansene legges sammen som vektorer.
//  - Ik min: c_min, ledere ved driftstemperatur (70/90 °C). Impedansene legges sammen
//    aritmetisk, som gir litt lavere (sikrere) Ik min.
//      IT og TT 230 V: topolet kortslutning, Ik2 = c·U/(2·Z)
//      TN og TT 400/230 V: enpolet feil fase–PE (TT: fase–N), Ik1 = c·U₀/Zs
//
// Enheter: Ik i kA, U i V og impedans i mΩ (V/mΩ = kA). Kabelverdier i Ω/km = mΩ/m.

import { v, silent } from '../core/engine.js';
import { formatNumber } from '../core/number.js';
import { r20 } from './kabel.js';
import { ALPHA } from '../data/ledere.js';

/** Hvilken minste kortslutning som gjelder for nettet. */
export function minFaultKind(network) {
  return network.neutral ? 'Ik1' : 'Ik2';
}

/**
 * params: { network, Ik3: kA, Ikmin: kA, segments: [{ L, material, S, Spe }],
 *           cmax, cmin, theta, X (Ω/km), cosNet, doubleEarthFault }
 * Gir { points: [{ ik3, ikmin, ikdj }] } der punkt 0 er inntaket og punkt i er enden av avsnitt i.
 * doubleEarthFault (bare IT): regner også dobbel jordfeil i to like kurser, der feilsløyfen er
 * fase + PE i hver kurs (NEK 400 411.6.4): Ijf = c·U/(2·(Znmin + Zs)). Gir ikdj i kA.
 */
export function shortCircuit(p, ctx = silent) {
  const { network, segments, cmax, cmin, theta, X, cosNet } = p;
  const thetaText = formatNumber(theta, { sig: 3 });
  const U = network.U;
  const U0 = network.U1f;
  const kind = minFaultKind(network);
  const sinNet = Math.sqrt(Math.max(0, 1 - cosNet * cosNet));

  const Znmaks = ctx.step('Znmaks', 'c·U/(√3·Ik3)', { c: cmax, U: v(U, 'V'), Ik3: v(p.Ik3, 'kA') }, 'mΩ', { text: 'Nettets impedans fra Ik3 maks ved inntaket' });
  const Rn = ctx.step('Rn', 'Znmaks·cosφk', { Znmaks: v(Znmaks, 'mΩ'), cosφk: cosNet }, 'mΩ');
  const Xn = ctx.step('Xn', 'Znmaks·sinφk', { Znmaks: v(Znmaks, 'mΩ'), sinφk: sinNet }, 'mΩ');
  const Znmin = kind === 'Ik2'
    ? ctx.step('Znmin', 'c·U/(2·Ik2)', { c: cmin, U: v(U, 'V'), Ik2: v(p.Ikmin, 'kA') }, 'mΩ', { text: 'Nettets impedans fra Ik2 min ved inntaket' })
    : ctx.step('Zsn', 'c·U₀/Ik1', { c: cmin, 'U₀': v(U0, 'V'), Ik1: v(p.Ikmin, 'kA') }, 'mΩ', { text: `Nettets sløyfeimpedans fra Ik1 min ved inntaket (fase–${network.earthing === 'TT' ? 'N' : 'PE'})` });

  const points = [{ ik3: p.Ik3, ikmin: p.Ikmin, ikdj: p.Ikmin }];
  const dj = kind === 'Ik2' && network.earthing === 'IT' && !!p.doubleEarthFault;
  const djVars = { c: cmin, U: v(U, 'V'), Znmin: v(Znmin, 'mΩ') };
  const djNames = [];
  const maxVars = { c: cmax, U: v(U, 'V'), Rn: v(Rn, 'mΩ'), Xn: v(Xn, 'mΩ') };
  const minVars = kind === 'Ik2' ? { c: cmin, U: v(U, 'V'), Znmin: v(Znmin, 'mΩ') } : { c: cmin, 'U₀': v(U0, 'V'), Zsn: v(Znmin, 'mΩ') };
  const rNames = [];
  const xNames = [];
  const zNames = [];

  segments.forEach((seg, idx) => {
    const i = idx + 1;
    const mat = seg.material === 'Al' ? 'Al' : 'Cu';
    const r = r20(mat, seg.S);
    if (r == null) throw new Error(`Mangler resistans for ${seg.S} mm² ${mat}`);
    const a = ALPHA[mat];
    const R = ctx.step(`R${i}`, 'r₂₀·L', { 'r₂₀': v(r, 'mΩ/m'), L: v(seg.L, 'm') }, 'mΩ', { text: `Avsnitt ${i}: fase, 20 °C (${String(seg.S).replace('.', ',')} mm² ${mat}, ${String(seg.L).replace('.', ',')} m)` });
    const Xs = ctx.step(`X${i}`, 'x·L', { x: v(X, 'mΩ/m'), L: v(seg.L, 'm') }, 'mΩ');
    maxVars[`R${i}`] = v(R, 'mΩ');
    maxVars[`X${i}`] = v(Xs, 'mΩ');
    rNames.push(`R${i}`);
    xNames.push(`X${i}`);
    const ik3 = ctx.step(`Ik3 etter avsnitt ${i}`, `c·U/(√3·√((Rn + ${rNames.join(' + ')})² + (Xn + ${xNames.join(' + ')})²))`, maxVars, 'kA');

    let ikmin;
    if (kind === 'Ik2') {
      const Rw = ctx.step(`R${i}θ`, 'r₂₀·(1 + α·(θ − 20))·L', { 'r₂₀': v(r, 'mΩ/m'), α: a, θ: v(p.theta, '°C'), L: v(seg.L, 'm') }, 'mΩ', { text: `Avsnitt ${i}: fase ved ${thetaText} °C` });
      const Zw = ctx.step(`Z${i}θ`, `√(R${i}θ² + X${i}²)`, { [`R${i}θ`]: v(Rw, 'mΩ'), [`X${i}`]: v(Xs, 'mΩ') }, 'mΩ');
      minVars[`Z${i}θ`] = v(Zw, 'mΩ');
      zNames.push(`Z${i}θ`);
      ikmin = ctx.step(`Ik2 etter avsnitt ${i}`, `c·U/(2·(Znmin + ${zNames.join(' + ')}))`, minVars, 'kA');
      if (dj) {
        const rpe = r20(mat, seg.Spe);
        if (rpe == null) throw new Error(`Mangler resistans for PE ${seg.Spe} mm² ${mat}`);
        const Rd = ctx.step(`Rjf${i}`, '(rL + rPE)·(1 + α·(θ − 20))·L', { rL: v(r, 'mΩ/m'), rPE: v(rpe, 'mΩ/m'), α: a, θ: v(p.theta, '°C'), L: v(seg.L, 'm') }, 'mΩ', { text: `Avsnitt ${i}: sløyfe fase + PE ved ${thetaText} °C (dobbel jordfeil)` });
        const Xd = ctx.step(`Xjf${i}`, '2·x·L', { x: v(X, 'mΩ/m'), L: v(seg.L, 'm') }, 'mΩ');
        const Zd = ctx.step(`Zjf${i}`, `√(Rjf${i}² + Xjf${i}²)`, { [`Rjf${i}`]: v(Rd, 'mΩ'), [`Xjf${i}`]: v(Xd, 'mΩ') }, 'mΩ');
        djVars[`Zjf${i}`] = v(Zd, 'mΩ');
        djNames.push(`Zjf${i}`);
      }
    } else {
      const rpe = r20(mat, seg.Spe);
      if (rpe == null) throw new Error(`Mangler resistans for PE ${seg.Spe} mm² ${mat}`);
      const Rs = ctx.step(`Rs${i}`, '(rL + rPE)·(1 + α·(θ − 20))·L', { rL: v(r, 'mΩ/m'), rPE: v(rpe, 'mΩ/m'), α: a, θ: v(p.theta, '°C'), L: v(seg.L, 'm') }, 'mΩ', { text: `Avsnitt ${i}: sløyfe fase + ${network.earthing === 'TT' ? 'N' : 'PE'} ved ${thetaText} °C` });
      const Xl = ctx.step(`Xs${i}`, '2·x·L', { x: v(X, 'mΩ/m'), L: v(seg.L, 'm') }, 'mΩ');
      const Zs = ctx.step(`Zs${i}`, `√(Rs${i}² + Xs${i}²)`, { [`Rs${i}`]: v(Rs, 'mΩ'), [`Xs${i}`]: v(Xl, 'mΩ') }, 'mΩ');
      minVars[`Zs${i}`] = v(Zs, 'mΩ');
      zNames.push(`Zs${i}`);
      ikmin = ctx.step(`Ik1 etter avsnitt ${i}`, `c·U₀/(Zsn + ${zNames.join(' + ')})`, minVars, 'kA');
    }
    let ikdj = ikmin;
    if (dj) {
      ikdj = ctx.step(`Ijf etter avsnitt ${i}`, `c·U/(2·(Znmin + ${djNames.join(' + ')}))`, djVars, 'kA', { text: 'Dobbel jordfeil i to like kurser, fase + PE i hver (NEK 400 411.6.4)' });
    }
    points.push({ ik3, ikmin, ikdj });
  });
  return { points, kind };
}

/**
 * Største lengde (m) for ett kabelavsnitt der Ik min ved enden fortsatt er minst Ia (A).
 * Samme formler som shortCircuit, løst for L. Impedansene legges sammen aritmetisk, så
 * kabelens impedans per meter kan skilles ut:
 *   TN/TT 400: c·U₀/(Zsn + L·zs) = Ia    zs = √(((rL + rPE)·(1 + α·(θ − 20)))² + (2·x)²)
 *   IT/TT 230: c·U/(2·(Znmin + L·z)) = Ia  z = √((r·(1 + α·(θ − 20)))² + x²)
 *   IT, dobbel jordfeil: som over, men z = √(((rL + rPE)·(1 + α·(θ − 20)))² + (2·x)²)
 * Gir 0 når Ik min i fordelingen allerede er lavere enn Ia.
 */
export function maxLengthForIk({ network, Ikmin, material, S, Spe = S, cmin, theta, X, doubleEarthFault = false }, Ia) {
  const mat = material === 'Al' ? 'Al' : 'Cu';
  const k = 1 + ALPHA[mat] * (theta - 20);
  const r = r20(mat, S);
  if (r == null) throw new Error(`Mangler resistans for ${S} mm² ${mat}`);
  const IaKA = Ia / 1000;
  let room;
  let perMeter;
  if (minFaultKind(network) === 'Ik2') {
    room = (cmin * network.U) / (2 * IaKA) - (cmin * network.U) / (2 * Ikmin);
    perMeter = Math.hypot(r * k, X);
    // Dobbel jordfeil i IT: sløyfen er fase + PE i hver av de to kursene.
    if (doubleEarthFault && network.earthing === 'IT') {
      const rpe = r20(mat, Spe);
      if (rpe == null) throw new Error(`Mangler resistans for PE ${Spe} mm² ${mat}`);
      perMeter = Math.hypot((r + rpe) * k, 2 * X);
    }
  } else {
    const rpe = r20(mat, Spe);
    if (rpe == null) throw new Error(`Mangler resistans for PE ${Spe} mm² ${mat}`);
    room = (cmin * network.U1f) / IaKA - (cmin * network.U1f) / Ikmin;
    perMeter = Math.hypot((r + rpe) * k, 2 * X);
  }
  return Math.max(0, room / perMeter);
}
