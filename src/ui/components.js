// Gjenbrukbare byggeklosser: valgknapper, bryter, lister og seksjoner.

import { h, nextId } from './dom.js';
import { icon } from './icons.js';

/**
 * Valgknapper (segmentert kontroll). options: [{ value, label }].
 * Gir { el, set(value), setOptions(options) }.
 */
export function segmented({ label, options, value, onChange, cls = '' }) {
  const labelId = nextId('seg');
  const group = h('div', { class: `seg ${cls}`.trim(), role: 'radiogroup', 'aria-labelledby': label ? labelId : null });
  let current = value;
  let opts = options;
  const draw = () => {
    group.replaceChildren(...opts.map((o) => h('button', {
      type: 'button',
      role: 'radio',
      'aria-checked': String(String(o.value) === String(current)),
      onclick: () => {
        if (String(o.value) === String(current)) return;
        current = o.value;
        draw();
        onChange(o.value);
      },
    }, o.label)));
  };
  draw();
  const el = label ? h('div', { class: 'seg-wrap' }, h('div', { class: 'field-label', id: labelId }, label), group) : group;
  return {
    el,
    set(val) { if (String(val) !== String(current)) { current = val; draw(); } },
    setOptions(next) { opts = next; draw(); },
  };
}

/** Av/på-bryter. */
export function toggleSwitch({ id, checked, onChange }) {
  const input = h('input', { id, type: 'checkbox', class: 'switch-input', role: 'switch' });
  input.checked = !!checked;
  input.addEventListener('change', () => onChange(input.checked));
  return { el: h('span', { class: 'switch' }, input, h('span', { class: 'switch-track', 'aria-hidden': 'true' })), input };
}

export function section(title, ...children) {
  return h('section', { class: 'section' }, title ? h('h2', { class: 'section-title' }, title) : null, ...children);
}

/** Liste med rader som lenker. items: [{ title, sub, href, icon, trailing }]. */
export function linkList(items) {
  return h('div', { class: 'list' }, items.map((it) => h('a', { class: 'row', href: '#' + it.href },
    it.icon ? icon(it.icon, 'row-icon') : null,
    h('span', { class: 'row-main' },
      h('span', { class: 'row-title' }, it.title),
      it.sub ? h('span', { class: 'row-sub' }, it.sub) : null),
    it.trailing || icon('chevron', 'row-chev'))));
}

export function calcList(calcs) {
  return linkList(calcs.map((c) => ({ title: c.title, sub: c.summary, href: `/k/${c.id}` })));
}

export function emptyNote(text) {
  return h('p', { class: 'muted' }, text);
}

// Lyttere som bare gjelder mens elementet sitt er på siden: { el, seen, stop }.
// seen: elementet har vært på siden (eller var det da lytteren ble lagt til).
const shownListeners = new Set();

/**
 * Melder av lyttere der elementet ikke lenger er på siden. shell.js kaller den etter hvert sidebytte.
 * all = false brukes når en ny lytter legges til: da får elementer som ennå ikke har vært på siden
 * (siden som bygges nå), stå.
 */
export function pruneShown(all = true) {
  for (const entry of [...shownListeners]) {
    if (entry.el.isConnected) entry.seen = true;
    else if (all || entry.seen) entry.stop();
  }
}

/**
 * Kjører fn ved hver endring så lenge el er på siden. Lyttere for sider som er forlatt, meldes av
 * når en ny lytter legges til, etter sidebytte og ved neste endring. På iPhone, i Firefox og i
 * installert app kommer det kanskje aldri noen endring, så det holder ikke å vente på den.
 * subscribe(cb) skal gi en avmeldingsfunksjon (f.eks. onInstallChange). Gir selv en avmeldingsfunksjon.
 */
export function whileShown(el, subscribe, fn) {
  pruneShown(false);
  let off = null;
  const entry = {
    el,
    seen: !!el.isConnected,
    stop() {
      shownListeners.delete(entry);
      if (typeof off === 'function') off();
      off = null;
    },
  };
  shownListeners.add(entry);
  off = subscribe(() => {
    if (!el.isConnected) {
      entry.stop();
      return;
    }
    fn();
  });
  return entry.stop;
}

/** Lite merke, f.eks. «Beta» ved navnet. */
export function badge(text) {
  return h('span', { class: 'badge' }, text);
}
