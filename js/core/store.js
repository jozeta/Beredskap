/*
 * store.js — localStorage wrapper with namespaced keys, schema-versioned
 * envelopes and an observable autosave status.
 *
 * Every value is stored as { v: <schemaVersion>, savedAt: <ISO>, data: <value> }
 * under "beredskap:<key>". Handles the error cases listed in spec section 15:
 *   - storage unavailable  -> falls back to an in-memory map (BK.store.available = false)
 *   - quota exceeded       -> write returns false and emits a "store:status" error
 *   - corrupted state      -> unreadable entries are collected in BK.store.corrupt
 * Callers never see exceptions from this module.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const PREFIX = BK.config.storagePrefix;
  const SCHEMA = BK.config.schemaVersion;

  // Migrations from older envelope versions: { fromVersion: (data, key) => newData }.
  // Empty in v1; listed here so later schema bumps have an obvious home.
  const migrations = {};

  const memory = new Map(); // Fallback backend when localStorage is unusable.
  const corrupt = []; // { key, raw, reason } for entries that failed to parse.

  function probeLocalStorage() {
    try {
      const probe = PREFIX + "__probe";
      window.localStorage.setItem(probe, "1");
      window.localStorage.removeItem(probe);
      return true;
    } catch (err) {
      return false;
    }
  }

  const available = probeLocalStorage();

  // Backend abstraction so the rest of the module does not care which store is active.
  const backend = available
    ? {
        get: (k) => window.localStorage.getItem(k),
        set: (k, v) => window.localStorage.setItem(k, v),
        remove: (k) => window.localStorage.removeItem(k),
        keys: () => Object.keys(window.localStorage)
      }
    : {
        get: (k) => (memory.has(k) ? memory.get(k) : null),
        set: (k, v) => memory.set(k, v),
        remove: (k) => memory.delete(k),
        keys: () => Array.from(memory.keys())
      };

  function isQuotaError(err) {
    return (
      err &&
      (err.name === "QuotaExceededError" ||
        err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        err.code === 22 ||
        err.code === 1014)
    );
  }

  function emitStatus(state, detail) {
    BK.events.emit("store:status", { state, at: new Date(), detail: detail || null });
  }

  function markCorrupt(fullKey, raw, reason) {
    if (!corrupt.some((c) => c.key === fullKey)) corrupt.push({ key: fullKey, raw, reason });
  }

  /** Read and unwrap a value. Returns `fallback` if missing or unreadable. */
  function get(key, fallback) {
    const fullKey = PREFIX + key;
    const raw = backend.get(fullKey);
    if (raw === null || raw === undefined) return fallback;

    let envelope;
    try {
      envelope = JSON.parse(raw);
    } catch (err) {
      markCorrupt(fullKey, raw, "parse");
      return fallback;
    }
    if (!envelope || typeof envelope !== "object" || !("v" in envelope) || !("data" in envelope)) {
      markCorrupt(fullKey, raw, "shape");
      return fallback;
    }
    if (envelope.v > SCHEMA) {
      // Written by a newer app version; do not guess at its meaning.
      markCorrupt(fullKey, raw, "newer-schema");
      return fallback;
    }

    let data = envelope.data;
    for (let v = envelope.v; v < SCHEMA; v++) {
      if (!migrations[v]) {
        markCorrupt(fullKey, raw, "no-migration");
        return fallback;
      }
      data = migrations[v](data, key);
    }
    return data;
  }

  /**
   * Wrap and write a value. Returns true on success, false on failure (status event emitted).
   * opts.silent skips the "saving/saved" status events (used for presence heartbeats).
   */
  function set(key, value, opts) {
    const silent = opts && opts.silent;
    const envelope = { v: SCHEMA, savedAt: new Date().toISOString(), data: value };
    if (!silent) emitStatus("saving");
    try {
      backend.set(PREFIX + key, JSON.stringify(envelope));
    } catch (err) {
      emitStatus("error", isQuotaError(err) ? "quota" : "write");
      return false;
    }
    if (!silent) emitStatus(available ? "saved" : "memory");
    return true;
  }

  function remove(key) {
    try {
      backend.remove(PREFIX + key);
    } catch (err) {
      /* Removing can only fail if storage vanished mid-session; nothing to recover. */
    }
  }

  /** List un-prefixed keys that start with `prefix` (e.g. "exercise:"). */
  function keys(prefix) {
    const full = PREFIX + (prefix || "");
    return backend
      .keys()
      .filter((k) => k.startsWith(full))
      .map((k) => k.slice(PREFIX.length));
  }

  // ---- Collections: exercises, sessions, … stored one item per key ----------

  function putItem(kind, item) {
    return set(kind + ":" + item.id, item);
  }

  function getItem(kind, id) {
    return get(kind + ":" + id, null);
  }

  function removeItem(kind, id) {
    remove(kind + ":" + id);
  }

  /** All items of a kind, newest `updatedAt` first. Unreadable items are skipped (and reported). */
  function list(kind) {
    return keys(kind + ":")
      .map((k) => get(k, null))
      .filter(Boolean)
      .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  }

  // ---- Preferences -----------------------------------------------------------

  const PREF_DEFAULTS = {
    lang: (navigator.language || "en").toLowerCase().startsWith("sv") ? "sv" : "en",
    uiTheme: "system",
    stageTheme: "dark",
    defaultDuration: 60
  };

  const prefs = {
    defaults: PREF_DEFAULTS,
    get() {
      return Object.assign({}, PREF_DEFAULTS, get("prefs", {}));
    },
    set(patch) {
      const next = Object.assign(prefs.get(), patch);
      set("prefs", next);
      return next;
    }
  };

  // ---- Bulk operations (settings + recovery) ---------------------------------

  /** Raw dump of every Beredskap key, unparsed. Used for "export raw data" before a reset. */
  function rawDump() {
    const dump = {};
    backend.keys()
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => {
        dump[k] = backend.get(k);
      });
    return dump;
  }

  /** Delete only the entries flagged as corrupt. */
  function resetCorrupt() {
    corrupt.splice(0).forEach((c) => {
      try {
        backend.remove(c.key);
      } catch (err) {
        /* see remove() */
      }
    });
  }

  /** Delete every Beredskap key (other sites' data on the same origin is untouched). */
  function clearAll() {
    backend.keys()
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => backend.remove(k));
    corrupt.length = 0;
  }

  /** Scan everything once at boot so corruption is surfaced immediately, not on first use. */
  function scan() {
    keys("").forEach((k) => get(k, null));
    return corrupt.slice();
  }

  BK.store = {
    available,
    corrupt,
    get,
    set,
    remove,
    keys,
    putItem,
    getItem,
    removeItem,
    list,
    prefs,
    rawDump,
    resetCorrupt,
    clearAll,
    scan
  };
})();
