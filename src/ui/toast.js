// Korte meldinger nederst på skjermen, og dialogvinduer.

import { h } from './dom.js';

let toastEl = null;
let timer = 0;

export function toast(message, ms = 2600) {
  if (!toastEl) {
    toastEl = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
    document.body.append(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(timer);
  timer = setTimeout(() => toastEl.classList.remove('show'), ms);
}

/**
 * Enkel dialog. actions: [{ label, primary, onClick }]. onClick kan returnere false for å
 * holde dialogen åpen.
 */
export function showModal({ title, body, actions = [], dismissable = true }) {
  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e) => { if (e.key === 'Escape' && dismissable) close(); };
  const buttons = actions.map((a) => h('button', {
    type: 'button',
    class: a.primary ? 'btn primary' : 'btn',
    onclick: () => { if (!a.onClick || a.onClick() !== false) close(); },
  }, a.label));
  const dialog = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'modal-title' },
    h('h2', { id: 'modal-title' }, title),
    h('div', { class: 'modal-body' }, body),
    h('div', { class: 'modal-actions' }, buttons));
  const overlay = h('div', {
    class: 'overlay',
    onclick: (e) => { if (e.target === overlay && dismissable) close(); },
  }, dialog);
  document.addEventListener('keydown', onKey);
  document.body.append(overlay);
  const first = dialog.querySelector('button.primary') || dialog.querySelector('button');
  if (first) first.focus();
  return { close };
}
