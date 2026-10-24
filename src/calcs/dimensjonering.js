// Dimensjoner kurs og strømføringsevne. Bruker tabellene i src/data/iz.js.

import { v, silent } from '../core/engine.js';
import { formatValue } from '../core/number.js';
import { NETWORKS } from '../core/settings.js';
import { FEATURES } from '../core/features.js';
import {
  METHODS, isGround, isTray, groupOptions, trayCountOptions, groundGapOptions,
  izFor, izProblem, tablesUsed, tableKey, conductorTemp,
} from '../lib/iz.js';
import { voltageDrop, resistanceAt, sizesFor } from '../lib/kabel.js';
import { currentFromActive } from '../lib/elektro.js';
import { shortCircuit, minFaultKind, maxLengthForIk } from '../lib/kortslutning.js';
import { DEVICE_TYPES, MCB_SIZES, MCB_TRIP, GG_SIZES, tripCurrent } from '../data/vern.js';
import { IZ_VERIFIED } from '../data/iz-verified.js';
import { K_VALUES } from './vernberegning.js';
import { MATERIAL_OPTIONS, sizeOptions, phasesField, voltageField, cosphiField } from './fields.js';

const listText = (items) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} og ${items[items.length - 1]}`);

const unverified = (ctx, keys) => {
  const open = [...new Set(keys)].filter((k) => !IZ_VERIFIED[k]);
  if (!open.length) return;
  const where = FEATURES.tablecheck ? ' Se Mer → Tabellkontroll.' : '';
  ctx.warn(`${open.length === 1 ? 'Tabell' : 'Tabellene'} ${listText(open)} er skrevet av fra offentlige kilder og ikke kontrollert mot NEK 400:2026 ennå.${where}`);
};

const INS = [{ value: 'tp', label: 'Termoplast 70 °C' }, { value: 'th', label: 'Termoherd 90 °C' }];
const LOADED = [{ value: 2, label: '2 belastede (1-fase)' }, { value: 3, label: '3 belastede (3-fase)' }];

// Felles felt for forlegning og korreksjon. loadedOf gir antall belastede ledere ut fra de andre feltene.
const layingFields = (loadedOf) => [
  { id: 'material', label: 'Ledermateriale', type: 'select', options: MATERIAL_OPTIONS, default: (s) => s.material || 'Cu' },
  { id: 'ins', label: 'Isolasjon', type: 'select', options: INS, default: (s) => (s.conductorTemp === 90 ? 'th' : 'tp'), help: '90 °C bare når klemmene i utstyret tåler 90 °C (NEK 400:2026).' },
  { id: 'method', label: 'Forlegningsmåte', type: 'select', dropdown: true, options: METHODS, default: 'A1' },
  {
    id: 'temp', label: 'Omgivelsestemperatur', type: 'number', unit: '°C', min: -20, max: 80, allowNegative: true,
    default: (s, x) => (isGround(x.method) ? 20 : 30),
    help: (s, x) => (isGround(x.method) ? 'Jordtemperatur. Tabellene gjelder 20 °C.' : 'Lufttemperatur. Tabellene gjelder 30 °C.'),
  },
  {
    id: 'n', label: 'Antall kurser samlet', type: 'number', min: 1, max: 100, default: 1,
    when: (x) => !isTray(x.arr),
    help: (s, x) => (isGround(x.method)
      ? 'Kurser som ligger i samme grøft over en strekning, inkludert denne. Parallelle ledere teller som egne kurser.'
      : 'Kabler som ligger sammen over en strekning, inkludert denne.'),
  },
  {
    id: 'gap', label: 'Avstand mellom kursene', type: 'select', dropdown: true, default: 'touching',
    options: (s, x) => groundGapOptions(x.method),
    when: (x) => isGround(x.method) && x.n > 1,
    help: (s, x) => (x.method === 'D1'
      ? 'Fri avstand mellom rørene (tabell B.52.19).'
      : 'Fri avstand mellom kablene (tabell B.52.18).'),
  },
  {
    id: 'arr', label: 'Samlet forlegning', type: 'select', dropdown: true,
    options: (s, x) => groupOptions(x.method),
    default: (s, x) => (groupOptions(x.method)[0] || {}).value,
    when: (x) => x.method === 'C' || x.method === 'E',
  },
  {
    id: 'nTray', label: 'Antall kurser per bro eller stige', type: 'number', min: 1, max: 100, default: 1,
    when: (x) => isTray(x.arr),
    help: 'Kabler i ett lag på samme bro eller stige, inkludert denne.',
  },
  {
    id: 'trays', label: 'Antall broer eller stiger', type: 'select', default: 1,
    options: (s, x) => (isTray(x.arr) ? trayCountOptions(x.arr) : [{ value: 1, label: '1' }]),
    when: (x) => isTray(x.arr),
    help: 'Over hverandre med minst 300 mm mellom (stående broer: 225 mm). Tettere gir lavere faktor.',
  },
];

const layParams = (x, loaded, S) => ({
  ins: x.ins, loaded, material: x.material, method: x.method, S, temp: x.temp,
  arrangement: x.arr, n: x.n, nTray: x.nTray, trays: x.trays, gap: x.gap,
});

// Forutsetninger som følger av forlegningen.
function layingNotes(x, iz, ctx) {
  if (iz.kG.capped) ctx.warn('Flere kurser enn tabellen dekker. Faktoren for det største antallet er brukt.');
  if (iz.kG.tray) ctx.assume('Bro og stige: ett lag kabler. Ligger kablene i flere lag oppå hverandre, blir faktoren lavere enn tabellen gir.');
  if (isGround(x.method)) ctx.assume('I jord: 0,7 m dybde og jord med termisk resistivitet 2,5 K·m/W, som tabellene forutsetter. Fuktig jord leder varmen bedre, tørr sand dårligere.');
  if (iz.kG.misprint) ctx.warn('Tabellverdien 0,38 for 16 kurser med 0,5 m mellom er trolig en trykkfeil i standarden (andre utgaver har 0,68). Appen bruker 0,38, som er det sikreste, til verdien er kontrollert mot NEK 400:2026.');
  if (x.ins === 'th') ctx.note('90 °C-verdier krever at klemmene i vern og utstyr tåler 90 °C. Ellers gjelder 70 °C-tabellene.');
}

const LAYING_KEYWORDS = ['forlegning', 'forlegningsmåte', 'samlet forlegning', 'kabelbro', 'kabelstige', 'bro', 'stige', 'fri luft', 'jord', 'grøft'];

export const stromforingsevne = {
  id: 'stromforingsevne',
  v: 2,
  title: 'Strømføringsevne (Iz)',
  category: 'kabel',
  summary: 'Iz for kabel ut fra forlegning, isolasjon, temperatur og samlet forlegning, også på bro og stige.',
  keywords: ['strømføringsevne', 'iz', 'ampacity', 'a1', 'korreksjonsfaktor', 'tverrsnitt', 'ledertemperatur', ...LAYING_KEYWORDS],
  refs: ['IEC 60364-5-52 tillegg B / NEK 400:2026, 5-52 (tabell 52B)', 'Tabellene er avskrift og skal kontrolleres mot NEK 400:2026'],
  inputs: [
    { id: 'loaded', label: 'Belastede ledere', type: 'select', options: LOADED, default: 2 },
    ...layingFields((x) => x.loaded),
    { id: 'S', label: 'Tverrsnitt', type: 'select', dropdown: true, options: (s, x) => sizeOptions(x.material), default: (s, x) => (x.material === 'Al' ? 16 : 2.5) },
    { id: 'Ib', label: 'Belastningsstrøm Ib (valgfritt)', type: 'number', unit: 'A', optional: true, min: 0, minExclusive: true, help: 'Gir ledertemperaturen ved denne strømmen.' },
    { id: 'In', label: 'Vernets merkestrøm (valgfritt)', type: 'number', unit: 'A', optional: true, min: 1 },
  ],
  compute(x, ctx) {
    const p = layParams(x, x.loaded, x.S);
    const problem = izProblem(p);
    if (problem) ctx.need(problem);
    const r = izFor(p, ctx);
    const thetaMax = x.ins === 'th' ? 90 : 70;
    ctx.out('Iz', 'Strømføringsevne Iz', r.Iz, 'A', { primary: true, sig: 3 });
    ctx.out('Iz0', `Tabellverdi (${tableKey(x.ins, x.loaded, x.method, x.material)})`, r.Iz0, 'A');
    ctx.out('kT', `Temperaturfaktor (${r.kT.temp} °C)`, r.kT.factor, '');
    ctx.out('kG', 'Faktor for samlet forlegning', r.kG.factor, '');
    if (x.Ib != null) {
      ctx.out('thetaIb', 'Ledertemperatur ved Ib', conductorTemp({ I: x.Ib, Iz: r.Iz, kG: r.kG.factor, ambient: x.temp, thetaMax }, ctx, 'θ ved Ib'), '°C');
      ctx.le('Ib ≤ Iz', x.Ib, r.Iz, 'A');
      ctx.note('Ledertemperaturen gjelder jevn last over tid. Ligger kabelen sammen med andre, er det regnet med at de andre går med full last. Den kan brukes til spenningsfall og Ik min i «Dimensjoner kurs».');
    }
    if (x.In != null) {
      ctx.out('thetaIn', 'Ledertemperatur ved In', conductorTemp({ I: x.In, Iz: r.Iz, kG: r.kG.factor, ambient: x.temp, thetaMax }, ctx, 'θ ved In'), '°C');
      ctx.le('In ≤ Iz', x.In, r.Iz, 'A');
    }
    layingNotes(x, r, ctx);
    unverified(ctx, tablesUsed(p));
    ctx.assume('Tabellverdier etter IEC 60364-5-52 tillegg B (samme som NEK 400-5-52). Mellom tabellverdier brukes ugunstig side (høyere temperatur, flere kurser).');
  },
  cases: [
    { name: '2,5 mm² Cu, PVC, 2 belastede, A1', inputs: { loaded: 2, material: 'Cu', ins: 'tp', method: 'A1', temp: '30', n: '1', S: 2.5 }, expect: { Iz: 19.5 }, source: 'IEC 60364-5-52 tabell B.52.2; også i fagartikkel om NEK 400 823.433' },
    { name: '16 mm² Cu, PEX, 3 belastede, C, 40 °C, 3 kurser samlet', inputs: { loaded: 3, material: 'Cu', ins: 'th', method: 'C', temp: '40', n: '3', arr: 1, S: 16, In: '63' }, expect: { Iz: 61.152, Iz0: 96, kT: 0.91, kG: 0.7 }, checks: { 'In ≤ Iz': 'fail' }, source: 'Håndregning: 96 · 0,91 · 0,70 (B.52.5, B.52.14, B.52.17)' },
    { name: '50 mm² Al, PVC, 3 belastede, D2, 22 °C', inputs: { loaded: 3, material: 'Al', ins: 'tp', method: 'D2', temp: '22', S: 50 }, expect: { Iz: 94.05 }, source: 'Håndregning: 99 · 0,95 (25 °C, ugunstig side av 22 °C)' },
    { name: 'E: 2,5 mm² Cu, PVC, 2 belastede, 3 kabler på perforert bro', inputs: { loaded: 2, material: 'Cu', ins: 'tp', method: 'E', temp: '30', arr: 'e-perf', nTray: '3', trays: 1, S: 2.5 }, expect: { Iz0: 30, kG: 0.82, Iz: 24.6 }, source: 'Håndregning: 30 · 0,82 (B.52.10 metode E, B.52.20 perforert bro, 1 bro, 3 kabler)' },
    { name: 'C rett under tak av tre, én kurs: faktor 0,95', inputs: { loaded: 2, material: 'Cu', ins: 'tp', method: 'C', temp: '30', n: '1', arr: 3, S: 10, In: '63' }, expect: { Iz0: 63, kG: 0.95, Iz: 59.85 }, checks: { 'In ≤ Iz': 'fail' }, source: 'B.52.17 rad 3 har 0,95 for én kurs: 63 · 0,95 = 59,85 A (B.52.2 C 10 mm²)' },
    { name: 'Ledertemperatur med 4 kurser i bunt: de andre på full last', inputs: { loaded: 2, material: 'Cu', ins: 'tp', method: 'C', temp: '30', n: '4', arr: 1, S: 2.5, Ib: '2' }, expect: { Iz: 17.55, thetaIb: 53.31948 }, source: 'Håndregning: Iz = 27 · 0,65. θ = 30 + ((1 − 0,65²) + (2/27)²) · 40 = 53,3 °C' },
    { name: 'Direkte i jord: 3 kurser inntil hverandre', inputs: { loaded: 3, material: 'Cu', ins: 'th', method: 'D2', temp: '20', n: '3', gap: 'touching', S: 6 }, expect: { kG: 0.65 }, source: 'B.52.18: 3 kurser, kablene inntil hverandre = 0,65' },
    { name: 'I rør i jord: 4 flerlederkabler med 0,25 m mellom rørene', inputs: { loaded: 3, material: 'Cu', ins: 'th', method: 'D1', temp: '20', n: '4', gap: '0.25m', S: 6 }, expect: { Iz0: 44, kG: 0.8, Iz: 35.2 }, source: 'Håndregning: 44 · 0,80 (B.52.5 D1 6 mm², B.52.19 A, 4 kabler, 0,25 m)' },
    { name: 'Ledertemperatur: 6 mm² Cu, PEX, 3 belastede, i rør i jord, 3 A', inputs: { loaded: 3, material: 'Cu', ins: 'th', method: 'D1', temp: '20', S: 6, Ib: '3' }, expect: { Iz: 44, thetaIb: 20.325413 }, checks: { 'Ib ≤ Iz': 'ok' }, source: 'Håndregning: 20 + (3/44)² · (90 − 20) = 20,33 °C (B.52.5 D1 6 mm² = 44 A)' },
  ],
};

// ---------- Dimensjoner kurs ----------
const STD_I2 = (dev, In) => {
  if (dev !== 'gG') return 1.45;
  if (In <= 4) return 2.1;
  if (In < 16) return 1.9;
  return 1.6;
};

const netOf = (id) => NETWORKS.find((n) => n.id === id) || NETWORKS[0];

export const dimensjoner = {
  id: 'dimensjoner',
  v: 2,
  title: 'Dimensjoner kurs',
  category: 'kabel',
  summary: 'Velger vern og tverrsnitt og sjekker alle fem kravene: Ib ≤ In ≤ Iz, I2, spenningsfall, utkobling og bryteevne.',
  keywords: ['dimensjonering', 'dimensjoner kurs', 'kurs', 'tverrsnitt', 'vern', 'iz', 'i2', 'utkobling', 'bryteevne', 'krav', 'jordfeilbryter', 'ledertemperatur', 'b-automat', 'c-automat', 'maks lengde', ...LAYING_KEYWORDS],
  refs: [
    'NEK 400:2026, 4-43 (433.1, 434 og 435.1), 4-41 (411.4.5), 5-52, 525 og 8-823 (boliger)',
    'IEC 60364-5-52 tillegg B (Iz) – avskrift, kontrolleres mot NEK 400:2026',
  ],
  inputs: [
    { id: 'net', label: 'Nett', type: 'select', default: (s) => s.network, options: NETWORKS.map((n) => ({ value: n.id, label: n.short })) },
    phasesField(),
    voltageField({ default: (s, x) => (x.phases === 3 ? netOf(x.net).U : 230) }),
    { id: 'load', label: 'Last oppgitt som', type: 'select', default: 'I', options: [{ value: 'I', label: 'Strøm (A)' }, { value: 'P', label: 'Effekt (kW)' }] },
    { id: 'Ib', label: 'Belastningsstrøm Ib', type: 'number', unit: 'A', min: 0, minExclusive: true, placeholder: 'f.eks. 13', when: (x) => x.load === 'I' },
    { id: 'P', label: 'Effekt', type: 'number', unit: 'kW', min: 0, minExclusive: true, when: (x) => x.load === 'P' },
    cosphiField(),
    { id: 'L', label: 'Kabellengde', type: 'number', unit: 'm', min: 0, minExclusive: true, placeholder: 'f.eks. 25' },
    ...layingFields((x) => (x.phases === 3 ? 3 : 2)),
    { id: 'dev', label: 'Vern', type: 'select', options: DEVICE_TYPES, default: 'B' },
    {
      id: 'In', label: 'Vernets merkestrøm', type: 'select', dropdown: true, default: 'auto',
      options: (s, x) => [{ value: 'auto', label: 'Velg for meg' }, ...(x.dev === 'gG' ? GG_SIZES : MCB_SIZES).map((a) => ({ value: a, label: `${a} A` }))],
    },
    {
      id: 'S', label: 'Tverrsnitt', type: 'select', dropdown: true, default: 'auto',
      options: (s, x) => [{ value: 'auto', label: 'Velg for meg' }, ...sizeOptions(x.material)],
    },
    { id: 'bolig', label: 'Bolig (strengere krav til I2 for ledere ≤ 4 mm²)', type: 'toggle', default: false },
    { id: 'k2', label: 'Vernets I2 / In', type: 'number', min: 1, max: 2.5, optional: true, advanced: true, help: 'Tomt: 1,45 for automat, 1,6–2,1 for gG. Boligvern finnes med 1,2–1,3.' },
    { id: 'Ik3', label: 'Ik3 maks i fordelingen', type: 'number', unit: 'kA', min: 0, minExclusive: true, optional: true, placeholder: 'valgfritt' },
    { id: 'Ikmin', label: 'Ik min i fordelingen', type: 'number', unit: 'kA', min: 0, minExclusive: true, optional: true, placeholder: 'valgfritt', help: 'TN: Ik1 min fase–PE. IT og TT 230 V: Ik2 min. TT 400 V: Ik1 min fase–N. Fra nettselskapet eller kortslutningskalkulatoren.' },
    { id: 'Icu', label: 'Vernets bryteevne', type: 'number', unit: 'kA', min: 0, minExclusive: true, optional: true, placeholder: 'f.eks. 6' },
    { id: 't', label: 'Krav til utkoblingstid', type: 'select', default: 0.4, options: [{ value: 0.4, label: '0,4 s (sluttkurs)' }, { value: 5, label: '5 s (fordeling)' }], when: (x) => x.dev === 'gG' },
    {
      // Påbudt for hver kurs i boliger (8-823) og det vanlige feilvernet i TT (411.5).
      id: 'rcd', label: 'Jordfeilbryter på kursen', type: 'toggle',
      default: (s, x) => !!x.bolig || netOf(x.net).earthing === 'TT',
      help: (s, x) => {
        const e = netOf(x.net).earthing;
        if (e === 'IT') return 'Jordfeilbryteren kobler ut ved dobbel jordfeil. Uten den må vernet klare det selv, med PE-lederen i feilsløyfen. Påbudt for alle kurser i boliger.';
        if (e === 'TT') return 'I TT er jordfeilbryter det vanlige vernet ved jordfeil (NEK 400 411.5). Vernet må fortsatt beskytte mot kortslutning.';
        return 'TN-S: jordfeilbryteren kobler ut ved jordfeil (fase–PE). Vernet må fortsatt beskytte mot kortslutning. Påbudt for alle kurser i boliger.';
      },
    },
    {
      id: 'thetaMode', label: 'Ledertemperatur i beregningen', type: 'select', dropdown: true, default: 'max',
      options: (s, x) => [
        { value: 'max', label: `Høyeste tillatte (${x.ins === 'th' ? 90 : 70} °C)` },
        { value: 'In', label: 'Ut fra vernets merkestrøm In' },
        { value: 'Ib', label: 'Ut fra belastningsstrømmen Ib' },
      ],
      help: (s, x) => {
        const group = ' Ligger kabelen sammen med andre, regnes det med at de andre går med full last.';
        if (x.thetaMode === 'Ib') return `Bare når lasten er kjent og ikke kan øke, f.eks. utelys. Lavere temperatur gir lavere motstand og høyere Ik min.${group}`;
        if (x.thetaMode === 'In') return `Så varm blir lederen hvis hele In går hele tiden. Et trygt valg når lasten kan endre seg.${group}`;
        return 'Gjelder spenningsfall og Ik min. Høyeste temperatur er det sikreste valget.';
      },
    },
    { id: 'dUup', label: 'Spenningsfall fram til fordelingen', type: 'number', unit: '%', min: 0, max: 20, default: 0, advanced: true },
    { id: 'limit', label: 'Grense for spenningsfall', type: 'number', unit: '%', min: 0.5, max: 20, default: (s) => s.vdLimit ?? 4, advanced: true },
    { id: 'X', label: 'Reaktans', type: 'number', unit: 'Ω/km', min: 0, max: 1, default: (s) => s.reactance ?? 0.08, advanced: true },
    { id: 'cmax', label: 'c maks', type: 'number', min: 1, max: 1.2, default: (s) => s.cmax ?? 1.1, advanced: true },
    { id: 'cmin', label: 'c min', type: 'number', min: 0.8, max: 1, default: (s) => s.cmin ?? 0.95, advanced: true },
    { id: 'cosNet', label: 'cos φk for nettet', type: 'number', min: 0.05, max: 1, default: (s) => s.netCos ?? 0.9, advanced: true },
  ],
  compute(x, ctx) {
    const net = netOf(x.net);
    const phases = x.phases;
    const loaded = phases === 3 ? 3 : 2;
    const thetaMax = x.ins === 'th' ? 90 : 70;
    const Ib = x.load === 'I' ? x.Ib : currentFromActive({ phases, U: x.U, P: x.P, cosphi: x.cosphi }, ctx);
    if (x.load === 'P') ctx.out('Ib', 'Belastningsstrøm Ib', Ib, 'A');

    const sizesIn = x.dev === 'gG' ? GG_SIZES : MCB_SIZES;
    const In = x.In === 'auto' ? sizesIn.find((a) => a >= Ib - 1e-9) : x.In;
    if (In == null) ctx.need('Lasten er større enn det største vernet i lista.');
    const k2 = x.k2 ?? STD_I2(x.dev, In);
    const hasIk = x.Ik3 != null && x.Ikmin != null;
    if (hasIk && x.Ikmin >= x.Ik3) ctx.need('Ik min må være mindre enn Ik3 maks.');
    const trip = tripCurrent(x.dev, In, x.dev === 'gG' ? x.t : 0.4);
    const rcd = !!x.rcd;
    const isMcb = !!MCB_TRIP[x.dev];
    const kind = minFaultKind(net);
    // IT uten jordfeilbryter: vernet må også koble ut dobbel jordfeil, med fase + PE i feilsløyfen (411.6.4).
    const dj = net.earthing === 'IT' && !rcd;
    const devName = x.dev === 'gG' ? `gG ${In} A` : `${x.dev}${In}`;
    const scName = kind === 'Ik2' ? 'fase–fase' : 'fase–N';
    const tripWhen = isMcb ? 'momentan' : `innen ${x.t >= 5 ? '5' : '0,4'} s`;

    // Er Ik min allerede for lav i fordelingen, hjelper verken tverrsnitt eller kortere kabel.
    if (x.S === 'auto' && hasIk && trip && !rcd && x.Ikmin * 1000 < trip.Ia) {
      ctx.need(`Ik min i fordelingen (${formatValue(x.Ikmin * 1000, 'A')}) er allerede lavere enn ${devName} trenger (${formatValue(trip.Ia, 'A')}). Ingen kabel gir utkobling. Velg B-karakteristikk, mindre vern eller jordfeilbryter på kursen.`);
    }

    // Forlegningen kan være umulig uansett tverrsnitt (temperatur eller samlet forlegning utenfor tabellen).
    const layingProblem = izProblem(layParams(x, loaded, null), { ignoreSize: true });
    if (layingProblem) ctx.need(layingProblem);

    // Vurderer ett tverrsnitt. Med ctx = silent brukes den til å finne minste tverrsnitt som holder.
    const evaluate = (S, c) => {
      const iz = izFor(layParams(x, loaded, S), c);
      if (!iz) return null;
      const small = x.bolig && x.material === 'Cu' && S <= 4;
      const I2 = c.step('I2', 'k2·In', { k2, In: v(In, 'A') }, 'A', { text: 'Strøm som sikkert løser ut vernet' });
      const I2lim = small ? iz.Iz : c.step('1,45·Iz', '1,45·Iz', { Iz: v(iz.Iz, 'A') }, 'A');
      const theta = x.thetaMode === 'max' ? thetaMax
        : conductorTemp({ I: x.thetaMode === 'In' ? In : Ib, Iz: iz.Iz, kG: iz.kG.factor, ambient: x.temp, thetaMax }, c);
      const R = resistanceAt({ material: x.material, S, theta }, c);
      const { pct } = voltageDrop({ phases, U: x.U, I: Ib, L: x.L, R, X: x.X, cosphi: x.cosphi }, c);
      const total = c.step('ΔU totalt', 'ΔUkurs + ΔUfør', { ΔUkurs: v(pct, '%'), ΔUfør: v(x.dUup, '%') }, '%', { text: 'Kursen pluss spenningsfallet fram til fordelingen' });
      let ik = null;
      let ikdj = null;
      let Lik = null;
      if (hasIk) {
        const sc = shortCircuit({
          network: net, Ik3: x.Ik3, Ikmin: x.Ikmin, segments: [{ L: x.L, material: x.material, S, Spe: S }],
          cmax: x.cmax, cmin: x.cmin, theta, X: x.X, cosNet: x.cosNet, doubleEarthFault: dj,
        }, c);
        ik = sc.points[1].ikmin * 1000;
        if (dj) ikdj = sc.points[1].ikdj * 1000;
        if (trip) Lik = maxLengthForIk({ network: net, Ikmin: x.Ikmin, material: x.material, S, cmin: x.cmin, theta, X: x.X, doubleEarthFault: dj }, trip.Ia);
      }
      // Strømmen som må koble ut vernet: dobbel jordfeil i IT uten jordfeilbryter, ellers Ik min.
      const ikFault = dj ? ikdj : ik;
      const overload = Ib <= In && In <= iz.Iz && I2 <= I2lim;
      // Med jordfeilbryter dekkes kortslutning av 435.1 når vernet beskytter mot overbelastning.
      const tripOk = ikFault == null || !trip || ikFault >= trip.Ia || rcd;
      const ok = overload && total <= x.limit && tripOk;
      return { S, iz, I2, I2lim, small, theta, pct, total, ik, ikdj, ikFault, Lik, overload, ok };
    };

    let S = x.S;
    if (S === 'auto') {
      S = null;
      for (const cand of sizesFor(x.material)) {
        const r = evaluate(cand, silent);
        if (r && r.ok) { S = cand; break; }
      }
      if (S == null) ctx.need('Fant ikke tverrsnitt som holder alle kravene. Prøv annet vern, kortere kabel, annen forlegning eller del opp lasten.');
    }
    const r = evaluate(S, ctx);
    if (!r) ctx.need(izProblem(layParams(x, loaded, S)) || 'Tabellen har ingen verdi for denne kombinasjonen.');

    ctx.out('S', 'Tverrsnitt', S, 'mm²', { primary: true, note: x.S === 'auto' ? 'minste som holder' : 'valgt' });
    ctx.out('In', 'Vern', In, 'A', { primary: true, note: `${x.dev}${x.In === 'auto' ? ', valgt for deg' : ''}` });
    ctx.out('Iz', 'Strømføringsevne Iz', r.iz.Iz, 'A');
    ctx.out('dU', 'Spenningsfall totalt', r.total, '%');
    if (x.thetaMode !== 'max') ctx.out('theta', 'Ledertemperatur', r.theta, '°C', { note: x.thetaMode === 'Ib' ? 'ved Ib' : 'ved In' });
    if (trip) ctx.out('Ia', 'Utløsestrøm for vernet', trip.Ia, 'A', { note: trip.basis });
    if (r.ik != null) ctx.out('ik', `${kind} min ved enden`, r.ik, 'A');
    if (r.ikdj != null) ctx.out('ikdj', 'Dobbel jordfeil ved enden', r.ikdj, 'A', { note: 'fase + PE' });
    if (r.Lik != null) ctx.out('Lik', 'Lengste kabel med utkobling', r.Lik, 'm', { note: dj ? `${devName}, dobbel jordfeil` : devName });

    ctx.check('1. Ib ≤ In ≤ Iz', Ib <= In && In <= r.iz.Iz ? 'ok' : 'fail', `${formatValue(Ib, 'A')} ≤ ${formatValue(In, 'A')} ≤ ${formatValue(r.iz.Iz, 'A', { sig: 3 })}`);
    ctx.le(`2. I2 ≤ ${r.small ? 'Iz (bolig, ≤ 4 mm²)' : '1,45 · Iz'}`, r.I2, r.I2lim, 'A');
    ctx.le('3. Spenningsfall', r.total, x.limit, '%');

    const fmtA = (a) => formatValue(a, 'A');
    const needText = trip ? `${devName} trenger minst ${fmtA(trip.Ia)} ved enden av kabelen (${trip.basis}).` : '';
    const notChecked = trip ? `Ikke kontrollert. ${needText} Fyll inn Ik3 maks og Ik min i fordelingen.` : 'Fant ikke utløsestrømmen for vernet.';
    // Tid lederen tåler ved strømmen I (k²S²/I²). Formelen gjelder opp til 5 s (434.5.2).
    const thermalNote = (I) => {
      if (I <= r.iz.Iz) {
        ctx.note(`Ik min (${fmtA(I)}) er lavere enn Iz, så lederen tåler den varig.`);
        return;
      }
      const k = K_VALUES[`${x.material}-${x.ins}`];
      const t = ctx.step('t tillatt', '(k·S/Ikmin)²', { k, S: v(S, 'mm²'), Ikmin: v(I, 'A') }, 's', { text: 'Tid lederen tåler ved Ik min (gjelder opp til 5 s)' });
      ctx.note(t > 5
        ? `Lederen tåler Ik min (${fmtA(I)}) i over 5 s. Sjekk i produsentens kurve at vernet løser ut innen rimelig tid.`
        : `Lederen tåler Ik min i ${formatValue(t, 's', { sig: 2 })}. Sjekk i produsentens kurve at vernet løser ut raskere ved ${fmtA(I)}.`);
    };

    if (rcd) {
      const how = net.earthing === 'TT'
        ? 'Jordfeilbryteren kobler ut ved jordfeil (NEK 400 411.5). Kontroller at RA · IΔn ≤ 50 V (kalkulatoren for jordelektrode).'
        : net.earthing === 'IT'
          ? 'Jordfeilbryterne kobler ut ved dobbel jordfeil (NEK 400 411.6.4). Påbudt for hver kurs i boliger (8-823).'
          : 'Jordfeilbryteren kobler ut ved jordfeil fase–PE (NEK 400 411.4.5). Gjelder TN-S med egen PE-leder.';
      ctx.check('4. Jordfeil (jordfeilbryter)', 'ok', how);
      if (r.ik == null || !trip) {
        ctx.check(`4b. Kortslutning ${scName}`, 'info', notChecked);
      } else if (r.ik >= trip.Ia) {
        ctx.ge(`4b. Kortslutning ${scName} (${tripWhen})`, r.ik, trip.Ia, 'A', { detail: trip.basis });
      } else {
        const icuKnown = x.Icu != null && x.Ik3 != null;
        const ok = r.overload && (!icuKnown || x.Icu >= x.Ik3);
        const icuText = icuKnown ? ' og har nok bryteevne' : ', forutsatt at bryteevnen er minst Ik3 maks (krav 5)';
        const noTrip = r.ik < (isMcb ? 1.13 : 1) * In;
        let detail;
        if (!ok) detail = `Ik min ${fmtA(r.ik)} er under ${fmtA(trip.Ia)}. Da må vernet beskytte mot overbelastning (krav 1 og 2) og ha nok bryteevne (krav 5), og det er ikke oppfylt.`;
        else if (noTrip) detail = `Ik min ${fmtA(r.ik)} er så lav at vernet ikke løser ut som ved kortslutning. Strømmen ligger i overlastområdet, som krav 1 og 2 dekker. Godkjent etter 435.1 fordi vernet beskytter mot overbelastning${icuText}.`;
        else detail = `Ik min ${fmtA(r.ik)} er under ${fmtA(trip.Ia)}, så ${isMcb ? 'automaten løser ut på overlastdelen' : 'sikringen smelter'} etter lengre tid. Godkjent etter 435.1 fordi vernet beskytter mot overbelastning (krav 1 og 2)${icuText}.`;
        ctx.check(`4b. Kortslutning ${scName} (435.1)`, ok ? 'ok' : 'fail', detail);
        if (ok) thermalNote(r.ik);
      }
    } else if (dj) {
      if (r.ikdj != null && trip) ctx.ge('4. Utkobling ved dobbel jordfeil', r.ikdj, trip.Ia, 'A', { detail: `${trip.basis}. Fase + PE i to like kurser (NEK 400 411.6.4)` });
      else ctx.check('4. Utkobling ved dobbel jordfeil', 'info', notChecked);
      ctx.note('IT uten jordfeilbryter: ved dobbel jordfeil går strømmen gjennom fase og PE i to kurser. Det gir lavere strøm enn kortslutning fase–fase. Med jordfeilbryter på kursene (påbudt i boliger) kobler den ut i stedet.');
    } else {
      if (r.ik != null && trip) ctx.ge('4. Utkobling ved Ik min', r.ik, trip.Ia, 'A', { detail: trip.basis });
      else ctx.check('4. Utkobling ved Ik min', 'info', notChecked);
      if (net.earthing === 'TT') ctx.warn('I TT gir overstrømsvernet normalt ikke utkobling ved jordfeil, fordi feilstrømmen går gjennom jordelektrodene. Bruk jordfeilbryter (NEK 400 411.5).');
    }
    if (!hasIk && isMcb) {
      ctx.warn('Utkobling ved kortslutning er ikke kontrollert. Uten Ik gir B, C og D samme svar her, men C trenger dobbelt så høy kortslutningsstrøm ved enden som B, og D fire ganger så høy.');
    }

    if (x.Icu != null && x.Ik3 != null) ctx.le('5. Bryteevne', x.Ik3, x.Icu, 'kA');
    else ctx.check('5. Bryteevne og termisk', 'info', 'Fyll inn Ik3 maks og vernets bryteevne. For automater: kontroller gjennomslupen I²t mot kabelens k²S² hos produsenten.');
    if (x.dev === 'gG' && r.ikFault != null && trip) {
      if (r.ikFault >= trip.Ia) {
        const k = K_VALUES[`${x.material}-${x.ins}`];
        const tAllowed = ctx.step('t tillatt', '(k·S/Ikmin)²', { k, S: v(S, 'mm²'), Ikmin: v(r.ikFault, 'A') }, 's', { text: 'Tid lederen tåler ved Ik min' });
        ctx.ge('5b. Termisk ved Ik min (gG)', tAllowed, x.t, 's');
      } else {
        ctx.check('5b. Termisk ved Ik min (gG)', 'info', `Ik min er under ${fmtA(trip.Ia)}, så sikringen bruker mer enn ${x.t >= 5 ? '5' : '0,4'} s. Se sikringens tid/strøm-kurve.`);
      }
    }
    if (r.small) ctx.note('Bolig, ledere ≤ 4 mm²: I2 ≤ Iz (NEK 400-8-823). Vanlige automater har I2 = 1,45 · In; boligvern med I2 = 1,2–1,3 · In finnes.');
    if (x.thetaMode === 'Ib') ctx.note('Ledertemperaturen er regnet ut fra Ib. Øker lasten senere, blir Ik min lavere og spenningsfallet større.');
    if (x.thetaMode !== 'max' && r.iz.kG.factor < 1) ctx.assume('Ledertemperaturen er regnet med at de andre kursene i gruppen går med full last.');
    layingNotes(x, r.iz, ctx);
    unverified(ctx, tablesUsed(layParams(x, loaded, S)));
    const thetaText = formatValue(r.theta, '°C', { sig: 3 });
    ctx.assume(`Iz etter IEC 60364-5-52 / NEK 400-5-52. Spenningsfall og Ik min med ledertemperatur ${thetaText}. N og PE med samme tverrsnitt som fase.`);
  },
  cases: [
    {
      name: 'Enkel kurs: 13 A, 20 m, A1',
      inputs: { net: 'IT230', phases: 1, U: '230', load: 'I', Ib: '13', cosphi: '1', L: '20', material: 'Cu', ins: 'tp', method: 'A1', temp: '30', n: '1', dev: 'B', In: 'auto', S: 'auto', bolig: false, dUup: '0', limit: '4' },
      expect: { S: 1.5, In: 13, Iz: 14.5, dU: 3.273050 },
      checks: { '1. Ib ≤ In ≤ Iz': 'ok', '2. I2 ≤ 1,45 · Iz': 'ok', '3. Spenningsfall': 'ok', '4. Utkobling ved dobbel jordfeil': 'info' },
      source: 'Håndregning: Iz 1,5 mm² A1 = 14,5 A; ΔU = 2·13·20·14,478/1000/230',
    },
    {
      name: 'Bolig 16 A, A1: vanlig automat gir 4 mm²',
      inputs: { net: 'TN400', phases: 1, U: '230', load: 'I', Ib: '16', cosphi: '1', L: '15', material: 'Cu', ins: 'tp', method: 'A1', temp: '30', n: '1', dev: 'B', In: 16, S: 'auto', bolig: true, dUup: '0', limit: '4' },
      expect: { S: 4, Iz: 26 },
      checks: { '2. I2 ≤ Iz (bolig, ≤ 4 mm²)': 'ok' },
      source: 'NEK 400 823.433.1: I2 = 23,2 A > Iz 19,5 A for 2,5 mm², 4 mm² gir Iz 26 A',
    },
    {
      name: 'Bolig 16 A med boligvern (I2 = 1,2 · In) gir 2,5 mm²',
      inputs: { net: 'TN400', phases: 1, U: '230', load: 'I', Ib: '16', cosphi: '1', L: '15', material: 'Cu', ins: 'tp', method: 'A1', temp: '30', n: '1', dev: 'B', In: 16, k2: '1,2', S: 'auto', bolig: true, dUup: '0', limit: '4' },
      expect: { S: 2.5, Iz: 19.5 },
      checks: { '2. I2 ≤ Iz (bolig, ≤ 4 mm²)': 'border' },
      source: 'Fagartikkel om 823.433: 16 A med I2 = 19,2 A ≤ 19,5 A',
    },
    {
      name: 'Med kortslutning: TN, 10 A, 30 m, C10',
      inputs: { net: 'TN400', phases: 1, U: '230', load: 'I', Ib: '10', cosphi: '1', L: '30', material: 'Cu', ins: 'tp', method: 'A1', temp: '30', n: '1', dev: 'C', In: 'auto', S: 'auto', bolig: false, Ik3: '6', Ikmin: '0,6', Icu: '10', dUup: '0', limit: '4', X: '0,08', cmax: '1,1', cmin: '0,95', cosNet: '0,9' },
      expect: { S: 1.5, In: 10, Ia: 100, ik: [177.231, 0.0005], Lik: 62.88332 },
      checks: { '4. Utkobling ved Ik min': 'ok', '5. Bryteevne': 'ok' },
      source: 'Håndregning: Zsn = 364,17 mΩ, Zs1 = 868,67 mΩ, Ik1 = 218,5/1232,84 = 177,2 A ≥ 100 A. Lengste kabel: (2185 − 364,17)/28,956 = 62,9 m',
    },
    {
      name: 'Samme kurs med B10: dobbelt så lang kabel før utkoblingen svikter',
      inputs: { net: 'TN400', phases: 1, U: '230', load: 'I', Ib: '10', cosphi: '1', L: '30', material: 'Cu', ins: 'tp', method: 'A1', temp: '30', n: '1', dev: 'B', In: 'auto', S: 1.5, bolig: false, Ik3: '6', Ikmin: '0,6', Icu: '10', dUup: '0', limit: '4', X: '0,08', cmax: '1,1', cmin: '0,95', cosNet: '0,9' },
      expect: { Ia: 50, Lik: 138.3433 },
      checks: { '4. Utkobling ved Ik min': 'ok' },
      source: 'Håndregning: (0,95·230/0,05 − 364,17)/28,956 = 138,3 m',
    },
    {
      name: 'Utelys TN: 5G6 PEX i rør i jord, 130 m, C16, Ik1 min 0,56 kA, 90 °C: utkobling svikter',
      inputs: { net: 'TN400', phases: 3, U: '400', load: 'I', Ib: '3', cosphi: '1', L: '130', material: 'Cu', ins: 'th', method: 'D1', temp: '20', dev: 'C', In: 16, S: 6, bolig: false, Ik3: '2', Ikmin: '0,56', Icu: '6', thetaMode: 'max', dUup: '0', limit: '4', X: '0,08', cmax: '1,1', cmin: '0,95', cosNet: '0,9' },
      expect: { ik: 154.8009, Lik: 124.1619 },
      checks: { '4. Utkobling ved Ik min': 'fail' },
      source: 'Håndregning: Zsn = 390,18 mΩ, Zs = √(1021,10² + 20,8²) = 1021,31 mΩ, Ik1 = 218,5/1411,49 = 154,8 A < 160 A',
    },
    {
      name: 'Samme utelys med ledertemperatur ut fra Ib (3 A): utkobling holder',
      inputs: { net: 'TN400', phases: 3, U: '400', load: 'I', Ib: '3', cosphi: '1', L: '130', material: 'Cu', ins: 'th', method: 'D1', temp: '20', dev: 'C', In: 16, S: 6, bolig: false, Ik3: '2', Ikmin: '0,56', Icu: '6', thetaMode: 'Ib', dUup: '0', limit: '4', X: '0,08', cmax: '1,1', cmin: '0,95', cosNet: '0,9' },
      expect: { theta: 20.325413, ik: 183.2635 },
      checks: { '4. Utkobling ved Ik min': 'ok' },
      source: 'Håndregning: θ = 20 + (3/44)²·70 = 20,33 °C, Zs = 802,09 mΩ, Ik1 = 218,5/1192,27 = 183,3 A ≥ 160 A',
    },
    {
      name: 'IT uten jordfeilbryter: dobbel jordfeil med PE i sløyfen',
      inputs: { net: 'IT230', phases: 1, U: '230', load: 'I', Ib: '10', cosphi: '1', L: '30', material: 'Cu', ins: 'tp', method: 'A1', temp: '30', dev: 'C', In: 10, S: 1.5, bolig: false, rcd: false, Ik3: '3', Ikmin: '1,5', Icu: '6', dUup: '0', limit: '4', X: '0,08', cmax: '1,1', cmin: '0,95', cosNet: '0,9' },
      expect: { ik: 215.4112, ikdj: 116.0375, Lik: 35.21466 },
      checks: { '4. Utkobling ved dobbel jordfeil': 'ok' },
      source: 'Håndregning: Znmin = 72,83 mΩ. Ik2 = 218,5/(2·(72,83 + 30·14,478)) = 215,4 A. Dobbel jordfeil: 218,5/(2·(72,83 + 30·28,956)) = 116,0 A ≥ 100 A (NEK 400 411.6.4)',
    },
    {
      name: 'Samme IT-kurs med jordfeilbryter: kortslutning fase–fase kobler ut momentant',
      inputs: { net: 'IT230', phases: 1, U: '230', load: 'I', Ib: '10', cosphi: '1', L: '30', material: 'Cu', ins: 'tp', method: 'A1', temp: '30', dev: 'C', In: 10, S: 1.5, bolig: false, rcd: true, Ik3: '3', Ikmin: '1,5', Icu: '6', dUup: '0', limit: '4', X: '0,08', cmax: '1,1', cmin: '0,95', cosNet: '0,9' },
      expect: { ik: 215.4112, Lik: 70.42932 },
      checks: { '4. Jordfeil (jordfeilbryter)': 'ok', '4b. Kortslutning fase–fase (momentan)': 'ok' },
      source: 'Håndregning: Ik2 = 215,4 A ≥ 100 A. Lengste kabel: (1092,5 − 72,83)/14,478 = 70,4 m',
    },
    {
      name: 'Jordfeilbryter, men vernet er for stort for kabelen: 4b underkjennes',
      inputs: { net: 'TN400', phases: 1, U: '230', load: 'I', Ib: '10', cosphi: '1', L: '100', material: 'Cu', ins: 'tp', method: 'A1', temp: '30', dev: 'C', In: 25, S: 2.5, bolig: false, rcd: true, Ik3: '6', Ikmin: '0,6', Icu: '6', dUup: '0', limit: '10', X: '0,08', cmax: '1,1', cmin: '0,95', cosNet: '0,9' },
      expect: { ik: 102.2245 },
      checks: { '1. Ib ≤ In ≤ Iz': 'fail', '4b. Kortslutning fase–N (435.1)': 'fail' },
      source: 'Håndregning: Ik1 = 218,5/(364,17 + 100·17,733) = 102,2 A < 250 A, og 25 A > Iz 19,5 A, så 435.1 gjelder ikke',
    },
    {
      name: 'Utelys i TT 400 V: jordfeilbryter er standard, kortslutning etter 435.1',
      inputs: { net: 'TT400', phases: 3, U: '400', load: 'I', Ib: '3', cosphi: '1', L: '130', material: 'Cu', ins: 'th', method: 'D1', temp: '20', dev: 'C', In: 16, S: 6, bolig: false, Ik3: '2', Ikmin: '0,56', Icu: '6', thetaMode: 'max', dUup: '0', limit: '4', X: '0,08', cmax: '1,1', cmin: '0,95', cosNet: '0,9' },
      expect: { ik: 154.8009 },
      checks: { '4. Jordfeil (jordfeilbryter)': 'ok', '4b. Kortslutning fase–N (435.1)': 'ok' },
      source: 'NEK 400 411.5 og 435.1. Ik1 fase–N regnes som i TN-eksemplet: 154,8 A',
    },
    {
      name: 'Samme utelys ved 90 °C med jordfeilbryter: jordfeil ved bryteren, kortslutning etter 435.1',
      inputs: { net: 'TN400', phases: 3, U: '400', load: 'I', Ib: '3', cosphi: '1', L: '130', material: 'Cu', ins: 'th', method: 'D1', temp: '20', dev: 'C', In: 16, S: 6, bolig: false, Ik3: '2', Ikmin: '0,56', Icu: '6', rcd: true, thetaMode: 'max', dUup: '0', limit: '4', X: '0,08', cmax: '1,1', cmin: '0,95', cosNet: '0,9' },
      expect: { ik: 154.8009 },
      checks: { '1. Ib ≤ In ≤ Iz': 'ok', '4. Jordfeil (jordfeilbryter)': 'ok', '4b. Kortslutning fase–N (435.1)': 'ok', '5. Bryteevne': 'ok' },
      source: 'NEK 400 411.4.5 og 435.1: 3 A ≤ 16 A ≤ 44 A, I2 = 23,2 A ≤ 63,8 A, bryteevne 6 kA ≥ 2 kA',
    },
  ],
};
