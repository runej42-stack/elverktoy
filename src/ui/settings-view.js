// Innstillinger og «Om appen».

import { h, nextId } from './dom.js';
import { icon } from './icons.js';
import { segmented, toggleSwitch, section, badge, whileShown } from './components.js';
import { THEMES } from './theme.js';
import { toast } from './toast.js';
import { getSettings, setSetting, NETWORKS, DEFAULTS } from '../core/settings.js';
import { formatInput, parseNumber } from '../core/number.js';
import { buildInfo, isFileMode, isStandalone } from '../core/env.js';
import { canInstall, promptInstall, onInstallChange, wasInstalled } from '../core/pwa.js';
import { FEATURES } from '../core/features.js';
import { R20_SOURCE } from '../data/ledere.js';
import { MCB_SOURCE, GG_SOURCE } from '../data/vern.js';
import { IZ_TABLES } from '../data/iz.js';
import { brand } from '../brand/active.js';

function row(label, control, help) {
  return h('div', { class: 'field' }, h('div', { class: 'field-label' }, label), control, help ? h('div', { class: 'field-help' }, help) : null);
}

function numberSetting(key, unit, { min, max }) {
  const id = nextId('s');
  const inp = h('input', { id, type: 'text', inputmode: 'decimal', autocomplete: 'off', value: formatInput(getSettings()[key]) });
  const save = () => {
    const x = parseNumber(inp.value);
    if (x == null || Number.isNaN(x) || x < min || x > max) {
      inp.value = formatInput(getSettings()[key]);
      toast(`Må være mellom ${formatInput(min)} og ${formatInput(max)} ${unit}`);
      return;
    }
    setSetting(key, x);
  };
  inp.addEventListener('change', save);
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });
  return h('div', { class: 'input-wrap' }, inp, h('span', { class: 'unit' }, unit));
}

export function settingsView() {
  const s = getSettings();
  const networkList = h('div', { class: 'radio-list', role: 'radiogroup', 'aria-label': 'Standard nett' });
  const drawNetworks = () => networkList.replaceChildren(...NETWORKS.map((n) => h('button', {
    type: 'button', role: 'radio', class: 'radio-row', 'aria-checked': String(getSettings().network === n.id),
    onclick: () => { setSetting('network', n.id); drawNetworks(); },
  }, h('span', { class: 'radio-dot', 'aria-hidden': 'true' }), h('span', null, n.label))));
  drawNetworks();

  const glove = toggleSwitch({ id: nextId('s'), checked: s.glove, onChange: (on) => setSetting('glove', on) });

  const content = h('div', { class: 'settings' },
    section('Standardverdier',
      row('Standard nett', networkList, 'Brukes som utgangspunkt for spenning og trefaseberegninger. Du kan alltid endre spenningen i hver kalkulator.'),
      row('Ledermateriale', segmented({
        options: [{ value: 'Cu', label: 'Kobber' }, { value: 'Al', label: 'Aluminium' }],
        value: s.material, onChange: (val) => setSetting('material', val),
      }).el),
      row('Maks ledertemperatur', segmented({
        options: [{ value: 70, label: '70 °C' }, { value: 90, label: '90 °C' }],
        value: s.conductorTemp, onChange: (val) => setSetting('conductorTemp', val),
      }).el, '70 °C: termoplast, eller termoherd der klemmene bare tåler 70 °C. 90 °C: termoherd med klemmer for 90 °C (NEK 400:2026).'),
      row('Grense for spenningsfall', numberSetting('vdLimit', '%', { min: 0.5, max: 20 }), 'Standard 4 %.'),
      row('Reaktans for kabel', numberSetting('reactance', 'Ω/km', { min: 0, max: 1 }), 'Standard 0,08 Ω/km.')),
    section('Grunnlag for kortslutning',
      row('Spenningsfaktor c maks', numberSetting('cmax', '', { min: 1, max: 1.2 }), '1,05 ved ±6 % spenningstoleranse, 1,10 ved ±10 % (IEC 60909). NELFO bruker 1,1.'),
      row('Spenningsfaktor c min', numberSetting('cmin', '', { min: 0.8, max: 1 }), 'Standard 0,95 (NELFO, CENELEC TR 50480).'),
      row('cos φk for nettet', numberSetting('netCos', '', { min: 0.05, max: 1 }), 'Fordeler nettets impedans på R og X ved Ik maks. Standard 0,9.')),
    section('Visning',
      row('Tema', segmented({ options: THEMES, value: s.theme, onChange: (val) => setSetting('theme', val) }).el),
      h('div', { class: 'field field-inline' }, h('div', { class: 'field-row' },
        h('label', { class: 'field-label', for: glove.input.id }, 'Hanskemodus'), glove.el),
      h('div', { class: 'field-help' }, 'Større knapper og tekst, for bruk med hansker eller i dårlig lys.'))),
    section('Tilbakestill',
      h('button', {
        type: 'button', class: 'btn',
        onclick: () => {
          for (const [k, val] of Object.entries(DEFAULTS)) if (k !== 'accepted') setSetting(k, val);
          toast('Standardverdiene er satt tilbake');
          location.hash = '#/innstillinger';
          location.reload();
        },
      }, 'Sett standardverdiene tilbake')));
  return { title: 'Innstillinger', back: '/mer', content };
}

const externalLink = (href, text) => h('a', { href, target: '_blank', rel: 'noopener' }, text);

/** Avslutter teksten med punktum hvis den ikke har det fra før. */
const sentence = (s) => {
  const t = String(s || '').trim();
  return /[.!?]$/.test(t) ? t : `${t}.`;
};

/**
 * Kildene tabellene for strømføringsevne er skrevet av fra, uten like navn.
 * Merknaden i parentes til slutt (hvordan tabellen ble lest) tas bort, så samme kilde bare står én gang.
 */
function izSourceNames() {
  const names = [];
  for (const t of Object.values(IZ_TABLES)) {
    for (const s of (t && t.sources) || []) {
      const name = s && s.name ? s.name.replace(/\s*\([^()]*\)\s*$/, '') : '';
      if (name && !names.includes(name)) names.push(name);
    }
  }
  return names;
}

function sourcesList() {
  const names = izSourceNames();
  return h('ul', { class: 'sources' },
    h('li', null, 'Strømføringsevne og korreksjonsfaktorer: IEC 60364-5-52:2009 tillegg B, tabell B.52.2–B.52.21 (samme tabeller som i NEK 400-5-52).',
      names.length ? [' Skrevet av fra:', h('ul', { class: 'source-list' }, names.map((n) => h('li', null, n)))] : null),
    h('li', null, `Lederresistans: ${sentence(R20_SOURCE.source)}`),
    h('li', null, `Automatsikringer: ${sentence(MCB_SOURCE.source)}`),
    h('li', null, `Sikringer gG: ${sentence(GG_SOURCE.source)}`),
    h('li', null, 'Kortslutning: CENELEC TR 50480 og IEC 60909-0, med c-faktorer og ledertemperaturer slik NELFO bruker dem.'),
    h('li', null, 'Spenningsfall: NEK 400:2026, 525 og tillegg G (veiledende).'),
    h('li', null, 'Varmekabel: Nexans Varmehåndboka 2026 (veiledende verdier).'),
    h('li', null, 'Belysning: NS-EN 12464-1.'),
    h('li', null, 'Jordfeilbryter: NEK EN 61008/61009.'),
    h('li', null, 'PoE: IEEE 802.3af/at/bt.'));
}

/** Seksjonen «Installer appen». Tegnes på nytt når nettleseren tilbyr eller trekker tilbake installering. */
function installSection() {
  const body = h('div');
  const draw = () => {
    if (isStandalone()) {
      body.replaceChildren(h('div', { class: 'card ok-card' }, icon('check'), h('span', null, 'Appen er installert på denne enheten.')));
      return;
    }
    const parts = [];
    if (isFileMode()) {
      if (brand.appUrl) {
        parts.push(h('p', null, 'Denne versjonen er en fil. Appen installeres fra nettadressen:'),
          h('p', null, externalLink(brand.appUrl, brand.appUrl)));
      } else {
        parts.push(h('p', null, 'Denne versjonen er en fil. Appen installeres fra nettadressen, ikke fra filen.'));
      }
    } else if (wasInstalled()) {
      parts.push(h('div', { class: 'card ok-card' }, icon('check'), h('span', null, 'Appen er installert. Du finner den på hjem-skjermen eller blant programmene.')));
    } else if (canInstall()) {
      parts.push(h('p', null, h('button', {
        type: 'button', class: 'btn primary',
        onclick: async () => {
          if (await promptInstall() === 'accepted') toast('Appen er installert');
        },
      }, icon('download'), 'Installer appen')));
    }
    parts.push(
      h('ul', { class: 'install-steps' },
        h('li', null, h('strong', null, 'iPhone og iPad (Safari): '), 'Trykk på Del-knappen og velg «Legg til på Hjem-skjerm».'),
        h('li', null, h('strong', null, 'Android (Chrome): '), 'Trykk på menyen ⋮ og velg «Installer app» (eller «Legg til på startsiden»).'),
        h('li', null, h('strong', null, 'PC (Chrome eller Edge): '), 'Klikk på installer-ikonet i adressefeltet.')),
      h('p', { class: 'muted' }, 'Appen virker uten nett når den er åpnet én gang.'));
    body.replaceChildren(...parts);
  };
  draw();
  whileShown(body, onInstallChange, draw);
  const el = section('Installer appen', body);
  el.id = 'installer';
  return el;
}

export function aboutView(focusId) {
  const b = buildInfo();
  const author = brand.author && brand.author.name ? brand.author : null;
  const content = h('div', { class: 'about' },
    h('div', { class: 'card' },
      h('div', { class: 'about-head' }, h('h2', null, brand.name), FEATURES.beta ? badge('Beta') : null),
      h('p', null, brand.description),
      h('p', { class: 'muted' }, `Versjon ${b.version}${b.date ? ` · bygget ${b.date}` : ''}`),
      author ? h('p', { class: 'muted' }, `Laget av ${author.name}`,
        author.url ? [' · ', externalLink(author.url, author.label || author.url)] : null) : null,
      brand.owner ? h('p', { class: 'muted' }, brand.owner) : null,
      FEATURES.beta ? h('p', null, 'Appen er i beta. Tabellene for strømføringsevne er skrevet av fra offentlige kilder og er ikke kontrollert mot NEK 400:2026 ennå. Kontroller resultatene ekstra nøye.') : null),
    section('Ansvarsforbehold',
      h('p', null, 'Appen er et hjelpemiddel. Den erstatter ikke NEK 400, prosjekteringsverktøy eller faglig vurdering. Kontroller alltid resultatene før du bruker dem.'),
      h('p', null, 'Appen bygger på NEK 400:2026, som har gjeldt siden 1.7.2026. Etter DSBs overgangsregler kan NEK 400:2022 brukes til prosjektering ut 2026, og slike anlegg må være ferdige innen utgangen av 2027.')),
    installSection(),
    section('Kilder',
      sourcesList(),
      h('p', { class: 'muted' }, 'Hver kalkulator viser kildene sine nederst på siden.')),
    section('Personvern',
      h('p', null, 'Alt du skriver inn, lagres bare på denne enheten. Appen sender ingen data noe sted.')));
  return { title: 'Om appen', back: '/mer', content, focusId: focusId || null };
}
