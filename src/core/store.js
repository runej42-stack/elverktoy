// Liten nøkkel/verdi-lagring i localStorage, med try/catch så appen virker også når lagring er sperret.
// Virker ikke localStorage (f.eks. én-fil-versjonen på enkelte telefoner), brukes minnet.

const PREFIX = 'elverktoy:';
const memory = new Map();
let works = null;

export function storageWorks() {
  if (works !== null) return works;
  try {
    const k = PREFIX + '__test';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    works = true;
  } catch (e) {
    works = false;
  }
  return works;
}

export function load(key, fallback) {
  try {
    const s = storageWorks() ? localStorage.getItem(PREFIX + key) : memory.get(key);
    return s == null ? fallback : JSON.parse(s);
  } catch (e) {
    return fallback;
  }
}

export function save(key, value) {
  const s = JSON.stringify(value);
  try {
    if (storageWorks()) localStorage.setItem(PREFIX + key, s);
    else memory.set(key, s);
  } catch (e) {
    memory.set(key, s);
  }
}

export function remove(key) {
  try {
    if (storageWorks()) localStorage.removeItem(PREFIX + key);
  } catch (e) { /* ignorer */ }
  memory.delete(key);
}
