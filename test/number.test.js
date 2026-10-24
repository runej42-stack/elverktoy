import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNumber, formatNumber, formatValue, formatInput } from '../src/core/number.js';

test('parseNumber tåler komma, punktum, mellomrom og minustegn', () => {
  assert.equal(parseNumber('1,5'), 1.5);
  assert.equal(parseNumber('1.5'), 1.5);
  assert.equal(parseNumber(' 2 500 '), 2500);
  assert.equal(parseNumber('2\u00a0500,25'), 2500.25);
  assert.equal(parseNumber('−3'), -3);
  assert.equal(parseNumber('-0,08'), -0.08);
  assert.equal(parseNumber('1.234,5'), 1234.5);
  assert.equal(parseNumber('1,234.5'), 1234.5);
  assert.equal(parseNumber(',5'), 0.5);
  assert.equal(parseNumber(16), 16);
});

test('parseNumber skiller tomt felt fra ugyldig tall', () => {
  assert.equal(parseNumber(''), null);
  assert.equal(parseNumber('   '), null);
  assert.equal(parseNumber(null), null);
  assert.ok(Number.isNaN(parseNumber('abc')));
  assert.ok(Number.isNaN(parseNumber('1,2,3')));
  assert.ok(Number.isNaN(parseNumber('1.2.3')));
  assert.ok(Number.isNaN(parseNumber('5 A')));
});

test('formatNumber gir norsk format', () => {
  assert.equal(formatNumber(3.456), '3,46');
  assert.equal(formatNumber(3.4), '3,4');
  assert.equal(formatNumber(16), '16');
  assert.equal(formatNumber(0), '0');
  assert.equal(formatNumber(-0.5), '−0,5');
  assert.equal(formatNumber(12345.6), '12\u00a0346');
  assert.equal(formatNumber(1234.5), '1235');
  assert.equal(formatNumber(0.000123), '0,000123');
  assert.equal(formatNumber(9.996), '10');
  assert.equal(formatNumber(2.5, { dec: 2 }), '2,50');
  assert.equal(formatNumber(NaN), '–');
  assert.equal(formatNumber(-0.0001, { dec: 2 }), '0,00');
  assert.equal(formatNumber(26.45), '26,5');
  assert.equal(formatNumber(1.005, { dec: 2 }), '1,01');
  assert.equal(formatNumber(1e-7, { maxDec: 8 }), '0,0000001');
});

test('formatValue og formatInput', () => {
  assert.equal(formatValue(3.7, '%'), '3,7\u00a0%');
  assert.equal(formatValue(16, 'A'), '16\u00a0A');
  assert.equal(formatInput(0.95), '0,95');
  assert.equal(formatInput(230), '230');
  assert.equal(formatInput(0.1 + 0.2), '0,3');
  assert.equal(formatInput(null), '');
});
