/*
 * edit.js — Pure editing operations on a stored exercise (instance + metadata).
 *
 * Edits apply to the exercise instance, never to the template (spec 5.1). Each
 * operation returns a new exercise object; callers re-validate and save. Changing
 * stage count or seed regenerates from the template and discards text edits.
 */
(function () {
  "use strict";

  const BK = window.BK;

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function touch(ex) {
    ex.updatedAt = new Date().toISOString();
    ex.edited = true;
    return ex;
  }

  function getAt(obj, path) {
    return path.reduce((o, k) => (o == null ? o : o[k]), obj);
  }

  /** Set one language of a bilingual text at `path` (array of keys/indices). */
  function setText(ex, path, lang, value) {
    const next = clone(ex);
    const target = getAt(next, path);
    if (!target || typeof target !== "object") return ex;
    target[lang] = String(value);
    return touch(next);
  }

  function locateInject(ex, injectId) {
    for (let si = 0; si < ex.stages.length; si++) {
      const xi = ex.stages[si].injects.findIndex((i) => i.id === injectId);
      if (xi >= 0) return { si, xi };
    }
    return null;
  }

  /** Include or exclude an optional inject. Mandatory injects cannot be disabled. */
  function toggleInject(ex, injectId, enabled) {
    const loc = locateInject(ex, injectId);
    if (!loc) return ex;
    const next = clone(ex);
    const inj = next.stages[loc.si].injects[loc.xi];
    if (!inj.optional && !enabled) return ex;
    inj.enabled = !!enabled;
    return touch(next);
  }

  /** Bounds for an inject's time: inside its own stage (before the next stage starts). */
  function timeBounds(ex, injectId) {
    const loc = locateInject(ex, injectId);
    if (!loc) return null;
    const stage = ex.stages[loc.si];
    const nextStage = ex.stages[loc.si + 1];
    return { min: stage.clock, max: nextStage ? Math.max(stage.clock, nextStage.clock - 1) : stage.clock + 2880 };
  }

  /** Move an inject in time within its stage; keeps labels, chart markers and order consistent. */
  function setInjectTime(ex, injectId, minutes) {
    const b = timeBounds(ex, injectId);
    if (!b) return ex;
    const at = Math.max(b.min, Math.min(b.max, Math.round(Number(minutes) || 0)));
    const next = clone(ex);
    const loc = locateInject(next, injectId);
    const stage = next.stages[loc.si];
    const inj = stage.injects[loc.xi];
    inj.at = at;
    const date = BK.engine.template.clockDate(next.entities.clock, at);
    inj.atLabel = { en: BK.i18n.fmt.time(date, "en"), sv: BK.i18n.fmt.time(date, "sv") };
    stage.injects.sort((a, c) => a.at - c.at);
    stage.charts.forEach((c) => (c.markers || []).forEach((m) => m.injectId === injectId && (m.at = at)));
    return touch(next);
  }

  /** Move a slide one step earlier/later, but only within its own stage. */
  function moveSlide(ex, slideId, delta) {
    const idx = ex.slides.findIndex((s) => s.id === slideId);
    const target = idx + delta;
    if (idx < 0 || target < 0 || target >= ex.slides.length) return ex;
    const a = ex.slides[idx];
    const b = ex.slides[target];
    if (!a.stageId || a.stageId !== b.stageId) return ex;
    const next = clone(ex);
    next.slides[idx] = b;
    next.slides[target] = a;
    return touch(next);
  }

  /** Regenerate from the template with patched params (stage count, seed). Text edits are discarded. */
  function regenerate(ex, patch) {
    const tpl = BK.scenarios.get(ex.templateId);
    if (!tpl) return ex;
    const params = Object.assign({}, ex.params, patch || {});
    const instance = BK.engine.generator.generate(tpl, params);
    return Object.assign({ id: ex.id, createdAt: ex.createdAt, updatedAt: new Date().toISOString(), edited: false }, instance);
  }

  function duplicate(ex, suffix) {
    const next = clone(ex);
    next.id = BK.dom.uid("ex");
    next.createdAt = next.updatedAt = new Date().toISOString();
    next.title = { en: BK.loc(ex.title, "en") + " " + suffix.en, sv: BK.loc(ex.title, "sv") + " " + suffix.sv };
    return next;
  }

  BK.engine.edit = { clone, getAt, setText, toggleInject, timeBounds, setInjectTime, moveSlide, regenerate, duplicate };
})();
