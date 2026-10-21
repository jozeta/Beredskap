/*
 * namespace.js — Bootstraps the single global namespace `window.BK`.
 *
 * Every other script attaches itself to BK, so this file must load first.
 * Also provides a tiny synchronous event bus used for cross-cutting changes
 * (language, theme, save status) without coupling modules to each other.
 */
(function () {
  "use strict";

  const BK = (window.BK = window.BK || {});

  BK.version = "0.1.0";

  // Technical identifiers fixed by the spec (section 1, "Name and identity").
  // A page may pre-seed BK.config before this script (tests.html uses its own storage prefix).
  BK.config = Object.assign(
    {
      storagePrefix: "beredskap:",
      channelName: "beredskap",
      schemaId: "beredskap.exercise",
      schemaVersion: 1,
      // Dev mode: add ?debug to the URL to get console reports (e.g. missing i18n keys).
      debug: /[?&]debug\b/.test(window.location.search)
    },
    BK.config || {}
  );

  // Sub-namespaces, filled in by later scripts.
  BK.data = BK.data || {};
  BK.engine = BK.engine || {};
  BK.graphics = BK.graphics || {};
  BK.io = BK.io || {};
  BK.ui = BK.ui || {};

  // Minimal publish/subscribe bus. Handlers run synchronously in registration order.
  const handlers = new Map();

  BK.events = {
    on(name, fn) {
      if (!handlers.has(name)) handlers.set(name, new Set());
      handlers.get(name).add(fn);
      return () => handlers.get(name).delete(fn);
    },
    off(name, fn) {
      if (handlers.has(name)) handlers.get(name).delete(fn);
    },
    emit(name, payload) {
      if (!handlers.has(name)) return;
      handlers.get(name).forEach((fn) => fn(payload));
    }
  };
})();
