// Små hjelpere for å lage DOM-elementer uten rammeverk.

/**
 * h('div', { class: 'x', onclick: fn }, barn...)
 * Egenskapen html setter innerHTML og brukes bare for appens egne, faste SVG-ikoner.
 */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, val] of Object.entries(props)) {
      if (val == null || val === false) continue;
      if (k === 'class') el.className = val;
      else if (k === 'html') el.innerHTML = val;
      else if (k === 'dataset') Object.assign(el.dataset, val);
      else if (k === 'style' && typeof val === 'object') Object.assign(el.style, val);
      else if (k.startsWith('on') && typeof val === 'function') el.addEventListener(k.slice(2), val);
      else if (k === 'value') el.value = val;
      else if (val === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(val));
    }
  }
  append(el, children);
  return el;
}

export function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : String(c));
  }
  return el;
}

export function clear(el) {
  while (el.firstChild) el.firstChild.remove();
  return el;
}

let uid = 0;
export const nextId = (prefix = 'id') => `${prefix}-${++uid}`;
