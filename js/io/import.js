/*
 * import.js — Validated import of exported exercises and sessions.
 *
 * Imported files are untrusted. Before anything is accepted:
 *   1. size cap, JSON parse with a reviver that drops prototype-polluting keys
 *   2. structural walk: only JSON types, bounded string length, array size,
 *      depth and node count
 *   3. envelope: schema id, schema version (not newer than this app), kind
 *   4. IDs match a strict pattern; the instance passes the validator
 *   5. session references (injects, decisions, objectives, criteria) all exist
 * Accepted data is stored as a NEW copy (fresh ids): an import never overwrites,
 * and a failed write rolls back, so nothing is ever partially imported.
 * Imported text is only ever rendered with textContent.
 */
(function () {
  "use strict";

  const BK = window.BK;

  const LIMITS = { bytes: 5 * 1024 * 1024, string: 20000, array: 2000, depth: 40, nodes: 250000 };
  const ID = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,79}$/;
  const SLIDE_TYPES = new Set(["title", "briefing", "context", "situation", "timeline", "inject", "data", "twist", "discussion", "decision", "recap", "debrief"]);
  const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

  class ImportError extends Error {
    constructor(reason, detail) {
      super(reason + (detail ? ": " + detail : ""));
      this.reason = reason;
      this.detail = detail || "";
    }
  }

  function fail(reason, detail) {
    throw new ImportError(reason, detail);
  }

  function parse(text) {
    if (typeof text !== "string") fail("json");
    if (text.length > LIMITS.bytes) fail("size");
    try {
      return JSON.parse(text, (key, value) => (FORBIDDEN_KEYS.has(key) ? undefined : value));
    } catch (err) {
      return fail("json");
    }
  }

  /** Reject anything that is not plain, bounded JSON data. */
  function walk(value, depth, counter, path) {
    if (++counter.n > LIMITS.nodes) fail("size", "nodes");
    if (depth > LIMITS.depth) fail("shape", "depth at " + path);
    if (value === null || typeof value === "boolean") return;
    if (typeof value === "number") {
      if (!Number.isFinite(value)) fail("shape", "number at " + path);
      return;
    }
    if (typeof value === "string") {
      if (value.length > LIMITS.string) fail("size", "string at " + path);
      return;
    }
    if (Array.isArray(value)) {
      if (value.length > LIMITS.array) fail("size", "array at " + path);
      value.forEach((v, i) => walk(v, depth + 1, counter, path + "[" + i + "]"));
      return;
    }
    if (typeof value === "object") {
      if (Object.getPrototypeOf(value) !== Object.prototype) fail("shape", path);
      const keys = Object.keys(value);
      if (keys.length > LIMITS.array) fail("size", "object at " + path);
      keys.forEach((k) => walk(value[k], depth + 1, counter, path + "." + k));
      return;
    }
    fail("shape", path);
  }

  function isObj(v) {
    return v && typeof v === "object" && !Array.isArray(v);
  }

  function need(cond, reason, detail) {
    if (!cond) fail(reason, detail);
  }

  function checkId(id, where) {
    need(typeof id === "string" && ID.test(id), "shape", "id at " + where);
  }

  function checkExercise(ex) {
    need(isObj(ex), "shape", "exercise");
    need(ex.schema === BK.config.schemaId, "schema");
    need(typeof ex.templateId === "string" && /^s\d{2}-[a-z0-9-]{1,60}$/.test(ex.templateId), "shape", "templateId");
    need(typeof ex.templateVersion === "number", "shape", "templateVersion");
    need(typeof ex.seed === "string" && ex.seed.length <= 60, "shape", "seed");
    need(isObj(ex.params) && isObj(ex.settings) && isObj(ex.pacing) && isObj(ex.entities), "shape", "params/settings/pacing/entities");
    need(isObj(ex.entities.org) && isObj(ex.entities.people) && isObj(ex.entities.clock), "shape", "entities");
    need(Array.isArray(ex.stages) && ex.stages.length >= 3 && ex.stages.length <= 10, "shape", "stages");
    need(Array.isArray(ex.slides) && Array.isArray(ex.hiddenFacts) && Array.isArray(ex.objectives), "shape", "slides/hiddenFacts/objectives");
    need(Array.isArray(ex.pacing.stages) && ex.pacing.stages.length === ex.stages.length, "shape", "pacing");

    ex.stages.forEach((s, i) => {
      checkId(s.id, "stages[" + i + "]");
      need(Array.isArray(s.injects) && Array.isArray(s.branchInjects) && Array.isArray(s.branches) && Array.isArray(s.questions) && Array.isArray(s.challenges) && Array.isArray(s.charts), "shape", "stage " + s.id);
      s.injects.concat(s.branchInjects).forEach((x) => {
        checkId(x.id, "inject");
        need(typeof x.at === "number" && typeof x.type === "string" && typeof x.visibility === "string", "shape", "inject " + x.id);
        need(x.visibility === "public" || x.visibility === "facilitator" || /^role:\w+$/.test(x.visibility), "shape", "visibility " + x.id);
      });
      if (s.decision) {
        checkId(s.decision.id, "decision");
        need(Array.isArray(s.decision.options), "shape", "decision " + s.decision.id);
      }
      need(isObj(s.facilitator), "shape", "facilitator " + s.id);
    });
    ex.slides.forEach((sl) => {
      checkId(sl.id.replace(/:/g, "."), "slide");
      need(SLIDE_TYPES.has(sl.type), "shape", "slide type " + sl.type);
    });
    ex.hiddenFacts.forEach((hf) => checkId(hf.id, "hiddenFact"));
    ex.objectives.forEach((o) => checkId(o.id, "objective"));
    Object.values(ex.entities.people).forEach((p) => need(isObj(p) && typeof p.name === "string", "shape", "people"));

    // Semantic validation: the same checks as before Start.
    const issues = BK.engine.validator.validateInstance(ex);
    if (issues.length) fail("invalid", issues.slice(0, 3).map((x) => BK.engine.validator.format(x, "en")).join("; "));
  }

  function checkSession(ses, ex) {
    need(isObj(ses), "shape", "session");
    need(isObj(ses.position) && typeof ses.position.slideId === "string" && typeof ses.position.step === "number", "shape", "position");
    need(["running", "paused", "ended"].includes(ses.status), "shape", "status");
    need(["en", "sv"].includes(ses.lang), "shape", "lang");
    need(isObj(ses.injects) && isObj(ses.decisions) && isObj(ses.objectives) && Array.isArray(ses.observations), "shape", "session maps");
    need(isObj(ses.clock) && typeof ses.clock.elapsedMs === "number" && isObj(ses.timer), "shape", "clocks");

    const injectIds = new Set();
    ex.stages.forEach((s) => s.injects.concat(s.branchInjects).forEach((x) => injectIds.add(x.id)));
    const stageIds = new Set(ex.stages.map((s) => s.id));
    Object.keys(ses.injects).forEach((id) => {
      need(injectIds.has(id), "reference", "inject " + id);
      const st = ses.injects[id];
      need(isObj(st) && ["pending", "released", "postponed", "skipped"].includes(st.state) && stageIds.has(st.stageId), "reference", "inject state " + id);
    });

    const decisionIds = new Set(ex.stages.filter((s) => s.decision).map((s) => s.decision.id));
    Object.keys(ses.decisions).forEach((id) => {
      need(decisionIds.has(id), "reference", "decision " + id);
      Object.values(ses.decisions[id]).forEach((v) => need(v === null || typeof v === "string" || typeof v === "number", "shape", "decision field " + id));
    });

    const objectiveIds = new Set(ex.objectives.map((o) => o.id));
    Object.keys(ses.objectives).forEach((id) => need(objectiveIds.has(id), "reference", "objective " + id));

    const criteria = new Set(BK.engine.session.criteria(ex).map((c) => c.id));
    Object.keys(ses.scorecard || {}).forEach((id) => need(criteria.has(id), "reference", "criterion " + id));

    ses.observations.forEach((o) => {
      need(isObj(o) && typeof o.observation === "string", "shape", "observation");
      Object.values(o).forEach((v) => need(v === null || typeof v === "string", "shape", "observation field"));
      need(!o.stageId || stageIds.has(o.stageId), "reference", "observation stage");
    });
  }

  function stripMeta(ex) {
    const copy = JSON.parse(JSON.stringify(ex));
    delete copy.id;
    delete copy.createdAt;
    delete copy.updatedAt;
    delete copy.edited;
    return copy;
  }

  /**
   * Validate an exported file. Returns { exercise, session } ready to store (with new
   * ids), or throws ImportError with .reason in json|size|shape|schema|version|kind|invalid|reference.
   */
  function validate(text) {
    const data = parse(text);
    need(isObj(data), "shape", "envelope");
    walk(data, 0, { n: 0 }, "$");
    need(data.schema === BK.config.schemaId, "schema");
    need(typeof data.schemaVersion === "number" && data.schemaVersion >= 1, "version");
    need(data.schemaVersion <= BK.config.schemaVersion, "version", "newer than this app");
    need(data.kind === "exercise" || data.kind === "session", "kind");

    checkExercise(data.exercise);
    if (data.kind === "session") checkSession(data.session, data.exercise);

    const now = new Date().toISOString();
    const exercise = Object.assign({ id: BK.dom.uid("ex"), createdAt: now, updatedAt: now, edited: !!data.exercise.edited, imported: true }, stripMeta(data.exercise));
    let session = null;
    if (data.kind === "session") {
      session = JSON.parse(JSON.stringify(data.session));
      session.id = BK.dom.uid("ses");
      session.exerciseId = exercise.id;
      session.instance = stripMeta(data.exercise);
      session.clock.runningSince = null; // an imported session is never live
      session.timer.runningSince = null;
      session.scorecard = session.scorecard || {};
      session.updatedAt = now;
      session.imported = true;
    }
    return { exercise, session };
  }

  /** Validate and store atomically. Returns { exercise, session }. */
  function importText(text) {
    const result = validate(text);
    if (!BK.store.putItem("exercise", result.exercise)) fail("storage");
    if (result.session && !BK.store.putItem("session", result.session)) {
      BK.store.removeItem("exercise", result.exercise.id); // roll back: never half-imported
      fail("storage");
    }
    return result;
  }

  /** Let the operator pick a file, then import it. Resolves with the result or rejects with ImportError. */
  function pickAndImport() {
    return new Promise((resolve, reject) => {
      const input = BK.dom.el("input", { type: "file", accept: ".json,application/json", hidden: true });
      input.addEventListener("change", () => {
        const file = input.files && input.files[0];
        input.remove();
        if (!file) return;
        if (file.size > LIMITS.bytes) return reject(new ImportError("size"));
        const reader = new FileReader();
        reader.onload = () => {
          try {
            resolve(importText(String(reader.result)));
          } catch (err) {
            reject(err instanceof ImportError ? err : new ImportError("invalid", err.message));
          }
        };
        reader.onerror = () => reject(new ImportError("json"));
        reader.readAsText(file, "utf-8");
      });
      document.body.appendChild(input);
      input.click();
    });
  }

  BK.io.import = { validate, importText, pickAndImport, ImportError, LIMITS };
})();
