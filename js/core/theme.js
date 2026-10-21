/*
 * theme.js — Light / dark / system theme handling.
 *
 * A theme is applied by setting data-theme on an element; tokens.css defines the
 * colours for any [data-theme] scope. The operator UI theme lives on <html>; the
 * stage gets its own data-theme on the stage root, so the two are independent.
 * "system" defers to prefers-color-scheme through the CSS media query.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const MODES = ["light", "dark", "system"];

  function normalize(mode) {
    return MODES.includes(mode) ? mode : "system";
  }

  /** Apply a theme mode to an element (defaults to <html>). */
  function apply(mode, target) {
    const node = target || document.documentElement;
    node.setAttribute("data-theme", normalize(mode));
  }

  /** The theme actually rendered right now: "light" or "dark". */
  function resolved(mode) {
    const m = normalize(mode);
    if (m !== "system") return m;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  /** Next mode in the light → dark → system cycle (for the header toggle). */
  function nextMode(mode) {
    const i = MODES.indexOf(normalize(mode));
    return MODES[(i + 1) % MODES.length];
  }

  /** Set and persist the operator UI theme. */
  function setUiTheme(mode) {
    const m = normalize(mode);
    apply(m);
    BK.store.prefs.set({ uiTheme: m });
    BK.events.emit("theme", m);
  }

  // Re-announce when the OS theme flips, so anything that caches the resolved value can redraw.
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => BK.events.emit("theme:system", resolved("system"));
    if (mq.addEventListener) mq.addEventListener("change", onChange);
  }

  BK.theme = { MODES, normalize, apply, resolved, nextMode, setUiTheme };
})();
