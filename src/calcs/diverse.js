// Grunnlagsverktøy: kobling av motstander, stjerne/trekant, energikostnad, effekttap i kabel,
// transformator og enhetsomregning.

import { v } from '../core/engine.js';
import { formatNumber } from '../core/number.js';
import { resistanceAt } from '../lib/kabel.js';
import { materialField, sizeField, tempField, phasesField } from './fields.js';

const kobling = {
  id: 'kobling',
  v: 1,
  title: 'Serie- og parallellkobling',
  category: 'grunnlag',
  summary: 'Samlet motstand for motstander i serie eller parallell (og kondensatorer).',
  keywords: ['serie', 'parallell', 'motstand', 'resistans', 'kondensator', 'kobling', 'total motstand'],
  refs: [],
  modes: [
    { id: 'serie', label: 'Serie' },
    { id: 'parallell', label: 'Parallell' },
  ],
  inputs: [
    { id: 'R1', label: 'R1', type: 'number', unit: 'Ω', min: 0, minExclusive: true, placeholder: 'f.eks. 100' },
    { id: 'R2', label: 'R2', type: 'number', unit: 'Ω', min: 0, minExclusive: true, placeholder: 'f.eks. 220' },
    { id: 'R3', label: 'R3 (valgfritt)', type: 'number', unit: 'Ω', optional: true, min: 0, minExclusive: true },
    { id: 'R4', label: 'R4 (valgfritt)', type: 'number', unit: 'Ω', optional: true, min: 0, minExclusive: true },
  ],
  compute(x, ctx) {
    const names = ['R1', 'R2', 'R3', 'R4'].filter((k) => x[k] != null);
    const vars = Object.fromEntries(names.map((k) => [k, v(x[k], 'Ω')]));
    const expr = x.mode === 'serie' ? names.join(' + ') : `1/(${names.map((k) => `1/${k}`).join(' + ')})`;
    const R = ctx.step('R', expr, vars, 'Ω');
    ctx.out('R', x.mode === 'serie' ? 'Samlet motstand (serie)' : 'Samlet motstand (parallell)', R, 'Ω', { primary: true });
    ctx.note(x.mode === 'serie'
      ? 'Kondensatorer i serie regnes som motstander i parallell, og omvendt.'
      : 'Kondensatorer i parallell legges sammen som motstander i serie.');
  },
  cases: [
    { name: 'Serie 100 + 220', inputs: { mode: 'serie', R1: '100', R2: '220' }, expect: { R: 320 }, source: 'Håndregning' },
    { name: 'Parallell 100 og 100 og 50', inputs: { mode: 'parallell', R1: '100', R2: '100', R3: '50' }, expect: { R: 25 }, source: 'Håndregning: 1/(0,01 + 0,01 + 0,02)' },
  ],
};

const stjerneTrekant = {
  id: 'stjerne-trekant',
  v: 1,
  title: 'Stjerne og trekant',
  category: 'grunnlag',
  summary: 'Effekt og strøm for tre like elementer koblet i stjerne eller trekant.',
  keywords: ['stjerne', 'trekant', 'y', 'δ', 'delta', 'varmeelement', 'kobling', 'trefase'],
  refs: [],
  inputs: [
    { id: 'R', label: 'Motstand per element', type: 'number', unit: 'Ω', min: 0, minExclusive: true, placeholder: 'f.eks. 52,9' },
    { id: 'U', label: 'Spenning mellom faser', type: 'number', unit: 'V', min: 1, default: (s) => (s.network === 'TN400' || s.network === 'TT400' ? 400 : 230) },
  ],
  compute(x, ctx) {
    const PY = ctx.step('P stjerne', 'U²/R', { U: v(x.U, 'V'), R: v(x.R, 'Ω') }, 'W', { text: 'Stjerne: hvert element får U/√3, til sammen 3·(U/√3)²/R = U²/R' });
    const PD = ctx.step('P trekant', '3·U²/R', { U: v(x.U, 'V'), R: v(x.R, 'Ω') }, 'W', { text: 'Trekant: hvert element får hele U' });
    const IY = ctx.step('I stjerne', 'U/(√3·R)', { U: v(x.U, 'V'), R: v(x.R, 'Ω') }, 'A');
    const ID = ctx.step('I trekant', '√3·U/R', { U: v(x.U, 'V'), R: v(x.R, 'Ω') }, 'A');
    ctx.out('PY', 'Effekt i stjerne', PY, 'W', { primary: true });
    ctx.out('PD', 'Effekt i trekant', PD, 'W', { primary: true });
    ctx.out('IY', 'Linjestrøm i stjerne', IY, 'A');
    ctx.out('ID', 'Linjestrøm i trekant', ID, 'A');
    ctx.note('Trekant gir tre ganger effekten av stjerne med samme elementer.');
  },
  cases: [
    { name: '52,9 Ω på 230 V', inputs: { R: '52,9', U: '230' }, expect: { PY: 1000, PD: 3000, ID: 7.530656 }, source: 'Håndregning: 230²/52,9 = 1000 W' },
    { name: '52,9 Ω på 400 V', inputs: { R: '52,9', U: '400' }, expect: { PY: 3024.575, PD: 9073.724 }, source: 'Håndregning' },
  ],
};

const energikostnad = {
  id: 'energikostnad',
  v: 1,
  title: 'Energi og kostnad',
  category: 'grunnlag',
  summary: 'Hva et apparat bruker og koster per dag, måned og år.',
  keywords: ['energi', 'kwh', 'kostnad', 'strømpris', 'forbruk', 'pris', 'kr'],
  refs: [],
  inputs: [
    { id: 'P', label: 'Effekt', type: 'number', unit: 'W', min: 0, minExclusive: true, placeholder: 'f.eks. 1000' },
    { id: 'h', label: 'Bruk per dag', type: 'number', unit: 'timer', min: 0, max: 24, default: 1 },
    { id: 'price', label: 'Strømpris inkl. nettleie', type: 'number', unit: 'kr/kWh', min: 0, default: 1.5 },
  ],
  compute(x, ctx) {
    const day = ctx.step('E dag', 'P·t/1000', { P: v(x.P, 'W'), t: v(x.h, 'h') }, 'kWh');
    const year = ctx.step('E år', 'E·365', { E: v(day, 'kWh') }, 'kWh');
    const cost = ctx.step('Kostnad år', 'E·pris', { E: v(year, 'kWh'), pris: v(x.price, 'kr/kWh') }, 'kr');
    ctx.out('day', 'Energi per dag', day, 'kWh');
    ctx.out('year', 'Energi per år', year, 'kWh', { primary: true });
    ctx.out('cost', 'Kostnad per år', cost, 'kr', { primary: true });
    ctx.out('month', 'Kostnad per måned', cost / 12, 'kr');
  },
  cases: [{ name: '1000 W i 2 t/dag', inputs: { P: '1000', h: '2', price: '1,5' }, expect: { day: 2, year: 730, cost: 1095 }, source: 'Håndregning' }],
};

const effekttap = {
  id: 'effekttap',
  v: 1,
  title: 'Effekttap i kabel',
  category: 'kabel',
  summary: 'Varmetap i kabelen ved en gitt last, og hva tapet koster i året.',
  keywords: ['effekttap', 'tap', 'kabeltap', 'i²r', 'varmetap', 'kostnad'],
  refs: ['IEC 60228:2023 (lederresistans)'],
  inputs: [
    phasesField({ default: 3 }),
    { id: 'I', label: 'Strøm', type: 'number', unit: 'A', min: 0, minExclusive: true, placeholder: 'f.eks. 32' },
    { id: 'L', label: 'Lengde', type: 'number', unit: 'm', min: 0, minExclusive: true, placeholder: 'f.eks. 50' },
    materialField(),
    sizeField({ default: (s, x) => (x.material === 'Al' ? 16 : 6) }),
    tempField({ advanced: false }),
    { id: 'hours', label: 'Brukstid per år med denne strømmen', type: 'number', unit: 'timer', min: 0, max: 8760, default: 2000 },
    { id: 'price', label: 'Strømpris', type: 'number', unit: 'kr/kWh', min: 0, default: 1.5 },
  ],
  compute(x, ctx) {
    const R = resistanceAt({ material: x.material, S: x.S, theta: x.theta }, ctx);
    const n = x.phases === 3 ? 3 : 2;
    const P = ctx.step('Ptap', 'n·I²·R·L/1000', { n, I: v(x.I, 'A'), R: v(R, 'Ω/km'), L: v(x.L, 'm') }, 'W', { text: `${n} strømførende ledere` });
    const E = ctx.step('E år', 'Ptap·t/1000', { Ptap: v(P, 'W'), t: v(x.hours, 'h') }, 'kWh');
    const cost = ctx.step('Kostnad', 'E·pris', { E: v(E, 'kWh'), pris: v(x.price, 'kr/kWh') }, 'kr');
    ctx.out('P', 'Effekttap', P, 'W', { primary: true });
    ctx.out('E', 'Tap per år', E, 'kWh');
    ctx.out('cost', 'Kostnad per år', cost, 'kr');
  },
  cases: [{ name: '32 A, 50 m, 6 mm² Cu, 3-fase, 70 °C', inputs: { phases: 3, I: '32', L: '50', material: 'Cu', S: 6, theta: 70, hours: '2000', price: '1,5' }, expect: { P: 566.0498, E: 1132.1, cost: 1698.149 }, source: 'Håndregning: 3·32²·3,68522·0,05' }],
};

const transformator = {
  id: 'transformator',
  v: 1,
  title: 'Transformator',
  category: 'vern',
  summary: 'Merkestrøm og kortslutningsstrøm på sekundærsiden ut fra kVA og uk.',
  keywords: ['transformator', 'trafo', 'kva', 'uk', 'kortslutningsspenning', 'merkestrøm', 'ik'],
  refs: [],
  inputs: [
    { id: 'S', label: 'Merkeeffekt', type: 'number', unit: 'kVA', min: 0, minExclusive: true, placeholder: 'f.eks. 800' },
    { id: 'U', label: 'Sekundærspenning (mellom faser)', type: 'number', unit: 'V', min: 1, default: (s) => (s.network === 'TN400' || s.network === 'TT400' ? 400 : 230) },
    { id: 'uk', label: 'Kortslutningsspenning uk', type: 'number', unit: '%', min: 0.5, max: 20, default: 6 },
  ],
  compute(x, ctx) {
    const In = ctx.step('In', 'S·1000/(√3·U)', { S: v(x.S, 'kVA'), U: v(x.U, 'V') }, 'A');
    const Ik = ctx.step('Ik', 'In/(uk/100)/1000', { In: v(In, 'A'), uk: v(x.uk, '%') }, 'kA', { text: 'Trefase kortslutning på klemmene (uendelig sterkt nett foran)' });
    ctx.out('In', 'Merkestrøm', In, 'A', { primary: true });
    ctx.out('Ik', 'Kortslutningsstrøm', Ik, 'kA', { primary: true });
    ctx.assume('Nettet foran trafoen er regnet som uendelig sterkt. Virkelig Ik blir litt lavere. Spenningsfaktoren c er ikke tatt med.');
  },
  cases: [{ name: '800 kVA, 400 V, 6 %', inputs: { S: '800', U: '400', uk: '6' }, expect: { In: 1154.701, Ik: 19.24501 }, source: 'Håndregning: 800000/(√3·400); /0,06' }],
};

// AWG: d = 0,127 · 92^((36 − n)/39) mm, der 1/0 = 0, 2/0 = −1, 3/0 = −2 og 4/0 = −3.
const AWG = [
  ['4/0', -3], ['3/0', -2], ['2/0', -1], ['1/0', 0], ['1', 1], ['2', 2], ['3', 3], ['4', 4], ['6', 6], ['8', 8],
  ['10', 10], ['12', 12], ['14', 14], ['16', 16], ['18', 18], ['20', 20], ['22', 22], ['24', 24], ['26', 26],
].map(([label, n]) => ({ value: n, label: `AWG ${label}` }));

const omregning = {
  id: 'omregning',
  v: 1,
  title: 'Enhetsomregning',
  category: 'grunnlag',
  summary: 'AWG ↔ mm², hestekrefter ↔ kW og grader °C ↔ °F.',
  keywords: ['awg', 'mm2', 'mm²', 'hestekrefter', 'hk', 'hp', 'kw', 'fahrenheit', 'omregning', 'enheter'],
  refs: [],
  modes: [
    { id: 'awg', label: 'AWG → mm²' },
    { id: 'mm2', label: 'mm² → AWG' },
    { id: 'hk', label: 'hk ↔ kW' },
    { id: 'temp', label: '°C ↔ °F' },
  ],
  inputs: [
    { id: 'awg', label: 'AWG', type: 'select', dropdown: true, options: AWG, default: 12, when: (x) => x.mode === 'awg' },
    { id: 'mm2', label: 'Tverrsnitt', type: 'number', unit: 'mm²', min: 0, minExclusive: true, placeholder: 'f.eks. 2,5', when: (x) => x.mode === 'mm2' },
    { id: 'kw', label: 'Effekt', type: 'number', unit: 'kW', min: 0, placeholder: 'f.eks. 7,5', when: (x) => x.mode === 'hk' },
    { id: 'c', label: 'Temperatur', type: 'number', unit: '°C', allowNegative: true, min: -273.15, placeholder: 'f.eks. 20', when: (x) => x.mode === 'temp' },
  ],
  compute(x, ctx) {
    if (x.mode === 'awg') {
      const d = ctx.step('d', '0,127·92^((36 − n)/39)', { n: x.awg }, 'mm', { text: 'Diameter (n = AWG-nummer, 1/0 = 0, 2/0 = −1 …)' });
      const A = ctx.step('A', 'π/4·d²', { d: v(d, 'mm') }, 'mm²');
      ctx.out('A', 'Tverrsnitt', A, 'mm²', { primary: true });
      ctx.out('d', 'Diameter', d, 'mm');
    } else if (x.mode === 'mm2') {
      const d = ctx.step('d', '√(4·A/π)', { A: v(x.mm2, 'mm²') }, 'mm');
      const n = ctx.step('n', '36 − 39·ln(d/0,127)/ln(92)', { d: v(d, 'mm') }, '', { text: 'AWG-nummer (desimaltall)' });
      const r = Math.round(n);
      const label = r <= 0 ? `${1 - r}/0` : String(r);
      ctx.text('awg', 'Nærmeste AWG', `AWG ${label}`, { primary: true });
      ctx.out('n', 'Beregnet AWG-tall', n, '', { sig: 3 });
    } else if (x.mode === 'hk') {
      const hk = ctx.step('hk', 'P·1000/735,5', { P: v(x.kw, 'kW') }, 'hk', { text: 'Metrisk hestekraft (1 hk = 735,5 W)' });
      const hp = ctx.step('hp', 'P·1000/745,7', { P: v(x.kw, 'kW') }, 'hp', { text: 'Britisk/amerikansk horsepower (1 hp = 745,7 W)' });
      ctx.out('hk', 'Hestekrefter (metrisk)', hk, 'hk', { primary: true });
      ctx.out('hp', 'Horsepower (hp)', hp, 'hp');
    } else {
      const f = ctx.step('°F', 'C·9/5 + 32', { C: v(x.c, '°C') }, '°F');
      const k = ctx.step('K', 'C + 273,15', { C: v(x.c, '°C') }, 'K');
      ctx.out('f', 'Fahrenheit', f, '°F', { primary: true });
      ctx.out('k', 'Kelvin', k, 'K');
    }
  },
  cases: [
    { name: 'AWG 12', inputs: { mode: 'awg', awg: 12 }, expect: { A: [3.3088, 1e-3], d: [2.0525, 1e-3] }, source: 'AWG-tabell: AWG 12 = 3,31 mm²' },
    { name: '2,5 mm²', inputs: { mode: 'mm2', mm2: '2,5' }, expect: { awg: 'AWG 13' }, source: 'AWG 13 = 2,63 mm², AWG 14 = 2,08 mm²' },
    { name: '7,5 kW', inputs: { mode: 'hk', kw: '7,5' }, expect: { hk: 10.19714, hp: 10.05766 }, source: 'Håndregning' },
    { name: '−25 °C', inputs: { mode: 'temp', c: '-25' }, expect: { f: -13, k: 248.15 }, source: 'Håndregning' },
  ],
};

export const DIVERSE = [kobling, stjerneTrekant, energikostnad, effekttap, transformator, omregning];

// Brukes i tester for å vise AWG-etiketten for et tall.
export const awgLabel = (n) => (n <= 0 ? `${1 - n}/0` : formatNumber(n));
