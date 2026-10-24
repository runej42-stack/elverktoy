// Rune Johansens merkevareprofil: stempelet med RHJ (design/logo/c-stempel). Dette er profilen som
// legges ut på r-j.no. Bygget velger profil med --brand=.

// Stempelet på et rutenett på 256 × 256: ring og bokstaver hver for seg, så de kan få ulike farger.
const RING = 'M128 10A118 118 0 0 1 128 246A118 118 0 0 1 128 10ZM128 22A106 106 0 0 0 128 234A106 106 0 0 0 128 22Z';
const LETTERS = 'M53 72H76A26 26 0 0 1 86 122L109 168H91L69 124V168H53ZM69 88V108H76A10 10 0 0 0 76 88ZM121 72H137V108H155V72H171V168H155V124H137V168H121ZM187 72H203V170A26 26 0 0 1 177 196H155V180H177A10 10 0 0 0 187 170Z';

const stamp = (ring, letters) => `<path fill="${ring}" fill-rule="evenodd" d="${RING}"/><path fill="${letters}" fill-rule="evenodd" d="${LETTERS}"/>`;
const gradient = (id) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="512" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1b2b33"/><stop offset="1" stop-color="#111b21"/></linearGradient></defs>`;

export const brand = {
  id: 'rhj',
  name: 'Elverktøy',
  shortName: 'Elverktøy',
  owner: '',
  description: 'Kalkulatorer, oppslag og dokumentasjon for elektrikere.',
  // Vises under «Om appen».
  author: { name: 'Rune Johansen', url: 'https://r-j.no', label: 'r-j.no' },
  // Nettadressen appen installeres fra (vises i én-fil-versjonen).
  appUrl: 'https://r-j.no/elverktoy/',
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
  // Samme farge som bunnen av ikonet, så oppstartsbildet på Android henger sammen med ikonet.
  background: '#111b21',
  logo: null,
  mark: `<svg viewBox="0 0 256 256" aria-hidden="true">${stamp('currentColor', 'currentColor')}</svg>`,
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${gradient('rhj-bg')}<rect width="512" height="512" rx="112" fill="url(#rhj-bg)"/><g transform="translate(48 48) scale(1.625)">${stamp('#ffc83d', '#e8ecee')}</g></svg>`,
  iconMaskable: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${gradient('rhj-bg-m')}<rect width="512" height="512" fill="url(#rhj-bg-m)"/><g transform="translate(64 64) scale(1.5)">${stamp('#ffc83d', '#e8ecee')}</g></svg>`,
};
