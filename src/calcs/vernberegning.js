// Vern og jording: termisk kortslutningsfasthet, PE-tverrsnitt, jordelektrode, IT-jordfeil,
// selektivitet og hovedsikring/effektbehov.

import { v } from '../core/engine.js';
import { MATERIAL_OPTIONS, sizeOptions } from './fields.js';
import { SIZES } from '../data/ledere.js';

// k-verdier for ledere (IEC 60364-4-43, tabell 43A), ledere inntil 300 mm².
export const K_VALUES = { 'Cu-tp': 115, 'Cu-th': 143, 'Al-tp': 76, 'Al-th': 94 };
const INSULATION = [{ value: 'tp', label: 'Termoplast (PVC)' }, { value: 'th', label: 'Termoherd (PEX/EPR)' }];

const termisk = {
  id: 'termisk',
  v: 1,
  title: 'Termisk kortslutningsfasthet',
  category: 'vern',
  summary: 'Tåler lederen kortslutningsstrømmen til vernet kobler ut? k²S² ≥ I²t.',
  keywords: ['termisk', 'kortslutningsfasthet', 'k2s2', 'i2t', 'k-verdi', 'adiabatisk', 'tverrsnitt', 'utkoblingstid'],
  refs: ['NEK 400:2026, 434.5.2 og tabell 43A'],
  modes: [
    { id: 't', label: 'Tillatt tid' },
    { id: 'S', label: 'Minste tverrsnitt' },
  ],
  inputs: [
    { id: 'material', label: 'Materiale', type: 'select', options: MATERIAL_OPTIONS, default: (s) => s.material || 'Cu' },
    { id: 'ins', label: 'Isolasjon', type: 'select', options: INSULATION, default: (s) => (s.conductorTemp === 90 ? 'th' : 'tp') },
    { id: 'S', label: 'Tverrsnitt', type: 'select', dropdown: true, options: (s, x) => sizeOptions(x.material), default: (s, x) => (x.material === 'Al' ? 16 : 2.5), when: (x) => x.mode === 't' },
    { id: 'I', label: 'Kortslutningsstrøm', type: 'number', unit: 'kA', min: 0, minExclusive: true, placeholder: 'f.eks. 3' },
    { id: 't', label: 'Utkoblingstid', type: 'number', unit: 's', min: 0, minExclusive: true, max: 5, default: 0.4, when: (x) => x.mode === 'S' },
  ],
  compute(x, ctx) {
    const k = K_VALUES[`${x.material}-${x.ins}`];
    ctx.out('k', 'k-verdi', k, '');
    if (x.mode === 't') {
      const t = ctx.step('t', '(k·S/(I·1000))²', { k, S: v(x.S, 'mm²'), I: v(x.I, 'kA') }, 's', { text: 'Største tid lederen tåler strømmen' });
      ctx.out('t', 'Tillatt tid', t, 's', { primary: true });
      if (t < 0.1) ctx.note('Under 0,1 s må vernets gjennomslupne energi I²t fra produsenten brukes i stedet for strøm · tid.');
    } else {
      const S = ctx.step('S', '√((I·1000)²·t)/k', { I: v(x.I, 'kA'), t: v(x.t, 's'), k }, 'mm²', { text: 'Minste tverrsnitt' });
      const std = SIZES[x.material === 'Al' ? 'Al' : 'Cu'].find((s) => s >= S - 1e-9);
      ctx.out('S', 'Minste tverrsnitt', S, 'mm²', { primary: true });
      if (std != null) ctx.out('Sstd', 'Nærmeste standard', std, 'mm²', { primary: true });
    }
    ctx.assume('Adiabatisk oppvarming (ingen varme ledes bort), gyldig for tider inntil 5 s.');
  },
  cases: [
    { name: '2,5 mm² Cu PVC ved 1 kA', inputs: { mode: 't', material: 'Cu', ins: 'tp', S: 2.5, I: '1' }, expect: { t: 0.08265625 }, source: 'Håndregning: (115·2,5/1000)²' },
    { name: 'Minste S for 4 kA i 0,4 s, Cu PVC', inputs: { mode: 'S', material: 'Cu', ins: 'tp', I: '4', t: '0,4' }, expect: { S: 21.99845, Sstd: 25 }, source: 'Håndregning: √(16·10⁶·0,4)/115' },
  ],
};

const pe = {
  id: 'pe-tverrsnitt',
  v: 1,
  title: 'PE-tverrsnitt',
  category: 'vern',
  summary: 'Minste tverrsnitt for beskyttelseslederen ut fra faselederen, eller beregnet.',
  keywords: ['pe', 'beskyttelsesleder', 'jordleder', 'tverrsnitt', 'tabell 54.2', 'utjevning'],
  refs: ['NEK 400:2026, 543.1 og tabell 54.2'],
  modes: [
    { id: 'tabell', label: 'Fra faseleder' },
    { id: 'beregnet', label: 'Beregnet' },
  ],
  inputs: [
    { id: 'S', label: 'Faselederens tverrsnitt', type: 'select', dropdown: true, options: sizeOptions('Cu'), default: 16, when: (x) => x.mode === 'tabell' },
    { id: 'I', label: 'Feilstrøm', type: 'number', unit: 'A', min: 0, minExclusive: true, when: (x) => x.mode === 'beregnet' },
    { id: 't', label: 'Utkoblingstid', type: 'number', unit: 's', min: 0, minExclusive: true, max: 5, default: 0.4, when: (x) => x.mode === 'beregnet' },
    { id: 'k', label: 'k for PE-lederen', type: 'number', min: 50, max: 200, default: 115, when: (x) => x.mode === 'beregnet', help: 'PE i samme kabel: som faselederen (Cu/PVC 115, Cu/PEX 143).' },
  ],
  compute(x, ctx) {
    if (x.mode === 'tabell') {
      let Spe;
      let rule;
      if (x.S <= 16) { Spe = x.S; rule = 'S ≤ 16 mm²: samme som fase'; } else if (x.S <= 35) { Spe = 16; rule = '16 < S ≤ 35 mm²: 16 mm²'; } else { Spe = x.S / 2; rule = 'S > 35 mm²: S/2'; }
      const std = SIZES.Cu.find((s) => s >= Spe - 1e-9);
      ctx.out('Spe', 'Minste PE', std, 'mm²', { primary: true, note: rule });
    } else {
      const S = ctx.step('S', '√(I²·t)/k', { I: v(x.I, 'A'), t: v(x.t, 's'), k: x.k }, 'mm²');
      ctx.out('S', 'Minste PE (beregnet)', S, 'mm²', { primary: true });
      const std = SIZES.Cu.find((s) => s >= S - 1e-9);
      if (std != null) ctx.out('Sstd', 'Nærmeste standard', std, 'mm²');
    }
    ctx.note('PE som ikke ligger i kabel eller kapsling: minst 2,5 mm² Cu med mekanisk beskyttelse, ellers 4 mm² Cu.');
    ctx.assume('PE av samme materiale som faselederen.');
  },
  cases: [
    { name: '10 mm²', inputs: { mode: 'tabell', S: 10 }, expect: { Spe: 10 }, source: 'Tabell 54.2' },
    { name: '25 mm²', inputs: { mode: 'tabell', S: 25 }, expect: { Spe: 16 }, source: 'Tabell 54.2' },
    { name: '95 mm²', inputs: { mode: 'tabell', S: 95 }, expect: { Spe: 50 }, source: 'Tabell 54.2: 47,5 → 50' },
    { name: 'Beregnet 2 kA i 0,4 s', inputs: { mode: 'beregnet', I: '2000', t: '0,4', k: '115' }, expect: { S: 10.99923, Sstd: 16 }, source: 'Håndregning: √(4·10⁶·0,4)/115' },
  ],
};

const SOILS = [
  { value: 30, label: 'Myr, fuktig matjord (ca. 30 Ωm)' },
  { value: 100, label: 'Leire (ca. 100 Ωm)' },
  { value: 300, label: 'Sand og grus, fuktig (ca. 300 Ωm)' },
  { value: 1000, label: 'Tørr sand og grus (ca. 1000 Ωm)' },
  { value: 3000, label: 'Fjell (3000 Ωm og mer)' },
];

const jordelektrode = {
  id: 'jordelektrode',
  v: 1,
  title: 'Jordelektrode og TT',
  category: 'vern',
  summary: 'Overgangsmotstand for jordspyd eller jordbånd, og kravet RA · IΔn ≤ 50 V.',
  keywords: ['jordelektrode', 'jordspyd', 'jordbånd', 'overgangsmotstand', 'jordresistivitet', 'tt', 'ra', 'jording'],
  refs: ['NEK 400:2026, 411.5 (TT) og 5-54 (jordelektroder)'],
  modes: [
    { id: 'spyd', label: 'Jordspyd' },
    { id: 'band', label: 'Jordbånd' },
    { id: 'tt', label: 'TT-krav' },
  ],
  inputs: [
    { id: 'rho', label: 'Jordresistivitet ρ', type: 'select', dropdown: true, options: SOILS, default: 300, when: (x) => x.mode !== 'tt' },
    { id: 'L', label: 'Lengde i jord', type: 'number', unit: 'm', min: 0, minExclusive: true, default: (s, x) => (x.mode === 'band' ? 20 : 3), when: (x) => x.mode !== 'tt' },
    { id: 'd', label: 'Diameter', type: 'number', unit: 'mm', min: 1, max: 100, default: 16, when: (x) => x.mode === 'spyd' },
    { id: 'idn', label: 'Jordfeilbryterens IΔn', type: 'select', default: 30, options: [30, 100, 300, 500].map((a) => ({ value: a, label: `${a} mA` })) },
    { id: 'RA', label: 'Målt jordmotstand RA (valgfritt)', type: 'number', unit: 'Ω', optional: true, min: 0, when: (x) => x.mode === 'tt' },
  ],
  compute(x, ctx) {
    const RAmax = ctx.step('RA maks', '50/(IΔn/1000)', { IΔn: v(x.idn, 'mA') }, 'Ω', { text: 'TT: RA · IΔn ≤ 50 V' });
    if (x.mode === 'spyd') {
      const R = ctx.step('R', 'ρ/(2·π·L)·(ln(8·L/(d/1000)) − 1)', { ρ: v(x.rho, 'Ωm'), L: v(x.L, 'm'), d: v(x.d, 'mm') }, 'Ω', { text: 'Loddrett jordspyd (Dwight)' });
      ctx.out('R', 'Overgangsmotstand', R, 'Ω', { primary: true });
      ctx.le('Mot TT-kravet', R, RAmax, 'Ω');
    } else if (x.mode === 'band') {
      const R = ctx.step('R', '2·ρ/L', { ρ: v(x.rho, 'Ωm'), L: v(x.L, 'm') }, 'Ω', { text: 'Horisontalt jordbånd, grovt overslag' });
      ctx.out('R', 'Overgangsmotstand', R, 'Ω', { primary: true });
      ctx.le('Mot TT-kravet', R, RAmax, 'Ω');
    } else if (x.RA != null) {
      ctx.le('Målt RA mot kravet', x.RA, RAmax, 'Ω');
    }
    ctx.out('RAmax', 'Største RA for TT', RAmax, 'Ω', { primary: x.mode === 'tt' });
    ctx.assume('Jordresistiviteten varierer mye med fukt og tele. Mål alltid jordmotstanden etter montering.');
  },
  cases: [
    { name: 'Spyd 3 m, Ø16, 300 Ωm', inputs: { mode: 'spyd', rho: 300, L: '3', d: '16', idn: 30 }, expect: { R: 100.4778, RAmax: 1666.667 }, checks: { 'Mot TT-kravet': 'ok' }, source: 'Håndregning: 300/(2π·3)·(ln 1500 − 1)' },
    { name: 'Jordbånd 20 m i 300 Ωm', inputs: { mode: 'band', rho: 300, L: '20', idn: 30 }, expect: { R: 30 }, checks: { 'Mot TT-kravet': 'ok' }, source: 'Håndregning: 2 · 300/20' },
    { name: 'TT med 300 mA og målt 200 Ω', inputs: { mode: 'tt', idn: 300, RA: '200' }, expect: { RAmax: 166.6667 }, checks: { 'Målt RA mot kravet': 'fail' }, source: 'Håndregning: 50/0,3' },
  ],
};

const itJordfeil = {
  id: 'it-jordfeil',
  v: 1,
  title: 'Jordfeil i IT-nett',
  category: 'vern',
  summary: 'Berøringsspenning ved første jordfeil: RA · Id ≤ 50 V.',
  keywords: ['it', 'jordfeil', 'første feil', 'id', 'ra', 'berøringsspenning', 'isolasjonsovervåking'],
  refs: ['NEK 400:2026, 411.6 (IT-system)'],
  inputs: [
    { id: 'Id', label: 'Feilstrøm ved første jordfeil Id', type: 'number', unit: 'mA', min: 0, minExclusive: true, placeholder: 'f.eks. 850', help: 'Oppgis av nettselskapet, eller beregnes ut fra nettets lekkasjekapasitet.' },
    { id: 'RA', label: 'Jordmotstand for utsatte deler RA', type: 'number', unit: 'Ω', min: 0, minExclusive: true, placeholder: 'f.eks. 20' },
  ],
  compute(x, ctx) {
    const UB = ctx.step('UB', 'RA·Id/1000', { RA: v(x.RA, 'Ω'), Id: v(x.Id, 'mA') }, 'V', { text: 'Berøringsspenning ved første feil' });
    const RAmax = ctx.step('RA maks', '50/(Id/1000)', { Id: v(x.Id, 'mA') }, 'Ω');
    ctx.out('UB', 'Berøringsspenning', UB, 'V', { primary: true });
    ctx.out('RAmax', 'Største RA', RAmax, 'Ω');
    ctx.le('Første feil', UB, 50, 'V');
    ctx.note('Første feil skal meldes (jordfeilvarsler/isolasjonsovervåking eller jordfeilbryter) og rettes raskt. Ved andre feil må vernet koble ut dobbel jordfeil, der sløyfen er fase + PE i begge kursene (411.6.4), eller jordfeilbryteren gjøre det.');
  },
  cases: [{ name: '850 mA og 20 Ω', inputs: { Id: '850', RA: '20' }, expect: { UB: 17, RAmax: 58.82353 }, checks: { 'Første feil': 'ok' }, source: 'Håndregning: 20 · 0,85' }],
};

const selektivitet = {
  id: 'selektivitet',
  v: 1,
  title: 'Selektivitet',
  category: 'vern',
  summary: 'Grovsjekk av selektivitet mellom to vern i serie.',
  keywords: ['selektivitet', 'selektiv', 'vern', 'sikring', 'automat', 'gG', 'oppstrøms', 'nedstrøms'],
  refs: ['Produsentenes selektivitetstabeller', 'IEC 60269: gG-sikringer med forhold 1:1,6 er selektive'],
  inputs: [
    { id: 'up', label: 'Vern foran (nærmest kilden)', type: 'select', options: [{ value: 'gG', label: 'Sikring gG' }, { value: 'B', label: 'Automat B' }, { value: 'C', label: 'Automat C' }, { value: 'D', label: 'Automat D' }], default: 'gG' },
    { id: 'Inup', label: 'Merkestrøm foran', type: 'number', unit: 'A', min: 1, default: 63 },
    { id: 'down', label: 'Vern etter', type: 'select', options: [{ value: 'gG', label: 'Sikring gG' }, { value: 'B', label: 'Automat B' }, { value: 'C', label: 'Automat C' }, { value: 'D', label: 'Automat D' }], default: 'B' },
    { id: 'Indown', label: 'Merkestrøm etter', type: 'number', unit: 'A', min: 1, default: 16 },
    { id: 'Ik', label: 'Største kortslutningsstrøm der vernet etter sitter', type: 'number', unit: 'A', optional: true, min: 0, minExclusive: true },
  ],
  compute(x, ctx) {
    const ratio = ctx.step('Forhold', 'In₁/In₂', { 'In₁': v(x.Inup, 'A'), 'In₂': v(x.Indown, 'A') }, '', { text: 'In₁ = vernet foran, In₂ = vernet etter' });
    ctx.out('ratio', 'Forhold mellom merkestrømmene', ratio, '', { primary: true, sig: 2 });
    if (x.up === 'gG' && x.down === 'gG') {
      ctx.ge('gG mot gG (minst 1,6)', ratio, 1.6, '', { border: 0.0001 });
    } else if (x.up !== 'gG') {
      const low = { B: 3, C: 5, D: 10 }[x.up];
      const limit = ctx.step('Grense', 'k·In₁', { k: low, 'In₁': v(x.Inup, 'A') }, 'A', { text: 'Under nedre momentangrense for vernet foran (In₁) løser bare vernet etter ut' });
      ctx.out('limit', 'Selektiv opp til ca.', limit, 'A', { primary: true });
      if (x.Ik != null) ctx.ge('Selektivitet ved største Ik', limit, x.Ik, 'A', { detail: 'Over grensen kan begge vern løse ut. Bruk produsentens tabeller for sikre verdier.' });
      ctx.ge('Merkestrøm foran større enn etter', ratio, 1.0001, '', { border: 0.0001 });
    } else {
      ctx.ge('Merkestrøm foran større enn etter', ratio, 1.0001, '', { border: 0.0001 });
      ctx.note('Sikring foran automat: selektiviteten avhenger av sikringens smeltekurve mot automatens gjennomslupne energi. Bruk produsentens tabeller.');
    }
    ctx.assume('Grovsjekk. Sikker selektivitet krever produsentens tabeller for de aktuelle vernene.');
  },
  cases: [
    { name: 'gG 63 foran gG 35', inputs: { up: 'gG', Inup: '63', down: 'gG', Indown: '35' }, expect: { ratio: 1.8 }, checks: { 'gG mot gG (minst 1,6)': 'ok' }, source: 'IEC 60269: 1,6' },
    { name: 'C63 foran B16, Ik 400 A', inputs: { up: 'C', Inup: '63', down: 'B', Indown: '16', Ik: '400' }, expect: { limit: 315 }, checks: { 'Selektivitet ved største Ik': 'fail' }, source: 'Håndregning: 5 · 63' },
  ],
};

const MAIN_FUSES = [25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400];
const loadGroup = (i, label, kw, factor) => [
  { id: `p${i}`, label: `${label}`, type: 'number', unit: 'kW', min: 0, optional: true, default: kw },
  { id: `f${i}`, label: `${label}: samtidighet`, type: 'number', unit: '%', min: 0, max: 100, default: factor, advanced: true },
];

const hovedsikring = {
  id: 'hovedsikring',
  v: 1,
  title: 'Hovedsikring og effektbehov',
  category: 'vern',
  summary: 'Overslag over effektbehov med samtidighet, og hvilken hovedsikring det gir.',
  keywords: ['hovedsikring', 'effektbehov', 'samtidighet', 'samtidighetsfaktor', 'inntak', 'kw', 'last'],
  refs: [],
  inputs: [
    { id: 'supply', label: 'Tilførsel', type: 'select', default: (s) => (s.network === 'TN400' || s.network === 'TT400' ? '3x400' : '3x230'), options: [{ value: '3x230', label: '3-fase 230 V' }, { value: '3x400', label: '3-fase 400 V' }, { value: '1x230', label: '1-fase 230 V' }] },
    ...loadGroup(1, 'Oppvarming', 10, 80),
    ...loadGroup(2, 'Varmtvann', 2, 100),
    ...loadGroup(3, 'Komfyr og kjøkken', 7, 50),
    ...loadGroup(4, 'Elbillading', 11, 100),
    ...loadGroup(5, 'Varmepumpe/ventilasjon', 2, 100),
    ...loadGroup(6, 'Annet', 3, 50),
  ],
  compute(x, ctx) {
    const terms = [];
    const vars = {};
    for (let i = 1; i <= 6; i++) {
      if (x[`p${i}`] == null || x[`p${i}`] === 0) continue;
      terms.push(`P${i}·f${i}/100`);
      vars[`P${i}`] = v(x[`p${i}`], 'kW');
      vars[`f${i}`] = v(x[`f${i}`], '%');
    }
    if (!terms.length) ctx.need('Fyll inn minst én last.');
    const P = ctx.step('P', terms.join(' + '), vars, 'kW', { text: 'Samtidig effekt' });
    const U = x.supply === '3x400' ? 400 : 230;
    const I = x.supply === '1x230'
      ? ctx.step('I', 'P·1000/U', { P: v(P, 'kW'), U: v(U, 'V') }, 'A')
      : ctx.step('I', 'P·1000/(√3·U)', { P: v(P, 'kW'), U: v(U, 'V') }, 'A');
    const fuse = MAIN_FUSES.find((f) => f >= I - 1e-9);
    ctx.out('P', 'Samtidig effekt', P, 'kW', { primary: true });
    ctx.out('I', 'Strøm', I, 'A');
    if (fuse) ctx.out('fuse', 'Hovedsikring minst', fuse, 'A', { primary: true });
    else ctx.warn('Over 400 A – avklar med nettselskapet.');
    if (x.p4) ctx.note('Med lastbalansering kan elbilladingen styres etter ledig kapasitet, så hovedsikringen ikke må dimensjoneres for full ladeeffekt.');
    ctx.assume(`Overslag med samtidighetsfaktorer du kan endre under «Flere valg». Nettselskapet kan bruke egne metoder, og effektbehovet bør vurderes for hvert anlegg.`);
  },
  cases: [
    {
      name: 'Enebolig IT 230 V',
      inputs: { supply: '3x230', p1: '10', f1: '80', p2: '2', f2: '100', p3: '7', f3: '50', p4: '11', f4: '100', p5: '2', f5: '100', p6: '3', f6: '50' },
      expect: { P: 28, I: 70.28616, fuse: 80 },
      source: 'Håndregning: 8 + 2 + 3,5 + 11 + 2 + 1,5 = 28 kW; 28000/(√3·230)',
    },
  ],
};

export const VERN = [termisk, pe, jordelektrode, itJordfeil, selektivitet, hovedsikring];

