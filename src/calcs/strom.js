import { v } from '../core/engine.js';
import { currentFromApparent } from '../lib/elektro.js';
import { phasesField, voltageField, cosphiField } from './fields.js';

export const calc = {
  id: 'strom',
  v: 1,
  title: 'Strøm',
  category: 'grunnlag',
  summary: 'Strømmen for en last ut fra effekt, virkningsgrad og cos φ.',
  keywords: ['strøm', 'ampere', 'belastningsstrøm', 'ib', 'virkningsgrad', 'η', 'kw til ampere'],
  refs: [],
  modes: [
    { id: 'P', label: 'Fra kW' },
    { id: 'S', label: 'Fra kVA' },
  ],
  inputs: [
    phasesField(),
    voltageField(),
    { id: 'P', label: 'Effekt P', type: 'number', unit: 'kW', min: 0, minExclusive: true, placeholder: 'f.eks. 11', when: (x) => x.mode === 'P' },
    { id: 'S', label: 'Tilsynelatende effekt S', type: 'number', unit: 'kVA', min: 0, minExclusive: true, placeholder: 'f.eks. 15', when: (x) => x.mode === 'S' },
    cosphiField({ when: (x) => x.mode === 'P' }),
    {
      id: 'eta', label: 'Virkningsgrad η', type: 'number', unit: '%', min: 1, max: 100, default: 100,
      when: (x) => x.mode === 'P',
      help: 'Effekten er avgitt effekt (f.eks. akseleffekt på motor). Varme og lys: 100 %.',
    },
  ],
  compute(x, ctx) {
    const { phases, U } = x;
    let I;
    if (x.mode === 'P') {
      const Pin = x.eta < 100
        ? ctx.step('Pinn', 'P/(η/100)', { P: v(x.P, 'kW'), η: v(x.eta, '%') }, 'kW', { text: 'Tilført effekt' })
        : x.P;
      const vars = { Pinn: v(Pin, 'kW'), U: v(U, 'V'), cosφ: x.cosphi };
      I = phases === 3
        ? ctx.step('I', 'Pinn·1000/(√3·U·cosφ)', vars, 'A')
        : ctx.step('I', 'Pinn·1000/(U·cosφ)', vars, 'A');
      if (x.eta < 100) ctx.out('Pin', 'Tilført effekt', Pin, 'kW');
    } else {
      I = currentFromApparent({ phases, U, S: x.S }, ctx);
    }
    ctx.out('I', 'Strøm', I, 'A', { primary: true });
    if (phases === 3) ctx.assume('Symmetrisk last på de tre fasene.');
  },
  cases: [
    { name: '11 kW, 400 V, cos φ 1', inputs: { phases: 3, U: '400', P: '11' }, expect: { I: 15.87713 }, source: 'Håndregning: 11000/(√3·400)' },
    { name: '7,5 kW motor, η 90 %, cos φ 0,85', inputs: { phases: 3, U: '400', P: '7,5', eta: '90', cosphi: '0,85' }, expect: { I: 14.15075, Pin: 8.333333 }, source: 'Håndregning: 8333/(√3·400·0,85)' },
    { name: '2 kW enfase', inputs: { phases: 1, U: '230', P: '2' }, expect: { I: 8.695652 }, source: 'Håndregning: 2000/230' },
    { name: '15 kVA, IT 230 V', inputs: { mode: 'S', phases: 3, U: '230', S: '15' }, expect: { I: 37.65329 }, source: 'Håndregning: 15000/(√3·230)' },
  ],
};
