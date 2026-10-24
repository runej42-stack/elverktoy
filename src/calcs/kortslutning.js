import { v } from '../core/engine.js';
import { formatValue } from '../core/number.js';
import { NETWORKS } from '../core/settings.js';
import { shortCircuit, minFaultKind } from '../lib/kortslutning.js';
import { DEVICE_TYPES, MCB_SIZES, GG_SIZES, tripCurrent, GG_SOURCE } from '../data/vern.js';
import { MATERIAL_OPTIONS, sizeOptions } from './fields.js';

const netOf = (x) => NETWORKS.find((n) => n.id === x.net) || NETWORKS[0];

function segmentFields(i) {
  const on = (x) => x.segs >= i;
  return [
    { id: `L${i}`, label: `Avsnitt ${i}: lengde`, type: 'number', unit: 'm', min: 0, minExclusive: true, placeholder: i === 1 ? 'f.eks. 25' : '', when: on },
    { id: `mat${i}`, label: `Avsnitt ${i}: materiale`, type: 'select', options: MATERIAL_OPTIONS, default: (s) => s.material || 'Cu', when: on },
    {
      id: `S${i}`, label: `Avsnitt ${i}: tverrsnitt fase`, type: 'select', dropdown: true,
      options: (s, x) => sizeOptions(x[`mat${i}`]), default: (s, x) => (x[`mat${i}`] === 'Al' ? 50 : i === 1 && x.segs > 1 ? 16 : 2.5), when: on,
    },
    {
      id: `Spe${i}`, label: `Avsnitt ${i}: tverrsnitt PE`, type: 'select', dropdown: true,
      options: (s, x) => sizeOptions(x[`mat${i}`]), default: (s, x) => x[`S${i}`],
      when: (x) => on(x) && netOf(x).neutral,
    },
  ];
}

export const calc = {
  id: 'kortslutning',
  v: 1,
  title: 'Kortslutning',
  category: 'vern',
  summary: 'Ik maks og Ik min gjennom inntil tre kabelavsnitt, med kontroll av utkobling og bryteevne.',
  keywords: ['kortslutning', 'ik', 'ik3', 'ik2', 'ik1', 'ikmin', 'ikmaks', 'kortslutningsstrøm', 'utkobling', 'bryteevne', 'sløyfeimpedans', 'zs'],
  refs: [
    'CENELEC TR 50480 / NEK EN 60909 (beregningsmetode, som FEBDOK bygger på)',
    'NEK 400:2026, 4-41 (automatisk utkobling) og 4-43 (kortslutningsvern)',
    'NELFO: c_maks 1,1, c_min 0,95, ledertemperatur 70 °C (× 1,2) for Ik min',
  ],
  inputs: [
    {
      id: 'net', label: 'Nett', type: 'select', default: (s) => s.network,
      options: NETWORKS.map((n) => ({ value: n.id, label: n.short })),
    },
    { id: 'Ik3', label: 'Ik3 maks ved inntaket', type: 'number', unit: 'kA', min: 0, minExclusive: true, max: 100, placeholder: 'fra nettselskapet', help: 'Oppgis av nettselskapet (f.eks. i Elsmart).' },
    {
      id: 'Ikmin', label: 'Ik min ved inntaket', type: 'number', unit: 'kA', min: 0, minExclusive: true, max: 100, placeholder: 'fra nettselskapet',
      help: (s, x) => (minFaultKind(netOf(x)) === 'Ik2'
        ? 'Ik2 min: minste topolede kortslutningsstrøm.'
        : `Ik1 min: minste enpolede feilstrøm fase–${netOf(x).earthing === 'TT' ? 'N' : 'PE'}.`),
    },
    {
      id: 'segs', label: 'Antall kabelavsnitt', type: 'select', default: 1,
      options: [{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }],
      help: 'F.eks. inntak → hovedfordeling → underfordeling → kurs. Vernet sitter i starten av siste avsnitt.',
    },
    ...segmentFields(1), ...segmentFields(2), ...segmentFields(3),
    { id: 'dev', label: 'Vern for siste avsnitt', type: 'select', dropdown: true, options: [{ value: 'none', label: 'Ikke kontroller vern' }, ...DEVICE_TYPES], default: 'C' },
    {
      id: 'In', label: 'Vernets merkestrøm', type: 'select', dropdown: true,
      options: (s, x) => (x.dev === 'gG' ? GG_SIZES : MCB_SIZES).map((a) => ({ value: a, label: `${a} A` })), default: 16,
      when: (x) => x.dev !== 'none',
    },
    {
      id: 't', label: 'Krav til utkoblingstid', type: 'select', default: 0.4,
      options: [{ value: 0.4, label: '0,4 s (sluttkurs)' }, { value: 5, label: '5 s (fordeling)' }],
      when: (x) => x.dev === 'gG',
    },
    { id: 'Icu', label: 'Vernets bryteevne (valgfritt)', type: 'number', unit: 'kA', optional: true, min: 0, minExclusive: true, when: (x) => x.dev !== 'none', help: 'Kontrolleres mot Ik3 maks der vernet sitter.' },
    { id: 'theta', label: 'Ledertemperatur ved Ik min', type: 'select', default: (s) => s.conductorTemp || 70, advanced: true, options: [{ value: 70, label: '70 °C' }, { value: 90, label: '90 °C' }], help: '70 °C gir R ≈ 1,2 · R₂₀, 90 °C gir R ≈ 1,28 · R₂₀.' },
    { id: 'X', label: 'Reaktans per leder', type: 'number', unit: 'Ω/km', min: 0, max: 1, default: (s) => s.reactance ?? 0.08, advanced: true },
    { id: 'cmax', label: 'Spenningsfaktor c maks', type: 'number', min: 1, max: 1.2, default: (s) => s.cmax ?? 1.1, advanced: true, help: '1,05 ved ±6 % spenningstoleranse, 1,10 ved ±10 % (IEC 60909).' },
    { id: 'cmin', label: 'Spenningsfaktor c min', type: 'number', min: 0.8, max: 1, default: (s) => s.cmin ?? 0.95, advanced: true },
    { id: 'cosNet', label: 'cos φk for nettet', type: 'number', min: 0.05, max: 1, default: (s) => s.netCos ?? 0.9, advanced: true, help: 'Fordeler nettimpedansen på R og X ved Ik maks. Brukes bare når nettselskapet ikke oppgir R og X.' },
  ],
  compute(x, ctx) {
    const network = netOf(x);
    if (x.Ikmin >= x.Ik3) ctx.need('Ik min må være mindre enn Ik3 maks.');
    const segments = [];
    for (let i = 1; i <= x.segs; i++) {
      segments.push({ L: x[`L${i}`], material: x[`mat${i}`], S: x[`S${i}`], Spe: x[`Spe${i}`] });
    }
    const { points, kind } = shortCircuit({
      network, Ik3: x.Ik3, Ikmin: x.Ikmin, segments,
      cmax: x.cmax, cmin: x.cmin, theta: x.theta, X: x.X, cosNet: x.cosNet,
    }, ctx);
    const end = points[points.length - 1];
    const atDevice = points[points.length - 2];
    const minLabel = kind === 'Ik2' ? 'Ik2 min' : 'Ik1 min';
    ctx.out('ik3', 'Ik3 maks ved enden', end.ik3, 'kA', { primary: true });
    ctx.out('ikmin', `${minLabel} ved enden`, end.ikmin, 'kA', { primary: true });
    ctx.out('ikminA', `${minLabel} ved enden, i ampere`, end.ikmin * 1000, 'A');
    if (points.length > 2) {
      points.slice(1, -1).forEach((pt, i) => {
        ctx.out(`ik3_${i + 1}`, `Ik3 maks etter avsnitt ${i + 1}`, pt.ik3, 'kA');
        ctx.out(`ikmin_${i + 1}`, `${minLabel} etter avsnitt ${i + 1}`, pt.ikmin, 'kA');
      });
    }

    if (x.dev !== 'none') {
      const trip = tripCurrent(x.dev, x.In, x.dev === 'gG' ? x.t : 0.4);
      if (!trip) {
        ctx.warn(`Fant ikke utløsestrøm for ${x.dev} ${x.In} A ved ${formatValue(x.t, 's')}. Bruk produsentens kurve.`);
      } else {
        const Ia = ctx.step('Ia', 'k·In', { k: trip.Ia / x.In, In: v(x.In, 'A') }, 'A', { text: `Strøm som gir utkobling: ${trip.basis}` });
        ctx.ge('Utkobling ved Ik min', end.ikmin * 1000, Ia, 'A', { detail: `${minLabel} ved enden av kursen mot utløsestrømmen.` });
        if (x.dev === 'gG') ctx.assume(`gG-verdier: ${GG_SOURCE.source}`);
      }
      if (x.Icu != null) ctx.le('Bryteevne', atDevice.ik3, x.Icu, 'kA', { detail: 'Ik3 maks der vernet sitter mot vernets bryteevne.' });
    }

    ctx.assume(`c maks = ${formatValue(x.cmax, '')}, c min = ${formatValue(x.cmin, '')}.`);
    ctx.assume(`Ik maks med ledere ved 20 °C. Ik min med ledere ved ${x.theta} °C.`);
    ctx.assume(`Nettimpedansen er delt med cos φk = ${formatValue(x.cosNet, '')} for Ik maks. For Ik min er impedansene lagt sammen aritmetisk (konservativt).`);
    if (kind === 'Ik2') ctx.assume('IT/TT 230 V: minste kortslutning er topolet (fase–fase).');
    else ctx.assume(`Minste feil er enpolet fase–${network.earthing === 'TT' ? 'N' : 'PE'}. Sløyfens reaktans er regnet som 2 · X.`);
    if (network.earthing === 'TT') ctx.note('I TT-nett kobles jordfeil normalt ut av jordfeilbryter. Kontroller RA · IΔn ≤ 50 V.');
    if (network.earthing === 'IT') ctx.note('Ved dobbel jordfeil i to kurser kommer PE med i sløyfen, og strømmen blir lavere enn Ik2 (NEK 400 411.6.4). «Dimensjoner kurs» og «Maks kabellengde» regner den når kursen ikke har jordfeilbryter.');
  },
  cases: [
    {
      name: 'IT 230 V, 30 m 2,5 mm², C16',
      inputs: { net: 'IT230', Ik3: '3', Ikmin: '1,5', segs: 1, L1: '30', mat1: 'Cu', S1: 2.5, dev: 'C', In: 16, theta: 70, X: '0,08', cmax: '1,1', cmin: '0,95', cosNet: '0,9' },
      expect: { ik3: 0.546734, ikmin: 0.3224369 },
      checks: { 'Utkobling ved Ik min': 'ok' },
      source: 'Håndregning: Zn = 72,83 mΩ, Z1 = 266,0 mΩ, Ik2 = 218,5/(2·338,83)',
    },
    {
      name: 'TN 400 V, 20 m 16 mm² + 25 m 2,5 mm², B16, Icu 6 kA',
      inputs: { net: 'TN400', Ik3: '10', Ikmin: '2', segs: 2, L1: '20', mat1: 'Cu', S1: 16, Spe1: 16, L2: '25', mat2: 'Cu', S2: 2.5, Spe2: 2.5, dev: 'B', In: 16, Icu: '6', theta: 70, X: '0,08', cmax: '1,1', cmin: '0,95', cosNet: '0,9' },
      expect: { ik3: 1.096971, ikmin: 0.359551, ik3_1: 5.338816 },
      checks: { 'Utkobling ved Ik min': 'ok', Bryteevne: 'ok' },
      source: 'Håndregning: Zsn = 109,25 mΩ, Zs1 = 55,13 mΩ, Zs2 = 443,32 mΩ, Ik1 = 218,5/607,70',
    },
    {
      name: 'HiØ-eksempel: IT 230 V, 50 m 3x50 Al + 40 m 3x1,5 Cu',
      inputs: { net: 'IT230', Ik3: '10', Ikmin: '2,5', segs: 2, L1: '50', mat1: 'Al', S1: 50, L2: '40', mat2: 'Cu', S2: 1.5, dev: 'none', theta: 70, X: '0,08', cmax: '1,05', cmin: '0,95', cosNet: '0,9' },
      expect: { ik3_1: [3.05, 0.01], ikmin: [0.1656, 0.01] },
      source: 'Høgskolen i Østfold, TELE2005 øving 3, løsningsforslag oppg. 1.2–1.3: Ik2 = 165,6 A, Ik3 = 3,05 kA',
    },
    {
      name: 'IT 230 V, lang kurs, gG 16 A, 0,4 s',
      inputs: { net: 'IT230', Ik3: '3', Ikmin: '1,5', segs: 1, L1: '120', mat1: 'Cu', S1: 2.5, dev: 'gG', In: 16, t: 0.4, theta: 70, X: '0,08', cmax: '1,1', cmin: '0,95', cosNet: '0,9' },
      expect: { ikmin: 0.0961028 },
      checks: { 'Utkobling ved Ik min': 'fail' },
      source: 'Håndregning: Z1 = 1064,0 mΩ, Ik2 = 218,5/(2·1136,8) = 96 A < 107 A (gG 16 A, 0,4 s)',
    },
  ],
};
