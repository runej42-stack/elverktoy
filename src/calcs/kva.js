import { apparentFromCurrent, currentFromApparent } from '../lib/elektro.js';
import { phasesField, voltageField } from './fields.js';

export const calc = {
  id: 'kva',
  v: 1,
  title: 'kVA ↔ ampere',
  category: 'grunnlag',
  summary: 'Regn mellom tilsynelatende effekt og strøm, f.eks. for trafo eller aggregat.',
  keywords: ['kva', 'ampere', 'strøm', 'trafo', 'transformator', 'aggregat', 'merkestrøm', 'va'],
  refs: [],
  modes: [
    { id: 'S2I', label: 'kVA → A' },
    { id: 'I2S', label: 'A → kVA' },
  ],
  inputs: [
    phasesField({ default: 3 }),
    voltageField(),
    { id: 'S', label: 'Tilsynelatende effekt S', type: 'number', unit: 'kVA', min: 0, minExclusive: true, placeholder: 'f.eks. 500', when: (x) => x.mode === 'S2I' },
    { id: 'I', label: 'Strøm', type: 'number', unit: 'A', min: 0, minExclusive: true, placeholder: 'f.eks. 63', when: (x) => x.mode === 'I2S' },
  ],
  compute(x, ctx) {
    const { phases, U } = x;
    if (x.mode === 'S2I') {
      const I = currentFromApparent({ phases, U, S: x.S }, ctx);
      ctx.out('I', 'Strøm', I, 'A', { primary: true });
    } else {
      const S = apparentFromCurrent({ phases, U, I: x.I }, ctx);
      ctx.out('S', 'Tilsynelatende effekt S', S, 'kVA', { primary: true });
    }
    if (phases === 3) ctx.assume('Symmetrisk last på de tre fasene.');
  },
  cases: [
    { name: '100 kVA, 400 V', inputs: { phases: 3, U: '400', S: '100' }, expect: { I: 144.3376 }, source: 'Håndregning' },
    { name: '500 kVA, 230 V', inputs: { phases: 3, U: '230', S: '500' }, expect: { I: 1255.109 }, source: 'Håndregning' },
    { name: '63 A, 230 V 3-fase', inputs: { mode: 'I2S', phases: 3, U: '230', I: '63' }, expect: { S: 25.09741 }, source: 'Håndregning' },
    { name: '16 A, 1-fase', inputs: { mode: 'I2S', phases: 1, U: '230', I: '16' }, expect: { S: 3.68 }, source: 'Håndregning' },
  ],
};
