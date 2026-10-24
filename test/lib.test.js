import test from 'node:test';
import assert from 'node:assert/strict';
import { r20, resistanceAt, voltageDrop, maxLength, minSizeForDrop } from '../src/lib/kabel.js';
import { apparentFromCurrent, currentFromActive, currentFromApparent, reactiveFrom } from '../src/lib/elektro.js';

const close = (a, b, rel = 1e-6) => assert.ok(Math.abs(a - b) <= rel * Math.abs(b), `${a} ≠ ${b}`);

test('lederresistans fra IEC 60228 og temperaturkorreksjon', () => {
  assert.equal(r20('Cu', 2.5), 7.41);
  assert.equal(r20('Cu', 2.5, true), 7.98);
  assert.equal(r20('Al', 16), 1.91);
  assert.equal(r20('Al', 2.5), null);
  close(resistanceAt({ material: 'Cu', S: 2.5, theta: 70 }), 7.41 * (1 + 0.00393 * 50));
  close(resistanceAt({ material: 'Al', S: 50, theta: 90 }), 0.641 * (1 + 0.00403 * 70));
  close(resistanceAt({ material: 'Cu', S: 10, theta: 20 }), 1.83);
});

test('spenningsfall enfase og trefase mot håndregning', () => {
  // 2·16 A·30 m·8,866 Ω/km
  const R = 7.41 * 1.1965;
  const a = voltageDrop({ phases: 1, U: 230, I: 16, L: 30, R, X: 0.08, cosphi: 1 });
  close(a.dU, 2 * 16 * 30 * R / 1000);
  close(a.pct, a.dU / 230 * 100);
  // √3·32·50·(R·0,9 + 0,08·sin φ)
  const R6 = 3.08 * 1.1965;
  const b = voltageDrop({ phases: 3, U: 400, I: 32, L: 50, R: R6, X: 0.08, cosphi: 0.9 });
  close(b.dU, Math.sqrt(3) * 32 * 50 * (R6 * 0.9 + 0.08 * Math.sqrt(0.19)) / 1000);
});

test('maks lengde er det inverse av spenningsfallet', () => {
  const p = { phases: 3, U: 400, I: 25, R: 1.83 * 1.1965, X: 0.08, cosphi: 0.85, limit: 4 };
  const L = maxLength(p);
  const { pct } = voltageDrop({ ...p, L });
  close(pct, 4, 1e-9);
});

test('minste tverrsnitt øker med lengden', () => {
  const base = { phases: 1, U: 230, I: 16, X: 0.08, cosphi: 1, limit: 4, material: 'Cu', theta: 70 };
  let last = 0;
  for (const L of [10, 30, 60, 120, 250]) {
    const S = minSizeForDrop({ ...base, L });
    assert.ok(S >= last, `L=${L} ga ${S} mm², mindre enn ${last}`);
    last = S;
  }
  assert.equal(minSizeForDrop({ ...base, L: 20000 }), null);
});

test('effekt og strøm', () => {
  close(apparentFromCurrent({ phases: 3, U: 400, I: 16 }), Math.sqrt(3) * 400 * 16 / 1000);
  close(apparentFromCurrent({ phases: 3, U: 230, I: 16 }), 6.373947);
  close(currentFromActive({ phases: 1, U: 230, P: 2.3, cosphi: 1 }), 10);
  close(currentFromApparent({ phases: 3, U: 400, S: 100 }), 144.3375673);
  close(reactiveFrom({ S: 10, P: 8 }), 6);
});
