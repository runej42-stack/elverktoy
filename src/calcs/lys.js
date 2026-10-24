// Belysning: lumenmetoden med veiledende luxverdier.

import { v } from '../core/engine.js';
import { formatValue } from '../core/number.js';

// Veiledende vedlikeholdt belysningsstyrke. Kontroller mot NS-EN 12464-1 for den aktuelle oppgaven.
export const LUX = [
  { value: 'kontor', label: 'Kontor, skriving og PC', lx: 500 },
  { value: 'mote', label: 'Møterom', lx: 500 },
  { value: 'skole', label: 'Klasserom', lx: 500 },
  { value: 'verksted', label: 'Verksted, fint arbeid', lx: 500 },
  { value: 'verksted-grov', label: 'Verksted, grovt arbeid', lx: 300 },
  { value: 'butikk', label: 'Butikk, salgsområde', lx: 300 },
  { value: 'lager', label: 'Lager', lx: 150 },
  { value: 'trapp', label: 'Trapp', lx: 150 },
  { value: 'korridor', label: 'Korridor, gang', lx: 100 },
  { value: 'garderobe', label: 'Garderobe, toalett', lx: 200 },
  { value: 'egen', label: 'Skriv inn selv', lx: 300 },
];

const lumen = {
  id: 'lumen',
  v: 1,
  title: 'Belysning (lumenmetoden)',
  category: 'lys',
  summary: 'Antall armaturer for ønsket lux, og hvilken belysningsstyrke det gir.',
  keywords: ['lys', 'belysning', 'lux', 'lumen', 'armatur', 'lysberegning', 'utnyttelsesfaktor', 'vedlikeholdsfaktor'],
  refs: ['NS-EN 12464-1 (belysning av arbeidsplasser innendørs)'],
  inputs: [
    { id: 'room', label: 'Rom / oppgave', type: 'select', dropdown: true, options: LUX, default: 'kontor' },
    {
      id: 'E', label: 'Ønsket belysningsstyrke', type: 'number', unit: 'lx', min: 1, max: 5000,
      default: (s, x) => (LUX.find((r) => r.value === x.room) || LUX[0]).lx,
      help: 'Veiledende verdi for valgt rom. Kontroller kravet for oppgaven.',
    },
    { id: 'A', label: 'Gulvareal', type: 'number', unit: 'm²', min: 0, minExclusive: true, placeholder: 'f.eks. 50' },
    { id: 'phi', label: 'Lysfluks per armatur', type: 'number', unit: 'lm', min: 1, placeholder: 'f.eks. 4000' },
    { id: 'UF', label: 'Utnyttelsesfaktor UF', type: 'number', min: 0.05, max: 1, default: 0.6, help: 'Avhenger av rommets form, refleksjoner og armatur. Typisk 0,4–0,8.' },
    { id: 'MF', label: 'Vedlikeholdsfaktor MF', type: 'number', min: 0.3, max: 1, default: 0.8, help: 'Typisk 0,7–0,9 for LED i rene rom.' },
    { id: 'P', label: 'Effekt per armatur (valgfritt)', type: 'number', unit: 'W', optional: true, min: 0 },
  ],
  compute(x, ctx) {
    const exact = ctx.step('N', 'E·A/(Φ·UF·MF)', { E: v(x.E, 'lx'), A: v(x.A, 'm²'), Φ: v(x.phi, 'lm'), UF: x.UF, MF: x.MF }, 'stk');
    const N = Math.max(1, Math.ceil(exact - 1e-9));
    const Eact = ctx.step('E oppnådd', 'n·Φ·UF·MF/A', { n: N, Φ: v(x.phi, 'lm'), UF: x.UF, MF: x.MF, A: v(x.A, 'm²') }, 'lx', { text: 'Med antallet rundet opp' });
    ctx.out('N', 'Antall armaturer', N, 'stk', { primary: true });
    ctx.out('E', 'Oppnådd belysningsstyrke', Eact, 'lx', { primary: true });
    if (x.P != null) {
      ctx.out('Ptot', 'Installert effekt', N * x.P, 'W');
      ctx.out('Pm2', 'Effekt per m²', (N * x.P) / x.A, 'W/m²');
    }
    ctx.note(`Fordel armaturene jevnt. Uten lysberegningsprogram kan jevnheten avvike; ${formatValue(exact, 'stk', { sig: 3 })} armaturer er nøyaktig behov.`);
    ctx.assume('Lumenmetoden gir gjennomsnittlig belysningsstyrke på arbeidsflaten, ikke jevnhet.');
  },
  cases: [
    { name: 'Kontor 50 m², 4000 lm', inputs: { room: 'kontor', E: '500', A: '50', phi: '4000', UF: '0,6', MF: '0,8', P: '30' }, expect: { N: 14, E: 537.6, Ptot: 420, Pm2: 8.4 }, source: 'Håndregning: 25000/1920 = 13,02 → 14' },
  ],
};

export const LYS = [lumen];
