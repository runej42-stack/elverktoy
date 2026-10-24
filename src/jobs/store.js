// Lagring av jobber i IndexedDB (én post per jobb). Uten IndexedDB, f.eks. når appen åpnes
// som fil på enkelte telefoner eller i tester, brukes den vanlige nøkkel/verdi-lagringen.

import { load, save } from '../core/store.js';
import { JOB_SCHEMA } from './model.js';

const DB = 'elverktoy';
const STORE = 'jobs';
let dbPromise = null;

function hasIDB() {
  try { return typeof indexedDB !== 'undefined' && indexedDB !== null; } catch (e) { return false; }
}

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => {
      const db = req.result;
      // Åpner på nytt neste gang hvis nettleseren stenger forbindelsen (skjer på iOS).
      db.onclose = () => { dbPromise = null; };
      db.onversionchange = () => { db.close(); dbPromise = null; };
      resolve(db);
    };
    req.onerror = () => { dbPromise = null; reject(req.error); };
    req.onblocked = () => { dbPromise = null; reject(new Error('Databasen er blokkert av en annen fane')); };
  });
  return dbPromise;
}

async function withStore(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Avbrutt'));
  });
}

// Reserve: alle jobber i én nøkkel.
const fallback = {
  all: () => load('jobs', []),
  write: (list) => save('jobs', list),
};

let useFallback = !hasIDB();

async function attempt(idbFn, fbFn) {
  if (!useFallback) {
    try { return await idbFn(); } catch (e) { useFallback = true; }
  }
  return fbFn();
}

export async function listJobs() {
  const list = await attempt(() => withStore('readonly', (s) => s.getAll()), () => fallback.all());
  return (list || []).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export async function getJob(id) {
  return attempt(() => withStore('readonly', (s) => s.get(id)), () => fallback.all().find((j) => j.id === id) || null);
}

export async function saveJob(job, { touch = true } = {}) {
  const copy = JSON.parse(JSON.stringify(job));
  if (touch) copy.updatedAt = new Date().toISOString();
  copy.schema = JOB_SCHEMA;
  await attempt(() => withStore('readwrite', (s) => s.put(copy)), () => {
    const list = fallback.all().filter((j) => j.id !== copy.id);
    list.push(copy);
    fallback.write(list);
  });
  return copy;
}

export async function deleteJob(id) {
  await attempt(() => withStore('readwrite', (s) => s.delete(id)), () => fallback.write(fallback.all().filter((j) => j.id !== id)));
}

export const storageKind = () => (useFallback ? 'localStorage' : 'IndexedDB');

// ---------- Sikkerhetskopi ----------

async function sha256(text) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return null;
  }
}

/** Sikkerhetskopi som tekst (JSON) med versjon og kontrollsum. */
export async function exportBackup({ appVersion, settings }) {
  const jobs = await listJobs();
  const body = { format: 'elverktoy-backup', schema: JOB_SCHEMA, appVersion, exportedAt: new Date().toISOString(), settings, jobs };
  const json = JSON.stringify(body);
  return JSON.stringify({ ...body, sha256: await sha256(json) }, null, 1);
}

/** Leser en sikkerhetskopi. Gir { jobs, settings, problems } uten å lagre noe. */
export async function parseBackup(text) {
  const problems = [];
  let data;
  try { data = JSON.parse(text); } catch (e) { return { jobs: [], settings: null, problems: ['Filen er ikke en gyldig sikkerhetskopi.'] }; }
  if (!data || data.format !== 'elverktoy-backup' || !Array.isArray(data.jobs)) {
    return { jobs: [], settings: null, problems: ['Filen er ikke en sikkerhetskopi fra Elverktøy.'] };
  }
  if (data.sha256) {
    const { sha256: sum, ...rest } = data;
    const check = await sha256(JSON.stringify(rest));
    if (check && check !== sum) problems.push('Kontrollsummen stemmer ikke. Filen kan være endret eller skadet.');
  }
  if (data.schema > JOB_SCHEMA) problems.push('Kopien er laget av en nyere versjon av appen. Oppdater appen først.');
  const jobs = data.jobs.filter((j) => j && j.id && Array.isArray(j.circuits));
  return { jobs, settings: data.settings || null, problems };
}

/** Fletter jobber inn: nye legges til, eksisterende erstattes bare hvis kopien er nyere. Sletter aldri. */
export async function importJobs(jobs) {
  const existing = new Map((await listJobs()).map((j) => [j.id, j]));
  let added = 0; let updated = 0; let skipped = 0;
  for (const j of jobs) {
    const cur = existing.get(j.id);
    if (!cur) { await saveJob(j, { touch: false }); added++; } else if (String(j.updatedAt) > String(cur.updatedAt)) { await saveJob(j, { touch: false }); updated++; } else skipped++;
  }
  return { added, updated, skipped };
}
