// Kalkulatormotoren: tolker feltene, kjører beregningen og samler resultater,
// kontroller, utregningssteg, forutsetninger og advarsler.
//
// En kalkulator er en definisjon (se src/calcs). Beregningen skjer bare i
// definisjonens compute(verdier, ctx). Utregningssteg lages med ctx.step(), som
// regner ut formelen og lagrer den samtidig.

import { parseNumber, formatNumber, formatValue } from './number.js';
import { evaluate } from './expr.js';

/** Innenfor 3 % av en grense regnes som grensetilfelle. */
export const BORDER = 0.03;

/** Verdi med enhet, brukt i formler og utregningssteg. */
export const v = (value, unit) => ({ v: value, u: unit });

class NeedInput extends Error {}

export function resolveOptions(input, settings, values) {
  return typeof input.options === 'function' ? input.options(settings, values) : input.options || [];
}

function resolveDefault(input, settings, values) {
  return typeof input.default === 'function' ? input.default(settings, values) : input.default;
}

export function isActive(input, values, settings) {
  return !input.when || !!input.when(values, settings);
}

/**
 * Lager verdiene som beregningen får. raw inneholder bare feltene brukeren har endret
 * (som tekst); resten hentes fra standardverdiene, som kan avhenge av innstillingene.
 */
export function prepare(def, raw = {}, settings = {}) {
  const values = {};
  if (def.modes && def.modes.length) {
    values.mode = def.modes.some((m) => m.id === raw.mode) ? raw.mode : def.modes[0].id;
  }
  for (const input of def.inputs) {
    const has = Object.prototype.hasOwnProperty.call(raw, input.id);
    const fallback = () => resolveDefault(input, settings, values);
    if (input.type === 'number') {
      values[input.id] = has ? parseNumber(raw[input.id]) : (fallback() ?? null);
    } else if (input.type === 'select') {
      const options = resolveOptions(input, settings, values);
      const same = (w) => options.find((o) => String(o.value) === String(w));
      const hit = (has && same(raw[input.id])) || same(fallback()) || options[0];
      values[input.id] = hit ? hit.value : null;
    } else if (input.type === 'toggle') {
      values[input.id] = has ? raw[input.id] === true || raw[input.id] === 'true' : !!fallback();
    } else {
      values[input.id] = has ? raw[input.id] : fallback();
    }
  }

  const fields = [];
  const missing = [];
  const errors = {};
  for (const input of def.inputs) {
    if (!isActive(input, values, settings)) continue;
    fields.push(input);
    if (input.type !== 'number') continue;
    const x = values[input.id];
    if (x === null || x === undefined) {
      if (!input.optional) missing.push(input.id);
      continue;
    }
    if (Number.isNaN(x)) {
      errors[input.id] = 'Ugyldig tall';
      continue;
    }
    const { min, max } = input;
    if (min != null && (input.minExclusive ? x <= min : x < min)) {
      errors[input.id] = input.minExclusive ? `Må være større enn ${formatNumber(min)}` : `Må være minst ${formatNumber(min)}`;
    } else if (max != null && x > max) {
      errors[input.id] = `Kan ikke være over ${formatNumber(max)}`;
    }
  }
  return { values, fields, missing, errors };
}

function addCheck(res, label, value, limit, unit, op, opts) {
  const ok = op === '≤' ? value <= limit : value >= limit;
  const base = Math.abs(limit) || 1;
  const rel = op === '≤' ? (limit - value) / base : (value - limit) / base;
  const status = !ok ? 'fail' : rel < (opts.border ?? BORDER) ? 'border' : 'ok';
  res.checks.push({ label, status, value, limit, unit, op, rel, detail: opts.detail || '', sig: opts.sig ?? 3 });
  return ok;
}

function makeContext(res, settings) {
  return {
    settings,
    step(label, expr, vars = {}, unit = '', opts = {}) {
      const value = evaluate(expr, vars);
      res.steps.push({ label, expr, vars, value, unit, text: opts.text || '' });
      return value;
    },
    calc: (expr, vars) => evaluate(expr, vars),
    out(id, label, value, unit = '', opts = {}) {
      res.outputs.push({ id, label, value, unit, primary: !!opts.primary, sig: opts.sig ?? 3, dec: opts.dec, note: opts.note || '' });
      return value;
    },
    text(id, label, value, opts = {}) {
      res.outputs.push({ id, label, value, unit: '', primary: !!opts.primary, isText: true, note: opts.note || '' });
    },
    le: (label, value, limit, unit = '', opts = {}) => addCheck(res, label, value, limit, unit, '≤', opts),
    ge: (label, value, limit, unit = '', opts = {}) => addCheck(res, label, value, limit, unit, '≥', opts),
    check(label, status, detail = '') {
      res.checks.push({ label, status, detail });
      return status !== 'fail';
    },
    warn(t) { if (!res.warnings.includes(t)) res.warnings.push(t); },
    note(t) { if (!res.notes.includes(t)) res.notes.push(t); },
    assume(t) { if (!res.assumptions.includes(t)) res.assumptions.push(t); },
    need(message) { throw new NeedInput(message); },
  };
}

/** Kjører en kalkulator. Status: 'ok', 'incomplete' (mangler/ugyldige felt) eller 'error'. */
export function run(def, raw = {}, settings = {}) {
  const prep = prepare(def, raw, settings);
  const res = {
    id: def.id,
    status: 'ok',
    message: '',
    error: '',
    mode: prep.values.mode,
    values: prep.values,
    fields: prep.fields,
    missing: prep.missing,
    errors: prep.errors,
    outputs: [], steps: [], checks: [], warnings: [], notes: [], assumptions: [],
  };
  if (prep.missing.length || Object.keys(prep.errors).length) {
    res.status = 'incomplete';
    return res;
  }
  try {
    def.compute(prep.values, makeContext(res, settings));
  } catch (e) {
    res.outputs = []; res.steps = []; res.checks = [];
    if (e instanceof NeedInput) {
      res.status = 'incomplete';
      res.message = e.message;
    } else {
      res.status = 'error';
      res.error = e && e.message ? e.message : String(e);
    }
  }
  if (res.status === 'ok') {
    const bad = res.outputs.find((o) => !o.isText && !Number.isFinite(o.value));
    if (bad) {
      res.status = 'error';
      res.error = `Kunne ikke regne ut ${bad.label.toLowerCase()} med disse verdiene.`;
    }
  }
  return res;
}

/** Regner uten å lagre steg. Brukes i søk etter tverrsnitt o.l. og i tester av lib-funksjoner. */
export const silent = {
  settings: {},
  step: (label, expr, vars = {}) => evaluate(expr, vars),
  calc: (expr, vars) => evaluate(expr, vars),
  out: (id, label, value) => value,
  text() {},
  le: (label, value, limit) => value <= limit,
  ge: (label, value, limit) => value >= limit,
  check: (label, status) => status !== 'fail',
  warn() {}, note() {}, assume() {},
  need(message) { throw new NeedInput(message); },
};

/** Teksten et felt vises med i deling og sammendrag. */
export function displayInput(input, value, settings, values) {
  if (input.type === 'select') {
    const o = resolveOptions(input, settings, values).find((x) => String(x.value) === String(value));
    return o ? o.label : String(value);
  }
  if (input.type === 'toggle') return value ? 'Ja' : 'Nei';
  if (input.type === 'number') return value == null ? '–' : formatValue(value, input.unit, { sig: 6 });
  return String(value ?? '');
}

export const STATUS_TEXT = { ok: 'OK', border: 'Grensetilfelle', fail: 'Ikke OK', info: 'Info' };

/** Kort tekst for deling: inndata, resultater og kontroller. */
export function summaryText(def, res, settings, appName = 'Elverktøy') {
  const lines = [def.title];
  if (def.modes && def.modes.length) {
    const m = def.modes.find((x) => x.id === res.mode);
    if (m) lines.push(m.label);
  }
  for (const f of res.fields) {
    if (f.shareHidden) continue;
    const value = res.values[f.id];
    if (f.type === 'number' && value == null) continue;
    lines.push(`${f.label}: ${displayInput(f, value, settings, res.values)}`);
  }
  if (res.status === 'ok') {
    lines.push('');
    for (const o of res.outputs) {
      lines.push(`${o.label}: ${o.isText ? o.value : formatValue(o.value, o.unit, { sig: o.sig, dec: o.dec })}`);
    }
    for (const c of res.checks) {
      const mark = c.status === 'ok' ? '✓' : c.status === 'border' ? '!' : c.status === 'fail' ? '✗' : '•';
      const cmp = c.op ? ` ${formatValue(c.value, c.unit, { sig: c.sig })} ${c.op} ${formatValue(c.limit, c.unit, { sig: c.sig })}` : '';
      lines.push(`${mark} ${c.label}:${cmp} (${STATUS_TEXT[c.status] || c.status})`);
    }
  }
  lines.push('', `${appName} – hjelpemiddel. Kontroller mot NEK 400:2026.`);
  return lines.join('\n');
}
