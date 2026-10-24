import { v } from '../core/engine.js';
import { formatValue } from '../core/number.js';
import { resistanceAt } from '../lib/kabel.js';
import { materialField, sizeField, sizeOptions } from './fields.js';

export const calc = {
  id: 'resistans',
  v: 1,
  title: 'Ledermotstand',
  category: 'maling',
  summary: 'Forventet motstand i leder, sløyfe eller R1 + R2 – til kontinuitetsmåling.',
  keywords: ['resistans', 'motstand', 'kontinuitet', 'r1+r2', 'r1 r2', 'pe', 'jordleder', 'måling', 'forventet'],
  refs: ['IEC 60228:2023 (lederresistans)', 'NEK 400:2026, del 6 (kontinuitetsmåling)'],
  modes: [
    { id: 'en', label: 'Én leder' },
    { id: 'r1r2', label: 'R1 + R2' },
    { id: 'krets', label: 'Fram og tilbake' },
  ],
  inputs: [
    { id: 'L', label: 'Lengde', type: 'number', unit: 'm', min: 0, minExclusive: true, placeholder: 'f.eks. 25' },
    materialField(),
    sizeField({ label: 'Tverrsnitt fase' }),
    {
      id: 'Spe', label: 'Tverrsnitt PE', type: 'select', dropdown: true,
      options: (s, x) => sizeOptions(x.material), default: (s, x) => x.S,
      when: (x) => x.mode === 'r1r2',
    },
    {
      id: 'theta', label: 'Ledertemperatur ved måling', type: 'number', unit: '°C', min: -40, max: 100, default: 20,
      allowNegative: true, help: 'Måling på kald kabel: omgivelsestemperaturen.',
    },
    { id: 'flex', label: 'Fleksibel leder (klasse 5)', type: 'toggle', default: false, advanced: true, when: (x) => x.material === 'Cu' },
    { id: 'measured', label: 'Målt verdi (valgfritt)', type: 'number', unit: 'Ω', optional: true, min: 0, advanced: true },
  ],
  compute(x, ctx) {
    const { material, theta, L } = x;
    const flexible = material === 'Cu' && x.flex;
    const lineR = (S, name) => {
      const r = resistanceAt({ material, S, flexible, theta }, ctx);
      return ctx.step(name, 'r·L/1000', { r: v(r, 'Ω/km'), L: v(L, 'm') }, 'Ω');
    };
    let R;
    if (x.mode === 'en') {
      R = lineR(x.S, 'R');
      ctx.out('R', 'Motstand i én leder', R, 'Ω', { primary: true, sig: 3 });
    } else if (x.mode === 'krets') {
      const R1 = lineR(x.S, 'R1');
      R = ctx.step('R', '2·R1', { R1: v(R1, 'Ω') }, 'Ω', { text: 'Fram og tilbake (to like ledere)' });
      ctx.out('R', 'Motstand fram og tilbake', R, 'Ω', { primary: true, sig: 3 });
    } else {
      const R1 = lineR(x.S, 'R1');
      const R2 = lineR(x.Spe, 'R2');
      R = ctx.step('R1 + R2', 'R1 + R2', { R1: v(R1, 'Ω'), R2: v(R2, 'Ω') }, 'Ω');
      ctx.out('R', 'R1 + R2', R, 'Ω', { primary: true, sig: 3 });
      ctx.out('R1', 'R1 (fase)', R1, 'Ω');
      ctx.out('R2', 'R2 (PE)', R2, 'Ω');
    }
    if (x.measured != null) {
      const dev = ctx.step('Avvik', '(Rmålt − R)/R·100', { Rmålt: v(x.measured, 'Ω'), R: v(R, 'Ω') }, '%');
      ctx.out('dev', 'Avvik fra forventet', dev, '%', { sig: 2 });
      if (dev > 25) ctx.warn(`Målt verdi er ${formatValue(dev, '%', { sig: 2 })} høyere enn forventet. Sjekk koblinger, klemmer og at riktig leder er målt.`);
    }
    ctx.assume('Måleledningene er nullstilt (kompensert) på instrumentet.');
    ctx.assume(`Lederresistans etter IEC 60228 ved 20 °C, omregnet til ${formatValue(theta, '°C')}.`);
  },
  cases: [
    { name: '25 m 2,5 mm² ved 20 °C', inputs: { mode: 'en', L: '25', material: 'Cu', S: 2.5, theta: '20' }, expect: { R: 0.18525 }, source: 'Håndregning: 7,41 Ω/km · 0,025 km' },
    { name: 'R1+R2 30 m 2,5/1,5 mm²', inputs: { mode: 'r1r2', L: '30', material: 'Cu', S: 2.5, Spe: 1.5, theta: '20' }, expect: { R: 0.5853, R1: 0.2223, R2: 0.363 }, source: 'Håndregning: (7,41 + 12,1)·0,030' },
    { name: 'Fram og tilbake 50 m 1,5 mm² ved 10 °C', inputs: { mode: 'krets', L: '50', material: 'Cu', S: 1.5, theta: '10' }, expect: { R: 1.162447 }, source: 'Håndregning: 2·12,1·(1 − 0,0393)·0,050' },
  ],
};
