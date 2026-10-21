/*
 * _registry.js — Scenario template registry: BK.scenarios.register().
 *
 * Each scenario file calls register() with its template. Templates are frozen on
 * registration so nothing downstream can mutate authored content; operator edits
 * live on exercise instances instead. If the validator is loaded (phase 2+), every
 * template is validated on registration and problems are kept for the library.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const templates = new Map();
  const problems = new Map(); // id -> [messages]

  function deepFreeze(obj) {
    Object.values(obj).forEach((v) => {
      if (v && typeof v === "object" && !Object.isFrozen(v)) deepFreeze(v);
    });
    return Object.freeze(obj);
  }

  function register(template) {
    if (!template || !template.id) {
      console.error("[Beredskap] scenario without id ignored", template);
      return;
    }
    if (templates.has(template.id)) {
      console.error("[Beredskap] duplicate scenario id", template.id);
      return;
    }
    templates.set(template.id, deepFreeze(template));

    const validator = BK.engine.validator;
    if (validator && validator.validateTemplate) {
      const issues = validator.validateTemplate(template);
      if (issues.length) {
        problems.set(template.id, issues);
        console.warn("[Beredskap] template " + template.id + " failed validation", issues);
      }
    }
  }

  /** Templates sorted by id (s01 … s20). */
  function list() {
    return Array.from(templates.values()).sort((a, b) => a.id.localeCompare(b.id));
  }

  BK.scenarios = {
    register,
    list,
    get: (id) => templates.get(id) || null,
    problems: (id) => problems.get(id) || [],
    count: () => templates.size
  };
})();
