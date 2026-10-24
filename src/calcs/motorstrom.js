import { v } from '../core/engine.js';
import { phasesField, voltageField } from './fields.js';

const START = [
  { value: 'DOL', label: 'Direktestart' },
  { value: 'YD', label: 'Stjerne/trekant' },
  { value: 'soft', label: 'Mykstarter' },
  { value: 'vfd', label: 'Frekvensomformer' },
];

export const calc = {
  id: 'motorstrom',
  v: 1,
  title: 'Motorstrøm og start',
  category: 'motor',
  summary: 'Merkestrøm fra akseleffekt, startstrøm for ulike startmetoder og innstilling av motorvern.',
  keywords: ['motor', 'merkestrøm', 'in', 'startstrøm', 'direktestart', 'dol', 'stjerne trekant', 'y/δ', 'mykstarter', 'frekvensomformer', 'motorvern', 'virkningsgrad'],
  refs: ['Typeskiltet på motoren går foran beregnede verdier.'],
  inputs: [
    phasesField({ default: 3 }),
    voltageField(),
    { id: 'P', label: 'Akseleffekt (typeskilt)', type: 'number', unit: 'kW', min: 0, minExclusive: true, placeholder: 'f.eks. 7,5' },
    { id: 'eta', label: 'Virkningsgrad η', type: 'number', unit: '%', min: 10, max: 100, default: 90, help: 'Typisk 85–95 % for IE3-motorer over 1 kW.' },
    { id: 'cosphi', label: 'Effektfaktor cos φ', type: 'number', min: 0.1, max: 1, default: 0.85 },
    { id: 'start', label: 'Startmetode', type: 'select', options: START, default: 'DOL' },
    {
      id: 'k', label: 'Startstrøm Ia/In', type: 'number', min: 1, max: 15, default: 7,
      when: (x) => x.start === 'DOL' || x.start === 'YD',
      help: 'Fra typeskiltet (ofte 6–8). Effektive IE3/IE4-motorer kan ligge høyere.',
    },
    {
      id: 'ksoft', label: 'Strømbegrensning i mykstarter', type: 'number', unit: '× In', min: 1, max: 8, default: 3.5,
      when: (x) => x.start === 'soft',
    },
  ],
  compute(x, ctx) {
    const { phases, U, P, eta, cosphi } = x;
    const Pin = ctx.step('Pinn', 'P/(η/100)', { P: v(P, 'kW'), η: v(eta, '%') }, 'kW', { text: 'Tilført elektrisk effekt' });
    const vars = { Pinn: v(Pin, 'kW'), U: v(U, 'V'), cosφ: cosphi };
    const In = phases === 3
      ? ctx.step('In', 'Pinn·1000/(√3·U·cosφ)', vars, 'A', { text: 'Merkestrøm' })
      : ctx.step('In', 'Pinn·1000/(U·cosφ)', vars, 'A', { text: 'Merkestrøm' });
    let Ia;
    if (x.start === 'DOL') Ia = ctx.step('Ia', 'k·In', { k: x.k, In: v(In, 'A') }, 'A', { text: 'Startstrøm ved direktestart' });
    else if (x.start === 'YD') Ia = ctx.step('Ia', 'k·In/3', { k: x.k, In: v(In, 'A') }, 'A', { text: 'Stjerne/trekant: en tredjedel av direktestart' });
    else if (x.start === 'soft') Ia = ctx.step('Ia', 'k·In', { k: x.ksoft, In: v(In, 'A') }, 'A', { text: 'Begrenset av mykstarteren' });
    else Ia = ctx.step('Ia', '1,5·In', { In: v(In, 'A') }, 'A', { text: 'Frekvensomformer: typisk inntil 1,5 · In' });

    ctx.out('In', 'Merkestrøm In', In, 'A', { primary: true });
    ctx.out('Ia', 'Startstrøm', Ia, 'A', { primary: true });
    ctx.out('Pin', 'Tilført effekt', Pin, 'kW');
    if (x.start === 'YD') {
      const set = ctx.step('Motorvern', 'In/√3', { In: v(In, 'A') }, 'A', { text: 'Motorvern plassert i faseviklingen (etter kontaktorene)' });
      ctx.out('relay', 'Motorvern (i faseviklingen)', set, 'A');
      ctx.note('Står motorvernet i tilførselen før stjerne/trekant-kontaktorene, stilles det på In.');
    } else {
      ctx.out('relay', 'Motorvern stilles på', In, 'A', { note: 'In fra typeskiltet' });
    }
    if (x.start === 'DOL' || x.start === 'YD') {
      ctx.note('Startstrømmen kan løse ut en B-automat (momentanutløsning 3–5 · In). Motorkurser har derfor ofte C- eller D-karakteristikk.');
    }
    if (x.start === 'YD') ctx.note('Startmomentet blir også bare en tredjedel. Sjekk at motoren klarer å starte lasten.');
    ctx.assume('Merkestrømmen på typeskiltet går foran beregnet verdi.');
  },
  cases: [
    { name: '7,5 kW direktestart', inputs: { phases: 3, U: '400', P: '7,5', eta: '90', cosphi: '0,85', start: 'DOL', k: '7' }, expect: { In: 14.15075, Ia: 99.05523, Pin: 8.333333 }, source: 'Håndregning: 8333/(√3·400·0,85); 7·In' },
    { name: '7,5 kW stjerne/trekant', inputs: { phases: 3, U: '400', P: '7,5', eta: '90', cosphi: '0,85', start: 'YD', k: '7' }, expect: { Ia: 33.01841, relay: 8.169938 }, source: 'Håndregning: 99,055/3; 14,151/√3' },
    { name: '2,2 kW enfase', inputs: { phases: 1, U: '230', P: '2,2', eta: '80', cosphi: '0,9', start: 'soft', ksoft: '3' }, expect: { In: 13.28502, Ia: 39.85507 }, source: 'Håndregning: 2750/(230·0,9)' },
    { name: '11 kW frekvensomformer, IT 230 V', inputs: { phases: 3, U: '230', P: '11', eta: '91', cosphi: '0,86', start: 'vfd' }, expect: { In: 35.28291, Ia: 52.92436 }, source: 'Håndregning: 12088/(√3·230·0,86)' },
  ],
};
