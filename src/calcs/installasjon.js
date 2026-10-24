// Installasjon: rørfylling og kabeltrommel.

import { v } from '../core/engine.js';
import { formatValue } from '../core/number.js';

const groupFields = (n) => [
  { id: `n${n}`, label: `Antall kabler, gruppe ${n}`, type: 'number', min: 0, max: 100, optional: n > 1, default: n === 1 ? 3 : null, placeholder: n > 1 ? 'valgfritt' : '' },
  { id: `d${n}`, label: `Ytre diameter, gruppe ${n}`, type: 'number', unit: 'mm', min: 0, minExclusive: true, max: 200, optional: n > 1, placeholder: n === 1 ? 'f.eks. 9,5' : 'valgfritt', help: n === 1 ? 'Fra kabelens datablad.' : undefined },
];

const rorfylling = {
  id: 'rorfylling',
  v: 1,
  title: 'Rørfylling',
  category: 'installasjon',
  summary: 'Hvor fullt et installasjonsrør blir, og hvilken rørdimensjon kablene trenger.',
  keywords: ['rør', 'rørfylling', 'fyllingsgrad', 'trekkerør', 'flexrør', 'kabelrør', 'installasjonsrør'],
  refs: ['Rørets innvendige diameter fra produsentens datablad'],
  inputs: [
    { id: 'D', label: 'Rørets innvendige diameter', type: 'number', unit: 'mm', min: 1, max: 300, placeholder: 'f.eks. 16,9', help: 'Merk: 20 mm rør har ofte 15–17 mm innvendig diameter.' },
    ...groupFields(1), ...groupFields(2), ...groupFields(3),
    { id: 'limit', label: 'Største fyllingsgrad', type: 'number', unit: '%', min: 5, max: 80, default: 40, advanced: true, help: 'Tommelfingerregel: ca. 40 %. Lavere ved lange trekk med mange bend.' },
  ],
  compute(x, ctx) {
    const groups = [1, 2, 3].map((g) => ({ n: x[`n${g}`], d: x[`d${g}`] })).filter((g) => g.n != null && g.d != null && g.n > 0);
    if (!groups.length) ctx.need('Fyll inn antall kabler og diameter.');
    const terms = groups.map((g, i) => `n${i + 1}·d${i + 1}²`).join(' + ');
    const vars = {};
    groups.forEach((g, i) => { vars[`n${i + 1}`] = g.n; vars[`d${i + 1}`] = v(g.d, 'mm'); });
    const sum = ctx.step('Σ', terms, vars, 'mm²', { text: 'Sum av diameter i andre for alle kablene' });
    const fill = ctx.step('Fylling', 'Σ/D²·100', { Σ: v(sum, 'mm²'), D: v(x.D, 'mm') }, '%', { text: 'Kabelareal delt på rørets innvendige areal' });
    const Dmin = ctx.step('Dmin', '√(Σ/(grense/100))', { Σ: v(sum, 'mm²'), grense: v(x.limit, '%') }, 'mm', { text: 'Minste innvendige diameter for grensen' });
    ctx.out('fill', 'Fyllingsgrad', fill, '%', { primary: true, sig: 2 });
    ctx.out('Dmin', 'Minste innvendige diameter', Dmin, 'mm');
    ctx.le('Fyllingsgrad', fill, x.limit, '%');
    const count = groups.reduce((a, g) => a + g.n, 0);
    if (count === 1 && groups[0].d > 0.9 * x.D) ctx.warn('Kabelen er nesten like tykk som røret. Trekk blir vanskelig.');
    if (count >= 3) {
      const maxd = Math.max(...groups.map((g) => g.d));
      const ratio = x.D / maxd;
      if (ratio > 2.8 && ratio < 3.2) ctx.warn(`Rør/kabel-forholdet er ${formatValue(ratio, '', { sig: 2 })}. Tre like kabler kan kile seg ved forhold rundt 3.`);
    }
    ctx.assume('Tommelfingerregel for trekk. Følg rørprodusentens og kabelprodusentens anvisninger.');
  },
  cases: [
    { name: '3 × 9,5 mm i 20 mm rør (Ø 16,9)', inputs: { D: '16,9', n1: '3', d1: '9,5', limit: '40' }, expect: { fill: 94.79710, Dmin: 26.01682 }, checks: { Fyllingsgrad: 'fail' }, source: 'Håndregning: 3·9,5²/16,9²' },
    { name: '2 × 9,5 + 1 × 7 mm i Ø 32,4', inputs: { D: '32,4', n1: '2', d1: '9,5', n2: '1', d2: '7', limit: '40' }, expect: { fill: 21.86214 }, checks: { Fyllingsgrad: 'ok' }, source: 'Håndregning: (180,5 + 49)/1049,76' },
  ],
};

const trommel = {
  id: 'kabeltrommel',
  v: 1,
  title: 'Kabeltrommel',
  category: 'installasjon',
  summary: 'Hvor mye kabel som får plass på en trommel, og omtrentlig vekt.',
  keywords: ['trommel', 'kabeltrommel', 'kabellengde', 'spole', 'kapasitet', 'kabelvekt'],
  refs: [],
  inputs: [
    { id: 'F', label: 'Flensdiameter', type: 'number', unit: 'mm', min: 1, placeholder: 'f.eks. 1000' },
    { id: 'B', label: 'Kjernediameter', type: 'number', unit: 'mm', min: 1, placeholder: 'f.eks. 500' },
    { id: 'W', label: 'Innvendig bredde', type: 'number', unit: 'mm', min: 1, placeholder: 'f.eks. 600' },
    { id: 'd', label: 'Kabeldiameter', type: 'number', unit: 'mm', min: 1, placeholder: 'f.eks. 25' },
    { id: 'c', label: 'Fri kant mot flensen', type: 'number', unit: 'mm', min: 0, default: 50 },
    { id: 'kg', label: 'Kabelvekt (valgfritt)', type: 'number', unit: 'kg/km', optional: true, min: 0 },
  ],
  compute(x, ctx) {
    if (x.B >= x.F) ctx.need('Kjernediameteren må være mindre enn flensdiameteren.');
    const H = ctx.step('H', '(F − B)/2 − c', { F: v(x.F, 'mm'), B: v(x.B, 'mm'), c: v(x.c, 'mm') }, 'mm', { text: 'Høyde som kan fylles' });
    if (H <= x.d) ctx.need('Det er ikke plass til ett lag kabel med denne frie kanten.');
    const L = ctx.step('L', 'π·W·H·(B + H)/d²/1000', { W: v(x.W, 'mm'), H: v(H, 'mm'), B: v(x.B, 'mm'), d: v(x.d, 'mm') }, 'm', { text: 'Tilnærmet kapasitet ved tett vikling' });
    ctx.out('L', 'Kapasitet', L, 'm', { primary: true, sig: 3 });
    if (x.kg != null) ctx.out('mass', 'Vekt av kabelen', (L / 1000) * x.kg, 'kg');
    ctx.assume('Overslag. Løs vikling og ujevne lag gir mindre plass – regn med ca. 10 % mindre.');
  },
  cases: [
    { name: 'Ø1000/500 × 600, 25 mm kabel', inputs: { F: '1000', B: '500', W: '600', d: '25', c: '50' }, expect: { L: 422.2301 }, source: 'Håndregning: π·600·200·700/625/1000' },
  ],
};


// PoE etter IEEE 802.3: effekt ut fra svitsjen (PSE), minste spenning og antall par.
const POE = [
  { value: 1, label: 'Type 1 (802.3af, 15,4 W)', P: 15.4, Pd: 12.95, U: 44, pairs: 2 },
  { value: 2, label: 'Type 2 (802.3at, 30 W)', P: 30, Pd: 25.5, U: 50, pairs: 2 },
  { value: 3, label: 'Type 3 (802.3bt, 60 W)', P: 60, Pd: 51, U: 50, pairs: 4 },
  { value: 4, label: 'Type 4 (802.3bt, 90 W)', P: 90, Pd: 71.3, U: 50, pairs: 4 },
];

const poe = {
  id: 'poe',
  v: 1,
  title: 'PoE: effekt og tap',
  category: 'installasjon',
  summary: 'Effektbudsjett for svitsjen og tap i kabelen for Power over Ethernet.',
  keywords: ['poe', 'power over ethernet', '802.3', 'nettverk', 'kamera', 'tilgangspunkt', 'svitsj', 'cat6'],
  refs: ['IEEE 802.3af/at/bt', 'NEK 400:2026, ny del 7-716 (PoE)'],
  inputs: [
    { id: 'type', label: 'PoE-type', type: 'select', dropdown: true, options: POE, default: 2 },
    { id: 'L', label: 'Kabellengde', type: 'number', unit: 'm', min: 1, max: 100, default: 100 },
    { id: 'r', label: 'Lederresistans', type: 'number', unit: 'Ω/100 m', min: 1, max: 30, default: 9.38, help: 'Maks for 24 AWG (Cat5e/Cat6) er 9,38 Ω/100 m. Se kabelens datablad.' },
    { id: 'ports', label: 'Antall porter i bruk', type: 'number', min: 1, max: 96, default: 1 },
  ],
  compute(x, ctx) {
    const t = POE.find((o) => o.value === x.type) || POE[1];
    const I = ctx.step('I', 'P/U', { P: v(t.P, 'W'), U: v(t.U, 'V') }, 'A', { text: 'Strøm ved laveste spenning fra svitsjen' });
    const R = t.pairs === 2
      ? ctx.step('Rsløyfe', 'r·L/100', { r: v(x.r, 'Ω/100 m'), L: v(x.L, 'm') }, 'Ω', { text: '2 par: to ledere parallelt hver vei' })
      : ctx.step('Rsløyfe', 'r·L/100/2', { r: v(x.r, 'Ω/100 m'), L: v(x.L, 'm') }, 'Ω', { text: '4 par: strømmen deles på to parsett' });
    const loss = ctx.step('Ptap', 'I²·Rsløyfe', { I: v(I, 'A'), Rsløyfe: v(R, 'Ω') }, 'W');
    const Pd = ctx.step('P ved utstyret', 'P − Ptap', { P: v(t.P, 'W'), Ptap: v(loss, 'W') }, 'W');
    ctx.out('Pd', 'Effekt fram til utstyret', Pd, 'W', { primary: true });
    ctx.out('loss', 'Tap i kabelen', loss, 'W');
    ctx.out('budget', 'Effektbudsjett for svitsjen', t.P * x.ports, 'W', { primary: true });
    ctx.ge('Nok effekt til utstyret', Pd, t.Pd, 'W');
    ctx.note('Store bunter med PoE-kabler blir varme. Se NEK 400-7-716 om forlegging og bunting.');
  },
  cases: [
    { name: 'Type 2, 100 m Cat6, 24 porter', inputs: { type: 2, L: '100', r: '9,38', ports: '24' }, expect: { loss: 3.3768, Pd: 26.6232, budget: 720 }, checks: { 'Nok effekt til utstyret': 'ok' }, source: 'Håndregning: (30/50)² · 9,38' },
  ],
};

export const INSTALLASJON = [rorfylling, trommel, poe];
