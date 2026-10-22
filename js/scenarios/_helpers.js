/*
 * _helpers.js — Compact authoring helpers for scenario templates.
 *
 * They expand short forms into exactly the template schema documented in the
 * README (and used verbatim by s01), so the validator, generator and tests see
 * no difference. Bilingual text is written as ["English", "Svenska"].
 *
 *   L(["en", "sv"])                         -> { en, sv }
 *   q("en", "sv", roles, revisits?)          question
 *   ch("en", "sv")                           challenge
 *   inj(id, at, type, source, severity, reliability, ["en","sv"], extra?)
 *   dec(id, authority, ["q en","q sv"], [["A en","A sv"], …], extra)
 *   fac(["notes"], ["expected"], [["hint"], …])
 *   act(["en","sv"], ownerRole, priority)    suggested action
 *   avr(["assumed"], ["reality"], stageId)   assumption vs reality
 *   kpi([{ id, label: [en, sv], value: (v) => n, format, tone }])   chart data function
 *
 * Branching (gamebook) pages:
 *   pg(id, ["title"], ["narrative"], extra)  page; extra: choice, route, ending, injects, chart,
 *                                            discuss, variants, long, skipTo, clock, facilitator
 *   ask(["question"], ["strong team"], [opt…])   choice; keys A–D by position
 *   opt(["text"], to, ["why"], extra)        option; extra: set (flag or [flags]), requires, hides
 *   end(grade, ["label"], ["summary"])       ending, grade 1 (contained) … 5 (disaster)
 *   vr(cond, ["narrative"], ["because"]?)    narrative variant when cond holds ("flag", "!flag", [..])
 *   rt([[cond, to], …, [null, to]])          route page: first matching rule wins
 */
(function () {
  "use strict";

  const BK = window.BK;

  function L(pair) {
    return pair ? { en: pair[0], sv: pair[1] } : null;
  }

  function q(en, sv, roles, revisits) {
    return Object.assign({ text: { en, sv }, roles: roles || [] }, revisits ? { revisits } : {});
  }

  function ch(en, sv) {
    return { text: { en, sv } };
  }

  /** Public inject by default; `extra` may override visibility, add headline (pair), notes (pairs) etc. */
  function inj(id, at, type, source, severity, reliability, content, extra) {
    const x = Object.assign({ id, at, type, source, severity, reliability, visibility: "public", content: L(content) }, extra || {});
    ["headline", "facilitatorNote", "expectedResponse", "statedReliability"].forEach((k) => {
      if (Array.isArray(x[k])) x[k] = L(x[k]);
    });
    if (x.substitute && Array.isArray(x.substitute.content)) x.substitute = Object.assign({}, x.substitute, { content: L(x.substitute.content) });
    return x;
  }

  function dec(id, authority, question, options, extra) {
    const e = extra || {};
    const keys = ["A", "B", "C", "D"];
    const tradeoffs = {};
    Object.keys(e.tradeoffs || {}).forEach((k) => (tradeoffs[k] = L(e.tradeoffs[k])));
    return {
      id,
      question: L(question),
      authority,
      options: options.map((o, i) => ({ key: keys[i], text: L(o) })),
      knowns: (e.knowns || []).map(L),
      uncertainties: (e.uncertainties || []).map(L),
      tradeoffs,
      evaluation: (e.evaluation || []).map(L),
      discussionMinutes: e.minutes || 8
    };
  }

  function fac(notes, expected, hints) {
    return { notes: L(notes), expected: L(expected), hints: (hints || []).map(L) };
  }

  function act(text, ownerRole, priority) {
    return { text: L(text), ownerRole, priority: priority || "medium" };
  }

  function avr(assumption, reality, stage) {
    return { assumption: L(assumption), reality: L(reality), stage };
  }

  /** KPI tiles as a chart data function; `value` receives the rolled variables. */
  function kpi(tiles) {
    return (ctx) => ({
      tiles: tiles.map((tl) => ({ id: tl.id, label: L(tl.label), value: typeof tl.value === "function" ? tl.value(ctx.vars, ctx) : tl.value, format: tl.format || "number", tone: tl.tone || "info" }))
    });
  }

  /** Line series from a generator of [x, y] points. */
  function line(label, from, to, step, yFn, xUnit) {
    return (ctx) => {
      const points = [];
      for (let x = from; x <= to; x += step) points.push([x, Math.max(0, Math.round(yFn(x, ctx)))]);
      return { xUnit: xUnit || "minutes", series: [{ id: "s1", label: L(label), points }] };
    };
  }

  // ---- Branching pages ----

  function pg(id, title, narrative, extra) {
    const p = Object.assign({ id, title: L(title), narrative: L(narrative) }, extra || {});
    if (p.ending && !p.choice && !p.route) delete p.choice;
    return p;
  }

  function ask(question, strong, options) {
    const keys = ["A", "B", "C", "D"];
    return { question: L(question), strong: L(strong), options: options.map((o, i) => Object.assign({ key: keys[i] }, o)) };
  }

  function opt(text, to, why, extra) {
    const e = Object.assign({}, extra || {});
    if (e.set != null) e.set = [].concat(e.set);
    return Object.assign({ text: L(text), to, why: L(why) }, e);
  }

  function end(grade, label, summary) {
    return { grade, label: L(label), summary: L(summary) };
  }

  function vr(cond, narrative, because) {
    return { if: cond, narrative: L(narrative), because: because ? L(because) : null };
  }

  function rt(rules) {
    return rules.map(([cond, to]) => ({ if: cond, to }));
  }

  BK.scenarios.h = { L, q, ch, inj, dec, fac, act, avr, kpi, line, pg, ask, opt, end, vr, rt };
})();
