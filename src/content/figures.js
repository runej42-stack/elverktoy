// Egne figurer (SVG) til oppslagene. Strektegningen følger tekstfargen (currentColor).

const svg = (w, h, body, label) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" font-size="11">${body}</svg>`;

const BROWN = '#8b5a2b';
const BLACK = '#333';
const GREY = '#999';
const BLUE = '#2b6cb0';
const GREEN = '#3a9d3a';
const Y = { L1: 34, L2: 54, L3: 74, N: 96, PE: 118, PEN: 107 };
const X0 = 66;
const XI = 170; // inntak
const X1 = 372;

const line = (x1, y1, x2, y2, color, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3" ${extra}/>`;
const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="3.5" fill="currentColor"/>`;
const label = (x, y, t, extra = '') => `<text x="${x}" y="${y}" fill="currentColor" ${extra}>${t}</text>`;
const earth = (x, y) => `<path d="M${x} ${y} v14 M${x - 12} ${y + 14} h24 M${x - 8} ${y + 19} h16 M${x - 4} ${y + 24} h8" stroke="currentColor" stroke-width="2" fill="none"/>`;
const PE_DASH = 'stroke-dasharray="8 4"';

function transformer(neutral) {
  let s = '<circle cx="40" cy="74" r="24" fill="none" stroke="currentColor" stroke-width="2"/>';
  s += '<path d="M40 74 v-15 M40 74 l13 8 M40 74 l-13 8" stroke="currentColor" stroke-width="2" fill="none"/>';
  s += label(18, 20, 'Trafo', 'font-weight="bold"');
  if (neutral === 'jordet') s += '<path d="M40 98 v52" stroke="currentColor" stroke-width="2"/>' + earth(40, 150);
  if (neutral === 'impedans') {
    s += '<path d="M40 98 v12 M40 132 v18" stroke="currentColor" stroke-width="2"/>';
    s += '<rect x="33" y="110" width="14" height="22" fill="none" stroke="currentColor" stroke-width="2"/>' + earth(40, 150);
    s += label(52, 125, 'isolert eller', 'font-size="10"') + label(52, 137, 'høy impedans', 'font-size="10"');
  }
  return s;
}

function phases(xStart = X0) {
  return ['L1', 'L2', 'L3'].map((k, i) => line(xStart, Y[k], X1, Y[k], [BROWN, BLACK, GREY][i]) + label(X1 + 6, Y[k] + 4, k)).join('');
}

const intake = () => `<line x1="${XI}" y1="16" x2="${XI}" y2="200" stroke="currentColor" stroke-dasharray="3 4" opacity=".6"/>${label(XI - 18, 12, 'Inntak', 'font-size="10"')}`;

// Utstyr med to tilkoblinger (a, b) og PE til kapslingen.
function equipment(a, b, pe) {
  let s = '<rect x="252" y="160" width="96" height="44" rx="6" fill="none" stroke="currentColor" stroke-width="2"/>';
  s += label(278, 186, 'Utstyr');
  s += `<line x1="270" y1="${Y[a]}" x2="270" y2="160" stroke="currentColor" stroke-width="1.5"/>${dot(270, Y[a])}`;
  s += `<line x1="292" y1="${Y[b]}" x2="292" y2="160" stroke="currentColor" stroke-width="1.5"/>${dot(292, Y[b])}`;
  if (pe === 'line') s += `<path d="M330 ${Y.PE} V182 H348" stroke="${GREEN}" stroke-width="2" fill="none" ${PE_DASH}/>${dot(330, Y.PE)}`;
  return s;
}

export const FIGURES = {
  tn: svg(410, 236, [
    transformer('jordet'),
    phases(),
    // PEN fram til inntaket, deles i N og PE der.
    line(X0, Y.PEN, XI, Y.PEN, GREEN), line(X0, Y.PEN, XI, Y.PEN, BLUE, 'stroke-dasharray="10 10"'),
    label(78, Y.PEN - 5, 'PEN', 'font-size="10"'),
    line(XI, Y.N, X1, Y.N, BLUE) + label(X1 + 6, Y.N + 4, 'N'),
    line(XI, Y.PE, X1, Y.PE, GREEN, PE_DASH) + label(X1 + 6, Y.PE + 4, 'PE'),
    `<line x1="${XI}" y1="${Y.N}" x2="${XI}" y2="${Y.PE}" stroke="currentColor" stroke-width="2"/>${dot(XI, Y.PEN)}`,
    `<line x1="196" y1="${Y.PE}" x2="196" y2="150" stroke="currentColor" stroke-width="2"/>${dot(196, Y.PE)}${earth(196, 150)}`,
    intake(),
    equipment('L1', 'N', 'line'),
    label(62, 226, 'Enfaselast mellom fase og N (230 V). Jordfeil = kortslutning via PE.', 'font-size="10"'),
  ].join(''), 'TN-C-S 400/230 V'),

  it: svg(410, 236, [
    transformer('impedans'),
    phases(),
    line(196, Y.PE, X1, Y.PE, GREEN, PE_DASH) + label(X1 + 6, Y.PE + 4, 'PE'),
    `<line x1="196" y1="${Y.PE}" x2="196" y2="150" stroke="currentColor" stroke-width="2"/>${dot(196, Y.PE)}${earth(196, 150)}`,
    intake(),
    equipment('L1', 'L2', 'line'),
    label(62, 226, 'Ingen N. Enfaselast mellom to faser (230 V). 1. jordfeil kobler normalt ikke ut.', 'font-size="10"'),
  ].join(''), 'IT 230 V'),

  tt: svg(410, 236, [
    transformer('jordet'),
    phases(),
    line(X0, Y.N, X1, Y.N, BLUE) + label(X1 + 6, Y.N + 4, 'N'),
    intake(),
    equipment('L1', 'N', 'none'),
    `<path d="M348 182 H362 V200" stroke="${GREEN}" stroke-width="2" fill="none" ${PE_DASH}/>${earth(362, 200)}`,
    label(190, 232, 'Anleggets egen jordelektrode', 'font-size="10"'),
    label(62, 214, 'Feilstrømmen går gjennom jord –', 'font-size="10"'),
    label(62, 226, 'jordfeilbryter kobler ut.', 'font-size="10"'),
  ].join(''), 'TT'),

  bad: svg(400, 250, `
    <path d="M20 220 H380" stroke="currentColor" stroke-width="2"/>
    <rect x="40" y="40" width="120" height="130" fill="#2b6cb0" opacity=".16"/>
    <rect x="160" y="40" width="60" height="180" fill="#ffb23d" opacity=".22"/>
    <rect x="40" y="170" width="120" height="50" rx="6" fill="#2b6cb0" opacity=".38" stroke="currentColor" stroke-width="2"/>
    <path d="M40 40 H220 M160 40 V170 M220 40 V220" stroke="currentColor" stroke-dasharray="6 4" fill="none"/>
    <text x="74" y="200" fill="currentColor" font-weight="bold" font-size="12">Sone 0</text>
    <text x="74" y="104" fill="currentColor" font-weight="bold" font-size="12">Sone 1</text>
    <text x="166" y="104" fill="currentColor" font-weight="bold" font-size="12">Sone 2</text>
    <text x="48" y="160" fill="currentColor" font-size="10">over badekar / dusjkar</text>
    <path d="M160 232 H220 M160 228 v8 M220 228 v8" stroke="currentColor"/>
    <text x="176" y="246" fill="currentColor" font-size="10">0,6 m</text>
    <path d="M300 40 V220 M294 40 H306 M294 220 H306" stroke="currentColor"/>
    <text x="310" y="134" fill="currentColor" font-size="11">2,25 m</text>
  `, 'Soner i baderom: sone 0 i karet, sone 1 over karet opp til 2,25 m, sone 2 0,6 m utenfor sone 1'),
};
