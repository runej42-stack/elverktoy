// Måling og kontroll: isolasjonsmåling, jordfeilbryter og sløyfeimpedans/Ik.

import { v } from '../core/engine.js';
import { formatValue } from '../core/number.js';
import { NETWORKS } from '../core/settings.js';
import { DEVICE_TYPES, MCB_SIZES, GG_SIZES, tripCurrent } from '../data/vern.js';

const isolasjon = {
  id: 'isolasjon',
  v: 1,
  title: 'Isolasjonsmåling',
  category: 'maling',
  summary: 'Prøvespenning og minste isolasjonsresistans, med vurdering av målt verdi.',
  keywords: ['isolasjon', 'isolasjonsmåling', 'isolasjonsresistans', 'megger', 'mω', '500 v', 'selv', 'pelv'],
  refs: ['NEK 400:2026, del 6 (prøving), tabell 6.1'],
  inputs: [
    {
      id: 'kind', label: 'Kursens spenning', type: 'select', default: 'lv',
      options: [
        { value: 'selv', label: 'SELV/PELV' },
        { value: 'lv', label: 'Til og med 500 V' },
        { value: 'hv', label: 'Over 500 V' },
      ],
    },
    { id: 'R', label: 'Målt isolasjonsresistans', type: 'number', unit: 'MΩ', min: 0, optional: true, placeholder: 'f.eks. 299', help: 'Viser instrumentet «> 299 MΩ», skriv 299.' },
  ],
  compute(x, ctx) {
    const table = { selv: [250, 0.5], lv: [500, 1], hv: [1000, 1] };
    const [Ut, Rmin] = table[x.kind];
    ctx.out('Ut', 'Prøvespenning', Ut, 'V DC', { primary: true });
    ctx.out('Rmin', 'Minste isolasjonsresistans', Rmin, 'MΩ', { primary: true });
    if (x.R != null) ctx.ge('Målt isolasjonsresistans', x.R, Rmin, 'MΩ', { border: 0.0001 });
    ctx.note('Koble fra utstyr som kan ta skade eller påvirke målingen (overspenningsvern, elektronikk, dimmere). Mål mellom aktive ledere og PE, og mellom de aktive lederne.');
    ctx.assume('Verdiene gjelder hele kurser. Store anlegg kan måles i deler.');
  },
  cases: [
    { name: '230 V-kurs, 0,8 MΩ', inputs: { kind: 'lv', R: '0,8' }, expect: { Ut: 500, Rmin: 1 }, checks: { 'Målt isolasjonsresistans': 'fail' }, source: 'NEK 400-6 tabell 6.1' },
    { name: 'SELV', inputs: { kind: 'selv' }, expect: { Ut: 250, Rmin: 0.5 }, source: 'NEK 400-6 tabell 6.1' },
  ],
};

const jfb = {
  id: 'jordfeilbryter',
  v: 1,
  title: 'Test av jordfeilbryter',
  category: 'maling',
  summary: 'Krav til utløsetid og utløsestrøm, og vurdering av målte verdier.',
  keywords: ['jordfeilbryter', 'jfb', 'rcd', 'utløsetid', 'utløsestrøm', 'test', 'iδn', '30 ma', 'type s'],
  refs: ['NEK EN 61008 / NEK EN 61009 (utløsetider)', 'NEK 400:2026, del 6'],
  inputs: [
    { id: 'type', label: 'Type', type: 'select', default: 'gen', options: [{ value: 'gen', label: 'Vanlig (A, F, B)' }, { value: 'S', label: 'Forsinket (S)' }] },
    { id: 'idn', label: 'Merkeutløsestrøm IΔn', type: 'select', default: 30, options: [10, 30, 100, 300, 500].map((a) => ({ value: a, label: `${a} mA` })) },
    { id: 't1', label: 'Utløsetid ved IΔn', type: 'number', unit: 'ms', min: 0, optional: true },
    { id: 't5', label: 'Utløsetid ved 5 · IΔn', type: 'number', unit: 'ms', min: 0, optional: true },
    { id: 'ia', label: 'Utløsestrøm (rampetest)', type: 'number', unit: 'mA', min: 0, optional: true },
    { id: 'ub', label: 'Berøringsspenning', type: 'number', unit: 'V', min: 0, optional: true, advanced: true },
  ],
  compute(x, ctx) {
    const sel = x.type === 'S';
    ctx.text('k1', 'Krav ved IΔn', sel ? '130–500 ms' : 'maks 300 ms', { primary: true });
    ctx.text('k5', 'Krav ved 5 · IΔn', sel ? '50–150 ms' : 'maks 40 ms', { primary: true });
    ctx.text('ka', 'Utløsestrøm', `${formatValue(0.5 * x.idn, 'mA')} – ${formatValue(x.idn, 'mA')}`);
    if (x.t1 != null) {
      ctx.le('Utløsetid ved IΔn', x.t1, sel ? 500 : 300, 'ms', { border: 0.0001 });
      if (sel) ctx.ge('Forsinkelse ved IΔn', x.t1, 130, 'ms', { border: 0.0001 });
    }
    if (x.t5 != null) {
      ctx.le('Utløsetid ved 5 · IΔn', x.t5, sel ? 150 : 40, 'ms', { border: 0.0001 });
      if (sel) ctx.ge('Forsinkelse ved 5 · IΔn', x.t5, 50, 'ms', { border: 0.0001 });
    }
    if (x.ia != null) {
      ctx.ge('Utløsestrøm over 0,5 · IΔn', x.ia, 0.5 * x.idn, 'mA', { border: 0.0001 });
      ctx.le('Utløsestrøm under IΔn', x.ia, x.idn, 'mA', { border: 0.0001 });
    }
    if (x.ub != null) ctx.le('Berøringsspenning', x.ub, 50, 'V', { border: 0.0001 });
    ctx.note('Trykk også på testknappen. Den prøver mekanikken, men ikke utløsetiden.');
  },
  cases: [
    { name: '30 mA, 24 ms og 21 mA', inputs: { type: 'gen', idn: 30, t1: '24', t5: '12', ia: '21' }, expect: { k1: 'maks 300 ms' }, checks: { 'Utløsetid ved IΔn': 'ok', 'Utløsetid ved 5 · IΔn': 'ok', 'Utløsestrøm over 0,5 · IΔn': 'ok', 'Utløsestrøm under IΔn': 'ok' }, source: 'NEK EN 61008' },
    { name: 'S 300 mA for rask', inputs: { type: 'S', idn: 300, t1: '90' }, checks: { 'Forsinkelse ved IΔn': 'fail' }, source: 'NEK EN 61008 type S: 130–500 ms' },
  ],
};

const netOf = (id) => NETWORKS.find((n) => n.id === id) || NETWORKS[0];

const sloyfe = {
  id: 'sloyfe',
  v: 1,
  title: 'Sløyfeimpedans og Ik mot vern',
  category: 'maling',
  summary: 'Målt Zs eller Ik vurdert mot strømmen vernet trenger for å koble ut.',
  keywords: ['sløyfeimpedans', 'zs', 'ik', 'måling', 'utkobling', 'kortslutningsstrøm', 'målt'],
  refs: ['NEK 400:2026, 4-41 og del 6'],
  modes: [
    { id: 'zs', label: 'Målt Zs' },
    { id: 'ik', label: 'Målt Ik' },
  ],
  inputs: [
    { id: 'net', label: 'Nett', type: 'select', default: (s) => s.network, options: NETWORKS.map((n) => ({ value: n.id, label: n.short })) },
    { id: 'Zs', label: 'Målt sløyfeimpedans Zs', type: 'number', unit: 'Ω', min: 0, minExclusive: true, when: (x) => x.mode === 'zs', help: 'TN: fase–PE. IT: fase–fase-sløyfen.' },
    { id: 'Ik', label: 'Målt kortslutningsstrøm', type: 'number', unit: 'A', min: 0, minExclusive: true, when: (x) => x.mode === 'ik' },
    { id: 'dev', label: 'Vern', type: 'select', options: DEVICE_TYPES, default: 'C' },
    { id: 'In', label: 'Merkestrøm', type: 'select', dropdown: true, default: 16, options: (s, x) => (x.dev === 'gG' ? GG_SIZES : MCB_SIZES).map((a) => ({ value: a, label: `${a} A` })) },
    { id: 't', label: 'Krav til utkoblingstid', type: 'select', default: 0.4, options: [{ value: 0.4, label: '0,4 s' }, { value: 5, label: '5 s' }], when: (x) => x.dev === 'gG' },
    { id: 'warm', label: 'Korriger for varm leder (÷ 1,2)', type: 'toggle', default: true, help: 'Målingen gjøres på kald kabel. I drift er motstanden ca. 20 % høyere.' },
  ],
  compute(x, ctx) {
    const net = netOf(x.net);
    let Ik;
    if (x.mode === 'zs') {
      Ik = net.neutral
        ? ctx.step('Ik', 'U₀/Zs', { 'U₀': v(net.U1f, 'V'), Zs: v(x.Zs, 'Ω') }, 'A', { text: 'Enpolet feilstrøm fase–PE' })
        : ctx.step('Ik', 'U/Zs', { U: v(net.U, 'V'), Zs: v(x.Zs, 'Ω') }, 'A', { text: 'Fase–fase (sløyfen gjennom to faser)' });
    } else Ik = x.Ik;
    const IkUse = x.warm ? ctx.step('Ik varm', 'Ik/1,2', { Ik: v(Ik, 'A') }, 'A', { text: 'Ved driftstemperatur' }) : Ik;
    const trip = tripCurrent(x.dev, x.In, x.dev === 'gG' ? x.t : 0.4);
    ctx.out('Ik', 'Kortslutningsstrøm', Ik, 'A', { primary: true });
    if (x.warm) ctx.out('IkWarm', 'Ved driftstemperatur', IkUse, 'A');
    if (!trip) {
      ctx.warn('Fant ikke utløsestrøm for vernet. Bruk produsentens kurve.');
      return;
    }
    ctx.out('Ia', 'Vernet trenger', trip.Ia, 'A', { note: trip.basis });
    ctx.ge('Utkobling', IkUse, trip.Ia, 'A');
    if (x.mode === 'zs') {
      const zmax = net.neutral ? net.U1f / trip.Ia : net.U / trip.Ia;
      ctx.out('Zmax', 'Største tillatte Zs (målt, kald)', x.warm ? zmax / 1.2 : zmax, 'Ω');
    }
  },
  cases: [
    { name: 'TN, Zs 0,8 Ω, B16', inputs: { mode: 'zs', net: 'TN400', Zs: '0,8', dev: 'B', In: 16, warm: true }, expect: { Ik: 287.5, IkWarm: 239.5833, Zmax: 2.395833 }, checks: { Utkobling: 'ok' }, source: 'Håndregning: 230/0,8; /1,2; 230/80/1,2' },
    { name: 'IT, målt Ik 140 A, C16', inputs: { mode: 'ik', net: 'IT230', Ik: '140', dev: 'C', In: 16, warm: true }, expect: { IkWarm: 116.6667 }, checks: { Utkobling: 'fail' }, source: 'Håndregning: 140/1,2 < 160 A' },
  ],
};

export const MALING = [isolasjon, jfb, sloyfe];
