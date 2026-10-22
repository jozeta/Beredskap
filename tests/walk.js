/*
 * walk.js — Shared session walkers for the suites that sweep every slide.
 *
 *   linear(inst, t0, fn)            discussion: "next" from the title to the debrief
 *   branching(inst, t0, fn, max)    branching: up to `max` playthroughs, each choice
 *                                   picking the option used least so far, so every
 *                                   reachable option is taken at least once
 *   paths(inst, t0, max)            the finished sessions of those playthroughs
 *
 * fn(session) is called on every slide and reveal step.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const S = () => BK.engine.session;

  function linear(inst, t0, fn) {
    let s = S().create(inst, t0);
    for (let i = 0; i < 800; i++) {
      if (fn) fn(s);
      if (S().locate(s).slide.type === "debrief") return s;
      s = S().apply(s, { type: "next" }, t0 + i);
    }
    throw new Error(inst.templateId + ": playthrough did not reach the debrief");
  }

  /** One playthrough; `used` counts how often each page:option was chosen across playthroughs. */
  function playthrough(inst, t0, fn, used) {
    const B = BK.engine.branching;
    let s = S().create(inst, t0);
    let fresh = false;
    for (let i = 0; i < 1200; i++) {
      if (fn) fn(s);
      const slide = S().locate(s).slide;
      if (slide.type === "debrief") return { session: s, fresh };
      const current = s.route[s.route.length - 1].pageId;
      if (slide.type === "choice" && slide.pageId === current) {
        const pg = B.page(s.instance, current);
        const opts = B.offered(pg.choice, s.flags);
        const pick = opts.slice().sort((a, b) => (used[pg.id + ":" + a.key] || 0) - (used[pg.id + ":" + b.key] || 0))[0];
        const key = pg.id + ":" + pick.key;
        if (!used[key]) fresh = true;
        used[key] = (used[key] || 0) + 1;
        s = S().apply(s, { type: "choose", option: pick.key }, t0 + i);
      } else {
        const before = s.position.slideId + "/" + s.position.step;
        s = S().apply(s, { type: "next" }, t0 + i);
        if (s.position.slideId + "/" + s.position.step === before) throw new Error(inst.templateId + ": stuck on " + before);
      }
    }
    throw new Error(inst.templateId + ": playthrough did not reach the debrief");
  }

  function paths(inst, t0, max, fn) {
    const used = {};
    const out = [];
    for (let n = 0; n < (max || 40); n++) {
      const r = playthrough(inst, t0, fn, used);
      out.push(r.session);
      if (!r.fresh) break; // every reachable option has been taken
    }
    return out;
  }

  function branching(inst, t0, fn, max) {
    return paths(inst, t0, max, fn);
  }

  /** Any format: linear for discussion exercises, coverage paths for branching ones. */
  function any(inst, t0, fn, max) {
    return inst.format === "branching" ? branching(inst, t0, fn, max) : [linear(inst, t0, fn)];
  }

  window.BKTest.walk = { linear, branching, paths, any };
})();
