// Kjører testtilfellene som ligger i hver kalkulator (cases).
// Brukes både av node --test og av selvtest-siden i appen.

import { run } from './engine.js';
import { DEFAULTS } from './settings.js';

const DEFAULT_TOL = 1e-4;

export function runCase(def, c) {
  const settings = { ...DEFAULTS, ...(c.settings || {}) };
  const res = run(def, c.inputs || {}, settings);
  const failures = [];
  if (res.status !== 'ok') {
    failures.push(`status ${res.status}${res.message ? ': ' + res.message : ''}${res.error ? ': ' + res.error : ''}${res.missing.length ? ' (mangler ' + res.missing.join(', ') + ')' : ''}`);
  }
  for (const [id, exp] of Object.entries(c.expect || {})) {
    const [want, tol = DEFAULT_TOL] = Array.isArray(exp) ? exp : [exp];
    const out = res.outputs.find((o) => o.id === id);
    if (!out) {
      failures.push(`mangler resultatet ${id}`);
      continue;
    }
    if (typeof want === 'number') {
      const err = want === 0 ? Math.abs(out.value) : Math.abs(out.value - want) / Math.abs(want);
      if (!(err <= (want === 0 ? 1e-9 : tol))) failures.push(`${id}: fikk ${out.value}, ventet ${want}`);
    } else if (out.value !== want) {
      failures.push(`${id}: fikk ${out.value}, ventet ${want}`);
    }
  }
  for (const [label, status] of Object.entries(c.checks || {})) {
    const chk = res.checks.find((x) => x.label === label);
    if (!chk) failures.push(`mangler kontrollen ${label}`);
    else if (chk.status !== status) failures.push(`${label}: fikk ${chk.status}, ventet ${status}`);
  }
  return { pass: failures.length === 0, failures, res };
}

/** Alle testtilfeller for alle kalkulatorer. */
export function runAllCases(calcs) {
  const out = [];
  for (const def of calcs) {
    for (const c of def.cases || []) out.push({ calc: def, case: c, ...runCase(def, c) });
  }
  return out;
}
