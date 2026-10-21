/*
 * sync.js — Persistence and cross-window sync for live sessions.
 *
 * Session state lives in localStorage ("beredskap:session:<id>"). Any window
 * (stage or presenter) dispatches commands: dispatch() re-reads the latest stored
 * state, applies the reducer, saves, and announces the new revision on
 * BroadcastChannel("beredskap"). The `storage` event is a fallback for browsers
 * where BroadcastChannel is unavailable (or isolated, as some are on file://).
 *
 * Presence: each tab keeps an id in sessionStorage (survives reload) and writes a
 * heartbeat. On open, if no OTHER tab has a fresh heartbeat, the exercise was
 * really closed, so running timers are paused (spec: "timers (paused)").
 */
(function () {
  "use strict";

  const BK = window.BK;
  const HEARTBEAT_MS = 2000;
  const FRESH_MS = 6000;

  function tabId() {
    const key = BK.config.storagePrefix + "tab";
    try {
      let id = window.sessionStorage.getItem(key);
      if (!id) {
        id = BK.dom.uid("tab");
        window.sessionStorage.setItem(key, id);
      }
      return id;
    } catch (err) {
      return BK.dom.uid("tab");
    }
  }

  function openChannel() {
    try {
      return typeof BroadcastChannel === "function" ? new BroadcastChannel(BK.config.channelName) : null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Open a live session. onChange(session) runs after every local or remote change.
   * Returns { get, dispatch, close, recovered } or null when the session does not exist.
   */
  function open(sessionId, onChange) {
    const key = "session:" + sessionId;
    let current = BK.store.get(key, null);
    if (!current) return null;

    const me = tabId();
    const channel = openChannel();
    const presenceKey = "presence:" + sessionId;

    function reload() {
      const fresh = BK.store.get(key, null);
      if (fresh && fresh.rev !== current.rev) {
        current = fresh;
        onChange(current);
      }
    }

    function dispatch(cmd) {
      const latest = BK.store.get(key, current) || current;
      const next = BK.engine.session.apply(latest, cmd, Date.now());
      if (next === latest) return current;
      current = next;
      BK.store.set(key, current);
      if (channel) channel.postMessage({ type: "update", sessionId, rev: current.rev });
      onChange(current);
      return current;
    }

    // Remote updates.
    const onMessage = (e) => {
      if (e.data && e.data.sessionId === sessionId && e.data.type === "update") reload();
    };
    const onStorage = (e) => {
      if (e.key === BK.config.storagePrefix + key) reload();
    };
    if (channel) channel.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);

    // Presence: was anyone else running this session?
    const presence = BK.store.get(presenceKey, {}) || {};
    const now = Date.now();
    const othersAlive = Object.keys(presence).some((id) => id !== me && now - presence[id] < FRESH_MS);
    let recovered = false;
    if (!othersAlive && current.status !== "ended" && BK.engine.session.hasRunningTimers(current)) {
      dispatch({ type: "recover" });
      recovered = true;
    }

    function beat() {
      const map = BK.store.get(presenceKey, {}) || {};
      const t = Date.now();
      map[me] = t;
      Object.keys(map).forEach((id) => {
        if (t - map[id] > FRESH_MS * 3) delete map[id];
      });
      BK.store.set(presenceKey, map, { silent: true });
    }
    beat();
    const beatTimer = setInterval(beat, HEARTBEAT_MS);

    function close() {
      clearInterval(beatTimer);
      if (channel) {
        channel.removeEventListener("message", onMessage);
        channel.close();
      }
      window.removeEventListener("storage", onStorage);
    }

    return { get: () => current, dispatch, close, recovered };
  }

  BK.sync = { open };
})();
