import { v } from '../core/engine.js';

const FIELDS = ['U', 'I', 'R', 'P'];

export const calc = {
  id: 'ohm',
  v: 1,
  title: 'Ohms lov',
  category: 'grunnlag',
  summary: 'Finn U, I, R og P når du kjenner to av dem.',
  keywords: ['ohm', 'u=r·i', 'u ri', 'spenning', 'strøm', 'motstand', 'resistans', 'effekt', 'watt'],
  help: 'Fyll inn to av feltene. Gjelder likestrøm og ren resistiv last (cos φ = 1).',
  refs: [],
  inputs: [
    { id: 'U', label: 'Spenning U', type: 'number', unit: 'V', optional: true, min: 0, minExclusive: true, placeholder: 'f.eks. 230' },
    { id: 'I', label: 'Strøm I', type: 'number', unit: 'A', optional: true, min: 0, minExclusive: true, placeholder: 'f.eks. 10' },
    { id: 'R', label: 'Motstand R', type: 'number', unit: 'Ω', optional: true, min: 0, minExclusive: true },
    { id: 'P', label: 'Effekt P', type: 'number', unit: 'W', optional: true, min: 0, minExclusive: true },
  ],
  compute(x, ctx) {
    const given = FIELDS.filter((k) => x[k] != null);
    if (given.length < 2) ctx.need('Fyll inn to av verdiene.');
    if (given.length > 2) ctx.need('Fyll inn bare to verdier. Tøm feltet du vil regne ut.');
    let { U, I, R, P } = x;
    const vars = { U: v(U, 'V'), I: v(I, 'A'), R: v(R, 'Ω'), P: v(P, 'W') };
    switch (given.join('')) {
      case 'UI':
        R = ctx.step('R', 'U/I', vars, 'Ω');
        P = ctx.step('P', 'U·I', vars, 'W');
        break;
      case 'UR':
        I = ctx.step('I', 'U/R', vars, 'A');
        P = ctx.step('P', 'U²/R', vars, 'W');
        break;
      case 'UP':
        I = ctx.step('I', 'P/U', vars, 'A');
        R = ctx.step('R', 'U²/P', vars, 'Ω');
        break;
      case 'IR':
        U = ctx.step('U', 'R·I', vars, 'V');
        P = ctx.step('P', 'R·I²', vars, 'W');
        break;
      case 'IP':
        U = ctx.step('U', 'P/I', vars, 'V');
        R = ctx.step('R', 'P/I²', vars, 'Ω');
        break;
      case 'RP':
        U = ctx.step('U', '√(P·R)', vars, 'V');
        I = ctx.step('I', '√(P/R)', vars, 'A');
        break;
      default:
        break;
    }
    const isGiven = (k) => (given.includes(k) ? 'oppgitt' : '');
    ctx.out('U', 'Spenning U', U, 'V', { primary: !given.includes('U'), note: isGiven('U') });
    ctx.out('I', 'Strøm I', I, 'A', { primary: !given.includes('I'), note: isGiven('I') });
    ctx.out('R', 'Motstand R', R, 'Ω', { primary: !given.includes('R'), note: isGiven('R') });
    ctx.out('P', 'Effekt P', P, 'W', { primary: !given.includes('P'), note: isGiven('P') });
  },
  cases: [
    { name: 'U og I', inputs: { U: '230', I: '10' }, expect: { R: 23, P: 2300 }, source: 'Håndregning' },
    { name: 'U og P', inputs: { U: '230', P: '2000' }, expect: { I: 8.695652, R: 26.45 }, source: 'Håndregning' },
    { name: 'U og R', inputs: { U: '12', R: '4' }, expect: { I: 3, P: 36 }, source: 'Håndregning' },
    { name: 'I og R', inputs: { I: '2', R: '50' }, expect: { U: 100, P: 200 }, source: 'Håndregning' },
    { name: 'I og P', inputs: { I: '5', P: '1150' }, expect: { U: 230, R: 46 }, source: 'Håndregning' },
    { name: 'R og P', inputs: { R: '26,45', P: '2000' }, expect: { U: 230, I: 8.695652 }, source: 'Håndregning' },
  ],
};
