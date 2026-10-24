import { v } from '../core/engine.js';
import { phasesField, voltageField } from './fields.js';

export const calc = {
  id: 'kompensering',
  v: 1,
  title: 'Fasekompensering',
  category: 'grunnlag',
  summary: 'Kondensatorbehov (kvar og µF) for å heve cos φ, og strømmen før og etter.',
  keywords: ['kompensering', 'kvar', 'reaktiv effekt', 'kondensator', 'cos φ', 'effektfaktor', 'µf', 'mikrofarad'],
  refs: [],
  inputs: [
    phasesField({ default: 3 }),
    voltageField(),
    { id: 'P', label: 'Aktiv effekt P', type: 'number', unit: 'kW', min: 0, minExclusive: true, placeholder: 'f.eks. 50' },
    { id: 'c1', label: 'cos φ i dag', type: 'number', min: 0.1, max: 1, minExclusive: true, placeholder: 'f.eks. 0,75' },
    { id: 'c2', label: 'Ønsket cos φ', type: 'number', min: 0.1, max: 1, default: 0.95 },
    {
      id: 'conn', label: 'Kondensatorene koblet i', type: 'select', default: 'D',
      options: [{ value: 'D', label: 'Trekant' }, { value: 'Y', label: 'Stjerne' }],
      when: (x) => x.phases === 3,
    },
    { id: 'f', label: 'Frekvens', type: 'number', unit: 'Hz', default: 50, min: 1, advanced: true },
  ],
  compute(x, ctx) {
    const { phases, U, P, c1, c2, f } = x;
    if (c2 <= c1) ctx.need('Ønsket cos φ må være høyere enn dagens.');
    const Qc = ctx.step('Qc', 'P·(tan(acos(cosφ₁)) − tan(acos(cosφ₂)))', { P: v(P, 'kW'), 'cosφ₁': c1, 'cosφ₂': c2 }, 'kvar', { text: 'Reaktiv effekt som må kompenseres' });
    let C;
    if (phases === 1) {
      C = ctx.step('C', 'Qc·1000/(2·π·f·U²)·1000000', { Qc: v(Qc, 'kvar'), f: v(f, 'Hz'), U: v(U, 'V') }, 'µF');
    } else if (x.conn === 'D') {
      C = ctx.step('C per fase', 'Qc·1000/(3·2·π·f·U²)·1000000', { Qc: v(Qc, 'kvar'), f: v(f, 'Hz'), U: v(U, 'V') }, 'µF', { text: 'Trekant: hver kondensator ligger over hovedspenningen' });
    } else {
      C = ctx.step('C per fase', 'Qc·1000/(2·π·f·U²)·1000000', { Qc: v(Qc, 'kvar'), f: v(f, 'Hz'), U: v(U, 'V') }, 'µF', { text: 'Stjerne: hver kondensator ligger over fasespenningen U/√3' });
    }
    const k = phases === 3 ? '√3·' : '';
    const I1 = ctx.step('I før', `P·1000/(${k}U·cosφ₁)`, { P: v(P, 'kW'), U: v(U, 'V'), 'cosφ₁': c1 }, 'A');
    const I2 = ctx.step('I etter', `P·1000/(${k}U·cosφ₂)`, { P: v(P, 'kW'), U: v(U, 'V'), 'cosφ₂': c2 }, 'A');
    ctx.out('Qc', 'Kondensatorbehov', Qc, 'kvar', { primary: true });
    ctx.out('C', phases === 3 ? 'Kapasitans per fase' : 'Kapasitans', C, 'µF', { primary: true });
    ctx.out('I1', 'Strøm før', I1, 'A');
    ctx.out('I2', 'Strøm etter', I2, 'A');
    if (c2 > 0.98) ctx.warn('Kompensering helt opp mot 1 gir fare for overkompensering ved lav last. Vanlig mål er 0,95–0,98.');
    ctx.assume('Sinusformet spenning uten overharmoniske. Med frekvensomformere og mye overharmoniske trengs ofte reaktorer (detuned anlegg).');
  },
  cases: [
    { name: '50 kW, 0,75 → 0,95, 400 V trekant', inputs: { phases: 3, U: '400', P: '50', c1: '0,75', c2: '0,95', conn: 'D' }, expect: { Qc: 27.66165, C: 183.4373, I1: 96.22504, I2: 75.96714 }, source: 'Håndregning: 50·(0,88192 − 0,32868)' },
    { name: 'Enfase 2 kW, 0,6 → 0,95', inputs: { phases: 1, U: '230', P: '2', c1: '0,6', c2: '0,95' }, expect: { Qc: 2.009300 }, source: 'Håndregning: 2·(1,33333 − 0,32868)' },
  ],
};
