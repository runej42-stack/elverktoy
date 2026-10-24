import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, substitute, variables } from '../src/core/expr.js';

const close = (a, b, tol = 1e-12) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);

test('regnerekkefølge', () => {
  assert.equal(evaluate('2 + 3·4'), 14);
  assert.equal(evaluate('(2 + 3)·4'), 20);
  assert.equal(evaluate('2^3^2'), 512);
  assert.equal(evaluate('−2²'), -4);
  assert.equal(evaluate('10/4/5'), 0.5);
  assert.equal(evaluate('2 − 3 − 4'), -5);
  assert.equal(evaluate('3²·2'), 18);
});

test('rot, funksjoner og desimalkomma', () => {
  assert.equal(evaluate('√(9)'), 3);
  assert.equal(evaluate('√9·2'), 6);
  close(evaluate('√3'), Math.sqrt(3));
  assert.equal(evaluate('maks(1; 5)'), 5);
  assert.equal(evaluate('min(2; 7; 1)'), 1);
  assert.equal(evaluate('1,5·2'), 3);
  assert.equal(evaluate('0.5 × 4'), 2);
  close(evaluate('cos(0)'), 1);
  close(evaluate('2·π·f', { f: 50 }), 2 * Math.PI * 50);
  close(evaluate('tan(acos(0,8))'), 0.75);
  assert.deepEqual(variables('2·π·f·C'), ['f', 'C']);
});

test('variabler med og uten enhet', () => {
  const vars = { U: { v: 230, u: 'V' }, I: 10, cosφ: 0.9, 'R₂₀': 7.41, θ: 70 };
  close(evaluate('√3·U·I·cosφ', vars), Math.sqrt(3) * 230 * 10 * 0.9);
  close(evaluate('R₂₀·(1 + 0,00393·(θ − 20))', vars), 7.41 * (1 + 0.00393 * 50));
  assert.deepEqual(variables('ΔU/U·100 + maks(a; b)'), ['ΔU', 'U', 'a', 'b']);
  assert.throws(() => evaluate('U·X', vars), /Mangler verdi for «X»/);
});

test('ugyldige formler gir tydelig feil', () => {
  assert.throws(() => evaluate('2 +'), /Uventet slutt/);
  assert.throws(() => evaluate('(2 + 3'), /Forventet/);
  assert.throws(() => evaluate('2 $ 3'), /Ukjent tegn/);
  assert.throws(() => evaluate('foo(2)'), /Ukjent funksjon/);
});

test('substitute setter inn verdier og beholder formateringen', () => {
  const fmt = (x, u) => (u ? `${x} ${u}` : String(x));
  assert.equal(substitute('2·I·L', { I: { v: 16, u: 'A' }, L: { v: 30, u: 'm' } }, fmt), '2 · 16 A · 30 m');
  assert.equal(substitute('a − b', { a: 5, b: -3 }, fmt), '5 − (-3)');
  assert.equal(substitute('√(P·R)', { P: 2000, R: 26.45 }, fmt), '√(2000 · 26.45)');
  assert.equal(substitute('cos(φ)', { φ: 0 }, fmt), 'cos(0)');
  assert.equal(substitute('−a + b²/2', { a: 1, b: 3 }, fmt), '−1 + 3² / 2');
  assert.equal(substitute('maks(a;b)', { a: 1, b: 2 }, fmt), 'maks(1; 2)');
  assert.equal(substitute('U²/P', { U: { v: 230, u: 'V' }, P: { v: 2000, u: 'W' } }, fmt), '(230 V)² / 2000 W');
});
