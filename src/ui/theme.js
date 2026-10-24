// Tema (auto/lyst/mørkt/høy kontrast), hanskemodus og merkevarefarger.

import { brand } from '../brand/active.js';

export const THEMES = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Lyst' },
  { value: 'dark', label: 'Mørkt' },
  { value: 'contrast', label: 'Høy kontrast' },
];

const prefersLight = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

export function resolvedTheme(settings) {
  if (settings.theme === 'auto' || !settings.theme) return prefersLight() ? 'light' : 'dark';
  return settings.theme;
}

export function applyTheme(settings) {
  const root = document.documentElement;
  const theme = resolvedTheme(settings);
  root.dataset.theme = theme;
  root.classList.toggle('glove', !!settings.glove);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? brand.themeColor.light : theme === 'contrast' ? '#000000' : brand.themeColor.dark);
}

/** Følg telefonens lys/mørk-innstilling når temaet står på auto. */
export function watchSystemTheme(getSettings) {
  if (!window.matchMedia) return;
  const mq = window.matchMedia('(prefers-color-scheme: light)');
  const onChange = () => { if (getSettings().theme === 'auto') applyTheme(getSettings()); };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange);
}

const cssVars = (obj) => Object.entries(obj).map(([k, val]) => `--${k}:${val};`).join('');

/** CSS med merkevarefargene. Bygget legger den samme teksten rett i HTML-en. */
export function brandCSS(b = brand) {
  return `:root,:root[data-theme="dark"]{${cssVars(b.colors.dark)}}:root[data-theme="light"]{${cssVars(b.colors.light)}}`;
}

export function injectBrand() {
  let el = document.getElementById('brand-vars');
  if (!el) {
    el = document.createElement('style');
    el.id = 'brand-vars';
    document.head.append(el);
  }
  el.textContent = brandCSS();
}

/** Logo eller merke + navn til toppfeltet. */
export function brandLogoHTML(theme) {
  if (brand.logo) return theme === 'light' ? brand.logo.light : brand.logo.dark;
  return null;
}
