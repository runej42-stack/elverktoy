import test from 'node:test';
import assert from 'node:assert/strict';
import { FORMULAS, FORMULA_GROUPS, TIPS } from '../src/content/index.js';
import { CALCS } from '../src/calcs/index.js';
import { search } from '../src/core/search.js';

const calcIds = new Set(CALCS.map((c) => c.id));

test('formelsamlingen er komplett og henger sammen', () => {
  assert.ok(FORMULAS.length >= 60, `bare ${FORMULAS.length} formler`);
  const ids = new Set();
  for (const f of FORMULAS) {
    assert.ok(!ids.has(f.id), `dobbel formel-id ${f.id}`);
    ids.add(f.id);
    assert.ok(FORMULA_GROUPS.includes(f.group), `${f.id}: ukjent gruppe ${f.group}`);
    assert.ok(f.title && f.expr, `${f.id}: mangler tittel eller formel`);
    assert.ok(Array.isArray(f.vars) && f.vars.length, `${f.id}: mangler forklaring av symbolene`);
    for (const v of f.vars) assert.equal(v.length, 3, `${f.id}: symbol må ha [symbol, forklaring, enhet]`);
    if (f.calc) assert.ok(calcIds.has(f.calc), `${f.id}: ukjent kalkulator ${f.calc}`);
    assert.equal((f.expr.match(/\{/g) || []).length, (f.expr.match(/\}/g) || []).length, `${f.id}: ubalanserte klammer`);
  }
  for (const g of FORMULA_GROUPS) assert.ok(FORMULAS.some((f) => f.group === g), `tom gruppe ${g}`);
});

test('fagtipsene henger sammen', () => {
  const ids = new Set();
  for (const t of TIPS) {
    assert.ok(!ids.has(t.id), `dobbelt fagtips ${t.id}`);
    ids.add(t.id);
    assert.ok(t.title && t.summary && t.body.length, `${t.id}: mangler innhold`);
    for (const id of t.related || []) assert.ok(calcIds.has(id), `${t.id}: ukjent kalkulator ${id}`);
    for (const b of t.body) assert.ok(b.p || b.h || b.list || b.note, `${t.id}: ukjent blokk`);
  }
});

test('søk finner formler og fagtips, og kalkulatorer først', () => {
  assert.ok(search('sløyfeimpedans').some((h) => h.type === 'formula'));
  assert.ok(search('√3').length >= 0);
  assert.ok(search('rot 3').some((h) => h.id === 'rot3'));
  const vd = search('spenningsfall');
  assert.equal(vd[0].type, 'calc');
  assert.ok(vd.some((h) => h.type === 'formula'));
  assert.ok(search('jordfeilbryter type b').some((h) => h.id === 'jordfeilbryter-typer'));
});
