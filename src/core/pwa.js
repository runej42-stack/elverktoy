// Service worker: registrering, oppdateringssjekk og «Ny versjon – Oppdater».
// Oppdateringer tas aldri i bruk i det stille; brukeren trykker selv.
// Her er også appens egen «Installer»-knapp (Chrome og Edge; Safari har bare Del-menyen).

import { canUseServiceWorker, hasDOM, isFileMode, isStandalone } from './env.js';

let waitingWorker = null;
let updateRequested = false;

export function initPWA({ onUpdateReady } = {}) {
  if (!canUseServiceWorker()) return;
  const sw = navigator.serviceWorker;
  sw.addEventListener('controllerchange', () => {
    if (updateRequested) location.reload();
  });
  sw.register('./sw.js').then((reg) => {
    const announce = (worker) => {
      waitingWorker = worker;
      if (onUpdateReady) onUpdateReady();
    };
    if (reg.waiting && sw.controller) announce(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && sw.controller) announce(worker);
      });
    });
    const check = () => reg.update().catch(() => {});
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
  }).catch(() => { /* appen virker uten service worker */ });
}

export function applyUpdate() {
  if (!waitingWorker) return;
  updateRequested = true;
  waitingWorker.postMessage({ type: 'SKIP_WAITING' });
}

/** Ber nettleseren om varig lagring, så jobber og innstillinger ikke slettes ved plassmangel. */
export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      if (await navigator.storage.persisted()) return true;
      return await navigator.storage.persist();
    }
  } catch (e) { /* ikke støttet */ }
  return false;
}

// ---------- Installering ----------
// Nettleseren sender beforeinstallprompt når appen kan installeres. Hendelsen tas vare på,
// så appen kan vise sin egen knapp i stedet for nettleserens linje.

let installEvent = null;
let installed = false;
let installStarted = false;
const installListeners = new Set();

function notifyInstall() {
  for (const fn of [...installListeners]) {
    try { fn(canInstall()); } catch (e) { /* en feil i én visning skal ikke stoppe de andre */ }
  }
}

export function initInstallPrompt() {
  // Som fil eller installert app kommer det aldri noen tilbud om installering.
  if (installStarted || !hasDOM || isFileMode() || isStandalone()) return;
  installStarted = true;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installEvent = e;
    notifyInstall();
  });
  window.addEventListener('appinstalled', () => {
    installEvent = null;
    installed = true;
    notifyInstall();
  });
}

/** Nettleseren tilbyr installering nå (knappen kan vises). */
export function canInstall() {
  return !!installEvent;
}

/** Appen ble installert mens denne siden var åpen. */
export function wasInstalled() {
  return installed;
}

/** Viser nettleserens installeringsdialog. Gir 'accepted', 'dismissed' eller 'unavailable'. */
export async function promptInstall() {
  const e = installEvent;
  if (!e || typeof e.prompt !== 'function') return 'unavailable';
  // Hendelsen kan bare brukes én gang.
  installEvent = null;
  try {
    await e.prompt();
    const choice = await e.userChoice;
    return choice && choice.outcome === 'accepted' ? 'accepted' : 'dismissed';
  } catch (err) {
    return 'unavailable';
  } finally {
    notifyInstall();
  }
}

/**
 * fn kalles når installering blir mulig eller ikke lenger er mulig. Gir en avmeldingsfunksjon.
 * Uten initInstallPrompt (fil, installert app) kommer det aldri endringer, og fn legges ikke til.
 * Visninger bør bruke whileShown (src/ui/components.js), så lyttere for forlatte sider meldes av.
 */
export function onInstallChange(fn) {
  if (!installStarted) return () => {};
  installListeners.add(fn);
  return () => { installListeners.delete(fn); };
}
