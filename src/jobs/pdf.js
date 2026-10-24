// Liten PDF-skriver uten pakker. Bruker tre av standardfontene som alle PDF-lesere har:
// Helvetica og Helvetica-Bold (WinAnsi, dekker æøå, ° ² ± µ ·) og Symbol (Ω Δ √ ≤ ≥ φ π − …).
// Teksten bygges i biter per font, så «R = 7,41 Ω» blir Helvetica + Symbol på samme linje.

import { HELVETICA, HELVETICA_BOLD, SYMBOL } from './pdf-fonts.js';

export const A4 = { w: 595.28, h: 841.89 };

// Unicode → WinAnsi (cp1252) for tegnene mellom 0x80 og 0x9F.
const CP1252 = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87,
  0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91,
  0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98,
  0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
};

// Tegn uten egen glyf i fontene erstattes.
const FALLBACK = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
  'ₖ': 'k', 'ₙ': 'n', 'ₘ': 'm', 'ₐ': 'a', 'ₓ': 'x', '\u2009': ' ', '\u202f': ' ', '\u200b': '',
  '✓': 'OK', '✗': 'X', '★': '*', '″': '"', '′': "'",
};

function winAnsi(cp) {
  if (cp >= 0x20 && cp <= 0x7e) return cp;
  if (cp >= 0xa0 && cp <= 0xff) return cp;
  return CP1252[cp] ?? null;
}

/** Deler teksten i biter: { font: 'H' | 'S', bytes: [...], width (1/1000 em) }. */
export function runs(text, bold = false) {
  const widths = bold ? HELVETICA_BOLD : HELVETICA;
  const out = [];
  const push = (font, code, w) => {
    const last = out[out.length - 1];
    if (last && last.font === font) { last.bytes.push(code); last.width += w; } else out.push({ font, bytes: [code], width: w });
  };
  for (const ch of String(text)) {
    const mapped = FALLBACK[ch];
    if (mapped !== undefined) {
      for (const c of mapped) push('H', c.charCodeAt(0), widths[c.charCodeAt(0) - 32] || 500);
      continue;
    }
    const code = winAnsi(ch.codePointAt(0));
    if (code != null) { push('H', code, widths[code - 32] || 500); continue; }
    if (SYMBOL[ch]) { push('S', SYMBOL[ch][0], SYMBOL[ch][1]); continue; }
    push('H', 0x3f, widths[0x3f - 32]);
  }
  return out;
}

export function textWidth(text, size, bold = false) {
  return runs(text, bold).reduce((a, r) => a + r.width, 0) * size / 1000;
}

/** Bryter tekst i linjer som får plass i bredden (ord for ord, lange ord deles). */
export function wrap(text, width, size, bold = false) {
  const lines = [];
  for (const para of String(text ?? '').split('\n')) {
    let line = '';
    for (const word of para.split(/ +/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (textWidth(candidate, size, bold) <= width || !line) {
        if (!line && textWidth(word, size, bold) > width) {
          // Ord som er lengre enn hele bredden deles tegn for tegn.
          let part = '';
          for (const ch of word) {
            if (textWidth(part + ch, size, bold) > width && part) { lines.push(part); part = ''; }
            part += ch;
          }
          line = part;
        } else line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

const num = (n) => (Math.round(n * 100) / 100).toString();

function pdfString(bytes) {
  let s = '(';
  for (const b of bytes) {
    if (b === 0x28 || b === 0x29 || b === 0x5c) s += '\\' + String.fromCharCode(b);
    else if (b < 0x20 || b > 0x7e) s += '\\' + b.toString(8).padStart(3, '0');
    else s += String.fromCharCode(b);
  }
  return s + ')';
}

function hexUTF16(text) {
  let hex = 'FEFF';
  for (const ch of String(text)) {
    const cp = ch.codePointAt(0);
    if (cp > 0xffff) {
      const v = cp - 0x10000;
      hex += (0xd800 + (v >> 10)).toString(16).padStart(4, '0') + (0xdc00 + (v & 0x3ff)).toString(16).padStart(4, '0');
    } else hex += cp.toString(16).padStart(4, '0');
  }
  return `<${hex.toUpperCase()}>`;
}

const rgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((c) => num(c)).join(' ');
};

/** Et PDF-dokument. Koordinater i punkter med origo øverst til venstre (y nedover). */
export class PdfDoc {
  constructor({ title = '', author = '', creator = '', date = new Date() } = {}) {
    this.info = { title, author, creator, date };
    this.pages = [];
    this.page = null;
  }

  addPage() {
    this.page = { ops: [], list: [] };
    this.pages.push(this.page);
    return this.pages.length;
  }

  op(s) { this.page.ops.push(s); }

  /** Tekst med venstre kant x og grunnlinje y. align: 'left' | 'right' | 'center' (x er da høyre kant/midt). */
  text(x, y, str, { size = 10, bold = false, color = '#000000', align = 'left' } = {}) {
    if (str == null || str === '') return 0;
    const parts = runs(str, bold);
    const w = parts.reduce((a, r) => a + r.width, 0) * size / 1000;
    let cx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
    const py = A4.h - y;
    this.page.list.push({ t: 'text', x: cx, y, str: String(str), size, bold, color });
    this.op(`${rgb(color)} rg`);
    for (const r of parts) {
      const font = r.font === 'S' ? 'F3' : bold ? 'F2' : 'F1';
      this.op(`BT /${font} ${num(size)} Tf 1 0 0 1 ${num(cx)} ${num(py)} Tm ${pdfString(r.bytes)} Tj ET`);
      cx += r.width * size / 1000;
    }
    return w;
  }

  line(x1, y1, x2, y2, { width = 0.5, color = '#000000' } = {}) {
    this.page.list.push({ t: 'line', x1, y1, x2, y2, width, color });
    this.op(`${num(width)} w ${rgb(color)} RG ${num(x1)} ${num(A4.h - y1)} m ${num(x2)} ${num(A4.h - y2)} l S`);
  }

  rect(x, y, w, h, { fill = null, stroke = null, width = 0.5 } = {}) {
    this.page.list.push({ t: 'rect', x, y, w, h, fill, stroke, width });
    const r = `${num(x)} ${num(A4.h - y - h)} ${num(w)} ${num(h)} re`;
    if (fill && stroke) this.op(`${rgb(fill)} rg ${rgb(stroke)} RG ${num(width)} w ${r} B`);
    else if (fill) this.op(`${rgb(fill)} rg ${r} f`);
    else this.op(`${rgb(stroke || '#000000')} RG ${num(width)} w ${r} S`);
  }

  circle(cx, cy, r, { fill = '#000000' } = {}) {
    this.page.list.push({ t: 'circle', cx, cy, r, fill });
    const k = 0.5523 * r;
    const y = A4.h - cy;
    this.op(`${rgb(fill)} rg ${num(cx + r)} ${num(y)} m `
      + `${num(cx + r)} ${num(y + k)} ${num(cx + k)} ${num(y + r)} ${num(cx)} ${num(y + r)} c `
      + `${num(cx - k)} ${num(y + r)} ${num(cx - r)} ${num(y + k)} ${num(cx - r)} ${num(y)} c `
      + `${num(cx - r)} ${num(y - k)} ${num(cx - k)} ${num(y - r)} ${num(cx)} ${num(y - r)} c `
      + `${num(cx + k)} ${num(y - r)} ${num(cx + r)} ${num(y - k)} ${num(cx + r)} ${num(y)} c f`);
  }

  /** Statusmerke: grønn hake, rød kryss, gult utropstegn eller grå strek. */
  status(cx, cy, status, r = 5) {
    const colors = { ok: '#1d7a3b', fail: '#b8322a', border: '#c98a00', na: '#8a8f96' };
    this.circle(cx, cy, r, { fill: colors[status] || colors.na });
    const w = { width: 1.2, color: '#ffffff' };
    if (status === 'ok') {
      this.line(cx - r * 0.5, cy, cx - r * 0.1, cy + r * 0.4, w);
      this.line(cx - r * 0.1, cy + r * 0.4, cx + r * 0.55, cy - r * 0.4, w);
    } else if (status === 'fail') {
      this.line(cx - r * 0.4, cy - r * 0.4, cx + r * 0.4, cy + r * 0.4, w);
      this.line(cx - r * 0.4, cy + r * 0.4, cx + r * 0.4, cy - r * 0.4, w);
    } else if (status === 'border') {
      this.line(cx, cy - r * 0.5, cx, cy + r * 0.15, w);
      this.line(cx, cy + r * 0.4, cx, cy + r * 0.45, w);
    } else {
      this.line(cx - r * 0.45, cy, cx + r * 0.45, cy, w);
    }
  }

  /** Ferdig PDF som byte. */
  toBytes() {
    const objs = [];
    const add = (body) => { objs.push(body); return objs.length; };
    const catalog = add(null);
    const pagesId = add(null);
    const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    const f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const f3 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Symbol >>');
    const kids = [];
    for (const p of this.pages) {
      const stream = p.ops.join('\n');
      const content = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
      kids.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${A4.w} ${A4.h}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R /F3 ${f3} 0 R >> >> /Contents ${content} 0 R >>`));
    }
    objs[catalog - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objs[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`;
    const d = this.info.date;
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = `D:${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    const info = add(`<< /Title ${hexUTF16(this.info.title)} /Author ${hexUTF16(this.info.author)} /Creator ${hexUTF16(this.info.creator)} /CreationDate (${stamp}) >>`);

    let out = '%PDF-1.4\n%âãÏÓ\n';
    const offsets = [];
    objs.forEach((body, i) => {
      offsets.push(out.length);
      out += `${i + 1} 0 obj\n${body}\nendobj\n`;
    });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
    for (const o of offsets) out += `${String(o).padStart(10, '0')} 00000 n \n`;
    out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    const bytes = new Uint8Array(out.length);
    for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
    return bytes;
  }
}

/**
 * Tegner en side på et canvas (forhåndsvisning i appen). Bruker samme koordinater som PDF-en;
 * Arial står i for Helvetica, så linjebryting og sideskift blir like.
 */
export function drawPage(ctx, page, scale = 1) {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, A4.w, A4.h);
  for (const d of page.list) {
    if (d.t === 'rect') {
      if (d.fill) { ctx.fillStyle = d.fill; ctx.fillRect(d.x, d.y, d.w, d.h); }
      if (d.stroke) { ctx.strokeStyle = d.stroke; ctx.lineWidth = d.width; ctx.strokeRect(d.x, d.y, d.w, d.h); }
    } else if (d.t === 'line') {
      ctx.strokeStyle = d.color; ctx.lineWidth = d.width;
      ctx.beginPath(); ctx.moveTo(d.x1, d.y1); ctx.lineTo(d.x2, d.y2); ctx.stroke();
    } else if (d.t === 'circle') {
      ctx.fillStyle = d.fill;
      ctx.beginPath(); ctx.arc(d.cx, d.cy, d.r, 0, Math.PI * 2); ctx.fill();
    } else if (d.t === 'text') {
      ctx.fillStyle = d.color;
      ctx.font = `${d.bold ? 'bold ' : ''}${d.size}px Arial, Helvetica, sans-serif`;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(d.str, d.x, d.y);
    }
  }
  ctx.restore();
}
