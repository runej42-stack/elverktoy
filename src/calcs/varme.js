// Varmekalkulatorene: velg varmekabel, c/c, snøsmelting, frostsikring, takrenne,
// kontrollmåling av varmekabel og oppvarming av vann.

import { v } from '../core/engine.js';
import { formatValue } from '../core/number.js';

// Veiledende effekt per rom/gulv (W/m²), normalt område og maks, fra Nexans Varmehåndboka 2026.
// Produsentens anvisning og gulvleverandørens grense går foran.
export const ROOMS = [
  { value: 'bad', label: 'Bad, WC, vaskerom', p: 130, max: 160, range: '120–150 W/m², maks 160' },
  { value: 'entre', label: 'Entré, vindfang', p: 130, max: 160, range: '120–150 W/m², maks 160' },
  { value: 'gang', label: 'Gang, korridor', p: 90, max: 160, range: '80–100 W/m², maks 160' },
  { value: 'stue', label: 'Stue, kjøkken, soverom', p: 80, max: 100, range: '70–100 W/m², maks 100' },
  { value: 'kontor', label: 'Kontor, butikk', p: 90, max: 100, range: '80–100 W/m², maks 100' },
  { value: 'nybygg', label: 'Godt isolert nybygg', p: 60, max: 80, range: '40–80 W/m²' },
  { value: 'tre', label: 'Parkett eller laminat', p: 60, max: 60, range: 'maks 60 W/m² (80 bare om gulvleverandøren tillater det)' },
  { value: 'bjelkelag', label: 'Trebjelkelag', p: 60, max: 80, range: 'maks 80 W/m² med kabel på maks 10 W/m; over 25 mm gulv + belegg: maks 60 W/m² og under 8 W/m' },
  { value: 'vinyl', label: 'Vinyl, linoleum', p: 80, max: 100, range: 'maks 100 W/m²' },
  { value: 'annet', label: 'Annet (skriv inn selv)', p: 100, max: 160, range: 'flis og stein: maks 160 W/m²' },
];

const CABLES = [6, 10, 12, 15, 17, 20, 25, 30].map((w) => ({ value: w, label: `${w} W/m` }));

const varmekabel = {
  id: 'varmekabel',
  v: 1,
  title: 'Velg varmekabel',
  category: 'varme',
  summary: 'Effektbehov, kabellengde og c/c ut fra areal og ønsket W/m².',
  keywords: ['varmekabel', 'gulvvarme', 'w/m2', 'w/m²', 'effekt', 'bad', 'varmematte', 'kabellengde'],
  refs: ['NEK 400:2026, 7-753 (varmekabler)', 'Nexans Varmehåndboka 2026 (veiledende verdier)', 'Produsentens monteringsanvisning'],
  modes: [
    { id: 'kabel', label: 'Kabel (W/m)' },
    { id: 'matte', label: 'Matte (W/m²)' },
  ],
  inputs: [
    { id: 'room', label: 'Rom / gulv', type: 'select', dropdown: true, options: ROOMS, default: 'bad' },
    { id: 'A', label: 'Areal som skal varmes', type: 'number', unit: 'm²', min: 0, minExclusive: true, placeholder: 'f.eks. 5,5', help: 'Fritt gulvareal uten fast innredning, dusjkabinett og lignende.' },
    {
      id: 'p', label: 'Ønsket effekt', type: 'number', unit: 'W/m²', min: 1, max: 400,
      default: (s, x) => (ROOMS.find((r) => r.value === x.room) || ROOMS[0]).p,
      help: (s, x) => {
        const r = ROOMS.find((o) => o.value === x.room);
        return r && r.range ? `Veiledende: ${r.range}.` : '';
      },
    },
    { id: 'pm', label: 'Kabelens effekt', type: 'select', dropdown: true, options: CABLES, default: 10, when: (x) => x.mode === 'kabel' },
    { id: 'U', label: 'Spenning', type: 'number', unit: 'V', min: 1, default: 230 },
  ],
  compute(x, ctx) {
    const P = ctx.step('P', 'A·p', { A: v(x.A, 'm²'), p: v(x.p, 'W/m²') }, 'W', { text: 'Effektbehov' });
    const I = ctx.step('I', 'P/U', { P: v(P, 'W'), U: v(x.U, 'V') }, 'A');
    ctx.out('P', 'Effektbehov', P, 'W', { primary: true });
    if (x.mode === 'kabel') {
      const L = ctx.step('L', 'P/pm', { P: v(P, 'W'), pm: v(x.pm, 'W/m') }, 'm', { text: 'Kabellengde' });
      const cc = ctx.step('c/c', 'A/L·1000', { A: v(x.A, 'm²'), L: v(L, 'm') }, 'mm', { text: 'Senteravstand' });
      ctx.out('L', 'Kabellengde', L, 'm', { primary: true });
      ctx.out('cc', 'Senteravstand c/c', cc, 'mm');
      ctx.note('Velg nærmeste kabellengde produsenten har, og regn ut virkelig c/c med «Finn c/c».');
    } else {
      ctx.note('Velg matte med areal så nær det oppvarmede arealet som mulig. Mattens W/m² er gitt.');
    }
    ctx.out('I', 'Strøm', I, 'A');
    const room = ROOMS.find((r) => r.value === x.room) || ROOMS[ROOMS.length - 1];
    ctx.le('Effekt mot veiledende maks', x.p, room.max, 'W/m²', { border: 0.0001, detail: room.range });
    if (x.room === 'bjelkelag' && x.mode === 'kabel' && x.pm > 10) ctx.warn('Trebjelkelag: bruk kabel på maks 10 W/m (under 8 W/m ved over 25 mm gulv + belegg).');
    if (I > 10) ctx.note(`Strømmen er ${formatValue(I, 'A')}. Vurder kurs og vern, og om anlegget bør deles.`);
    ctx.assume('Jordfeilvern, skjerm koblet til PE og termostat med gulvføler etter produsentens anvisning.');
  },
  cases: [
    { name: 'Bad 5,5 m², 130 W/m², 10 W/m', inputs: { room: 'bad', A: '5,5', p: '130', pm: 10, U: '230' }, expect: { P: 715, L: 71.5, cc: 76.92308, I: 3.108696 }, source: 'Håndregning: 5,5·130; 715/10; 5,5/71,5' },
    { name: 'Stue, matte 15 m²', inputs: { mode: 'matte', room: 'stue', A: '15', p: '80', U: '230' }, expect: { P: 1200, I: 5.217391 }, source: 'Håndregning' },
  ],
};

const varmekabelCC = {
  id: 'varmekabel-cc',
  v: 1,
  title: 'Finn c/c for varmekabel',
  category: 'varme',
  summary: 'Senteravstand ut fra areal og kabellengde, og hvilken W/m² det gir.',
  keywords: ['c/c', 'cc', 'senteravstand', 'varmekabel', 'avstand', 'leggeavstand'],
  refs: ['Produsentens monteringsanvisning'],
  inputs: [
    { id: 'A', label: 'Areal som skal dekkes', type: 'number', unit: 'm²', min: 0, minExclusive: true, placeholder: 'f.eks. 5,5' },
    { id: 'L', label: 'Kabellengde', type: 'number', unit: 'm', min: 0, minExclusive: true, placeholder: 'f.eks. 50' },
    { id: 'P', label: 'Kabelens effekt (valgfritt)', type: 'number', unit: 'W', optional: true, min: 0 },
  ],
  compute(x, ctx) {
    const cc = ctx.step('c/c', 'A/L·1000', { A: v(x.A, 'm²'), L: v(x.L, 'm') }, 'mm');
    ctx.out('cc', 'Senteravstand c/c', cc, 'mm', { primary: true, sig: 3 });
    if (x.P != null) {
      const p = ctx.step('p', 'P/A', { P: v(x.P, 'W'), A: v(x.A, 'm²') }, 'W/m²');
      ctx.out('p', 'Effekt per m²', p, 'W/m²');
    }
    ctx.note('Rom med mange hindringer: regn med areal der kabelen faktisk skal ligge. Hold avstand til sluk, vegger og fast innredning etter produsentens anvisning.');
  },
  cases: [
    { name: '5,5 m², 50 m, 850 W', inputs: { A: '5,5', L: '50', P: '850' }, expect: { cc: 110, p: 154.5455 }, source: 'Håndregning: 5,5/50; 850/5,5' },
  ],
};

const snosmelting = {
  id: 'snosmelting',
  v: 1,
  title: 'Snøsmelting',
  category: 'varme',
  summary: 'c/c, kabellengde og effekt for snøsmelting i innkjørsel, trapp og gangvei.',
  keywords: ['snøsmelting', 'snø', 'is', 'innkjørsel', 'trapp', 'utendørs', 'w/m²'],
  refs: ['Produsentens monteringsanvisning'],
  inputs: [
    { id: 'A', label: 'Areal', type: 'number', unit: 'm²', min: 0, minExclusive: true, placeholder: 'f.eks. 20' },
    { id: 'p', label: 'Ønsket effekt', type: 'number', unit: 'W/m²', min: 50, max: 600, default: 300, help: 'Veiledende 250–350 W/m², 300–400 med automatikk. Trapper 300–350 W/m² (Nexans Varmehåndboka 2026).' },
    { id: 'pm', label: 'Kabelens effekt', type: 'number', unit: 'W/m', min: 1, max: 100, default: 30 },
    { id: 'phases', label: 'Tilkobling', type: 'select', options: [{ value: 1, label: '1-fase 230 V' }, { value: 3, label: '3-fase' }], default: 1 },
    { id: 'U', label: 'Spenning mellom faser', type: 'number', unit: 'V', min: 1, default: 400, when: (x) => x.phases === 3 },
  ],
  compute(x, ctx) {
    const cc = ctx.step('c/c', 'pm/p·100', { pm: v(x.pm, 'W/m'), p: v(x.p, 'W/m²') }, 'cm');
    const P = ctx.step('P', 'A·p', { A: v(x.A, 'm²'), p: v(x.p, 'W/m²') }, 'W');
    const L = ctx.step('L', 'P/pm', { P: v(P, 'W'), pm: v(x.pm, 'W/m') }, 'm');
    const I = x.phases === 3
      ? ctx.step('I', 'P/(√3·U)', { P: v(P, 'W'), U: v(x.U, 'V') }, 'A')
      : ctx.step('I', 'P/U', { P: v(P, 'W'), U: v(230, 'V') }, 'A');
    ctx.out('cc', 'Senteravstand c/c', cc, 'cm', { primary: true, sig: 3 });
    ctx.out('L', 'Kabellengde', L, 'm', { primary: true });
    ctx.out('P', 'Effekt', P / 1000, 'kW');
    ctx.out('I', 'Strøm', I, 'A');
    ctx.assume('Kabelens W/m er ved den spenningen den kobles til.');
    if (x.phases === 3) ctx.assume('Effekten er fordelt likt på de tre fasene.');
  },
  cases: [
    { name: '20 m², 300 W/m², 30 W/m', inputs: { A: '20', p: '300', pm: '30', phases: 1 }, expect: { cc: 10, L: 200, P: 6, I: 26.08696 }, source: 'Håndregning: 30/300·100; 6000/30' },
    { name: '40 m² på 3-fase 400 V', inputs: { A: '40', p: '300', pm: '30', phases: 3, U: '400' }, expect: { P: 12, I: 17.32051 }, source: 'Håndregning: 12000/(√3·400)' },
  ],
};

// Veiledende kabeleffekt på rør (Nexans Varmehåndboka 2026): utenpå rør under 2″ 8–13 W/m,
// over 2″ 10–14 W/m, inne i rør under 2″ 6–13 W/m.
const PIPES = [
  { value: 'lite', label: 'Utenpå rør under 2″', w: 10, range: '8–13 W/m' },
  { value: 'stort', label: 'Utenpå rør 2″ og større', w: 12, range: '10–14 W/m' },
  { value: 'inne', label: 'Inne i rør under 2″', w: 10, range: '6–13 W/m' },
  { value: 'egen', label: 'Oppgi varmetap selv', w: 10, range: '' },
];

const frostsikring = {
  id: 'frostsikring',
  v: 1,
  title: 'Frostsikring av rør',
  category: 'varme',
  summary: 'Hvor mye varmekabel et rør trenger, og hvor mange løp eller spiral.',
  keywords: ['frostsikring', 'rør', 'vannrør', 'avløp', 'frost', 'varmekabel', 'selvregulerende'],
  refs: ['Nexans Varmehåndboka 2026 (veiledende verdier og tabeller for varmetap)', 'Produsentens monteringsanvisning'],
  inputs: [
    { id: 'pipe', label: 'Rør', type: 'select', options: PIPES, default: 'lite' },
    {
      id: 'q', label: 'Varmetap for røret', type: 'number', unit: 'W/m', min: 1, max: 200,
      default: (s, x) => (PIPES.find((p) => p.value === x.pipe) || PIPES[0]).w,
      help: (s, x) => {
        const p = PIPES.find((o) => o.value === x.pipe);
        return `${p && p.range ? `Veiledende ${p.range}. ` : ''}Riktig verdi avhenger av rørdimensjon, isolasjon og laveste temperatur – se produsentens tabell. Vanlig sikkerhetsfaktor er 1,2.`;
      },
    },
    { id: 'pm', label: 'Kabelens effekt', type: 'number', unit: 'W/m', min: 1, max: 100, default: 10 },
    { id: 'L', label: 'Rørlengde', type: 'number', unit: 'm', min: 0, minExclusive: true, placeholder: 'f.eks. 12' },
  ],
  compute(x, ctx) {
    const k = ctx.step('Faktor', 'q/pm', { q: v(x.q, 'W/m'), pm: v(x.pm, 'W/m') }, '', { text: 'Meter kabel per meter rør' });
    const runs = Math.max(1, Math.ceil(k - 1e-9));
    const Lk = ctx.step('Kabellengde', 'maks(1; Faktor)·L', { Faktor: k, L: v(x.L, 'm') }, 'm');
    const P = ctx.step('P', 'Kabellengde·pm', { Kabellengde: v(Lk, 'm'), pm: v(x.pm, 'W/m') }, 'W');
    ctx.out('k', 'Kabel per meter rør', Math.max(1, k), 'm/m', { primary: true, sig: 3 });
    ctx.out('Lk', 'Kabellengde', Lk, 'm', { primary: true });
    ctx.out('P', 'Effekt', P, 'W');
    ctx.text('runs', 'Legging', k <= 1 ? 'Ett rett løp langs røret' : `${runs} rette løp, eller spiral med ${formatValue(k, 'm', { sig: 2 })} kabel per meter rør`);
    ctx.note('Legg kabelen på undersiden av røret (ca. kl. 4 eller 8) og under isolasjonen. Ved ventiler og flenser trengs ekstra kabel.');
  },
  cases: [
    { name: 'Lite rør, 10 W/m kabel, 12 m', inputs: { pipe: 'lite', q: '10', pm: '10', L: '12' }, expect: { Lk: 12, P: 120, k: 1 }, source: 'Håndregning' },
    { name: 'Stort rør, 14 W/m mot 10 W/m kabel', inputs: { pipe: 'stort', q: '14', pm: '10', L: '10' }, expect: { Lk: 14, P: 140, k: 1.4 }, source: 'Håndregning: 14/10 = 1,4 m/m' },
  ],
};

const takrenne = {
  id: 'takrenne',
  v: 1,
  title: 'Takrenne og nedløp',
  category: 'varme',
  summary: 'Kabellengde og effekt for takrenner og nedløpsrør.',
  keywords: ['takrenne', 'nedløp', 'renne', 'is', 'istapper', 'tak', 'varmekabel'],
  refs: ['Nexans Varmehåndboka 2026 (veiledende verdier)', 'Produsentens monteringsanvisning'],
  inputs: [
    { id: 'Lr', label: 'Lengde takrenne', type: 'number', unit: 'm', min: 0, minExclusive: true, placeholder: 'f.eks. 24' },
    { id: 'runs', label: 'Løp i renna', type: 'select', options: [{ value: 1, label: '1 løp' }, { value: 2, label: '2 løp' }], default: 2 },
    { id: 'Ln', label: 'Lengde nedløp (sum)', type: 'number', unit: 'm', min: 0, default: 0, help: 'Ett løp ned i hvert nedløp, helt ned til frostfritt.' },
    {
      id: 'mat', label: 'Takrenne av', type: 'select', default: 'metall',
      options: [{ value: 'metall', label: 'Metall' }, { value: 'plast', label: 'Plast' }, { value: 'tre', label: 'Tre' }],
    },
    {
      id: 'pm', label: 'Kabelens effekt', type: 'number', unit: 'W/m', min: 1, max: 100, default: 20,
      help: 'Renna trenger 30–50 W per meter. Med to løp gir det 15–25 W/m kabel. Maks kabeleffekt: metall 25, plast 20, tre 18 W/m.',
    },
  ],
  compute(x, ctx) {
    const maxPm = { metall: 25, plast: 20, tre: 18 }[x.mat] || 25;
    const perGutter = ctx.step('p renne', 'n·pm', { n: x.runs, pm: v(x.pm, 'W/m') }, 'W/m', { text: 'Effekt per meter takrenne' });
    ctx.le('Kabeleffekt mot maks for rennematerialet', x.pm, maxPm, 'W/m', { border: 0.0001 });
    ctx.ge('Effekt per meter renne (anbefalt minst 30 W/m)', perGutter, 30, 'W/m', { border: 0.0001 });
    const L = ctx.step('L', 'n·Lr + Ln', { n: x.runs, Lr: v(x.Lr, 'm'), Ln: v(x.Ln, 'm') }, 'm', { text: 'Kabellengde' });
    const P = ctx.step('P', 'L·pm', { L: v(L, 'm'), pm: v(x.pm, 'W/m') }, 'W');
    const I = ctx.step('I', 'P/U', { P: v(P, 'W'), U: v(230, 'V') }, 'A');
    ctx.out('L', 'Kabellengde', L, 'm', { primary: true });
    ctx.out('P', 'Effekt', P, 'W', { primary: true });
    ctx.out('I', 'Strøm ved 230 V', I, 'A');
    ctx.out('pr', 'Effekt per meter renne', perGutter, 'W/m');
    ctx.assume('Selvregulerende kabel gir mindre effekt når det er varmt; W/m gjelder ved 0 °C i is og snø.');
  },
  cases: [
    { name: '24 m metallrenne, 2 løp, 2×6 m nedløp, 20 W/m', inputs: { Lr: '24', runs: 2, Ln: '12', pm: '20', mat: 'metall' }, expect: { L: 60, P: 1200, I: 5.217391, pr: 40 }, checks: { 'Kabeleffekt mot maks for rennematerialet': 'ok' }, source: 'Håndregning: 2·24 + 12; 60·20' },
    { name: 'Trerenne med 25 W/m kabel', inputs: { Lr: '10', runs: 2, Ln: '0', pm: '25', mat: 'tre' }, expect: { L: 20 }, checks: { 'Kabeleffekt mot maks for rennematerialet': 'fail' }, source: 'Nexans: maks 18 W/m i trerenne' },
  ],
};

const varmekabelKontroll = {
  id: 'varmekabel-kontroll',
  v: 1,
  title: 'Kontrollmåling av varmekabel',
  category: 'maling',
  summary: 'Forventet motstand R = U²/P med toleranse, og vurdering av målt verdi.',
  keywords: ['varmekabel', 'måling', 'motstand', 'resistans', 'kontroll', 'garanti', 'ohm'],
  refs: ['Nexans Varmehåndboka 2026: toleranse −5 %/+10 % på ledermotstand', 'Produsentens monteringsanvisning og garantibetingelser'],
  inputs: [
    { id: 'P', label: 'Merkeeffekt', type: 'number', unit: 'W', min: 0, minExclusive: true, placeholder: 'f.eks. 1000' },
    { id: 'U', label: 'Merkespenning', type: 'number', unit: 'V', min: 1, default: 230 },
    { id: 'tolMinus', label: 'Toleranse under', type: 'number', unit: '%', min: 0, max: 50, default: 5, advanced: true },
    { id: 'tolPlus', label: 'Toleranse over', type: 'number', unit: '%', min: 0, max: 50, default: 10, advanced: true, help: 'Bruk toleransen i produsentens anvisning.' },
    { id: 'R', label: 'Målt motstand (valgfritt)', type: 'number', unit: 'Ω', optional: true, min: 0, minExclusive: true },
  ],
  compute(x, ctx) {
    const Rn = ctx.step('R', 'U²/P', { U: v(x.U, 'V'), P: v(x.P, 'W') }, 'Ω', { text: 'Forventet motstand' });
    const Rmin = ctx.step('Rmin', 'R·(1 − nedre/100)', { R: v(Rn, 'Ω'), nedre: v(x.tolMinus, '%') }, 'Ω');
    const Rmax = ctx.step('Rmaks', 'R·(1 + øvre/100)', { R: v(Rn, 'Ω'), øvre: v(x.tolPlus, '%') }, 'Ω');
    ctx.out('R', 'Forventet motstand', Rn, 'Ω', { primary: true });
    ctx.out('Rmin', 'Laveste godkjente', Rmin, 'Ω');
    ctx.out('Rmax', 'Høyeste godkjente', Rmax, 'Ω');
    if (x.R != null) {
      ctx.ge('Målt motstand over nedre grense', x.R, Rmin, 'Ω', { border: 0.005 });
      ctx.le('Målt motstand under øvre grense', x.R, Rmax, 'Ω', { border: 0.005 });
      if (x.R < Rmin) ctx.warn('For lav motstand kan bety kortslutning mellom ledere eller feil kabel.');
      if (x.R > Rmax) ctx.warn('For høy motstand kan bety brudd, dårlig skjøt eller feil kabel.');
    }
    ctx.assume('Måling ved romtemperatur. Mål også isolasjonsresistans mellom leder og skjerm.');
  },
  cases: [
    { name: '1000 W, 230 V', inputs: { P: '1000', U: '230' }, expect: { R: 52.9, Rmin: 50.255, Rmax: 58.19 }, source: 'Håndregning: 230²/1000' },
    { name: 'Målt 53,5 Ω', inputs: { P: '1000', U: '230', R: '53,5' }, expect: { R: 52.9 }, checks: { 'Målt motstand over nedre grense': 'ok', 'Målt motstand under øvre grense': 'ok' }, source: 'Håndregning' },
  ],
};

const bereder = {
  id: 'bereder',
  v: 1,
  title: 'Oppvarming av varmtvannsbereder',
  category: 'varme',
  summary: 'Energi og tid for å varme opp vann, f.eks. en bereder fra kaldt.',
  keywords: ['bereder', 'varmtvann', 'vann', 'oppvarmingstid', 'kwh', 'liter', 'kolbe'],
  refs: [],
  inputs: [
    { id: 'V', label: 'Volum', type: 'number', unit: 'liter', min: 0, minExclusive: true, default: 200 },
    { id: 'T1', label: 'Temperatur inn', type: 'number', unit: '°C', min: 0, max: 99, default: 10 },
    { id: 'T2', label: 'Ønsket temperatur', type: 'number', unit: '°C', min: 1, max: 99, default: 70 },
    { id: 'P', label: 'Effekt på elementet', type: 'number', unit: 'kW', min: 0, minExclusive: true, default: 2 },
  ],
  compute(x, ctx) {
    if (x.T2 <= x.T1) ctx.need('Ønsket temperatur må være høyere enn temperaturen inn.');
    const E = ctx.step('E', 'V·4,19·(T₂ − T₁)/3600', { V: v(x.V, 'l'), 'T₂': v(x.T2, '°C'), 'T₁': v(x.T1, '°C') }, 'kWh', { text: 'Energi (1 liter ≈ 1 kg, c = 4,19 kJ/(kg·K))' });
    const t = ctx.step('t', 'E/P', { E: v(E, 'kWh'), P: v(x.P, 'kW') }, 'h');
    ctx.out('E', 'Energi', E, 'kWh', { primary: true });
    ctx.out('t', 'Oppvarmingstid', t, 'timer', { primary: true });
    ctx.out('min', 'I minutter', t * 60, 'min', { sig: 3 });
    ctx.assume('Uten varmetap fra beholderen. Reell tid blir litt lengre.');
    if (x.T2 < 65) ctx.note('Varmtvannsberedere bør holde minst 65–70 °C for å hindre legionella.');
  },
  cases: [
    { name: '200 l fra 10 til 70 °C med 2 kW', inputs: { V: '200', T1: '10', T2: '70', P: '2' }, expect: { E: 13.96667, t: 6.983333 }, source: 'Håndregning: 200·4,19·60/3600' },
  ],
};

export const VARME = [varmekabel, varmekabelCC, snosmelting, frostsikring, takrenne, varmekabelKontroll, bereder];
