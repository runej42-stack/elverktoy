import test from 'node:test';
import assert from 'node:assert/strict';
import { R20_CU, R20_CU_FLEX, R20_AL, R20_SOURCE, SIZES } from '../src/data/ledere.js';
import { search } from '../src/core/search.js';

const decreasing = (table) => table.every((row, i) => i === 0 || row[1] < table[i - 1][1] && row[0] > table[i - 1][0]);

test('lederresistans: kilde og rimelige tall', () => {
  for (const k of ['source', 'edition', 'transcribedBy']) assert.ok(R20_SOURCE[k], `mangler ${k}`);
  assert.ok(decreasing(R20_CU), 'Cu: resistansen skal synke når tverrsnittet øker');
  assert.ok(decreasing(R20_CU_FLEX), 'Cu klasse 5: synkende');
  assert.ok(decreasing(R20_AL), 'Al: synkende');
  for (const [S, R] of R20_AL) {
    const cu = R20_CU.find(([s]) => s === S);
    if (cu) assert.ok(R > cu[1], `Al ${S} mm² skal ha høyere resistans enn Cu`);
  }
  for (const [S, R] of R20_CU_FLEX) {
    const cu = R20_CU.find(([s]) => s === S);
    // IEC 60228 har 0,386 (klasse 5) mot 0,387 (klasse 2) for 50 mm², så 1 % slingringsmonn.
    if (cu && S <= 300) assert.ok(R >= cu[1] * 0.99, `fleksibel ${S} mm² skal ikke ha lavere resistans enn fast`);
  }
  // Grov fysisk kontroll mot R ≈ ρ/S (fanger feil som et komma på feil plass). Flertrådet leder
  // ligger opptil ca. 12 % over ρ/S fordi virkelig tverrsnitt er mindre enn nominelt.
  for (const [S, R] of R20_CU) assert.ok(Math.abs(R - 17.24 / S) / R < 0.15, `Cu ${S} mm²: ${R} Ω/km virker feil`);
  for (const [S, R] of R20_AL) assert.ok(Math.abs(R - 28.26 / S) / R < 0.15, `Al ${S} mm²: ${R} Ω/km virker feil`);
});

test('alle tilbudte tverrsnitt finnes i tabellen', () => {
  for (const S of SIZES.Cu) assert.ok(R20_CU.some(([s]) => s === S), `Cu ${S}`);
  for (const S of SIZES.Al) assert.ok(R20_AL.some(([s]) => s === S), `Al ${S}`);
});

test('søk finner kalkulatorer med synonymer', () => {
  assert.equal(search('spenningsfall')[0].id, 'spenningsfall');
  assert.equal(search('du')[0].id, 'spenningsfall');
  assert.equal(search('ΔU')[0].id, 'spenningsfall');
  assert.equal(search('ohm')[0].id, 'ohm');
  assert.equal(search('kva')[0].id, 'kva');
  assert.ok(search('trafo').some((h) => h.id === 'kva'));
  assert.ok(search('motstand').some((h) => h.id === 'ohm'));
  assert.deepEqual(search(''), []);
  assert.deepEqual(search('xyzxyz'), []);
});
