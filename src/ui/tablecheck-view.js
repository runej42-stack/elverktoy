// Tabellkontroll: viser de avskrevne tabellene med tabellnummer, så de kan sammenlignes med
// NEK 400:2026. Resultatet lagres på enheten og kan deles, og registreres så i iz-verified.js.

import { h } from './dom.js';
import { icon } from './icons.js';
import { section, linkList, segmented } from './components.js';
import { toast } from './toast.js';
import { formatNumber } from '../core/number.js';
import { load, save } from '../core/store.js';
import { shareText } from '../core/share.js';
import { IZ_TABLES } from '../data/iz.js';
import { IZ_VERIFIED } from '../data/iz-verified.js';
import { notFound } from './views.js';

// Norske navn på tabellene (nummereringen er den samme i NEK 400-5-52).
export const TABLE_NAMES = {
  'B.52.2': 'Strømføringsevne, termoplast/PVC 70 °C, 2 belastede ledere',
  'B.52.3': 'Strømføringsevne, termoherd/PEX 90 °C, 2 belastede ledere',
  'B.52.4': 'Strømføringsevne, termoplast/PVC 70 °C, 3 belastede ledere',
  'B.52.5': 'Strømføringsevne, termoherd/PEX 90 °C, 3 belastede ledere',
  'B.52.10': 'Metode E, F og G (fri luft), PVC, kobber',
  'B.52.11': 'Metode E, F og G (fri luft), PVC, aluminium',
  'B.52.12': 'Metode E, F og G (fri luft), PEX, kobber',
  'B.52.13': 'Metode E, F og G (fri luft), PEX, aluminium',
  'B.52.14': 'Korreksjon for lufttemperatur (30 °C)',
  'B.52.15': 'Korreksjon for jordtemperatur (20 °C)',
  'B.52.16': 'Korreksjon for jordens termiske resistivitet (2,5 K·m/W)',
  'B.52.17': 'Reduksjon for samlet forlegning i luft',
  'B.52.18': 'Reduksjon for flere kurser direkte i jord',
  'B.52.19': 'Reduksjon for flere kurser i rør i jord',
  'B.52.20': 'Reduksjon for flerlederkabler på bro og stige',
  'B.52.21': 'Reduksjon for enlederkabler på bro og stige',
};

const n = (x) => (x == null ? '–' : formatNumber(x, { sig: 6 }));
const state = () => load('tablecheck', {});

export function tableStatus(key) {
  if (IZ_VERIFIED[key]) return 'verified';
  return state()[key] ? state()[key].status : null;
}

function grid(columns, rows) {
  return h('div', { class: 'table-wrap' }, h('table', { class: 'ref-table num' },
    h('thead', null, h('tr', null, columns.map((c) => h('th', null, c)))),
    h('tbody', null, rows.map((r) => h('tr', null, r.map((cell) => h('td', null, cell)))))));
}

function renderTable(t) {
  const out = [];
  if (t.sizes && (t.Cu || t.Al) && !t.columns) {
    for (const mat of ['Cu', 'Al']) {
      if (!t[mat]) continue;
      const methods = Object.keys(t[mat]);
      out.push(h('h3', null, mat === 'Cu' ? 'Kobber' : 'Aluminium'));
      out.push(grid(['mm²', ...methods], t.sizes.map((S, i) => [n(S), ...methods.map((m) => n(t[mat][m][i]))])));
    }
  } else if (t.sizes && t.columns) {
    for (const mat of ['Cu', 'Al']) {
      if (!t[mat]) continue;
      const keys = Object.keys(t[mat]);
      out.push(h('h3', null, mat === 'Cu' ? 'Kobber' : 'Aluminium'));
      out.push(grid(['mm²', ...keys], t.sizes.map((S, i) => [n(S), ...keys.map((k) => n(t[mat][k][i]))])));
      const cols = Array.isArray(t.columns) ? t.columns : Object.entries(t.columns).map(([k, val]) => `${k}: ${val}`);
      out.push(h('ul', { class: 'small muted' }, cols.map((c) => h('li', null, typeof c === 'string' ? c : JSON.stringify(c)))));
    }
  } else if (t.temps) {
    const ins = Object.keys(t).filter((k) => Array.isArray(t[k]) && k !== 'temps' && k !== 'sources' && k !== 'discrepancies' && k !== 'notes');
    out.push(grid(['°C', ...ins], t.temps.map((T, i) => [n(T), ...ins.map((k) => n(t[k][i]))])));
  } else if (t.arrangements) {
    out.push(grid(['Forlegning', ...t.circuits.map(String)], t.arrangements.map((a) => [`${a.item}. ${a.text}`, ...a.factors.map(n)])));
  } else {
    out.push(h('pre', { class: 'snap-text' }, JSON.stringify(Object.fromEntries(Object.entries(t).filter(([k]) => !['sources', 'discrepancies', 'notes', 'title'].includes(k))), null, 1)));
  }
  return out;
}

export function tablecheckView() {
  const keys = Object.keys(IZ_TABLES);
  const st = state();
  const done = keys.filter((k) => IZ_VERIFIED[k] || (st[k] && st[k].status)).length;
  const label = (k) => (IZ_VERIFIED[k] ? 'Kontrollert' : st[k] && st[k].status === 'ok' ? 'Stemmer (ikke sendt inn)' : st[k] && st[k].status === 'fail' ? 'Avvik meldt' : 'Ikke kontrollert');
  const content = h('div', null,
    h('div', { class: 'card note' }, h('p', null, icon('info'), h('span', null,
      'Tabellene er skrevet av fra offentlig tilgjengelige gjengivelser av IEC 60364-5-52. Sammenlign hver tabell med NEK 400:2026, marker «Stemmer» eller «Avvik», og del resultatet med utvikleren.'))),
    h('p', { class: 'muted' }, `${done} av ${keys.length} tabeller vurdert.`),
    linkList(keys.map((k) => ({ title: `Tabell ${k}`, sub: `${TABLE_NAMES[k] || ''} · ${label(k)}`, href: `/tabellkontroll/${k}` }))),
    h('button', {
      type: 'button', class: 'btn primary wide',
      onclick: async () => {
        const s = state();
        const lines = ['Tabellkontroll mot NEK 400:2026', ''];
        for (const k of keys) {
          const e = s[k];
          lines.push(`${k}: ${e ? (e.status === 'ok' ? 'stemmer' : 'AVVIK') : 'ikke kontrollert'}${e && e.note ? ` – ${e.note}` : ''}${e && e.by ? ` (${e.by}, ${e.date})` : ''}`);
        }
        const r = await shareText({ title: 'Tabellkontroll', text: lines.join('\n') });
        if (r === 'copied') toast('Kopiert – send det til utvikleren');
      },
    }, icon('share'), 'Del kontrollresultat'));
  return { title: 'Tabellkontroll', back: '/mer', content };
}

export function tableDetailView(key) {
  const t = IZ_TABLES[key];
  if (!t) return notFound();
  const st = state();
  const entry = st[key] || {};
  const by = h('input', { type: 'text', class: 'text-input', placeholder: 'Ditt navn', value: entry.by || load('tablecheck:by', '') });
  const note = h('input', { type: 'text', class: 'text-input', placeholder: 'Merknad / hvilke tall som avviker', value: entry.note || '' });
  const persist = (patch) => {
    const all = state();
    all[key] = { ...(all[key] || {}), ...patch, by: by.value, date: new Date().toISOString().slice(0, 10) };
    save('tablecheck', all);
    save('tablecheck:by', by.value);
  };
  note.addEventListener('input', () => persist({ note: note.value }));
  by.addEventListener('input', () => persist({}));
  const content = h('div', null,
    h('p', { class: 'lead' }, TABLE_NAMES[key] || ''),
    h('p', { class: 'muted small' }, t.title || ''),
    IZ_VERIFIED[key] ? h('div', { class: 'card ok-card' }, icon('check'), h('span', null, `Kontrollert av ${IZ_VERIFIED[key].by}, ${IZ_VERIFIED[key].date}.`)) : null,
    renderTable(t),
    t.notes && t.notes.length ? section('Merknader', h('ul', { class: 'small' }, t.notes.map((x) => h('li', null, x)))) : null,
    t.discrepancies && t.discrepancies.length ? section('Avvik mellom kildene ved avskrift', h('ul', { class: 'small' }, t.discrepancies.map((x) => h('li', null, x)))) : null,
    section('Kilder', h('ul', { class: 'small' }, (t.sources || []).map((s) => h('li', null, [s.name, s.tableName].filter(Boolean).join(', '), s.url ? h('div', { class: 'muted' }, s.url) : null)))),
    section('Kontroll mot NEK 400:2026',
      h('div', { class: 'field' }, h('div', { class: 'field-label' }, 'Resultat'),
        segmented({ options: [{ value: 'ok', label: 'Stemmer' }, { value: 'fail', label: 'Avvik' }], value: entry.status, onChange: (val) => { persist({ status: val }); toast('Lagret'); } }).el),
      h('div', { class: 'field' }, h('div', { class: 'field-label' }, 'Kontrollert av'), by),
      h('div', { class: 'field' }, h('div', { class: 'field-label' }, 'Merknad'), note)));
  return { title: `Tabell ${key}`, back: '/tabellkontroll', content };
}

