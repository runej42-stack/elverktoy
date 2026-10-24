// Rapportoppsett på A4 oppå PDF-skriveren: topptekst, avsnitt, nøkkel/verdi-blokker,
// tabeller med gjentatt tabellhode, sjekklister med statusmerker og bunntekst med sidetall.

import { PdfDoc, A4, wrap } from './pdf.js';

const M = { left: 42, right: 42, top: 48, bottom: 56 };
const W = A4.w - M.left - M.right;
const GREY = '#5c636a';

export class Report {
  constructor({ title, subtitle = '', meta = [], footer = '', author = '', creator = '', date = new Date() }) {
    this.doc = new PdfDoc({ title, author, creator, date });
    this.title = title;
    this.subtitle = subtitle;
    this.footer = footer;
    this.newPage(true, meta);
  }

  newPage(first = false, meta = []) {
    this.doc.addPage();
    this.y = M.top;
    if (first) {
      this.doc.text(M.left, this.y + 14, this.title, { size: 17, bold: true });
      this.y += 22;
      if (this.subtitle) {
        this.doc.text(M.left, this.y + 10, this.subtitle, { size: 10, color: GREY });
        this.y += 16;
      }
      this.doc.line(M.left, this.y + 4, A4.w - M.right, this.y + 4, { width: 1.2, color: '#222222' });
      this.y += 16;
      if (meta.length) this.keyValues(meta);
    } else {
      this.doc.text(M.left, this.y + 9, this.title, { size: 9, bold: true, color: GREY });
      this.doc.line(M.left, this.y + 14, A4.w - M.right, this.y + 14, { color: '#bbbbbb' });
      this.y += 26;
    }
  }

  /** Ny side hvis høyden h ikke får plass. Gir true når det ble ny side. */
  ensure(h) {
    if (this.y + h > A4.h - M.bottom) {
      this.newPage();
      return true;
    }
    return false;
  }

  heading(text) {
    this.ensure(40);
    this.y += 10;
    this.doc.text(M.left, this.y + 11, text, { size: 12.5, bold: true });
    this.y += 16;
    this.doc.line(M.left, this.y, A4.w - M.right, this.y, { width: 0.8, color: '#333333' });
    this.y += 8;
  }

  para(text, { size = 9.5, color = '#000000', bold = false } = {}) {
    const lh = size * 1.35;
    for (const line of wrap(text, W, size, bold)) {
      this.ensure(lh);
      this.doc.text(M.left, this.y + size, line, { size, color, bold });
      this.y += lh;
    }
    this.y += 4;
  }

  keyValues(rows, { labelWidth = 120, size = 9.5 } = {}) {
    const lh = size * 1.35;
    for (const [label, value] of rows) {
      if (value == null || value === '') continue;
      const lines = wrap(String(value), W - labelWidth, size);
      this.ensure(lines.length * lh);
      this.doc.text(M.left, this.y + size, label, { size, color: GREY });
      lines.forEach((l, i) => this.doc.text(M.left + labelWidth, this.y + size + i * lh, l, { size }));
      this.y += lines.length * lh + 2;
    }
    this.y += 6;
  }

  /**
   * Tabell. columns: [{ title, width (relativ), align: 'left'|'right'|'center', status: true }].
   * For statuskolonner er cellen 'ok' | 'fail' | 'border' | 'na' | null.
   */
  table({ columns, rows, size = 8.5 }) {
    const total = columns.reduce((a, c) => a + c.width, 0);
    const widths = columns.map((c) => (c.width / total) * W);
    const pad = 3.5;
    const lh = size * 1.3;
    const cellX = (x, i, align) => (align === 'right' ? x + widths[i] - pad : align === 'center' ? x + widths[i] / 2 : x + pad);

    const header = () => {
      const lines = columns.map((c, i) => wrap(c.title, widths[i] - 2 * pad, size, true));
      const h = Math.max(...lines.map((l) => l.length)) * lh + 2 * pad;
      this.doc.rect(M.left, this.y, W, h, { fill: '#e6e9ed' });
      let x = M.left;
      lines.forEach((ls, i) => {
        const align = columns[i].status ? 'center' : columns[i].align || 'left';
        ls.forEach((l, j) => this.doc.text(cellX(x, i, align), this.y + pad + size + j * lh, l, { size, bold: true, align }));
        x += widths[i];
      });
      this.y += h;
    };

    this.ensure(48);
    header();
    rows.forEach((row, ri) => {
      const lines = row.map((cell, i) => (columns[i].status ? [''] : wrap(cell == null ? '' : String(cell), widths[i] - 2 * pad, size)));
      const h = Math.max(...lines.map((l) => l.length), 1) * lh + 2 * pad;
      if (this.ensure(h)) header();
      if (ri % 2 === 1) this.doc.rect(M.left, this.y, W, h, { fill: '#f6f7f9' });
      let x = M.left;
      row.forEach((cell, i) => {
        if (columns[i].status) {
          if (cell) this.doc.status(x + widths[i] / 2, this.y + h / 2, cell, 4.5);
        } else {
          const align = columns[i].align || 'left';
          lines[i].forEach((l, j) => this.doc.text(cellX(x, i, align), this.y + pad + size + j * lh, l, { size, align }));
        }
        x += widths[i];
      });
      this.doc.line(M.left, this.y + h, A4.w - M.right, this.y + h, { width: 0.3, color: '#c8cdd2' });
      this.y += h;
    });
    this.y += 10;
  }

  /** Sjekkliste: [{ status: 'ok'|'fail'|'na'|null, text, note }]. */
  checklist(items, { size = 9.5 } = {}) {
    const lh = size * 1.32;
    for (const it of items) {
      const lines = wrap(it.text, W - 26, size);
      const noteLines = it.note ? wrap(`Merknad: ${it.note}`, W - 26, size - 1) : [];
      const h = lines.length * lh + noteLines.length * (lh - 1) + 6;
      this.ensure(h);
      if (it.status) this.doc.status(M.left + 7, this.y + 7, it.status, 5.5);
      else this.doc.rect(M.left + 2, this.y + 1.5, 11, 11, { stroke: '#8a8f96', width: 0.8 });
      lines.forEach((l, i) => this.doc.text(M.left + 22, this.y + size + i * lh, l, { size }));
      noteLines.forEach((l, i) => this.doc.text(M.left + 22, this.y + size + lines.length * lh + i * (lh - 1), l, { size: size - 1, color: GREY }));
      this.y += h;
    }
    this.y += 6;
  }

  /** Signaturfelt nederst. */
  signatures(labels) {
    this.ensure(70);
    this.y += 36;
    const w = (W - 30) / labels.length;
    labels.forEach((label, i) => {
      const x = M.left + i * (w + 30 / Math.max(1, labels.length - 1));
      this.doc.line(x, this.y, x + w, this.y, { width: 0.6 });
      this.doc.text(x, this.y + 11, label, { size: 8.5, color: GREY });
    });
    this.y += 20;
  }

  /** Avslutter med bunntekst og sidetall på hver side, og gir PDF-en som byte. */
  finish() {
    const n = this.doc.pages.length;
    this.doc.pages.forEach((page, i) => {
      this.doc.page = page;
      const y = A4.h - M.bottom + 26;
      this.doc.line(M.left, y - 12, A4.w - M.right, y - 12, { width: 0.4, color: '#bbbbbb' });
      this.doc.text(M.left, y, this.footer, { size: 7.5, color: GREY });
      this.doc.text(A4.w - M.right, y, `Side ${i + 1} av ${n}`, { size: 7.5, color: GREY, align: 'right' });
    });
    return this.doc.toBytes();
  }
}
