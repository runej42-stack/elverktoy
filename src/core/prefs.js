// Favoritter og sist brukte kalkulatorer.

import { load, save } from './store.js';

export function favorites() {
  return load('favorites', []);
}

export function isFavorite(id) {
  return favorites().includes(id);
}

/** Legger til eller fjerner. Gir true når kalkulatoren nå er favoritt. */
export function toggleFavorite(id) {
  const list = favorites();
  const i = list.indexOf(id);
  if (i >= 0) list.splice(i, 1);
  else list.unshift(id);
  save('favorites', list);
  return i < 0;
}

export function recents() {
  return load('recents', []);
}

export function addRecent(id) {
  const list = recents().filter((x) => x !== id);
  list.unshift(id);
  save('recents', list.slice(0, 8));
}
