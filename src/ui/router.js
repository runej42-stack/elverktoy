// Ruter med #-adresser (virker både på nett og fra fil). Tilbake-knappen i appen går
// tilbake i historikken når det finnes en side i appen å gå tilbake til, ellers til forelderen.

let routes = [];
let onRender = () => {};
let lastPath = null;

export function currentPath() {
  const p = location.hash.replace(/^#/, '');
  return p.startsWith('/') ? p : '/';
}

function match(path) {
  for (const r of routes) {
    const m = path.match(r.pattern);
    if (m) return { route: r, params: m.slice(1).map(decodeURIComponent) };
  }
  return null;
}

function render(force = false) {
  const path = currentPath();
  if (!force && path === lastPath) return;
  lastPath = path;
  const hit = match(path) || match('/');
  onRender(hit.route, hit.params, path);
}

export function startRouter(routeList, renderFn) {
  routes = routeList;
  onRender = renderFn;
  const depth = history.state && typeof history.state.depth === 'number' ? history.state.depth : 0;
  history.replaceState({ depth }, '', '#' + currentPath());
  window.addEventListener('popstate', () => render());
  window.addEventListener('hashchange', () => render());
  render(true);
}

export function go(path) {
  if (path === currentPath()) return;
  const depth = (history.state && history.state.depth) || 0;
  history.pushState({ depth: depth + 1 }, '', '#' + path);
  render();
}

export function replace(path) {
  const depth = (history.state && history.state.depth) || 0;
  history.replaceState({ depth }, '', '#' + path);
  render();
}

export function back(fallback = '/') {
  if (history.state && history.state.depth > 0) history.back();
  else replace(fallback);
}

export function rerender() {
  render(true);
}
