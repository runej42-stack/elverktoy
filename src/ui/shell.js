// Appens skall: toppfelt, innhold, bunnmeny eller verktøylinje, og oppstart.

import { h, clear } from './dom.js';
import { icon } from './icons.js';
import { segmented, badge, pruneShown } from './components.js';
import { toast, showModal } from './toast.js';
import { startRouter, go, back, currentPath } from './router.js';
import { applyTheme, watchSystemTheme, injectBrand, brandLogoHTML, resolvedTheme } from './theme.js';
import { homeView, categoryView, searchView, moreView, notFound } from './views.js';
import { jobsListView, jobView, jobInfoView, circuitView, checklistView } from './jobs-views.js';
import { lookupView, formulasView, tipsView, tipView, referenceView } from './lookup-views.js';
import { calcView } from './calc-view.js';
import { settingsView, aboutView } from './settings-view.js';
import { selftestView } from './selftest-view.js';
import { tablecheckView, tableDetailView } from './tablecheck-view.js';
import { getCalc } from '../core/registry.js';
import { getSettings, setSetting, onSettingsChange, NETWORKS, DISCLAIMER_VERSION } from '../core/settings.js';
import { initPWA, applyUpdate, requestPersistence, initInstallPrompt } from '../core/pwa.js';
import { isFileMode, isStandalone } from '../core/env.js';
import { load, save, storageWorks } from '../core/store.js';
import { FEATURES } from '../core/features.js';
import { brand } from '../brand/active.js';

const TABS = [
  { id: 'kalk', label: 'Kalkulatorer', icon: 'calc', path: '/' },
  { id: 'sok', label: 'Søk', icon: 'search', path: '/sok' },
  { id: 'jobber', label: 'Jobber', icon: 'jobs', path: '/jobber' },
  { id: 'oppslag', label: 'Oppslag', icon: 'book', path: '/oppslag' },
  { id: 'mer', label: 'Mer', icon: 'more', path: '/mer' },
];

const ROUTES = [
  { pattern: /^\/$/, tab: 'kalk', view: homeView },
  { pattern: /^\/kategori\/([\w-]+)$/, tab: 'kalk', view: categoryView },
  { pattern: /^\/k\/([\w-]+)$/, tab: 'kalk', view: (id) => { const def = getCalc(id); return def ? calcView(def) : notFound(); } },
  { pattern: /^\/sok$/, tab: 'sok', view: searchView },
  { pattern: /^\/jobber$/, tab: 'jobber', view: jobsListView },
  { pattern: /^\/jobber\/([\w-]+)$/, tab: 'jobber', view: jobView },
  { pattern: /^\/jobber\/([\w-]+)\/info$/, tab: 'jobber', view: jobInfoView },
  { pattern: /^\/jobber\/([\w-]+)\/kurs\/([\w-]+)$/, tab: 'jobber', view: circuitView },
  { pattern: /^\/jobber\/([\w-]+)\/sluttkontroll$/, tab: 'jobber', view: (id) => checklistView(id, 'sluttkontroll') },
  { pattern: /^\/jobber\/([\w-]+)\/risiko$/, tab: 'jobber', view: (id) => checklistView(id, 'risiko') },
  { pattern: /^\/oppslag$/, tab: 'oppslag', view: lookupView },
  { pattern: /^\/oppslag\/formler$/, tab: 'oppslag', view: () => formulasView() },
  { pattern: /^\/oppslag\/formler\/([\w-]+)$/, tab: 'oppslag', view: (id) => formulasView(id) },
  { pattern: /^\/oppslag\/fagtips$/, tab: 'oppslag', view: tipsView },
  { pattern: /^\/oppslag\/side\/([\w-]+)$/, tab: 'oppslag', view: referenceView },
  { pattern: /^\/oppslag\/fagtips\/([\w-]+)$/, tab: 'oppslag', view: tipView },
  { pattern: /^\/mer$/, tab: 'mer', view: moreView },
  { pattern: /^\/innstillinger$/, tab: 'mer', view: settingsView },
  { pattern: /^\/om$/, tab: 'mer', view: () => aboutView() },
  { pattern: /^\/om\/installer$/, tab: 'mer', view: () => aboutView('installer') },
  { pattern: /^\/selvtest$/, tab: 'mer', view: selftestView },
  // Tabellkontroll er bare med når bygget tar den med (--tabellkontroll) og under utvikling.
  ...(FEATURES.tablecheck ? [
    { pattern: /^\/tabellkontroll$/, tab: 'mer', view: tablecheckView },
    { pattern: /^\/tabellkontroll\/([\w.-]+)$/, tab: 'mer', view: tableDetailView },
  ] : []),
];

let header, main, bottom, banner;
const scrollPositions = new Map();
let shownPath = null;

function brandEl() {
  const logo = brandLogoHTML(resolvedTheme(getSettings()));
  const beta = FEATURES.beta ? badge('Beta') : null;
  if (logo) {
    return h('div', { class: 'brand' }, h('span', { class: 'brand-logo', html: logo }), h('span', { class: 'brand-name small' }, 'Elverktøy'), beta);
  }
  return h('div', { class: 'brand' }, h('span', { class: 'brand-mark', html: brand.mark }), h('span', { class: 'brand-name' }, brand.name), beta);
}

function tabBar(activeTab) {
  return h('nav', { class: 'tabs', 'aria-label': 'Hovedmeny' }, TABS.map((t) => h('a', {
    href: '#' + t.path,
    class: 'tab',
    'aria-current': t.id === activeTab ? 'page' : null,
  }, icon(t.icon), h('span', null, t.label))));
}

function renderRoute(route, params, path) {
  if (shownPath) scrollPositions.set(shownPath, window.scrollY);
  let view;
  try {
    view = route.view(...params);
  } catch (e) {
    view = { title: 'Noe gikk galt', back: '/', content: h('div', { class: 'card error' }, icon('alert'), h('span', null, e.message)) };
  }

  clear(header);
  if (view.back) header.append(h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Tilbake', onclick: () => back(view.back) }, icon('back')));
  if (view.brandHeader) header.append(brandEl());
  else header.append(h('div', { class: 'titles' }, h('h1', null, view.title), view.subtitle ? h('div', { class: 'sub' }, view.subtitle) : null));

  clear(main);
  main.append(view.content);
  clear(bottom);
  bottom.append(view.toolbar || tabBar(route.tab));
  document.body.classList.toggle('has-toolbar', !!view.toolbar);
  // Bred side på PC (kalkulator med felt og resultat ved siden av hverandre).
  document.body.classList.toggle('wide', !!view.wide);
  // Lyttere for siden som ble forlatt, trengs ikke lenger.
  pruneShown();

  document.title = view.brandHeader ? brand.name : `${view.title} – ${brand.shortName}`;
  shownPath = path;
  const target = view.focusId && document.getElementById(view.focusId);
  if (target) target.scrollIntoView({ block: 'start' });
  else window.scrollTo(0, scrollPositions.get(path) || 0);
  save('lastRoute', { path, t: Date.now() });
}

function showUpdateBanner() {
  if (banner) return;
  banner = h('div', { class: 'update-banner', role: 'status' },
    h('span', null, 'Ny versjon er klar.'),
    h('button', { type: 'button', class: 'btn primary small', onclick: () => applyUpdate() }, 'Oppdater'));
  document.body.append(banner);
}

function showWelcome() {
  const s = getSettings();
  const seg = segmented({
    options: NETWORKS.map((n) => ({ value: n.id, label: n.short })),
    value: s.network,
    onChange: (val) => setSetting('network', val),
    cls: 'wrap',
  });
  showModal({
    title: `Velkommen til ${brand.name}`,
    dismissable: false,
    body: h('div', null,
      h('p', null, 'Kalkulatorer og oppslag for elektrikere, med utregningen vist steg for steg.'),
      h('p', null, h('strong', null, 'Appen er et hjelpemiddel. '), 'Den erstatter ikke NEK 400, prosjekteringsverktøy eller faglig vurdering. Kontroller resultatene før du bruker dem.'),
      FEATURES.beta ? h('p', null, 'Appen er i beta, og tabellene for strømføringsevne er ikke kontrollert mot NEK 400:2026 ennå.') : null,
      h('div', { class: 'field' }, h('div', { class: 'field-label' }, 'Hvilket nett jobber du mest i?'), seg.el,
        h('div', { class: 'field-help' }, 'Kan endres under Mer → Innstillinger.'))),
    actions: [{ label: 'Jeg forstår', primary: true, onClick: () => setSetting('accepted', DISCLAIMER_VERSION) }],
  });
}

/**
 * Måler toppfeltet og bunnlinjen og setter --topbar-h og --bottombar-h, så CSS vet hvor mye plass
 * de tar (fast resultatkolonne på PC, og felt som får fokus, skal ikke havne under dem).
 */
function watchBarHeights(topbar, bottombar) {
  // Uten ResizeObserver brukes reserveverdiene i css/app.css.
  if (typeof ResizeObserver !== 'function') return;
  const root = document.documentElement;
  const measure = () => {
    root.style.setProperty('--topbar-h', `${Math.ceil(topbar.getBoundingClientRect().height)}px`);
    root.style.setProperty('--bottombar-h', `${Math.ceil(bottombar.getBoundingClientRect().height)}px`);
  };
  // Kalles første gang når feltene er tegnet, og så hver gang høyden endrer seg (hanskemodus, ny verktøylinje).
  const ro = new ResizeObserver(measure);
  ro.observe(topbar);
  ro.observe(bottombar);
}

/** Den installerte appen på iPhone starter alltid på forsiden. Gå tilbake dit brukeren var nylig. */
function restoreLastRoute() {
  if (location.hash && location.hash !== '#/' && location.hash !== '#') return;
  if (!isStandalone()) return;
  const last = load('lastRoute', null);
  if (last && last.path && last.path !== '/' && Date.now() - last.t < 2 * 3600 * 1000) {
    history.replaceState({ depth: 0 }, '', '#' + last.path);
  }
}

export function boot() {
  injectBrand();
  applyTheme(getSettings());
  watchSystemTheme(getSettings);
  onSettingsChange((s, key) => {
    if (key === 'theme' || key === 'glove') applyTheme(s);
  });

  // Innholdet i toppfeltet ligger i en indre kolonne, så det står over innholdet på brede skjermer.
  header = h('div', { class: 'topbar-inner' });
  main = h('main', { id: 'main' });
  bottom = h('div', { class: 'bottombar' });
  const app = document.getElementById('app');
  clear(app);
  const topbar = h('header', { class: 'topbar' }, header);
  app.append(topbar, main, bottom);
  watchBarHeights(topbar, bottom);

  // Interne lenker går via ruteren, så tilbake-knappen vet hvor den skal.
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#/"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    go(a.getAttribute('href').slice(1));
  });

  // Fang nettleserens tilbud om installering før ruteren tegner første side.
  if (!isFileMode() && !isStandalone()) initInstallPrompt();
  restoreLastRoute();
  startRouter(ROUTES, renderRoute);
  initPWA({ onUpdateReady: showUpdateBanner });

  if ((getSettings().accepted || 0) < DISCLAIMER_VERSION) showWelcome();
  if (!storageWorks()) {
    toast(isFileMode() ? 'Lagring virker ikke når appen åpnes som fil her. Innstillinger lagres ikke.' : 'Lagring virker ikke. Innstillinger lagres ikke.', 6000);
  } else if (isStandalone()) {
    requestPersistence();
  }
  window.__elverktoy = { go, currentPath };
}
