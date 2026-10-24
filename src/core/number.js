// Tall inn og ut på norsk: desimalkomma, mellomrom som tusenskille og ekte minustegn (U+2212).
// Bevisst uavhengig av nettleserens språkdata, som varierer mellom motorer.

const SPACES = /[\s\u00a0\u2009\u202f]/g;
export const MINUS = '−';
const NBSP = '\u00a0';

/** Tolker tekst fra et tallfelt. Gir null for tomt felt og NaN for ugyldig tall. */
export function parseNumber(input) {
  if (typeof input === 'number') return Number.isFinite(input) ? input : NaN;
  if (input == null) return null;
  let s = String(input).replace(SPACES, '').replace(/[−–]/g, '-');
  if (s === '') return null;
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma >= 0 && lastDot >= 0) {
    // Begge finnes: det siste er desimaltegnet, det andre er tusenskille.
    s = lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (lastComma >= 0) {
    if (s.indexOf(',') !== lastComma) return NaN;
    s = s.replace(',', '.');
  }
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return NaN;
  return Number(s);
}

/**
 * Formaterer et tall på norsk.
 * opts.sig    gjeldende siffer (standard 3)
 * opts.dec    fast antall desimaler (overstyrer sig)
 * opts.maxDec øvre grense for desimaler (standard 6)
 * opts.trim   fjern avsluttende nuller (standard når sig brukes)
 */
export function formatNumber(x, opts = {}) {
  if (x == null || !Number.isFinite(x)) return '–';
  const { sig = 3, dec, maxDec = 6 } = opts;
  let decimals;
  if (dec != null) decimals = dec;
  else if (x === 0) decimals = 0;
  else decimals = Math.min(maxDec, Math.max(0, sig - 1 - Math.floor(Math.log10(Math.abs(x)))));
  let s = roundHalfUp(Math.abs(x), decimals).toFixed(decimals);
  const trim = opts.trim ?? dec == null;
  if (trim && s.includes('.')) s = s.replace(/\.?0+$/, '');
  let [int, frac] = s.split('.');
  if (int.length > 4) int = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  const negative = x < 0 && Number(s) !== 0;
  return (negative ? MINUS : '') + int + (frac ? ',' + frac : '');
}

// Avrunder som på papir (26,45 → 26,5), uten feilen toFixed gir når tallet ikke kan lagres eksakt.
function roundHalfUp(x, decimals) {
  const s = String(x);
  if (s.includes('e')) return x;
  return Number(Math.round(Number(s + 'e' + decimals)) + 'e-' + decimals);
}

/** Tall med enhet, f.eks. «3,7 %» eller «16 A». */
export function formatValue(x, unit, opts) {
  const n = formatNumber(x, opts);
  return unit ? n + NBSP + unit : n;
}

/** Verdi slik den vises i et tallfelt: desimalkomma, uten tusenskille. */
export function formatInput(x) {
  if (x == null || !Number.isFinite(x)) return '';
  const s = String(Math.round(x * 1e9) / 1e9);
  return s.replace('.', ',');
}
