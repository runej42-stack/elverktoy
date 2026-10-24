// Selvtest: kjører alle regneeksemplene på denne enheten og viser miljøet appen kjører i.

import { h } from './dom.js';
import { icon } from './icons.js';
import { section } from './components.js';
import { runAllCases } from '../core/cases.js';
import { allCalcs } from '../core/registry.js';
import { buildInfo, isFileMode, isStandalone } from '../core/env.js';
import { storageWorks } from '../core/store.js';

export function selftestView() {
  const t0 = performance.now();
  const results = runAllCases(allCalcs());
  const ms = performance.now() - t0;
  const failed = results.filter((r) => !r.pass);
  const b = buildInfo();
  const sw = 'serviceWorker' in navigator ? (navigator.serviceWorker.controller ? 'aktiv' : 'ikke aktiv') : 'ikke støttet';

  const summary = h('div', { class: `card ${failed.length ? 'error' : 'ok-card'}` },
    icon(failed.length ? 'x' : 'check'),
    h('span', null, failed.length
      ? `${failed.length} av ${results.length} regneeksempler feilet.`
      : `Alle ${results.length} regneeksempler stemmer (${Math.round(ms)} ms).`));

  const content = h('div', null,
    summary,
    failed.length ? section('Feil', h('ul', null, failed.map((r) => h('li', null,
      h('strong', null, `${r.calc.title} – ${r.case.name}: `), r.failures.join('; '))))) : null,
    section('Miljø', factsList([
      ['Versjon', b.version], ['Bygg', b.target], ['Én-fil-modus', isFileMode() ? 'ja' : 'nei'],
      ['Installert', isStandalone() ? 'ja' : 'nei'], ['Service worker', sw],
      ['Lagring', storageWorks() ? 'virker' : 'virker ikke'],
    ])),
    section('Regneeksempler', h('ul', { class: 'case-list' }, results.map((r) => h('li', { class: r.pass ? 'pass' : 'fail' },
      icon(r.pass ? 'check' : 'x'), h('span', null, `${r.calc.title}: ${r.case.name}`), h('span', { class: 'muted' }, ` (${r.case.source || 'uten kilde'})`))))));
  return { title: 'Selvtest', back: '/mer', content };
}

function factsList(pairs) {
  return h('dl', { class: 'facts' }, pairs.flatMap(([k, val]) => [h('dt', null, k), h('dd', null, val)]));
}
