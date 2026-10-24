// Lyttere for installering (whileShown + onInstallChange) skal ikke hope seg opp når brukeren
// bytter side. På iPhone, i Firefox og i installert app kommer det aldri noen installer-hendelse
// som kunne ha ryddet dem bort.

import test from 'node:test';
import assert from 'node:assert/strict';

// Et lite, falskt vindu. Det må finnes før env.js lastes (hasDOM leses ved oppstart).
const winListeners = {};
let standalone = false;
globalThis.window = {
  addEventListener(type, fn) { (winListeners[type] ||= []).push(fn); },
  matchMedia: () => ({ matches: standalone }),
};
globalThis.document = {};

const { whileShown, pruneShown } = await import('../src/ui/components.js');
const pwa = await import('../src/core/pwa.js');

const countAll = () => Object.values(winListeners).reduce((n, list) => n + list.length, 0);

/** onInstallChange som teller hvor mange lyttere som er i bruk. */
function counter() {
  const c = { live: 0 };
  c.subscribe = (cb) => {
    const off = pwa.onInstallChange(cb);
    c.live++;
    return () => { c.live--; off(); };
  };
  return c;
}

/** Som renderRoute: ny side bygges (elementet er ikke på siden ennå), så byttes innholdet. */
function showPage(state, c, fn, prune) {
  const el = { isConnected: false };
  whileShown(el, c.subscribe, fn);
  if (state.current) state.current.isConnected = false;
  el.isConnected = true;
  state.current = el;
  if (prune) pruneShown();
}

pwa.initInstallPrompt();

test('nettleservinduet får lytterne for installering én gang', () => {
  assert.equal(winListeners.beforeinstallprompt.length, 1);
  assert.equal(winListeners.appinstalled.length, 1);
  pwa.initInstallPrompt();
  assert.equal(countAll(), 2);
});

test('lyttere hoper seg ikke opp selv om det aldri kommer en hendelse', () => {
  const c = counter();
  const state = {};
  let draws = 0;
  // Uten opprydding etter sidebytte: lytteren for siden før den forrige meldes av når en ny legges til.
  for (let i = 0; i < 50; i++) showPage(state, c, () => { draws++; }, false);
  assert.ok(c.live <= 2, `${c.live} lyttere etter 50 sidebytter`);
  pruneShown();
  assert.equal(c.live, 1);
  // Med opprydding etter hvert sidebytte (shell.js) er det bare siden som vises, som lytter.
  for (let i = 0; i < 50; i++) {
    showPage(state, c, () => { draws++; }, true);
    assert.equal(c.live, 1);
  }
  assert.equal(draws, 0);

  // En hendelse når bare siden som vises.
  winListeners.beforeinstallprompt[0]({ preventDefault() {} });
  assert.equal(draws, 1);
  assert.equal(pwa.canInstall(), true);
  winListeners.appinstalled[0]({});
  assert.equal(draws, 2);
  assert.equal(pwa.wasInstalled(), true);
  assert.equal(pwa.canInstall(), false);

  // Siden forlates: lytteren meldes av.
  state.current.isConnected = false;
  pruneShown();
  assert.equal(c.live, 0);
});

test('et element som ennå ikke er på siden, mister ikke lytteren når en ny legges til', () => {
  const c = counter();
  const a = { isConnected: false };
  const b = { isConnected: false };
  whileShown(a, c.subscribe, () => {});
  whileShown(b, c.subscribe, () => {});
  assert.equal(c.live, 2);
  // Etter sidebytte er bare elementene på siden igjen.
  a.isConnected = true;
  pruneShown();
  assert.equal(c.live, 1);
  a.isConnected = false;
  pruneShown();
  assert.equal(c.live, 0);
});

test('installert app og fil: ingen lyttere i det hele tatt', async () => {
  const before = countAll();
  standalone = true;
  const asApp = await import('../src/core/pwa.js?installert');
  asApp.initInstallPrompt();
  assert.equal(countAll(), before, 'installert app skal ikke lytte etter installering');
  assert.equal(typeof asApp.onInstallChange(() => {}), 'function');
  standalone = false;

  globalThis.location = { protocol: 'file:', search: '' };
  const asFile = await import('../src/core/pwa.js?fil');
  asFile.initInstallPrompt();
  assert.equal(countAll(), before, 'filversjonen skal ikke lytte etter installering');
  delete globalThis.location;
});
