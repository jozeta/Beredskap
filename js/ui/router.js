/*
 * router.js — Minimal hash router.
 *
 * Routes look like "#/edit/:instanceId" and may carry a query ("#/new?scenario=s01").
 * A view is { title(ctx) -> string, render(root, ctx), bare?: bool, unmount?() }.
 * "bare" views (stage, presenter) render without the operator shell.
 * The current view is re-rendered on language change so every label follows t().
 */
(function () {
  "use strict";

  const BK = window.BK;
  const routes = []; // { pattern, keys, regex, view }
  let current = null; // { view, ctx }
  let notFoundView = null;
  let rootEl = null;

  function compile(pattern) {
    const keys = [];
    const src = pattern
      .replace(/^#/, "")
      .split("/")
      .map((part) => {
        if (part.startsWith(":")) {
          keys.push(part.slice(1));
          return "([^/]+)";
        }
        return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      })
      .join("/");
    return { keys, regex: new RegExp("^" + src + "$") };
  }

  function register(pattern, view) {
    const c = compile(pattern);
    routes.push({ pattern, keys: c.keys, regex: c.regex, view });
  }

  function parseHash(hash) {
    const raw = (hash || "#/").replace(/^#/, "") || "/";
    const qIndex = raw.indexOf("?");
    const path = qIndex >= 0 ? raw.slice(0, qIndex) : raw;
    const query = {};
    if (qIndex >= 0) {
      new URLSearchParams(raw.slice(qIndex + 1)).forEach((v, k) => (query[k] = v));
    }
    return { path: path || "/", query };
  }

  function match(path) {
    for (const r of routes) {
      const m = r.regex.exec(path);
      if (m) {
        const params = {};
        r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
        return { view: r.view, params, pattern: r.pattern };
      }
    }
    return null;
  }

  function render(opts) {
    const parsed = parseHash(window.location.hash);
    const found = match(parsed.path);
    const view = found ? found.view : notFoundView;
    const ctx = { path: parsed.path, params: found ? found.params : {}, query: parsed.query, pattern: found && found.pattern };

    if (current && current.view.unmount) current.view.unmount();
    current = { view, ctx };

    document.body.classList.toggle("is-bare", !!view.bare);
    BK.dom.clear(rootEl);
    view.render(rootEl, ctx);

    document.title = view.title(ctx) + " · " + BK.t("app.name");
    BK.events.emit("route", ctx);
    if (!(opts && opts.keepFocus)) focusHeading();
  }

  // Move focus to the view heading so screen-reader users hear the new page.
  function focusHeading() {
    const h = rootEl.querySelector("h1");
    if (h) {
      h.setAttribute("tabindex", "-1");
      h.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }

  function navigate(hash) {
    if (window.location.hash === hash) render();
    else window.location.hash = hash;
  }

  /** Re-render the current view in place (e.g. after a language switch). */
  function refresh() {
    if (current) render({ keepFocus: true });
  }

  function start(root, fallbackView) {
    rootEl = root;
    notFoundView = fallbackView;
    window.addEventListener("hashchange", () => render());
    render();
  }

  BK.router = { register, start, navigate, refresh, parseHash, current: () => current };
})();
