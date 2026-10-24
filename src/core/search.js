// Søk i kalkulatorer (og etter hvert formler og oppslag), med synonymer.

import { CALCS } from '../calcs/index.js';
import { CATEGORIES } from '../data/categories.js';
import { SYNONYMS } from '../data/synonyms.js';
import { contentSearchEntries } from '../content/index.js';

/** Små bokstaver, æøå → ae/o/a, greske tegn til navn, bare bokstaver og tall. */
export function norm(s) {
  return String(s).toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .replace(/δ/g, 'd').replace(/φ/g, 'phi').replace(/ω/g, 'ohm').replace(/η/g, 'eta').replace(/²/g, '2')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

let synonymMap = null;
function synonyms() {
  if (synonymMap) return synonymMap;
  synonymMap = new Map();
  for (const group of SYNONYMS) {
    const terms = group.map(norm);
    for (const t of terms) {
      const set = synonymMap.get(t) || new Set();
      for (const o of terms) if (o !== t) set.add(o);
      synonymMap.set(t, set);
    }
  }
  return synonymMap;
}

let index = null;
const extraSources = [];

/** Andre deler av appen (formler, oppslag) kan registrere søkbare oppføringer. */
export function registerSearchSource(fn) {
  extraSources.push(fn);
  index = null;
}

function entry({ type, id, title, summary = '', keywords = [], route, group }) {
  const nTitle = norm(title);
  return {
    type, id, title, summary, route, group,
    nTitle,
    titleWords: nTitle.split(' '),
    keywords: keywords.map(norm),
    hay: [nTitle, norm(summary), ...keywords.map(norm), norm(group || '')].join(' '),
  };
}

function buildIndex() {
  const list = CALCS.map((c) => entry({
    type: 'calc', id: c.id, title: c.title, summary: c.summary, keywords: c.keywords || [],
    route: `/k/${c.id}`, group: (CATEGORIES.find((k) => k.id === c.category) || {}).title,
  }));
  for (const e of contentSearchEntries()) list.push(entry(e));
  for (const fn of extraSources) for (const e of fn()) list.push(entry(e));
  return list;
}

function termScore(e, t) {
  if (e.nTitle.startsWith(t)) return 100;
  if (e.keywords.includes(t)) return 80;
  if (e.titleWords.some((w) => w.startsWith(t))) return 70;
  if (e.keywords.some((k) => k.startsWith(t) || k.split(' ').some((w) => w.startsWith(t)))) return 50;
  if (t.length >= 3 && e.hay.includes(t)) return 20;
  return 0;
}

export function search(query, limit = 40) {
  const terms = norm(query).split(' ').filter(Boolean);
  if (!terms.length) return [];
  if (!index) index = buildIndex();
  const syn = synonyms();
  const hits = [];
  for (const e of index) {
    let score = 0;
    let all = true;
    for (const t of terms) {
      let best = termScore(e, t);
      for (const alt of syn.get(t) || []) best = Math.max(best, termScore(e, alt) * 0.9);
      if (!best) { all = false; break; }
      score += best;
    }
    // Ved likt treff kommer kalkulatorer foran formler og fagtips.
    if (all) hits.push({ ...e, score: score + (e.type === 'calc' ? 5 : 0) });
  }
  return hits
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'nb'))
    .slice(0, limit);
}
