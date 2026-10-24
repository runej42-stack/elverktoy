import { v } from '../core/engine.js';

const POLES = [2, 4, 6, 8, 10, 12].map((p) => ({ value: p, label: `${p}-polet` }));

export const calc = {
  id: 'moment',
  v: 1,
  title: 'Moment og turtall',
  category: 'motor',
  summary: 'Moment fra effekt og turtall, effekt fra moment, synkront turtall og slipp.',
  keywords: ['moment', 'dreiemoment', 'nm', 'turtall', 'omdreininger', 'o/min', 'rpm', 'slipp', 'poltall', 'synkront turtall'],
  refs: [],
  modes: [
    { id: 'T', label: 'Moment' },
    { id: 'P', label: 'Effekt' },
    { id: 'ns', label: 'Turtall og slipp' },
  ],
  inputs: [
    { id: 'P', label: 'Effekt', type: 'number', unit: 'kW', min: 0, minExclusive: true, placeholder: 'f.eks. 7,5', when: (x) => x.mode === 'T' },
    { id: 'T', label: 'Moment', type: 'number', unit: 'Nm', min: 0, minExclusive: true, placeholder: 'f.eks. 50', when: (x) => x.mode === 'P' },
    { id: 'n', label: 'Turtall', type: 'number', unit: 'o/min', min: 0, minExclusive: true, placeholder: 'f.eks. 1450', when: (x) => x.mode !== 'ns' },
    { id: 'f', label: 'Frekvens', type: 'number', unit: 'Hz', min: 1, max: 400, default: 50, when: (x) => x.mode === 'ns' },
    { id: 'poles', label: 'Poltall', type: 'select', dropdown: true, options: POLES, default: 4, when: (x) => x.mode === 'ns' },
    { id: 'nr', label: 'Målt eller oppgitt turtall (valgfritt)', type: 'number', unit: 'o/min', optional: true, min: 0, when: (x) => x.mode === 'ns' },
  ],
  compute(x, ctx) {
    if (x.mode === 'T') {
      const T = ctx.step('T', 'P·1000·60/(2·π·n)', { P: v(x.P, 'kW'), n: v(x.n, 'o/min') }, 'Nm', { text: 'Tilnærmet T ≈ 9550 · P/n' });
      ctx.out('T', 'Moment', T, 'Nm', { primary: true });
    } else if (x.mode === 'P') {
      const P = ctx.step('P', 'T·2·π·n/60/1000', { T: v(x.T, 'Nm'), n: v(x.n, 'o/min') }, 'kW');
      ctx.out('P', 'Effekt', P, 'kW', { primary: true });
    } else {
      const ns = ctx.step('ns', '120·f/p', { f: v(x.f, 'Hz'), p: x.poles }, 'o/min', { text: 'Synkront turtall (p = poltall)' });
      ctx.out('ns', 'Synkront turtall', ns, 'o/min', { primary: true });
      if (x.nr != null) {
        if (x.nr > ns) ctx.need('Turtallet kan ikke være høyere enn synkront turtall for en asynkronmotor i motordrift.');
        const s = ctx.step('s', '(ns − n)/ns·100', { ns: v(ns, 'o/min'), n: v(x.nr, 'o/min') }, '%', { text: 'Slipp' });
        ctx.out('s', 'Slipp', s, '%', { sig: 2 });
      }
    }
  },
  cases: [
    { name: '7,5 kW ved 1450 o/min', inputs: { mode: 'T', P: '7,5', n: '1450' }, expect: { T: 49.39289 }, source: 'Håndregning: 9549,3·7,5/1450' },
    { name: '100 Nm ved 2900 o/min', inputs: { mode: 'P', T: '100', n: '2900' }, expect: { P: 30.36873 }, source: 'Håndregning: 100·2π·2900/60000' },
    { name: '4-polet, 50 Hz, 1450 o/min', inputs: { mode: 'ns', f: '50', poles: 4, nr: '1450' }, expect: { ns: 1500, s: 3.333333 }, source: 'Håndregning: 120·50/4; 50/1500' },
  ],
};
