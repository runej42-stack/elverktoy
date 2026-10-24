// Forside, kategorier, søk, «Mer» og sidene som kommer i senere faser.

import { h, clear } from './dom.js';
import { icon } from './icons.js';
import { section, linkList, calcList, emptyNote, whileShown } from './components.js';
import { toast } from './toast.js';
import { go } from './router.js';
import { activeCategories, calcsInCategory, getCalc, getCategory } from '../core/registry.js';
import { favorites, recents } from '../core/prefs.js';
import { search } from '../core/search.js';
import { canInstall, promptInstall, onInstallChange, wasInstalled } from '../core/pwa.js';
import { isStandalone } from '../core/env.js';
import { load, save } from '../core/store.js';
import { FEATURES } from '../core/features.js';
import { brand } from '../brand/active.js';

const INSTALL_DISMISSED = 'ui:installDismissed';
const INSTALL_QUIET_DAYS = 30;

async function install() {
  const result = await promptInstall();
  if (result === 'accepted') toast('Appen er installert');
  return result;
}

/** Brukeren har trykket «Ikke nå» på installeringskortet de siste 30 dagene. */
function installDismissed() {
  const t = load(INSTALL_DISMISSED, 0);
  return typeof t === 'number' && Date.now() - t < INSTALL_QUIET_DAYS * 24 * 3600 * 1000;
}

/** Kortet «Installer appen» på forsiden. Vises bare når nettleseren tilbyr installering. */
function installCard() {
  const card = h('div', { class: 'card install-card', role: 'region', 'aria-label': 'Installer appen' },
    icon('download'),
    h('div', { class: 'install-main' },
      h('div', { class: 'install-title' }, 'Installer appen'),
      h('p', null, 'Få appen på hjem-skjermen. Den virker uten nett.'),
      h('div', { class: 'btn-row' },
        h('button', { type: 'button', class: 'btn primary small', onclick: () => install() }, 'Installer'),
        h('button', {
          type: 'button', class: 'btn ghost small',
          onclick: () => {
            save(INSTALL_DISMISSED, Date.now());
            card.hidden = true;
          },
        }, 'Ikke nå'))));
  const draw = () => { card.hidden = !canInstall() || installDismissed(); };
  draw();
  whileShown(card, onInstallChange, draw);
  return card;
}

export function homeView() {
  const content = h('div', { class: 'home' });
  content.append(h('button', { type: 'button', class: 'search-launch', onclick: () => go('/sok') },
    icon('search'), h('span', null, 'Søk etter kalkulator')));

  const favIds = favorites();
  const favs = favIds.map(getCalc).filter(Boolean);
  if (favs.length) content.append(section('Favoritter', calcList(favs)));

  const rec = recents().filter((id) => !favIds.includes(id)).map(getCalc).filter(Boolean).slice(0, 4);
  if (rec.length) content.append(section('Sist brukt', calcList(rec)));

  content.append(section('Kategorier', h('div', { class: 'tiles' }, activeCategories().map((cat) => h('a', {
    class: 'tile', href: `#/kategori/${cat.id}`,
  },
  icon(cat.icon, 'tile-icon'),
  h('span', { class: 'tile-title' }, cat.title),
  h('span', { class: 'tile-sub' }, `${cat.count} ${cat.count === 1 ? 'kalkulator' : 'kalkulatorer'}`))))));

  content.append(installCard());
  content.append(h('p', { class: 'footnote' }, 'Hjelpemiddel. Kontroller alltid mot NEK 400:2026.'));
  return { brandHeader: true, title: brand.name, content };
}

export function categoryView(id) {
  const cat = getCategory(id);
  if (!cat) return notFound();
  const calcs = calcsInCategory(id);
  const content = h('div', null,
    h('p', { class: 'lead' }, cat.summary),
    calcs.length ? calcList(calcs) : emptyNote('Ingen kalkulatorer her ennå.'));
  return { title: cat.title, back: '/', content };
}

let lastQuery = '';

export function searchView() {
  const input = h('input', {
    type: 'search', class: 'search-input', placeholder: 'F.eks. ik, spenningsfall, kVA',
    enterkeyhint: 'search', autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false',
    'aria-label': 'Søk',
  });
  input.value = lastQuery;
  const list = h('div', { class: 'search-results' });
  const draw = () => {
    lastQuery = input.value;
    clear(list);
    if (!input.value.trim()) {
      list.append(emptyNote('Søk i kalkulatorene. Vanlige forkortelser virker også, som «ik», «du» og «jfb».'));
      return;
    }
    const hits = search(input.value);
    if (!hits.length) {
      list.append(emptyNote('Ingen treff. Prøv et annet ord.'));
      return;
    }
    list.append(linkList(hits.map((hit) => ({ title: hit.title, sub: hit.group ? `${hit.group} · ${hit.summary}` : hit.summary, href: hit.route }))));
  };
  input.addEventListener('input', draw);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = search(input.value)[0];
      if (first) go(first.route);
    }
  });
  draw();
  setTimeout(() => input.focus(), 60);
  return { title: 'Søk', content: h('div', { class: 'search' }, input, list) };
}

/**
 * Raden for installering på Mer-siden: knapp når nettleseren tilbyr det, beskjed når appen nettopp
 * ble installert, ellers lenke til veiledningen.
 */
function installRow() {
  const slot = h('div', { class: 'list' });
  const draw = () => {
    if (wasInstalled()) {
      slot.replaceChildren(h('div', { class: 'row static' },
        icon('check', 'row-icon ok'),
        h('span', { class: 'row-main' },
          h('span', { class: 'row-title' }, 'Appen er installert'),
          h('span', { class: 'row-sub' }, 'Du finner den på hjem-skjermen eller blant programmene'))));
    } else if (canInstall()) {
      slot.replaceChildren(h('button', { type: 'button', class: 'row as-button', onclick: () => install() },
        icon('download', 'row-icon'),
        h('span', { class: 'row-main' },
          h('span', { class: 'row-title' }, 'Installer appen'),
          h('span', { class: 'row-sub' }, 'Få appen på hjem-skjermen. Den virker uten nett.'))));
    } else {
      slot.replaceChildren(linkList([
        { title: 'Installer på mobilen', sub: 'Slik legger du appen på hjem-skjermen', href: '/om/installer', icon: 'download' },
      ]).firstChild);
    }
  };
  draw();
  whileShown(slot, onInstallChange, draw);
  return slot;
}

export function moreView() {
  const items = [
    { title: 'Innstillinger', sub: 'Nett, materiale, grenser, tema og hanskemodus', href: '/innstillinger', icon: 'gear' },
    { title: 'Om appen', sub: 'Versjon, kilder og ansvarsforbehold', href: '/om', icon: 'info' },
    { title: 'Selvtest', sub: 'Kjør alle regneeksemplene på denne telefonen', href: '/selvtest', icon: 'test' },
  ];
  if (FEATURES.tablecheck) {
    items.push({ title: 'Tabellkontroll', sub: 'Sammenlign tabellene for strømføringsevne med NEK 400:2026', href: '/tabellkontroll', icon: 'check' });
  }
  const content = h('div', null, linkList(items));
  // Kjører appen installert, trengs ingen rad for installering.
  if (!isStandalone()) content.append(h('div', { class: 'section' }, installRow()));
  return { title: 'Mer', content };
}

export function notFound() {
  return { title: 'Fant ikke siden', back: '/', content: h('div', null, emptyNote('Siden finnes ikke.'), h('a', { class: 'btn', href: '#/' }, 'Til forsiden')) };
}
