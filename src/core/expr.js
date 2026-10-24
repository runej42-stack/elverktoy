// Lite formelspråk. Samme formeltekst regnes ut og vises i «Vis utregning»,
// så utregningen som vises kan aldri avvike fra resultatet.
//
// Skrivemåte: · × * for gange, / for dele, ^ ² ³ for potens, √ for kvadratrot,
// desimalkomma (1,5) og semikolon mellom argumenter: maks(a; b).

const FUNCS = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  ln: Math.log, lg: Math.log10, log: Math.log10, exp: Math.exp,
  abs: Math.abs, sqrt: Math.sqrt,
  min: Math.min, maks: Math.max, max: Math.max,
};

// Konstanter står urørt i «Vis utregning» (π vises som π, ikke som 3,14…).
const CONSTS = { π: Math.PI };

const OPS = {
  '+': '+', '-': '-', '−': '-',
  '·': '*', '×': '*', '*': '*', '/': '/', '÷': '/',
  '^': '^', '²': '²', '³': '³', '√': '√',
  '(': '(', ')': ')', ';': ';',
};

const ID_START = /[A-Za-zÀ-ÖØ-öø-ÿΑ-Ωα-ωµ_]/;
const ID_PART = /[A-Za-z0-9À-ÖØ-öø-ÿΑ-Ωα-ωµ_₀-₉ₐ-ₜ']/;

function tokenize(src) {
  const toks = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9]/.test(src[j])) j++;
      if ((src[j] === ',' || src[j] === '.') && /[0-9]/.test(src[j + 1] || '')) {
        j++;
        while (j < src.length && /[0-9]/.test(src[j])) j++;
      }
      toks.push({ t: 'num', v: Number(src.slice(i, j).replace(',', '.')), s: i, e: j });
      i = j;
      continue;
    }
    if (ID_START.test(c)) {
      let j = i + 1;
      while (j < src.length && ID_PART.test(src[j])) j++;
      toks.push({ t: 'id', v: src.slice(i, j), s: i, e: j });
      i = j;
      continue;
    }
    if (OPS[c]) {
      toks.push({ t: 'op', v: OPS[c], s: i, e: i + 1 });
      i++;
      continue;
    }
    throw new Error(`Ukjent tegn «${c}» i formelen ${src}`);
  }
  return toks;
}

function parse(toks, src) {
  let p = 0;
  const fail = (msg) => new Error(`${msg} i formelen ${src}`);
  const isOp = (v) => p < toks.length && toks[p].t === 'op' && toks[p].v === v;
  const expect = (v) => {
    if (!isOp(v)) throw fail(`Forventet «${v}»`);
    p++;
  };

  function expr() {
    let a = term();
    while (isOp('+') || isOp('-')) {
      const op = toks[p++].v;
      a = { k: 'bin', op, a, b: term() };
    }
    return a;
  }
  function term() {
    let a = unary();
    while (isOp('*') || isOp('/')) {
      const op = toks[p++].v;
      a = { k: 'bin', op, a, b: unary() };
    }
    return a;
  }
  function unary() {
    if (isOp('-')) { p++; return { k: 'neg', a: unary() }; }
    if (isOp('+')) { p++; return unary(); }
    return power();
  }
  function power() {
    const base = postfix();
    if (isOp('^')) { p++; return { k: 'pow', a: base, b: unary() }; }
    return base;
  }
  function postfix() {
    let a = primary();
    while (isOp('²') || isOp('³')) {
      const n = toks[p++].v === '²' ? 2 : 3;
      a = { k: 'pow', a, b: { k: 'num', v: n } };
    }
    return a;
  }
  function primary() {
    const t = toks[p];
    if (!t) throw fail('Uventet slutt');
    if (t.t === 'num') { p++; return { k: 'num', v: t.v }; }
    if (t.t === 'id') {
      p++;
      if (isOp('(')) {
        if (!FUNCS[t.v]) throw fail(`Ukjent funksjon «${t.v}»`);
        p++;
        const args = [expr()];
        while (isOp(';')) { p++; args.push(expr()); }
        expect(')');
        return { k: 'call', fn: t.v, args };
      }
      return { k: 'var', name: t.v };
    }
    if (isOp('(')) { p++; const a = expr(); expect(')'); return a; }
    if (isOp('√')) { p++; return { k: 'sqrt', a: postfix() }; }
    throw fail(`Uventet «${src.slice(t.s, t.e)}»`);
  }

  const ast = expr();
  if (p < toks.length) throw fail(`Uventet «${src.slice(toks[p].s, toks[p].e)}»`);
  return ast;
}

const cache = new Map();
function compile(src) {
  let c = cache.get(src);
  if (!c) {
    const toks = tokenize(src);
    c = { toks, ast: parse(toks, src) };
    cache.set(src, c);
  }
  return c;
}

const valueOf = (x) => (x !== null && typeof x === 'object' ? x.v : x);

function ev(n, vars) {
  switch (n.k) {
    case 'num': return n.v;
    case 'var':
      if (Object.prototype.hasOwnProperty.call(vars, n.name)) return valueOf(vars[n.name]);
      if (Object.prototype.hasOwnProperty.call(CONSTS, n.name)) return CONSTS[n.name];
      throw new Error(`Mangler verdi for «${n.name}»`);
    case 'neg': return -ev(n.a, vars);
    case 'bin': {
      const a = ev(n.a, vars);
      const b = ev(n.b, vars);
      if (n.op === '+') return a + b;
      if (n.op === '-') return a - b;
      if (n.op === '*') return a * b;
      return a / b;
    }
    case 'pow': return Math.pow(ev(n.a, vars), ev(n.b, vars));
    case 'sqrt': return Math.sqrt(ev(n.a, vars));
    case 'call': return FUNCS[n.fn](...n.args.map((a) => ev(a, vars)));
    default: throw new Error('Ukjent node');
  }
}

/** Regner ut en formel. vars: { navn: tall | { v: tall, u: 'enhet' } }. */
export function evaluate(src, vars = {}) {
  return ev(compile(src).ast, vars);
}

/** Variabelnavnene i en formel (ikke funksjonsnavn). */
export function variables(src) {
  const { toks } = compile(src);
  const names = [];
  toks.forEach((t, i) => {
    const next = toks[i + 1];
    const isCall = next && next.t === 'op' && next.v === '(' && FUNCS[t.v];
    if (t.t === 'id' && !isCall && !(t.v in CONSTS) && !names.includes(t.v)) names.push(t.v);
  });
  return names;
}

/**
 * Setter verdiene inn i formelteksten: «2·I·L» → «2 · 16 A · 30 m».
 * format(tall, enhet) lager teksten for hver verdi. Teksten bygges fra symbolene,
 * med mellomrom rundt regnetegn så tall med enhet blir lette å lese.
 */
export function substitute(src, vars, format) {
  const { toks } = compile(src);
  let out = '';
  toks.forEach((t, i) => {
    const prev = toks[i - 1];
    const next = toks[i + 1];
    if (t.t === 'op') {
      const unary = (t.v === '-' || t.v === '+') && (!prev || (prev.t === 'op' && prev.v !== ')' && prev.v !== '²' && prev.v !== '³'));
      if (unary) out += t.v === '-' ? '−' : '';
      else if (t.v === '+') out += ' + ';
      else if (t.v === '-') out += ' − ';
      else if (t.v === '*') out += ' · ';
      else if (t.v === '/') out += ' / ';
      else if (t.v === ';') out += '; ';
      else out += src.slice(t.s, t.e);
      return;
    }
    const isCall = next && next.t === 'op' && next.v === '(' && FUNCS[t.v];
    if (t.t === 'id' && !isCall && Object.prototype.hasOwnProperty.call(vars, t.v)) {
      const raw = vars[t.v];
      const value = valueOf(raw);
      const unit = raw !== null && typeof raw === 'object' ? raw.u : '';
      const text = format(value, unit);
      const powered = next && next.t === 'op' && (next.v === '²' || next.v === '³' || next.v === '^');
      out += value < 0 || (unit && powered) ? `(${text})` : text;
    } else {
      out += src.slice(t.s, t.e);
    }
  });
  return out;
}
