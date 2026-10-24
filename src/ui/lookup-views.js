// Oppslag: formelsamling og fagtips.

import { h, clear } from './dom.js';
import { icon } from './icons.js';
import { section, linkList, emptyNote } from './components.js';
import { FORMULAS, FORMULA_GROUPS, TIPS, REFERENCE, REFERENCE_GROUPS, getTip, getReference } from '../content/index.js';
import { FIGURES } from '../content/figures.js';
import { getCalc } from '../core/registry.js';
import { norm } from '../core/search.js';
import { notFound } from './views.js';

const escapeHTML = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** «I_{k3} = c·U^2» → I<sub>k3</sub> = c·U<sup>2</sup>. Brukes bare på appens egne formeltekster. */
export function formulaHTML(text) {
  return escapeHTML(text)
    .replace(/_\{([^}]+)\}/g, '<sub>$1</sub>')
    .replace(/_([A-Za-z0-9ΔφθαΦ]+)/g, '<sub>$1</sub>')
    .replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
    .replace(/\^([0-9]+)/g, '<sup>$1</sup>');
}

export function lookupView() {
  const content = h('div', null,
    linkList([
      { title: 'Formelsamling', sub: `${FORMULAS.length} formler med forklaring`, href: '/oppslag/formler', icon: 'steps' },
      { title: 'Fagtips', sub: `${TIPS.length} korte forklaringer på det som ofte går galt`, href: '/oppslag/fagtips', icon: 'info' },
    ]),
    REFERENCE_GROUPS.map((g) => section(g, linkList(REFERENCE.filter((r) => r.group === g)
      .map((r) => ({ title: r.title, sub: r.summary, href: `/oppslag/side/${r.id}` }))))));
  return { title: 'Oppslag', content };
}

export function referenceView(id) {
  const page = getReference(id);
  if (!page) return notFound();
  const content = h('article', { class: 'article' },
    h('h2', null, page.title),
    h('p', { class: 'lead' }, page.summary),
    page.blocks.map(block));
  return { title: page.group, back: '/oppslag', content };
}

function formulaCard(f, highlight) {
  const calc = f.calc ? getCalc(f.calc) : null;
  return h('article', { class: `card formula${highlight ? ' highlight' : ''}`, id: `formel-${f.id}` },
    h('h3', null, f.title),
    h('div', { class: 'formula-expr', html: formulaHTML(f.expr) }),
    h('dl', { class: 'formula-vars' }, f.vars.flatMap(([sym, desc, unit]) => [
      h('dt', { html: formulaHTML(sym) }),
      h('dd', null, desc, unit && unit !== '–' ? h('span', { class: 'muted' }, ` [${unit}]`) : null),
    ])),
    f.note ? h('p', { class: 'formula-note' }, f.note) : null,
    calc ? h('a', { class: 'btn small', href: `#/k/${calc.id}` }, icon('calc'), `Regn ut: ${calc.title}`) : null);
}

export function formulasView(focusId) {
  const filter = h('input', {
    type: 'search', class: 'search-input', placeholder: 'Filtrer formlene', autocomplete: 'off', 'aria-label': 'Filtrer formlene',
  });
  const list = h('div');
  const draw = () => {
    const q = norm(filter.value);
    clear(list);
    let shown = 0;
    for (const group of FORMULA_GROUPS) {
      const items = FORMULAS.filter((f) => f.group === group).filter((f) => !q
        || norm([f.title, f.expr, f.group, ...(f.keywords || []), ...f.vars.map((x) => x.join(' '))].join(' ')).includes(q));
      if (!items.length) continue;
      shown += items.length;
      list.append(section(group, ...items.map((f) => formulaCard(f, f.id === focusId))));
    }
    if (!shown) list.append(emptyNote('Ingen formler passer.'));
  };
  filter.addEventListener('input', draw);
  draw();
  return { title: 'Formelsamling', back: '/oppslag', content: h('div', null, filter, list), focusId: focusId ? `formel-${focusId}` : null };
}

export function tipsView() {
  return {
    title: 'Fagtips',
    back: '/oppslag',
    content: linkList(TIPS.map((t) => ({ title: t.title, sub: t.summary, href: `/oppslag/fagtips/${t.id}` }))),
  };
}

function block(b) {
  if (b.figure) return h('figure', { class: 'figure', html: FIGURES[b.figure] || '' });
  if (b.table) {
    return h('div', { class: 'table-wrap' }, h('table', { class: 'ref-table' },
      h('thead', null, h('tr', null, b.table.columns.map((c) => h('th', null, c)))),
      h('tbody', null, b.table.rows.map((r) => h('tr', null, r.map((cell) => h('td', null, cell)))))));
  }
  if (b.h) return h('h3', null, b.h);
  if (b.list) return h('ul', null, b.list.map((t) => h('li', null, t)));
  if (b.note) return h('div', { class: 'card note' }, h('p', null, icon('info'), h('span', null, b.note)));
  return h('p', null, b.p);
}

export function tipView(id) {
  const tip = getTip(id);
  if (!tip) return notFound();
  const related = (tip.related || []).map(getCalc).filter(Boolean);
  const content = h('article', { class: 'article' },
    h('h2', null, tip.title),
    h('p', { class: 'lead' }, tip.summary),
    tip.body.map(block),
    related.length ? section('Kalkulatorer', linkList(related.map((c) => ({ title: c.title, sub: c.summary, href: `/k/${c.id}` })))) : null,
    h('p', { class: 'footnote' }, 'Fagtipsene er forklaringer med egne ord. Kravene står i NEK 400:2026 og forskriftene.'));
  return { title: 'Fagtips', back: '/oppslag/fagtips', content };
}
