import { v } from '../core/engine.js';
import { NETWORKS } from '../core/settings.js';

const netOf = (x) => NETWORKS.find((n) => n.id === x.net) || NETWORKS[0];

export const calc = {
  id: 'overspenningsvern',
  v: 1,
  title: 'Overspenningsvern',
  category: 'vern',
  summary: 'Type, Uc, ledertverrsnitt og tilkobling for overspenningsvern i TN, IT og TT.',
  keywords: ['overspenningsvern', 'ov', 'spd', 'lynvern', 'type 1', 'type 2', 'type 3', 'uc', 'havarisikker', 'transient'],
  refs: [
    'NEK 400:2026, 4-443 (beskyttelse mot transiente overspenninger) og 5-534 (overspenningsvern)',
    'IEC 60364-5-53 tabell 534.2 (Uc) og 534.4 (tilkobling)',
    'NEK 400:2026: overspenningsvern i IT- og TT-nett skal være havarisikre',
  ],
  inputs: [
    { id: 'net', label: 'Nett', type: 'select', default: (s) => s.network, options: NETWORKS.map((n) => ({ value: n.id, label: n.short })) },
    {
      id: 'place', label: 'Plassering', type: 'select', default: 'hoved',
      options: [
        { value: 'hoved', label: 'Inntak / hovedfordeling' },
        { value: 'under', label: 'Underfordeling' },
        { value: 'utstyr', label: 'Ved utstyr' },
      ],
    },
    { id: 'lps', label: 'Bygget har lynvernanlegg (lynavleder)', type: 'toggle', default: false },
    { id: 'overhead', label: 'Forsynt med luftlinje', type: 'toggle', default: false },
    {
      id: 'dist', label: 'Kabellengde fra forrige overspenningsvern', type: 'number', unit: 'm', min: 0, optional: true,
      when: (x) => x.place !== 'hoved', help: 'Over ca. 10 m bør det vurderes et nytt vern nærmere utstyret.',
    },
  ],
  compute(x, ctx) {
    const net = netOf(x);
    const it = !net.neutral;

    let type;
    if (x.place === 'hoved') type = x.lps ? 'Type 1 + 2 (kombinert)' : x.overhead ? 'Type 2, vurder type 1 + 2' : 'Type 2';
    else if (x.place === 'under') type = 'Type 2';
    else type = 'Type 3 (finvern), koordinert med type 2 foran';
    ctx.text('type', 'Vernetype', type, { primary: true });

    const Ucmin = it
      ? ctx.step('Uc IEC', '1,1·U', { U: v(net.U, 'V') }, 'V', { text: 'IEC 534.2: IT uten N, fase–PE: 1,1 · spenning mellom faser' })
      : ctx.step('Uc IEC', '1,1·U₀', { 'U₀': v(net.U1f, 'V') }, 'V', { text: 'IEC 534.2: fase–N/PE: 1,1 · U₀' });
    if (it) {
      ctx.text('uc', 'Uc', 'Minst 350 V (norsk krav i 534). Vanlig valg: 385 V eller 440 V', { primary: true, note: 'kontroller NEK 400:2026' });
    } else {
      ctx.text('uc', 'Uc', `Minst ${Math.ceil(Ucmin)} V fase–N/PE. Vanlig valg: 275 V`, { primary: true });
    }
    if (net.earthing === 'TT' && net.neutral) ctx.note('TT med N: bruk 3+1-kobling med gnistgap mellom N og PE.');

    const t1 = x.lps && x.place === 'hoved';
    ctx.text('surge', 'Utladningsstrøm', t1 ? 'Iimp ≥ 12,5 kA (10/350) per pol, med mindre risikovurdering gir annet' : x.place === 'utstyr' ? 'Etter produsentens koordinering med vernet foran' : 'In ≥ 5 kA (8/20) per pol');
    ctx.text('cond', 'Ledertverrsnitt Cu', t1 ? 'Fase: minst 6 mm². Til PE/jord: minst 16 mm²' : 'Fase: minst 2,5 mm². Til PE/jord: minst 6 mm²');
    ctx.text('len', 'Tilkobling', 'Fase + PE-ledning til sammen maks 0,5 m, så korte og rette som mulig');
    if (it || net.earthing === 'TT') ctx.text('fail', 'Havarisikkert', 'Påkrevd i IT og TT etter NEK 400:2026 (ny utgave fjerner de gamle alternativene)', { primary: true });

    ctx.check('Forvern', 'info', 'Sikring foran vernet etter produsentens anvisning (maks forsikring).');
    if (x.dist != null) {
      ctx.le('Avstand fra forrige vern', x.dist, 10, 'm', { border: 0.0001, detail: 'Over 10 m kan overspenningen ved utstyret bli høyere enn vernnivået.' });
    }
    ctx.assume('Veiledning. Krav til når vern skal installeres står i NEK 400 443.4 (risikovurdering). I boliger har overspenningsvern vært påkrevd siden 2010.');
  },
  cases: [
    { name: 'TN, hovedfordeling, uten lynvern', inputs: { net: 'TN400', place: 'hoved' }, expect: { type: 'Type 2' }, source: 'IEC 60364-5-53 og NEK 400' },
    { name: 'IT med lynvernanlegg', inputs: { net: 'IT230', place: 'hoved', lps: true }, expect: { type: 'Type 1 + 2 (kombinert)' }, source: 'IEC 60364-5-53 og NEK 400' },
    { name: 'Underfordeling 25 m unna', inputs: { net: 'TN400', place: 'under', dist: '25' }, expect: { type: 'Type 2' }, checks: { 'Avstand fra forrige vern': 'fail' }, source: 'Veiledning: ca. 10 m' },
  ],
};
