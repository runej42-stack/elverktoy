// Elbil, effekttariff, solceller og batteri.

import { v } from '../core/engine.js';
import { formatValue } from '../core/number.js';
import { networkOf } from '../core/settings.js';

const SUPPLY = [
  { value: '1x230', label: '1-fase 230 V', phases: 1, U: 230 },
  { value: '3x230', label: '3-fase 230 V (IT/TT)', phases: 3, U: 230 },
  { value: '3x400', label: '3-fase 400 V (TN)', phases: 3, U: 400 },
];
const supplyOf = (id) => SUPPLY.find((s) => s.value === id) || SUPPLY[0];
const defaultSupply = (s) => (networkOf(s).U === 400 ? '3x400' : '3x230');

/** Effekt (kW) fra tilførsel og strøm, med steg. */
function supplyPower(sup, I, ctx) {
  return sup.phases === 3
    ? ctx.step('P', '√3·U·I/1000', { U: v(sup.U, 'V'), I: v(I, 'A') }, 'kW')
    : ctx.step('P', 'U·I/1000', { U: v(sup.U, 'V'), I: v(I, 'A') }, 'kW');
}

const elbil = {
  id: 'elbil',
  v: 1,
  title: 'Elbillading',
  category: 'energi',
  summary: 'Ladeeffekt for 1- og 3-fase i IT og TN, og hvor lang tid ladingen tar.',
  keywords: ['elbil', 'lading', 'ladeboks', 'ladepunkt', 'ladetid', 'kw', '11 kw', '22 kw', '7,4 kw'],
  refs: ['NEK 400:2026, 7-722 (forsyning av elektriske kjøretøy)'],
  inputs: [
    { id: 'supply', label: 'Tilførsel', type: 'select', options: SUPPLY, default: defaultSupply },
    { id: 'I', label: 'Ladestrøm', type: 'number', unit: 'A', min: 6, max: 80, default: 16, help: 'Innstilt strøm i laderen, minst 6 A.' },
    { id: 'carMax', label: 'Bilens maks AC-ladeeffekt (valgfritt)', type: 'number', unit: 'kW', optional: true, min: 1, max: 50 },
    { id: 'cap', label: 'Batteristørrelse', type: 'number', unit: 'kWh', min: 1, max: 250, default: 75 },
    { id: 'soc1', label: 'Lade fra', type: 'number', unit: '%', min: 0, max: 99, default: 20 },
    { id: 'soc2', label: 'Lade til', type: 'number', unit: '%', min: 1, max: 100, default: 80 },
    { id: 'eta', label: 'Virkningsgrad for ladingen', type: 'number', unit: '%', min: 50, max: 100, default: 90, advanced: true },
  ],
  compute(x, ctx) {
    if (x.soc2 <= x.soc1) ctx.need('«Lade til» må være høyere enn «Lade fra».');
    const sup = supplyOf(x.supply);
    let P = supplyPower(sup, x.I, ctx);
    if (x.carMax != null && x.carMax < P) {
      P = x.carMax;
      ctx.note(`Bilen begrenser ladingen til ${formatValue(x.carMax, 'kW')}.`);
    }
    const E = ctx.step('E', 'C·(til − fra)/100', { C: v(x.cap, 'kWh'), til: v(x.soc2, '%'), fra: v(x.soc1, '%') }, 'kWh', { text: 'Energi inn i batteriet' });
    const t = ctx.step('t', 'E/(P·η/100)', { E: v(E, 'kWh'), P: v(P, 'kW'), η: v(x.eta, '%') }, 'h', { text: 'Ladetid' });
    ctx.out('P', 'Ladeeffekt', P, 'kW', { primary: true });
    ctx.out('t', 'Ladetid', t, 'timer', { primary: true });
    ctx.out('E', 'Energi til batteriet', E, 'kWh');
    ctx.out('Enett', 'Energi fra nettet', E / (x.eta / 100), 'kWh');
    if (sup.value === '3x230') ctx.note('I IT 230 V lader mange biler bare på én fase. Sjekk bilen – ofte blir maks 7,4 kW ved 32 A.');
    ctx.assume('Ladeeffekten er jevn hele veien. Mot fullt batteri lader bilen saktere.');
    ctx.assume('NEK 400:2026: hvert nytt ladepunkt skal ha egen kurs. Jordfeilvern type B, eller type A med 6 mA DC-overvåking (RDC-DD) i laderen.');
  },
  cases: [
    { name: 'TN 400 V, 16 A, 75 kWh 20→80 %', inputs: { supply: '3x400', I: '16', cap: '75', soc1: '20', soc2: '80', eta: '90' }, expect: { P: 11.08513, E: 45, t: 4.510552 }, source: 'Håndregning: √3·400·16; 45/(11,085·0,9)' },
    { name: 'IT 230 V, 32 A, 3-fase', inputs: { supply: '3x230', I: '32', cap: '60', soc1: '10', soc2: '90', eta: '90' }, expect: { P: 12.74789, E: 48 }, source: 'Håndregning: √3·230·32' },
    { name: 'Bilen begrenser til 7,4 kW', inputs: { supply: '3x400', I: '32', carMax: '7,4', cap: '50', soc1: '20', soc2: '80', eta: '100' }, expect: { P: 7.4, t: 4.054054 }, source: 'Håndregning: 30/7,4' },
  ],
};

const lastbalansering = {
  id: 'lastbalansering',
  v: 1,
  title: 'Lastbalansering for lading',
  category: 'energi',
  summary: 'Hvor mye strøm som er ledig til lading ut fra hovedsikring og øvrig last.',
  keywords: ['lastbalansering', 'lastbalanse', 'hovedsikring', 'lading', 'elbil', 'dynamisk', 'ledig kapasitet'],
  refs: [],
  inputs: [
    { id: 'supply', label: 'Tilførsel', type: 'select', options: SUPPLY, default: defaultSupply },
    { id: 'main', label: 'Hovedsikring', type: 'number', unit: 'A', min: 1, default: 63 },
    { id: 'other', label: 'Øvrig last (høyest belastede fase)', type: 'number', unit: 'A', min: 0, placeholder: 'f.eks. 25' },
    { id: 'margin', label: 'Sikkerhetsmargin', type: 'number', unit: '%', min: 0, max: 50, default: 10 },
    { id: 'n', label: 'Antall ladere som lader samtidig', type: 'number', min: 1, max: 100, default: 1 },
  ],
  compute(x, ctx) {
    const sup = supplyOf(x.supply);
    const free = ctx.step('Ledig', 'Ih·(1 − m/100) − Iøvrig', { Ih: v(x.main, 'A'), m: v(x.margin, '%'), Iøvrig: v(x.other, 'A') }, 'A', { text: 'Ledig strøm per fase' });
    const per = ctx.step('Per lader', 'Ledig/n', { Ledig: v(free, 'A'), n: x.n }, 'A');
    ctx.out('free', 'Ledig strøm', free, 'A', { primary: true });
    ctx.out('per', 'Per lader', per, 'A', { primary: true });
    if (per >= 6) {
      const P = supplyPower(sup, per, ctx);
      ctx.out('P', 'Ladeeffekt per lader', P, 'kW');
    } else {
      ctx.warn('Under 6 A per lader: ladingen stopper eller må fordeles (rotasjon) til lasten går ned.');
    }
    ctx.assume('Øvrig last er målt eller beregnet på den høyest belastede fasen.');
  },
  cases: [
    { name: '63 A, 25 A øvrig, 2 ladere, TN', inputs: { supply: '3x400', main: '63', other: '25', margin: '10', n: '2' }, expect: { free: 31.7, per: 15.85, P: 10.98118 }, source: 'Håndregning: 63·0,9 − 25; /2; √3·400·15,85' },
  ],
};

const TARIFF_STEPS = [0, 2, 5, 10, 15, 20, 25, 50, 75, 100];

const effekttariff = {
  id: 'effekttariff',
  v: 1,
  title: 'Effekttariff (kapasitetsledd)',
  category: 'energi',
  summary: 'Snittet av månedens tre høyeste timer og hvilket kapasitetstrinn det gir.',
  keywords: ['effekttariff', 'kapasitetsledd', 'nettleie', 'effekttrinn', 'trinn', 'toppeffekt', 'kwh/h'],
  refs: ['Nettselskapets gjeldende tariff'],
  inputs: [
    { id: 'p1', label: 'Høyeste time, dag 1', type: 'number', unit: 'kWh/h', min: 0, placeholder: 'f.eks. 9,2' },
    { id: 'p2', label: 'Høyeste time, dag 2', type: 'number', unit: 'kWh/h', min: 0, placeholder: 'f.eks. 8,1' },
    { id: 'p3', label: 'Høyeste time, dag 3', type: 'number', unit: 'kWh/h', min: 0, placeholder: 'f.eks. 7,4' },
    { id: 'price', label: 'Pris for trinnet (valgfritt)', type: 'number', unit: 'kr/mnd', optional: true, min: 0 },
  ],
  compute(x, ctx) {
    const avg = ctx.step('Snitt', '(P1 + P2 + P3)/3', { P1: v(x.p1, 'kWh/h'), P2: v(x.p2, 'kWh/h'), P3: v(x.p3, 'kWh/h') }, 'kWh/h');
    let lo = TARIFF_STEPS[0];
    let hi = null;
    for (let i = 0; i < TARIFF_STEPS.length; i++) {
      if (avg >= TARIFF_STEPS[i]) { lo = TARIFF_STEPS[i]; hi = TARIFF_STEPS[i + 1] ?? null; }
    }
    ctx.out('avg', 'Snitt av tre høyeste timer', avg, 'kW', { primary: true });
    ctx.text('step', 'Typisk kapasitetstrinn', hi == null ? `over ${lo} kW` : `${lo}–${hi} kW`, { primary: true });
    if (x.price != null) ctx.out('year', 'Kostnad per år (12 × pris)', x.price * 12, 'kr');
    if (hi != null) ctx.note(`Ved å holde snittet under ${lo} kW kommer du ett trinn ned, f.eks. ved å flytte elbillading og varmtvann bort fra de travleste timene.`);
    ctx.assume('Timene må være fra tre ulike dager i samme måned.');
    ctx.assume('Trinnene varierer mellom nettselskapene. Sjekk ditt nettselskap for trinn og priser.');
  },
  cases: [
    { name: '9,2 + 8,1 + 7,4', inputs: { p1: '9,2', p2: '8,1', p3: '7,4' }, expect: { avg: 8.233333, step: '5–10 kW' }, source: 'Håndregning' },
  ],
};

const solstreng = {
  id: 'solstreng',
  v: 1,
  title: 'Solcellestreng',
  category: 'energi',
  summary: 'Strengspenning ved kulde og varme mot inverterens grenser, og antall moduler per streng.',
  keywords: ['solcelle', 'solceller', 'pv', 'streng', 'voc', 'mppt', 'inverter', 'vekselretter', 'strengspenning'],
  refs: ['NEK 400:2026, 7-712 (solcelleanlegg, revidert)', 'Datablad for modul og inverter'],
  inputs: [
    { id: 'Voc', label: 'Voc (STC)', type: 'number', unit: 'V', min: 1, placeholder: 'f.eks. 49,5' },
    { id: 'Vmp', label: 'Vmp (STC)', type: 'number', unit: 'V', min: 1, placeholder: 'f.eks. 41,6' },
    { id: 'beta', label: 'Temperaturkoeffisient for Voc', type: 'number', unit: '%/K', min: -2, max: 0, default: -0.28, allowNegative: true },
    { id: 'Isc', label: 'Isc (STC)', type: 'number', unit: 'A', min: 0, minExclusive: true, placeholder: 'f.eks. 13,9' },
    { id: 'n', label: 'Moduler i strengen', type: 'number', min: 1, max: 100, placeholder: 'f.eks. 16' },
    { id: 'Umax', label: 'Inverterens maks DC-spenning', type: 'number', unit: 'V', min: 1, default: 1000 },
    { id: 'mpptMin', label: 'MPPT nedre grense', type: 'number', unit: 'V', min: 0, default: 200 },
    { id: 'mpptMax', label: 'MPPT øvre grense', type: 'number', unit: 'V', min: 1, default: 850 },
    { id: 'Tmin', label: 'Laveste celletemperatur', type: 'number', unit: '°C', min: -50, max: 25, default: -25, allowNegative: true, advanced: true },
    { id: 'Tmax', label: 'Høyeste celletemperatur', type: 'number', unit: '°C', min: 25, max: 100, default: 70, advanced: true },
  ],
  compute(x, ctx) {
    const VocCold = ctx.step('Voc_kald', 'Voc·(1 + β/100·(Tmin − 25))', { Voc: v(x.Voc, 'V'), β: v(x.beta, '%/K'), Tmin: v(x.Tmin, '°C') }, 'V', { text: 'Voc per modul ved laveste temperatur' });
    const VmpHot = ctx.step('Vmp_varm', 'Vmp·(1 + β/100·(Tmaks − 25))', { Vmp: v(x.Vmp, 'V'), β: v(x.beta, '%/K'), Tmaks: v(x.Tmax, '°C') }, 'V', { text: 'Vmp per modul ved høyeste temperatur (tilnærmet med samme koeffisient)' });
    const VmpCold = ctx.step('Vmp_kald', 'Vmp·(1 + β/100·(Tmin − 25))', { Vmp: v(x.Vmp, 'V'), β: v(x.beta, '%/K'), Tmin: v(x.Tmin, '°C') }, 'V');
    const Ustr = ctx.step('Ustreng', 'n·Voc_kald', { n: x.n, Voc_kald: v(VocCold, 'V') }, 'V');
    const nmax = Math.floor(x.Umax / VocCold + 1e-9);
    const nmin = Math.ceil(x.mpptMin / VmpHot - 1e-9);
    const I = ctx.step('Idim', '1,25·Isc', { Isc: v(x.Isc, 'A') }, 'A', { text: 'Strøm for dimensjonering av kabel og vern' });
    ctx.out('Ustr', 'Strengspenning ved kulde', Ustr, 'V', { primary: true });
    ctx.out('nmax', 'Maks moduler per streng', nmax, '', { primary: true });
    ctx.out('nmin', 'Min moduler for MPPT i varme', nmin, '');
    ctx.out('Idim', '1,25 · Isc', I, 'A');
    ctx.le('Strengspenning ved kulde mot inverterens maks', Ustr, x.Umax, 'V');
    ctx.ge('MPPT-spenning i varme', x.n * VmpHot, x.mpptMin, 'V');
    ctx.le('MPPT-spenning i kulde', x.n * VmpCold, x.mpptMax, 'V', { detail: 'Over MPPT-området taper inverteren litt effekt, men tar ikke skade.' });
    ctx.assume('Tomgangsspenning ved −25 °C celletemperatur som standard. Bruk lokal laveste temperatur.');
  },
  cases: [
    { name: '18 × 49,5 V ved −25 °C mot 1000 V', inputs: { Voc: '49,5', Vmp: '41,6', beta: '-0,27', Isc: '13,9', n: '18', Umax: '1000', mpptMin: '200', mpptMax: '850', Tmin: '-25', Tmax: '70' }, expect: { Ustr: 1011.285, nmax: 17, Idim: 17.375 }, checks: { 'Strengspenning ved kulde mot inverterens maks': 'fail' }, source: 'Håndregning: 49,5·(1 + 0,0027·50) = 56,18 V; 18·56,18' },
  ],
};

const solproduksjon = {
  id: 'solproduksjon',
  v: 1,
  title: 'Solproduksjon (overslag)',
  category: 'energi',
  summary: 'Grovt overslag over årsproduksjon og verdi for et solcelleanlegg.',
  keywords: ['solcelle', 'produksjon', 'kwp', 'kwh', 'årsproduksjon', 'pvgis', 'sol'],
  refs: ['PVGIS (EU) gir nøyaktig produksjon for adresse, vinkel og retning'],
  inputs: [
    { id: 'kWp', label: 'Installert effekt', type: 'number', unit: 'kWp', min: 0, minExclusive: true, placeholder: 'f.eks. 10' },
    { id: 'yield', label: 'Spesifikk produksjon', type: 'number', unit: 'kWh/kWp', min: 100, max: 1500, default: 800, help: 'Grovt: 700–950 i Sør-Norge med god retning, lavere i nord og på flate eller skyggefulle tak.' },
    { id: 'price', label: 'Verdi av strømmen', type: 'number', unit: 'kr/kWh', min: 0, default: 1 },
  ],
  compute(x, ctx) {
    const E = ctx.step('E', 'P·y', { P: v(x.kWp, 'kWp'), y: v(x.yield, 'kWh/kWp') }, 'kWh');
    const value = ctx.step('Verdi', 'E·pris', { E: v(E, 'kWh'), pris: v(x.price, 'kr/kWh') }, 'kr');
    ctx.out('E', 'Produksjon per år', E, 'kWh', { primary: true });
    ctx.out('value', 'Verdi per år', value, 'kr');
    ctx.assume('Overslag. Bruk PVGIS for adresse, takvinkel, retning og skygge.');
  },
  cases: [{ name: '10 kWp × 800', inputs: { kWp: '10', yield: '800', price: '1' }, expect: { E: 8000, value: 8000 }, source: 'Håndregning' }],
};

const batteri = {
  id: 'batteri',
  v: 1,
  title: 'Batteri og UPS',
  category: 'energi',
  summary: 'Driftstid på batteri, eller hvor stor kapasitet en last trenger.',
  keywords: ['batteri', 'ups', 'nødstrøm', 'driftstid', 'ah', 'kapasitet', 'reservestrøm'],
  refs: [],
  modes: [
    { id: 't', label: 'Driftstid' },
    { id: 'C', label: 'Nødvendig Ah' },
  ],
  inputs: [
    { id: 'C', label: 'Kapasitet', type: 'number', unit: 'Ah', min: 0, minExclusive: true, placeholder: 'f.eks. 100', when: (x) => x.mode === 't' },
    { id: 't', label: 'Ønsket driftstid', type: 'number', unit: 'h', min: 0, minExclusive: true, placeholder: 'f.eks. 4', when: (x) => x.mode === 'C' },
    { id: 'U', label: 'Batterispenning', type: 'number', unit: 'V', min: 1, default: 12 },
    { id: 'P', label: 'Last', type: 'number', unit: 'W', min: 0, minExclusive: true, placeholder: 'f.eks. 100' },
    { id: 'dod', label: 'Utladningsdybde (DoD)', type: 'number', unit: '%', min: 1, max: 100, default: 80, help: 'Bly: ofte 50 %. Litium: 80–90 %.' },
    { id: 'eta', label: 'Virkningsgrad (inverter m.m.)', type: 'number', unit: '%', min: 10, max: 100, default: 90 },
  ],
  compute(x, ctx) {
    if (x.mode === 't') {
      const t = ctx.step('t', 'C·U·DoD/100·η/100/P', { C: v(x.C, 'Ah'), U: v(x.U, 'V'), DoD: v(x.dod, '%'), η: v(x.eta, '%'), P: v(x.P, 'W') }, 'h');
      ctx.out('t', 'Driftstid', t, 'timer', { primary: true });
      ctx.out('min', 'I minutter', t * 60, 'min');
    } else {
      const C = ctx.step('C', 'P·t/(U·DoD/100·η/100)', { P: v(x.P, 'W'), t: v(x.t, 'h'), U: v(x.U, 'V'), DoD: v(x.dod, '%'), η: v(x.eta, '%') }, 'Ah');
      ctx.out('C', 'Nødvendig kapasitet', C, 'Ah', { primary: true });
    }
    ctx.assume('Kapasiteten avtar ved kulde, høy utladningsstrøm og alder. Legg inn margin.');
  },
  cases: [
    { name: '100 Ah, 12 V, 100 W', inputs: { mode: 't', C: '100', U: '12', P: '100', dod: '80', eta: '90' }, expect: { t: 8.64 }, source: 'Håndregning: 100·12·0,8·0,9/100' },
    { name: '200 W i 4 timer på 24 V', inputs: { mode: 'C', t: '4', U: '24', P: '200', dod: '80', eta: '90' }, expect: { C: 46.2963 }, source: 'Håndregning: 800/(24·0,72)' },
  ],
};

export const ENERGI = [elbil, lastbalansering, effekttariff, solstreng, solproduksjon, batteri];
