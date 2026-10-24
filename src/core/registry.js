// Oppslag i kalkulatorer og kategorier.

import { CALCS } from '../calcs/index.js';
import { CATEGORIES } from '../data/categories.js';

export function allCalcs() {
  return CALCS;
}

export function getCalc(id) {
  return CALCS.find((c) => c.id === id) || null;
}

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}

export function calcsInCategory(id) {
  return CALCS.filter((c) => c.category === id);
}

/** Kategorier som har minst én kalkulator, med antall. */
export function activeCategories() {
  return CATEGORIES
    .map((c) => ({ ...c, count: calcsInCategory(c.id).length }))
    .filter((c) => c.count > 0);
}
