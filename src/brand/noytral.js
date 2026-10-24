// Nøytral merkevareprofil (arbeidsnavn «Elverktøy»). Navn, farger og ikon kan endres her
// uten å røre resten av koden. Bygget velger profil med --brand=.

const BOLT = 'M292 56 L128 296 H236 L212 456 L384 208 H276 Z';

export const brand = {
  id: 'noytral',
  name: 'Elverktøy',
  shortName: 'Elverktøy',
  owner: '',
  description: 'Kalkulatorer, oppslag og dokumentasjon for elektrikere.',
  colors: {
    dark: {
      bg: '#0f141a', surface: '#18202a', 'surface-2': '#222c38', line: 'rgba(255,255,255,.12)',
      text: '#eef2f6', muted: '#9aa7b4', accent: '#ffc83d', 'accent-ink': '#1a1a1a', 'accent-text': '#ffc83d',
    },
    light: {
      bg: '#f2f4f7', surface: '#ffffff', 'surface-2': '#e8ecf1', line: 'rgba(0,0,0,.12)',
      text: '#121820', muted: '#566270', accent: '#ffc83d', 'accent-ink': '#1a1a1a', 'accent-text': '#8a5d00',
    },
  },
  themeColor: { dark: '#0f141a', light: '#f2f4f7' },
  background: '#0f141a',
  logo: null,
  mark: `<svg viewBox="0 0 512 512" aria-hidden="true"><path d="${BOLT}" fill="currentColor"/></svg>`,
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2833"/><stop offset="1" stop-color="#0f141a"/></linearGradient></defs><rect width="512" height="512" rx="112" fill="url(#g)"/><path d="${BOLT}" fill="#ffc83d"/></svg>`,
  iconMaskable: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#141a21"/><g transform="translate(76.8 76.8) scale(0.7)"><path d="${BOLT}" fill="#ffc83d"/></g></svg>`,
};
