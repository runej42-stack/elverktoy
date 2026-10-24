import test from 'node:test';
import assert from 'node:assert/strict';
import { CALCS } from '../src/calcs/index.js';
import { CATEGORIES } from '../src/data/categories.js';
import { run, prepare, resolveOptions, summaryText } from '../src/core/engine.js';
import { runCase } from '../src/core/cases.js';
import { DEFAULTS, NETWORKS } from '../src/core/settings.js';
import { variables } from '../src/core/expr.js';

test('alle kalkulatorer har gyldig definisjon', () => {
  const ids = new Set();
  for (const c of CALCS) {
    assert.ok(c.id && !ids.has(c.id), `dobbel eller manglende id: ${c.id}`);
    ids.add(c.id);
    assert.ok(c.title && c.summary, `${c.id}: mangler tittel/sammendrag`);
    assert.ok(CATEGORIES.some((k) => k.id === c.category), `${c.id}: ukjent kategori ${c.category}`);
    assert.equal(typeof c.compute, 'function');
    assert.ok(Array.isArray(c.inputs));
    const fieldIds = new Set();
    for (const f of c.inputs) {
      assert.ok(f.id && f.label && f.type, `${c.id}: felt mangler id/label/type`);
      assert.ok(!fieldIds.has(f.id), `${c.id}: dobbelt felt ${f.id}`);
      fieldIds.add(f.id);
    }
    assert.ok((c.cases || []).length >= 1, `${c.id}: mangler testtilfeller`);
  }
});

test('testtilfellene i hver kalkulator stemmer', () => {
  for (const c of CALCS) {
    for (const k of c.cases) {
      const r = runCase(c, k);
      assert.ok(r.pass, `${c.id} – ${k.name}: ${r.failures.join('; ')}`);
    }
  }
});

test('hver modus har minst ett testtilfelle som går gjennom', () => {
  for (const c of CALCS) {
    for (const m of c.modes || [{ id: undefined }]) {
      const hit = c.cases.some((k) => (k.inputs.mode ?? (c.modes ? c.modes[0].id : undefined)) === m.id && runCase(c, k).pass);
      assert.ok(hit, `${c.id}: ingen testtilfelle for modus ${m.id}`);
    }
  }
});

test('røyktest: alle kalkulatorer × moduser × nett × materiale gir ingen feil', () => {
  for (const c of CALCS) {
    for (const mode of (c.modes || [{ id: undefined }]).map((m) => m.id)) {
      for (const network of NETWORKS.map((n) => n.id)) {
        for (const material of ['Cu', 'Al']) {
          const settings = { ...DEFAULTS, network, material };
          const res = run(c, mode ? { mode } : {}, settings);
          assert.notEqual(res.status, 'error', `${c.id}/${mode}/${network}/${material}: ${res.error}`);
          for (const k of c.cases) {
            const r = run(c, { ...k.inputs, ...(mode ? { mode } : {}) }, settings);
            assert.notEqual(r.status, 'error', `${c.id}/${mode}/${k.name}: ${r.error}`);
            const text = summaryText(c, r, settings);
            assert.ok(!/NaN|undefined|\[object/.test(text), `${c.id}: rar tekst i deling: ${text}`);
            for (const s of r.steps) {
              assert.ok(Number.isFinite(s.value), `${c.id}: steg ${s.label} er ikke et tall`);
              for (const name of variables(s.expr)) assert.ok(name in s.vars, `${c.id}: steg ${s.label} mangler ${name}`);
            }
          }
        }
      }
    }
  }
});

test('standardverdier er gyldige valg', () => {
  for (const c of CALCS) {
    const { values } = prepare(c, {}, DEFAULTS);
    for (const f of c.inputs.filter((x) => x.type === 'select')) {
      const opts = resolveOptions(f, DEFAULTS, values);
      assert.ok(opts.some((o) => o.value === values[f.id]), `${c.id}.${f.id}: standard ${values[f.id]} finnes ikke`);
    }
  }
});

test('ugyldige og manglende tall gir «incomplete», ikke feil', () => {
  const vd = CALCS.find((c) => c.id === 'spenningsfall');
  const r1 = run(vd, { I: 'abc', L: '10' }, DEFAULTS);
  assert.equal(r1.status, 'incomplete');
  assert.equal(r1.errors.I, 'Ugyldig tall');
  const r2 = run(vd, { I: '-5', L: '10' }, DEFAULTS);
  assert.equal(r2.status, 'incomplete');
  assert.ok(r2.errors.I);
  const r3 = run(vd, {}, DEFAULTS);
  assert.equal(r3.status, 'incomplete');
  assert.deepEqual(r3.missing, ['I', 'L']);
});

test('spenningen følger nettet når feltet ikke er endret', () => {
  const ef = CALCS.find((c) => c.id === 'effekt');
  assert.equal(prepare(ef, { phases: 3 }, { ...DEFAULTS, network: 'TN400' }).values.U, 400);
  assert.equal(prepare(ef, { phases: 3 }, { ...DEFAULTS, network: 'IT230' }).values.U, 230);
  assert.equal(prepare(ef, { phases: 1 }, { ...DEFAULTS, network: 'TN400' }).values.U, 230);
  assert.equal(prepare(ef, { phases: 3, U: '415' }, DEFAULTS).values.U, 415);
});
