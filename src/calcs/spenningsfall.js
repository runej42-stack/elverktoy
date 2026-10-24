import { v } from '../core/engine.js';
import { formatValue } from '../core/number.js';
import { currentFromActive } from '../lib/elektro.js';
import { resistanceAt, voltageDrop, maxLength, minSizeForDrop, sizesFor } from '../lib/kabel.js';
import {
  phasesField, voltageField, cosphiField, materialField, sizeField, tempField, reactanceField,
} from './fields.js';

export const calc = {
  id: 'spenningsfall',
  v: 1,
  title: 'Spenningsfall',
  category: 'kabel',
  summary: 'Finn spenningsfallet, minste tverrsnitt eller største kabellengde.',
  keywords: ['spenningsfall', 'δu', 'du', 'delta u', 'maks lengde', 'kabellengde', 'tverrsnitt', 'reaktans'],
  refs: ['NEK 400:2026, 525 og tillegg G (veiledende)', 'IEC 60228:2023 (lederresistans)'],
  modes: [
    { id: 'du', label: 'Finn ΔU' },
    { id: 'S', label: 'Tverrsnitt' },
    { id: 'L', label: 'Maks lengde' },
  ],
  inputs: [
    phasesField(),
    voltageField(),
    {
      id: 'load', label: 'Last oppgitt som', type: 'select', default: 'I',
      options: [{ value: 'I', label: 'Strøm (A)' }, { value: 'P', label: 'Effekt (kW)' }],
    },
    { id: 'I', label: 'Belastningsstrøm Ib', type: 'number', unit: 'A', min: 0, minExclusive: true, placeholder: 'f.eks. 16', when: (x) => x.load === 'I' },
    { id: 'P', label: 'Effekt', type: 'number', unit: 'kW', min: 0, minExclusive: true, placeholder: 'f.eks. 3,6', when: (x) => x.load === 'P' },
    cosphiField(),
    { id: 'L', label: 'Kabellengde (én vei)', type: 'number', unit: 'm', min: 0, minExclusive: true, placeholder: 'f.eks. 25', when: (x) => x.mode !== 'L' },
    materialField(),
    sizeField({ when: (x) => x.mode !== 'S' }),
    {
      id: 'limit', label: 'Grense for spenningsfall', type: 'number', unit: '%', min: 0, minExclusive: true, max: 20,
      default: (s) => s.vdLimit ?? 4,
      help: 'NEK 400 (525): normalt maks 4 % fra forsyningspunktet. Tillegg G nevner 3 % for lys og 5 % for annet.',
    },
    tempField(),
    reactanceField(),
    {
      id: 'flex', label: 'Fleksibel leder (klasse 5)', type: 'toggle', default: false, advanced: true,
      when: (x) => x.material === 'Cu',
    },
  ],
  compute(x, ctx) {
    const { phases, U, cosphi, X, theta, material, limit } = x;
    const flexible = material === 'Cu' && x.flex;
    const I = x.load === 'I' ? x.I : currentFromActive({ phases, U, P: x.P, cosphi }, ctx);
    if (x.load === 'P') ctx.out('I', 'Belastningsstrøm', I, 'A');

    if (x.mode === 'du') {
      const R = resistanceAt({ material, S: x.S, flexible, theta }, ctx);
      const { dU, pct } = voltageDrop({ phases, U, I, L: x.L, R, X, cosphi }, ctx);
      const Uload = ctx.step('U ved last', 'U − ΔU', { U: v(U, 'V'), ΔU: v(dU, 'V') }, 'V');
      ctx.out('pct', 'Spenningsfall', pct, '%', { primary: true });
      ctx.out('dU', 'Spenningsfall i volt', dU, 'V', { primary: true });
      ctx.out('Uload', 'Spenning ved last', Uload, 'V');
      ctx.le('Spenningsfall', pct, limit, '%');
    } else if (x.mode === 'S') {
      const S = minSizeForDrop({ phases, U, I, L: x.L, X, cosphi, limit, material, flexible, theta });
      const largest = sizesFor(material).slice(-1)[0];
      if (S == null) {
        ctx.need(`Selv ${largest} mm² gir mer enn ${formatValue(limit, '%')} spenningsfall. Del opp lasten, bruk parallelle kabler eller kortere strekk.`);
      }
      const R = resistanceAt({ material, S, flexible, theta }, ctx);
      const { dU, pct } = voltageDrop({ phases, U, I, L: x.L, R, X, cosphi }, ctx);
      ctx.out('S', 'Minste tverrsnitt', S, 'mm²', { primary: true });
      ctx.out('pct', 'Spenningsfall med dette tverrsnittet', pct, '%');
      ctx.out('dU', 'Spenningsfall i volt', dU, 'V');
      ctx.le('Spenningsfall', pct, limit, '%');
      ctx.warn('Bare spenningsfallet er vurdert. Sjekk også strømføringsevne (Iz), vern og kortslutning.');
    } else {
      const R = resistanceAt({ material, S: x.S, flexible, theta }, ctx);
      const Lmax = maxLength({ phases, U, I, R, X, cosphi, limit }, ctx);
      ctx.out('Lmax', 'Største lengde', Lmax, 'm', { primary: true, sig: 3 });
      ctx.warn('Lengden gjelder bare spenningsfallet. Utkobling ved kortslutning kan gi kortere maks lengde.');
    }

    if (material === 'Al' && phases === 1) ctx.note('Aluminium brukes normalt i større tverrsnitt, oftest til fordelinger og stikkledninger.');
    ctx.assume(`Lederresistans etter IEC 60228 ved 20 °C, omregnet til ${theta} °C.`);
    ctx.assume(`Reaktans ${formatValue(X, 'Ω/km')}.`);
    ctx.assume(phases === 3 ? 'Symmetrisk trefaselast. U er spenningen mellom faser.' : 'Enfase: strømmen går fram og tilbake, derfor faktor 2.');
  },
  cases: [
    {
      name: '1-fase, 2,5 mm² Cu, 16 A, 30 m',
      inputs: { phases: 1, U: '230', I: '16', L: '30', material: 'Cu', S: 2.5, theta: 70, X: '0,08', limit: '4' },
      expect: { dU: 8.511422, pct: 3.700618 },
      checks: { Spenningsfall: 'ok' },
      source: 'Håndregning: R70 = 7,41·(1 + 0,00393·50) = 8,866 Ω/km; ΔU = 2·16·30·8,866/1000',
    },
    {
      name: '3-fase 400 V, 6 mm² Cu, 32 A, 50 m, cos φ 0,9',
      inputs: { phases: 3, U: '400', I: '32', L: '50', cosphi: '0,9', material: 'Cu', S: 6, theta: 70, X: '0,08', limit: '4' },
      expect: { dU: 9.288141, pct: 2.322035 },
      source: 'Håndregning: √3·32·50·(3,6852·0,9 + 0,08·0,4359)/1000',
    },
    {
      name: 'Maks lengde 1,5 mm², 10 A, 4 %',
      inputs: { mode: 'L', phases: 1, U: '230', I: '10', material: 'Cu', S: 1.5, theta: 70, X: '0,08', limit: '4' },
      expect: { Lmax: 31.77310 },
      source: 'Håndregning: 9,2 V·1000/(2·10·14,4777 Ω/km)',
    },
    {
      name: 'Minste tverrsnitt 20 A, 60 m',
      inputs: { mode: 'S', phases: 1, U: '230', I: '20', L: '60', material: 'Cu', theta: 70, X: '0,08', limit: '4' },
      expect: { S: 6, pct: 3.845447 },
      source: 'Håndregning: 4 mm² gir 5,76 %; 6 mm² gir 3,85 %',
    },
    {
      name: 'Effekt i stedet for strøm, 3,6 kW',
      inputs: { phases: 1, U: '230', load: 'P', P: '3,6', L: '20', material: 'Cu', S: 2.5, theta: 70, X: '0,08', limit: '4' },
      expect: { I: 15.65217, pct: 2.413446 },
      source: 'Håndregning: I = 3600/230; ΔU = 2·15,652·20·8,866/1000 = 5,551 V',
    },
  ],
};
