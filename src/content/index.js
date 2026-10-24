// Oppslagsinnholdet og søkeoppføringene for det.

import { FORMULAS, FORMULA_GROUPS } from './formulas.js';
import { TIPS } from './tips.js';
import { REFERENCE, REFERENCE_GROUPS, getReference } from './reference.js';

export { FORMULAS, FORMULA_GROUPS, TIPS, REFERENCE, REFERENCE_GROUPS, getReference };

export const getFormula = (id) => FORMULAS.find((f) => f.id === id) || null;
export const getTip = (id) => TIPS.find((t) => t.id === id) || null;

/** Søkeoppføringer for formler og fagtips (registreres i søket ved oppstart). */
export function contentSearchEntries() {
  const plain = (s) => s.replace(/[_^{}]/g, '');
  return [
    ...FORMULAS.map((f) => ({
      type: 'formula', id: f.id, title: f.title, summary: plain(f.expr), group: `Formel · ${f.group}`,
      keywords: [...(f.keywords || []), ...f.vars.map((x) => x[1])], route: `/oppslag/formler/${f.id}`,
    })),
    ...TIPS.map((t) => ({
      type: 'tip', id: t.id, title: t.title, summary: t.summary, group: 'Fagtips',
      keywords: t.keywords || [], route: `/oppslag/fagtips/${t.id}`,
    })),
    ...REFERENCE.map((r) => ({
      type: 'reference', id: r.id, title: r.title, summary: r.summary, group: `Oppslag · ${r.group}`,
      keywords: r.keywords || [], route: `/oppslag/side/${r.id}`,
    })),
  ];
}
