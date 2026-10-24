// Kabelverktøy: maks kabellengde (spenningsfall og utkobling), kabeldata og kabeltrekk.

import { v, silent } from '../core/engine.js';
import { formatValue } from '../core/number.js';
import { NETWORKS } from '../core/settings.js';
import { r20, resistanceAt, voltageDrop, maxLength } from '../lib/kabel.js';
import { shortCircuit, minFaultKind, maxLengthForIk } from '../lib/kortslutning.js';
import { DEVICE_TYPES, MCB_SIZES, GG_SIZES, tripCurrent } from '../data/vern.js';
import { ALPHA, SIZES } from '../data/ledere.js';
import { MATERIAL_OPTIONS, sizeOptions, phasesField, cosphiField } from './fields.js';

const netOf = (id) => NETWORKS.find((n) => n.id === id) || NETWORKS[0];

const makslengde = {
  id: 'makslengde',
  v: 1,
  title: 'Maks kabellengde',
  category: 'kabel',
  summary: 'Største lengde for en kurs: både spenningsfall og utkobling ved minste kortslutningsstrøm.',
  keywords: ['maks lengde', 'kabellengde', 'lengde', 'utkobling', 'spenningsfall', 'ik min', 'maksimal lengde'],
  refs: ['NEK 400:2026, 4-41 og 525', 'Beregningsmetode som kortslutningskalkulatoren (CENELEC TR 50480)'],
  inputs: [
    { id: 'net', label: 'Nett', type: 'select', default: (s) => s.network, options: NETWORKS.map((n) => ({ value: n.id, label: n.short })) },
    phasesField(),
    { id: 'Ib', label: 'Belastningsstrøm Ib', type: 'number', unit: 'A', min: 0, minExclusive: true, placeholder: 'f.eks. 16' },
    cosphiField(),
    { id: 'material', label: 'Ledermateriale', type: 'select', options: MATERIAL_OPTIONS, default: (s) => s.material || 'Cu' },
    { id: 'S', label: 'Tverrsnitt', type: 'select', dropdown: true, options: (s, x) => sizeOptions(x.material), default: (s, x) => (x.material === 'Al' ? 16 : 2.5) },
    { id: 'dev', label: 'Vern', type: 'select', options: DEVICE_TYPES, default: 'C' },
    { id: 'In', label: 'Merkestrøm', type: 'select', dropdown: true, default: 16, options: (s, x) => (x.dev === 'gG' ? GG_SIZES : MCB_SIZES).map((a) => ({ value: a, label: `${a} A` })) },
    { id: 't', label: 'Krav til utkoblingstid', type: 'select', default: 0.4, options: [{ value: 0.4, label: '0,4 s' }, { value: 5, label: '5 s' }], when: (x) => x.dev === 'gG' },
    { id: 'Ik3', label: 'Ik3 maks i fordelingen', type: 'number', unit: 'kA', min: 0, minExclusive: true, placeholder: 'f.eks. 3' },
    { id: 'Ikmin', label: 'Ik min i fordelingen', type: 'number', unit: 'kA', min: 0, minExclusive: true, placeholder: 'f.eks. 1,5', help: 'IT: Ik2 min. TN: Ik1 min fase–PE.' },
    {
      id: 'rcd', label: 'Jordfeilbryter på kursen', type: 'toggle', default: false,
      when: (x) => netOf(x.net).earthing === 'IT',
      help: 'Uten jordfeilbryter må vernet også koble ut dobbel jordfeil, med PE-lederen i feilsløyfen. Det gir kortere kurs. Påbudt for alle kurser i boliger.',
    },
    { id: 'limit', label: 'Grense for spenningsfall i kursen', type: 'number', unit: '%', min: 0.5, max: 20, default: (s) => s.vdLimit ?? 4 },
    { id: 'theta', label: 'Ledertemperatur', type: 'select', default: (s) => s.conductorTemp || 70, options: [{ value: 70, label: '70 °C' }, { value: 90, label: '90 °C' }], advanced: true },
    { id: 'X', label: 'Reaktans', type: 'number', unit: 'Ω/km', min: 0, max: 1, default: (s) => s.reactance ?? 0.08, advanced: true },
    { id: 'cmax', label: 'c maks', type: 'number', min: 1, max: 1.2, default: (s) => s.cmax ?? 1.1, advanced: true },
    { id: 'cmin', label: 'c min', type: 'number', min: 0.8, max: 1, default: (s) => s.cmin ?? 0.95, advanced: true },
    { id: 'cosNet', label: 'cos φk for nettet', type: 'number', min: 0.05, max: 1, default: (s) => s.netCos ?? 0.9, advanced: true },
  ],
  compute(x, ctx) {
    const net = netOf(x.net);
    if (x.Ikmin >= x.Ik3) ctx.need('Ik min må være mindre enn Ik3 maks.');
    const U = x.phases === 3 ? net.U : 230;
    const R = resistanceAt({ material: x.material, S: x.S, theta: x.theta }, ctx);
    const Ldu = maxLength({ phases: x.phases, U, I: x.Ib, R, X: x.X, cosphi: x.cosphi, limit: x.limit }, ctx);
    const trip = tripCurrent(x.dev, x.In, x.dev === 'gG' ? x.t : 0.4);
    if (!trip) ctx.need('Fant ikke utløsestrøm for vernet.');
    const Ia = trip.Ia / 1000;
    if (x.Ikmin < Ia) ctx.need(`Ik min i fordelingen (${formatValue(x.Ikmin * 1000, 'A')}) er allerede lavere enn vernet trenger (${formatValue(trip.Ia, 'A')}).`);
    // Største lengde der Ik min ved enden fortsatt er ≥ utløsestrømmen.
    // IT uten jordfeilbryter: dobbel jordfeil med fase + PE i to kurser (411.6.4) gir lavere strøm.
    const dj = net.earthing === 'IT' && !x.rcd;
    const lengthFor = (doubleEarthFault) => maxLengthForIk({ network: net, Ikmin: x.Ikmin, material: x.material, S: x.S, cmin: x.cmin, theta: x.theta, X: x.X, doubleEarthFault }, trip.Ia);
    const Lshort = lengthFor(false);
    const Lik = dj ? lengthFor(true) : Lshort;
    const L = Math.min(Ldu, Lik);
    ctx.out('L', 'Største lengde', L, 'm', { primary: true, note: Ldu < Lik ? 'spenningsfallet bestemmer' : 'utkoblingen bestemmer' });
    ctx.out('Ldu', 'Grense fra spenningsfall', Ldu, 'm');
    ctx.out('Lik', 'Grense fra utkobling', Lik, 'm', { note: dj ? 'dobbel jordfeil' : '' });
    if (dj) ctx.out('Lshort', 'Grense ved kortslutning fase–fase', Lshort, 'm', { note: 'gjelder med jordfeilbryter' });
    ctx.out('Ia', 'Vernet trenger', trip.Ia, 'A', { note: trip.basis });
    // Steg for kontroll ved den største lengden.
    shortCircuit({
      network: net, Ik3: x.Ik3, Ikmin: x.Ikmin, segments: [{ L: Lik, material: x.material, S: x.S, Spe: x.S }],
      cmax: x.cmax, cmin: x.cmin, theta: x.theta, X: x.X, cosNet: x.cosNet, doubleEarthFault: dj,
    }, ctx);
    if (dj) ctx.note('IT uten jordfeilbryter: ved dobbel jordfeil går strømmen gjennom fase og PE i to kurser, og det gir omtrent halv lengde. Med jordfeilbryter på kursene (påbudt i boliger) gjelder grensen for kortslutning fase–fase.');
    ctx.assume(`PE med samme tverrsnitt som fase. ${minFaultKind(net) === 'Ik2' ? (dj ? 'IT: dobbel jordfeil i to like kurser (NEK 400 411.6.4).' : 'Topolet Ik min.') : 'TN: Ik1 fase–PE.'}`);
  },
  cases: [
    {
      name: 'IT 230 V, 2,5 mm², C16, Ik2 min 1,5 kA',
      inputs: { net: 'IT230', phases: 1, Ib: '16', material: 'Cu', S: 2.5, dev: 'C', In: 16, Ik3: '3', Ikmin: '1,5', rcd: true, limit: '4', theta: 70, X: '0,08', cmax: '1,1', cmin: '0,95', cosNet: '0,9' },
      expect: { Ldu: 32.42704, Lik: [68.7964, 0.0005], L: 32.42704 },
      source: 'Håndregning: ΔU: 9,2·1000/(2·16·8,866) = 32,4 m. Ik: 218,5/(2·(72,83 + 8,8664·L)) = 160 A gir L = 68,8 m',
    },
    {
      name: 'Samme kurs uten jordfeilbryter: dobbel jordfeil gir omtrent halv lengde',
      inputs: { net: 'IT230', phases: 1, Ib: '16', material: 'Cu', S: 2.5, dev: 'C', In: 16, Ik3: '3', Ikmin: '1,5', rcd: false, limit: '4', theta: 70, X: '0,08', cmax: '1,1', cmin: '0,95', cosNet: '0,9' },
      expect: { Lik: 34.39826, Lshort: [68.7964, 0.0005], L: 32.42704 },
      source: 'Håndregning: (0,95·230/(2·0,16) − 72,83)/√((2·7,41·1,1965)² + 0,16²) = 610,0/17,733 = 34,4 m (NEK 400 411.6.4)',
    },
  ],
};

const kabeldata = {
  id: 'kabeldata',
  v: 1,
  title: 'Kabeldata',
  category: 'kabel',
  summary: 'Lederresistans ved 20, 70 og 90 °C, og reaktans, for alle standard tverrsnitt.',
  keywords: ['kabeldata', 'resistans', 'r20', 'reaktans', 'ω/km', 'lederresistans', 'tabell'],
  refs: ['IEC 60228:2023 (maks DC-resistans ved 20 °C)'],
  inputs: [
    { id: 'material', label: 'Ledermateriale', type: 'select', options: MATERIAL_OPTIONS, default: (s) => s.material || 'Cu' },
    { id: 'S', label: 'Tverrsnitt', type: 'select', dropdown: true, options: (s, x) => sizeOptions(x.material), default: (s, x) => (x.material === 'Al' ? 16 : 2.5) },
    { id: 'flex', label: 'Fleksibel leder (klasse 5)', type: 'toggle', default: false, when: (x) => x.material === 'Cu' },
  ],
  compute(x, ctx) {
    const flexible = x.material === 'Cu' && x.flex;
    const R20 = r20(x.material, x.S, flexible);
    ctx.out('R20', 'R ved 20 °C', R20, 'Ω/km', { primary: true });
    const a = ALPHA[x.material === 'Al' ? 'Al' : 'Cu'];
    ctx.out('R70', 'R ved 70 °C', R20 * (1 + a * 50), 'Ω/km', { primary: true });
    ctx.out('R90', 'R ved 90 °C', R20 * (1 + a * 70), 'Ω/km');
    ctx.out('mOhm', 'Per meter ved 20 °C', R20, 'mΩ/m');
    ctx.out('X', 'Reaktans (typisk, flerleder)', ctx.settings.reactance ?? 0.08, 'Ω/km');
    ctx.assume('Maks DC-resistans etter IEC 60228. Virkelig verdi er litt lavere. Reaktans 0,08 Ω/km er typisk for flerlederkabel; små tverrsnitt kan ligge litt høyere.');
  },
  cases: [{ name: '2,5 mm² Cu', inputs: { material: 'Cu', S: 2.5 }, expect: { R20: 7.41, R70: 8.866065 }, source: 'IEC 60228 og 7,41 · 1,1965' }],
};

const kabeltrekk = {
  id: 'kabeltrekk',
  v: 1,
  title: 'Kabeltrekk og bøyeradius',
  category: 'installasjon',
  summary: 'Største trekkraft på lederne og minste bøyeradius.',
  keywords: ['trekkraft', 'kabeltrekk', 'trekke kabel', 'bøyeradius', 'bøy', 'trekkhode', 'strømpe'],
  refs: ['Kabelprodusentens datablad (trekkraft og bøyeradius)'],
  inputs: [
    { id: 'material', label: 'Ledermateriale', type: 'select', options: MATERIAL_OPTIONS, default: (s) => s.material || 'Cu' },
    { id: 'cores', label: 'Antall ledere som trekkes i', type: 'number', min: 1, max: 61, default: 3 },
    { id: 'S', label: 'Tverrsnitt per leder', type: 'select', dropdown: true, options: (s, x) => sizeOptions(x.material), default: (s, x) => (x.material === 'Al' ? 50 : 16) },
    { id: 'sigma', label: 'Tillatt strekk i lederne', type: 'number', unit: 'N/mm²', min: 1, max: 100, default: (s, x) => (x.material === 'Al' ? 30 : 50), help: 'Vanlig verdi ved trekkhode på lederne: Cu 50, Al 30 N/mm². Se databladet.' },
    { id: 'D', label: 'Kabelens ytre diameter', type: 'number', unit: 'mm', min: 1, optional: true, placeholder: 'f.eks. 24' },
    { id: 'k', label: 'Bøyeradius (× diameter)', type: 'number', min: 2, max: 30, default: 12, when: (x) => x.D != null, help: 'Fra databladet. Under trekking ofte større enn ved fast forlegning.' },
  ],
  compute(x, ctx) {
    const F = ctx.step('F', 'n·S·σ', { n: x.cores, S: v(x.S, 'mm²'), σ: v(x.sigma, 'N/mm²') }, 'N', { text: 'Trekk i lederne med trekkhode' });
    ctx.out('F', 'Største trekkraft', F, 'N', { primary: true });
    ctx.out('kg', 'Tilsvarer ca.', F / 9.81, 'kg');
    if (x.D != null) {
      const r = ctx.step('r', 'k·D', { k: x.k, D: v(x.D, 'mm') }, 'mm');
      ctx.out('r', 'Minste bøyeradius', r, 'mm', { primary: true });
    }
    ctx.note('Med trekkstrømpe over kappen er grensen ofte lavere – følg databladet. Bruk glidemiddel og trekk jevnt.');
    ctx.assume('Trekkraften fordeles likt på lederne. PE og skjerm regnes ikke med.');
  },
  cases: [{ name: '3 × 16 mm² Cu, Ø 24 mm', inputs: { material: 'Cu', cores: '3', S: 16, sigma: '50', D: '24', k: '12' }, expect: { F: 2400, r: 288 }, source: 'Håndregning: 3·16·50; 12·24' }],
};

export const KABELVERKTOY = [makslengde, kabeldata, kabeltrekk];

// Brukes av tester.
export const _internal = { silent, voltageDrop, SIZES };
