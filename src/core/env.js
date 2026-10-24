// Hvor appen kjører: bygget nettside, én fil, utviklingsserver eller tester i Node.

export const hasDOM = typeof window !== 'undefined' && typeof document !== 'undefined';

/** Byggeinfo som tools/build.mjs legger inn. Under utvikling finnes den ikke. */
export function buildInfo() {
  const b = globalThis.__BUILD__;
  return b && typeof b === 'object' ? b : { version: 'dev', brand: null, target: 'dev', date: null };
}

/** Én-fil-versjonen (file://), eller testet med ?fil=1 på utviklingsserveren. */
export function isFileMode() {
  if (buildInfo().target === 'file') return true;
  if (typeof location === 'undefined') return false;
  return location.protocol === 'file:' || new URLSearchParams(location.search).has('fil');
}

/** Startet fra hjem-skjermen (installert app). */
export function isStandalone() {
  if (!hasDOM) return false;
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
}

/** Service worker brukes bare i den bygde nettversjonen over https (eller localhost). */
export function canUseServiceWorker() {
  if (!hasDOM || !('serviceWorker' in navigator)) return false;
  if (buildInfo().target !== 'web' || isFileMode()) return false;
  return window.isSecureContext === true;
}
