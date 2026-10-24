// Appens egne, enkle strek-ikoner (24 × 24).

const stroke = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const fill = (d) => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${d}</svg>`;

const ICONS = {
  calc: stroke('<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8.5 6.5h7"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h.01M15.5 18h.01"/>'),
  search: stroke('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>'),
  jobs: stroke('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M3 12.5h18"/>'),
  book: stroke('<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19"/><path d="M9 7.5h6"/>'),
  more: fill('<circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/>'),
  back: stroke('<path d="M15 18l-6-6 6-6"/>'),
  chevron: stroke('<path d="M9 6l6 6-6 6"/>'),
  star: stroke('<path d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.5l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>'),
  starFilled: fill('<path d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.5l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>'),
  share: stroke('<path d="M12 3v12"/><path d="M7.5 7.5L12 3l4.5 4.5"/><path d="M5 12.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5"/>'),
  steps: stroke('<path d="M17 4H7l6 8-6 8h10"/>'),
  check: stroke('<path d="M5 12.5l4.5 4.5L19 7"/>'),
  x: stroke('<path d="M6 6l12 12M18 6L6 18"/>'),
  alert: stroke('<path d="M12 3.5l9 16H3z"/><path d="M12 10v4.5"/><path d="M12 17.5h.01"/>'),
  info: stroke('<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.5h.01"/>'),
  gear: stroke('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>'),
  reset: stroke('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>'),
  bolt: fill('<path d="M13.5 2L4.5 13.5h6.2L9.5 22l9-11.5h-6.2z"/>'),
  cable: stroke('<path d="M3 17c4 0 4.5-10 9-10s5 10 9 10"/><circle cx="3" cy="17" r="1.2"/><circle cx="21" cy="17" r="1.2"/>'),
  shield: stroke('<path d="M12 3l7.5 3v6c0 4.6-3.2 7.8-7.5 9-4.3-1.2-7.5-4.4-7.5-9V6z"/><path d="M12.8 7.5L9.5 12.5h3l-.8 4 3.3-5h-3z"/>'),
  omega: stroke('<path d="M5 20h4v-2.2A7 7 0 1 1 15 17.8V20h4"/>'),
  motor: stroke('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 15.5v-7l3.5 4.5 3.5-4.5v7"/>'),
  heat: stroke('<path d="M7 20c-2-3 2-5 0-8s2-5 0-8"/><path d="M12 20c-2-3 2-5 0-8s2-5 0-8"/><path d="M17 20c-2-3 2-5 0-8s2-5 0-8"/>'),
  plug: stroke('<path d="M9 3v4.5M15 3v4.5"/><path d="M6.5 7.5h11v3a5.5 5.5 0 0 1-11 0z"/><path d="M12 16v5"/>'),
  bulb: stroke('<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1v.1h5v-.1c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3z"/>'),
  tools: stroke('<path d="M14.7 6.3a4 4 0 0 0 5 5L12 19l-3.5 1 1-3.5 7.7-7.7"/><path d="M14.7 6.3L17.5 3.5l3 3-2.8 2.8"/>'),
  gauge: stroke('<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l3.5-4.5"/><path d="M3 20.5h18"/>'),
  sun: stroke('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>'),
  moon: stroke('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
  test: stroke('<path d="M9 3h6"/><path d="M10 3v6.5L4.8 18.3A1.8 1.8 0 0 0 6.4 21h11.2a1.8 1.8 0 0 0 1.6-2.7L14 9.5V3"/><path d="M7.5 15h9"/>'),
  copy: stroke('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>'),
  download: stroke('<path d="M12 4v11"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M5 20h14"/>'),
};

/** Ikon som <span>. Ukjent navn gir et tomt ikon. */
export function icon(name, cls = '') {
  const span = document.createElement('span');
  span.className = `ic ${cls}`.trim();
  span.innerHTML = ICONS[name] || '';
  return span;
}

export const iconSVG = (name) => ICONS[name] || '';
