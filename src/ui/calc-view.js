// Visning av én kalkulator: felt, resultater, kontroller og «Vis utregning».
// Feltene bygges én gang; ved hver endring kjøres beregningen og bare resultatet tegnes på nytt.

import { h, clear, nextId } from './dom.js';
import { icon } from './icons.js';
import { segmented, toggleSwitch } from './components.js';
import { toast } from './toast.js';
import { back } from './router.js';
import { run, resolveOptions, summaryText, STATUS_TEXT } from '../core/engine.js';
import { formatValue, formatNumber, formatInput, parseNumber } from '../core/number.js';
import { substitute, variables } from '../core/expr.js';
import { load, save, remove } from '../core/store.js';
import { getSettings } from '../core/settings.js';
import { isFavorite, toggleFavorite, addRecent } from '../core/prefs.js';
import { shareText } from '../core/share.js';
import { getCategory } from '../core/registry.js';
import { brand } from '../brand/active.js';
import { buildInfo } from '../core/env.js';
import { saveCalculationToJob } from './jobs-views.js';

const fmtVar = (x, unit) => formatValue(x, unit, { sig: 4 });
const SEGMENT_MAX = 4;

const listText = (items) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} og ${items[items.length - 1]}`);

export function calcView(def) {
  addRecent(def.id);
  const key = 'inputs:' + def.id;
  let raw = load(key, {});
  let showSteps = !!load('ui:steps', false);
  let lastRes = null;
  const fields = new Map();

  const setRaw = (id, value) => {
    raw = { ...raw, [id]: value };
    save(key, raw);
    update();
  };
  const unsetRaw = (id) => {
    if (!Object.prototype.hasOwnProperty.call(raw, id)) return;
    const next = { ...raw };
    delete next[id];
    raw = next;
    save(key, raw);
    update();
  };

  // ---------- Felt ----------
  function numberField(input, id) {
    const inp = h('input', {
      id, type: 'text', inputmode: 'decimal', autocomplete: 'off', autocorrect: 'off',
      autocapitalize: 'off', spellcheck: 'false', enterkeyhint: 'done', placeholder: input.placeholder || '',
    });
    // Verdien brukeren skrev sist gang, vises igjen når kalkulatoren åpnes på nytt.
    if (Object.prototype.hasOwnProperty.call(raw, input.id)) inp.value = String(raw[input.id] ?? '');
    inp.addEventListener('input', () => setRaw(input.id, inp.value));
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });
    // Tømt felt med standardverdi: gå tilbake til standardverdien når feltet forlates.
    inp.addEventListener('blur', () => {
      if (inp.value.trim() === '' && input.default != null) unsetRaw(input.id);
    });
    const parts = [inp];
    if (input.unit) parts.push(h('span', { class: 'unit' }, input.unit));
    if (input.allowNegative) {
      parts.push(h('button', {
        type: 'button', class: 'pm', 'aria-label': 'Bytt fortegn',
        onclick: () => {
          const x = parseNumber(inp.value);
          if (x == null || Number.isNaN(x)) return;
          inp.value = formatInput(-x);
          setRaw(input.id, inp.value);
        },
      }, '±'));
    }
    const control = h('div', { class: 'input-wrap' }, parts);
    return {
      control,
      update(res) {
        const touched = Object.prototype.hasOwnProperty.call(raw, input.id);
        if (!touched && document.activeElement !== inp) inp.value = formatInput(res.values[input.id]);
        inp.setAttribute('aria-invalid', String(!!res.errors[input.id]));
      },
    };
  }

  function selectField(input, id) {
    let opts = resolveOptions(input, getSettings(), lastRes ? lastRes.values : {});
    const useSegments = !input.dropdown && opts.length <= SEGMENT_MAX;
    if (useSegments) {
      const seg = segmented({ options: opts, value: undefined, onChange: (val) => setRaw(input.id, val) });
      return {
        control: seg.el,
        update(res) {
          const next = resolveOptions(input, getSettings(), res.values);
          if (JSON.stringify(next) !== JSON.stringify(opts)) { opts = next; seg.setOptions(opts); }
          seg.set(res.values[input.id]);
        },
      };
    }
    const sel = h('select', { id, class: 'select' });
    const fill = () => sel.replaceChildren(...opts.map((o) => h('option', { value: String(o.value) }, o.label)));
    fill();
    sel.addEventListener('change', () => {
      const o = opts.find((x) => String(x.value) === sel.value);
      setRaw(input.id, o ? o.value : sel.value);
    });
    return {
      control: h('div', { class: 'select-wrap' }, sel),
      update(res) {
        const next = resolveOptions(input, getSettings(), res.values);
        if (JSON.stringify(next) !== JSON.stringify(opts)) { opts = next; fill(); }
        sel.value = String(res.values[input.id]);
      },
    };
  }

  function toggleField(input, id) {
    const sw = toggleSwitch({ id, checked: false, onChange: (on) => setRaw(input.id, on) });
    return {
      control: sw.el,
      inline: true,
      update(res) { sw.input.checked = !!res.values[input.id]; },
    };
  }

  function makeField(input) {
    const id = nextId('f');
    const kind = input.type === 'number' ? numberField : input.type === 'select' ? selectField : toggleField;
    const f = kind(input, id);
    const label = h('label', { class: 'field-label', for: id }, input.label);
    const help = h('div', { class: 'field-help' });
    const err = h('div', { class: 'field-error' });
    const wrap = h('div', { class: `field${f.inline ? ' field-inline' : ''}`, dataset: { field: input.id } },
      f.inline ? h('div', { class: 'field-row' }, label, f.control) : [label, f.control], help, err);
    return {
      wrap,
      update(res) {
        const active = res.fields.includes(input);
        wrap.hidden = !active;
        if (!active) return;
        f.update(res);
        const helpText = typeof input.help === 'function' ? input.help(getSettings(), res.values) : input.help;
        help.textContent = helpText || '';
        help.hidden = !helpText;
        const e = res.errors[input.id];
        err.textContent = e || '';
        err.hidden = !e;
        wrap.classList.toggle('invalid', !!e);
      },
    };
  }

  // ---------- Oppsett ----------
  // To beholdere: felt og resultat. På PC står de ved siden av hverandre (css/app.css).
  const inputBox = h('div', { class: 'calc-input' });
  const outputBox = h('div', { class: 'calc-output' });
  // Bare ved utskrift: tittel og alle inndata, også de under «Flere valg» (som ikke skrives ut).
  const printBox = h('section', { class: 'card print-only print-summary' });
  const root = h('div', { class: 'calc' }, printBox, inputBox, outputBox);
  if (def.help) inputBox.append(h('p', { class: 'calc-help' }, def.help));

  let modeSeg = null;
  if (def.modes && def.modes.length) {
    modeSeg = segmented({
      options: def.modes.map((m) => ({ value: m.id, label: m.label })),
      value: def.modes[0].id,
      onChange: (val) => setRaw('mode', val),
      cls: 'modes',
    });
    inputBox.append(modeSeg.el);
  }

  const form = h('div', { class: 'form' });
  const advBody = h('div', { class: 'form' });
  for (const input of def.inputs) {
    const f = makeField(input);
    fields.set(input.id, f);
    (input.advanced ? advBody : form).append(f.wrap);
  }
  inputBox.append(form);
  let adv = null;
  if (def.inputs.some((i) => i.advanced)) {
    adv = h('details', { class: 'advanced' }, h('summary', null, 'Flere valg'), advBody);
    if (load('ui:advanced', false)) adv.open = true;
    adv.addEventListener('toggle', () => save('ui:advanced', adv.open));
    inputBox.append(adv);
  }
  inputBox.append(h('div', { class: 'form-actions' }, h('button', {
    type: 'button', class: 'btn ghost small',
    onclick: () => {
      raw = {};
      remove(key);
      for (const input of def.inputs) {
        const el = root.querySelector(`[data-field="${input.id}"] input[type="text"]`);
        if (el) el.value = '';
      }
      update();
      toast('Feltene er nullstilt');
    },
  }, icon('reset'), 'Nullstill')));

  const results = h('section', { class: 'results', 'aria-live': 'polite', 'aria-label': 'Resultat' });
  outputBox.append(results);

  const meta = h('div', { class: 'meta' });
  outputBox.append(meta);

  // ---------- Resultat ----------
  function outEl(o) {
    return h('div', { class: 'out' },
      h('div', { class: 'out-label' }, o.label, o.note ? h('span', { class: 'out-note' }, ` · ${o.note}`) : null),
      h('div', { class: 'out-value' },
        o.isText ? o.value : formatNumber(o.value, { sig: o.sig, dec: o.dec }),
        o.unit ? h('span', { class: 'out-unit' }, o.unit) : null));
  }

  function marginText(c) {
    if (!c.op || !Number.isFinite(c.rel)) return '';
    const pct = formatNumber(Math.abs(c.rel) * 100, { sig: 2 });
    if (c.status === 'fail') return c.op === '≤' ? ` · ${pct} % over grensen` : ` · ${pct} % under kravet`;
    return ` · ${pct} % margin`;
  }

  function checkEl(c) {
    const name = c.status === 'ok' ? 'check' : c.status === 'fail' ? 'x' : c.status === 'border' ? 'alert' : 'info';
    return h('div', { class: `check ${c.status}` },
      h('span', { class: 'check-icon' }, icon(name)),
      h('div', { class: 'check-body' },
        h('div', { class: 'check-title' }, c.label, ': ', h('strong', null, STATUS_TEXT[c.status] || c.status)),
        c.op ? h('div', { class: 'check-detail' },
          `${formatValue(c.value, c.unit, { sig: c.sig })} ${c.op} ${formatValue(c.limit, c.unit, { sig: c.sig })}${marginText(c)}`) : null,
        c.detail ? h('div', { class: 'check-detail' }, c.detail) : null));
  }

  function stepsEl(res) {
    return h('div', { class: 'card steps', id: 'utregning' },
      h('h3', null, 'Utregning'),
      res.steps.map((s) => h('div', { class: 'step' },
        s.text ? h('div', { class: 'step-text' }, s.text) : null,
        h('div', { class: 'step-line' }, `${s.label} = ${s.expr}`),
        variables(s.expr).length ? h('div', { class: 'step-line' }, `= ${substitute(s.expr, s.vars, fmtVar)}`) : null,
        h('div', { class: 'step-line step-result' }, `= ${fmtVar(s.value, s.unit)}`))));
  }

  function renderResults(res) {
    clear(results);
    if (res.status === 'incomplete') {
      const names = res.missing.map((id) => (def.inputs.find((i) => i.id === id) || {}).label).filter(Boolean)
        .map((s) => s.charAt(0).toLowerCase() + s.slice(1));
      const msg = res.message
        || (Object.keys(res.errors).length ? 'Rett opp feltet som er merket.' : names.length ? `Fyll inn ${listText(names)}.` : 'Fyll inn feltene.');
      results.append(h('div', { class: 'card hint' }, icon('info'), h('span', null, msg)));
      return;
    }
    if (res.status === 'error') {
      results.append(h('div', { class: 'card error' }, icon('alert'), h('span', null, res.error)));
      return;
    }
    const primary = res.outputs.filter((o) => o.primary);
    const rest = res.outputs.filter((o) => !o.primary);
    if (primary.length) results.append(h('div', { class: `card result-main n${Math.min(primary.length, 3)}` }, primary.map(outEl)));
    if (rest.length) results.append(h('div', { class: 'result-grid' }, rest.map((o) => h('div', { class: 'card result-small' }, outEl(o)))));
    if (res.checks.length) results.append(h('div', { class: 'card checks' }, res.checks.map(checkEl)));
    if (res.warnings.length) results.append(h('div', { class: 'card warn' }, res.warnings.map((t) => h('p', null, icon('alert'), h('span', null, t)))));
    if (res.notes.length) results.append(h('div', { class: 'card note' }, res.notes.map((t) => h('p', null, icon('info'), h('span', null, t)))));
    if (showSteps && res.steps.length) results.append(stepsEl(res));
  }

  function renderMeta(res) {
    clear(meta);
    if (res.status === 'ok' && res.assumptions.length) {
      meta.append(h('div', { class: 'meta-block' }, h('h3', null, 'Forutsetninger'), h('ul', null, res.assumptions.map((t) => h('li', null, t)))));
    }
    if (def.refs && def.refs.length) {
      meta.append(h('div', { class: 'meta-block' }, h('h3', null, 'Kilder'), h('ul', null, def.refs.map((t) => h('li', null, t)))));
    }
    meta.append(h('p', { class: 'footnote' }, 'Hjelpemiddel. Kontroller resultatet mot NEK 400:2026 og produsentens data.'));
  }

  // Første del av delingsteksten: tittel, modus og alle aktive felt.
  function renderPrintSummary(res) {
    const [title, ...lines] = summaryText(def, res, getSettings(), brand.shortName).split('\n\n')[0].split('\n');
    const mode = def.modes && def.modes.find((m) => m.id === res.mode);
    const modeLine = mode && lines[0] === mode.label ? lines.shift() : null;
    printBox.replaceChildren(...[
      h('h2', null, title),
      modeLine ? h('p', null, modeLine) : null,
      h('h3', null, 'Inndata'),
      h('ul', null, lines.map((t) => h('li', null, t))),
    ].filter(Boolean));
  }

  function update() {
    const res = run(def, raw, getSettings());
    lastRes = res;
    if (modeSeg) modeSeg.set(res.mode);
    for (const f of fields.values()) f.update(res);
    if (adv) adv.hidden = !def.inputs.some((i) => i.advanced && res.fields.includes(i));
    renderResults(res);
    renderMeta(res);
    renderPrintSummary(res);
  }

  // ---------- Verktøylinje ----------
  const toolBtn = (name, label, onClick, extra = {}) => h('button', { type: 'button', class: 'tool', onclick: onClick, ...extra },
    icon(name), h('span', null, label));

  const stepsBtn = toolBtn('steps', 'Utregning', () => {
    showSteps = !showSteps;
    save('ui:steps', showSteps);
    stepsBtn.setAttribute('aria-pressed', String(showSteps));
    update();
    if (showSteps) revealSteps();
  }, { 'aria-pressed': String(showSteps) });

  // På PC står resultatet i en egen kolonne som ruller for seg selv. Da rulles bare den,
  // så siden ikke flytter seg og utregningen ikke havner under toppfeltet.
  function revealSteps() {
    const el = document.getElementById('utregning');
    if (!el) return;
    if (getComputedStyle(outputBox).position === 'sticky') {
      const top = outputBox.scrollTop + el.getBoundingClientRect().top - outputBox.getBoundingClientRect().top;
      outputBox.scrollTo({ top, behavior: 'smooth' });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const favBtn = toolBtn(isFavorite(def.id) ? 'starFilled' : 'star', 'Favoritt', () => {
    const on = toggleFavorite(def.id);
    favBtn.replaceChildren(icon(on ? 'starFilled' : 'star'), h('span', null, 'Favoritt'));
    favBtn.setAttribute('aria-pressed', String(on));
    toast(on ? 'Lagt til i favoritter' : 'Fjernet fra favoritter');
  }, { 'aria-pressed': String(isFavorite(def.id)) });

  const shareBtn = toolBtn('share', 'Del', async () => {
    if (!lastRes || lastRes.status !== 'ok') {
      toast('Fyll inn feltene først');
      return;
    }
    const result = await shareText({ title: def.title, text: summaryText(def, lastRes, getSettings(), brand.shortName) });
    if (result === 'copied') toast('Kopiert – lim inn i Teams, SMS eller e-post');
    else if (result === 'failed') toast('Kunne ikke dele resultatet');
  });

  const saveBtn = toolBtn('jobs', 'Lagre', () => {
    if (!lastRes || lastRes.status !== 'ok') {
      toast('Fyll inn feltene først');
      return;
    }
    const worst = lastRes.checks.some((c) => c.status === 'fail') ? 'fail' : lastRes.checks.some((c) => c.status === 'border') ? 'border' : 'ok';
    saveCalculationToJob({
      calcId: def.id, calcV: def.v, appV: buildInfo().version, title: def.title,
      mode: lastRes.mode, raw: { ...raw }, text: summaryText(def, lastRes, getSettings(), brand.shortName),
      status: worst, savedAt: new Date().toISOString(),
    });
  });

  const toolbar = h('div', { class: 'toolbar' },
    toolBtn('back', 'Tilbake', () => back(`/kategori/${def.category}`)),
    stepsBtn, shareBtn, saveBtn, favBtn);

  update();
  const cat = getCategory(def.category);
  return { title: def.title, subtitle: cat ? cat.title : '', content: root, toolbar, wide: true };
}
