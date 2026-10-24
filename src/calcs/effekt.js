import { networkOf } from '../core/settings.js';
import {
  apparentFromCurrent, currentFromApparent, activeFromApparent, apparentFromActive, reactiveFrom,
} from '../lib/elektro.js';
import { phasesField, voltageField, cosphiField } from './fields.js';

export const calc = {
  id: 'effekt',
  v: 1,
  title: 'Effekt',
  category: 'grunnlag',
  summary: 'Aktiv, tilsynelatende og reaktiv effekt (W, VA, var) for 1- og 3-fase.',
  keywords: ['effekt', 'kw', 'kva', 'kvar', 'watt', 'cos φ', 'effektfaktor', 'trefase', 'enfase', 'strøm'],
  refs: [],
  modes: [
    { id: 'I', label: 'Fra strøm' },
    { id: 'P', label: 'Fra kW' },
    { id: 'S', label: 'Fra kVA' },
  ],
  inputs: [
    phasesField(),
    voltageField(),
    { id: 'I', label: 'Strøm', type: 'number', unit: 'A', min: 0, minExclusive: true, placeholder: 'f.eks. 16', when: (x) => x.mode === 'I' },
    { id: 'P', label: 'Aktiv effekt P', type: 'number', unit: 'kW', min: 0, minExclusive: true, placeholder: 'f.eks. 11', when: (x) => x.mode === 'P' },
    { id: 'S', label: 'Tilsynelatende effekt S', type: 'number', unit: 'kVA', min: 0, minExclusive: true, placeholder: 'f.eks. 100', when: (x) => x.mode === 'S' },
    cosphiField(),
  ],
  compute(x, ctx) {
    const { phases, U, cosphi } = x;
    let I, P, S;
    if (x.mode === 'I') {
      I = x.I;
      S = apparentFromCurrent({ phases, U, I }, ctx);
      P = activeFromApparent({ S, cosphi }, ctx);
    } else if (x.mode === 'P') {
      P = x.P;
      S = apparentFromActive({ P, cosphi }, ctx);
      I = currentFromApparent({ phases, U, S }, ctx);
    } else {
      S = x.S;
      P = activeFromApparent({ S, cosphi }, ctx);
      I = currentFromApparent({ phases, U, S }, ctx);
    }
    const Q = reactiveFrom({ S, P }, ctx);
    ctx.out('I', 'Strøm', I, 'A', { primary: x.mode !== 'I' });
    ctx.out('P', 'Aktiv effekt P', P, 'kW', { primary: x.mode !== 'P' });
    ctx.out('S', 'Tilsynelatende effekt S', S, 'kVA', { primary: x.mode === 'P' });
    ctx.out('Q', 'Reaktiv effekt Q', Q, 'kvar');
    if (phases === 3 && U === 230 && networkOf(ctx.settings).earthing !== 'TN') {
      ctx.note('IT/TT 230 V: trefase regnes med 230 V mellom faser, så 16 A gir ca. 6,4 kVA (mot 11 kVA i TN 400 V).');
    }
    if (phases === 3) ctx.assume('Symmetrisk last på de tre fasene.');
  },
  cases: [
    { name: 'TN 400 V, 16 A', inputs: { phases: 3, U: '400', I: '16' }, expect: { S: 11.08513, P: 11.08513, Q: 0 }, source: 'Håndregning: √3·400·16' },
    { name: 'IT 230 V, 32 A', inputs: { phases: 3, U: '230', I: '32' }, expect: { S: 12.74789 }, source: 'Håndregning: √3·230·32' },
    { name: '1-fase 3,6 kW', inputs: { mode: 'P', phases: 1, U: '230', P: '3,6' }, expect: { I: 15.65217, S: 3.6 }, source: 'Håndregning: 3600/230' },
    { name: 'Motor 7,5 kW, cos φ 0,85', inputs: { mode: 'P', phases: 3, U: '400', P: '7,5', cosphi: '0,85' }, expect: { S: 8.823529, I: 12.73568, Q: 4.648083 }, source: 'Håndregning' },
    { name: '100 kVA, 400 V', inputs: { mode: 'S', phases: 3, U: '400', S: '100', cosphi: '0,9' }, expect: { I: 144.3376, P: 90 }, source: 'Håndregning: 100000/(√3·400)' },
  ],
};
