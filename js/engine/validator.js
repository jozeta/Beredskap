/*
 * validator.js — Template and instance validation (spec 5.5).
 *
 * Runs on every template at registration and on every instance before Start is
 * enabled. Returns a list of issues { code, where, detail }; format() turns them
 * into translated, actionable messages ("validation.<code>" in i18n).
 *
 * Template validation is structural AND behavioural: besides checking fields and
 * references it generates probe instances at the minimum and maximum stage count
 * (and with every external pressure switched off) and validates those, so a
 * template cannot pass while producing a broken exercise at some setting.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const LANGS = ["en", "sv"];
  const opts = () => BK.data.options;

  // Fields that must always be bilingual { en, sv } when present.
  const TEXT_KEYS = new Set([
    "title", "summary", "narrative", "twist", "assumptionChallenged", "headline", "content", "text", "question",
    "expectedResponse", "facilitatorNote", "rootCause", "notes", "expected", "noDecision", "statedReliability",
    "caption", "narrativeAppend", "motivation", "assumption", "reality"
  ]);

  const BRANCH_KEYS = new Set(["when", "addInjects", "narrativeAppend", "facilitatorNote"]);

  function issue(list, code, where, detail) {
    list.push({ code, where: where || "", detail: detail == null ? "" : String(detail) });
  }

  function isBilingual(v) {
    return v && typeof v === "object" && !Array.isArray(v) && LANGS.every((l) => typeof v[l] === "string" && v[l].trim() !== "");
  }

  /** Every objective needs its clear text (facilitator) and a teaser (briefing slide) that does not give the plot away. */
  function checkObjectives(tpl, where, list) {
    (tpl.learningObjectives || []).forEach((lo) => {
      if (!isBilingual(lo.text)) issue(list, "field", where("learningObjectives › " + lo.id), "text");
      if (!isBilingual(lo.teaser)) issue(list, "stageContent", where("learningObjectives › " + lo.id), "teaser");
    });
  }

  /** Walk any structure; report text fields that are not complete { en, sv } objects. */
  function checkLanguages(value, path, list) {
    if (Array.isArray(value)) {
      value.forEach((v, i) => checkLanguages(v, path + "[" + i + "]", list));
      return;
    }
    if (!value || typeof value !== "object") return;
    const keys = Object.keys(value);
    const looksText = keys.length && keys.every((k) => LANGS.includes(k));
    if (looksText) {
      if (!isBilingual(value)) issue(list, "language", path, LANGS.filter((l) => !(typeof value[l] === "string" && value[l].trim())).join(", "));
      return;
    }
    keys.forEach((k) => {
      const v = value[k];
      const p = path ? path + "." + k : k;
      // A text field written as a plain string has only one language. (Incomplete
      // { en, sv } objects are caught by the recursion's looksText branch.)
      if (TEXT_KEYS.has(k) && typeof v === "string") {
        issue(list, "language", p, "plain string");
        return;
      }
      checkLanguages(v, p, list);
    });
  }

  // ---- Template ---------------------------------------------------------------------------

  function validateTemplate(tpl) {
    if (tpl.format === "branching") return validateBranchingTemplate(tpl);
    const list = [];
    const o = opts();
    const where = (s) => tpl.id + (s ? " › " + s : "");

    // Required top-level fields.
    ["id", "version", "category", "archetype", "title", "summary", "learningObjectives", "roles", "stages", "groundTruth", "debrief", "resolution"].forEach((f) => {
      if (tpl[f] == null) issue(list, "field", where(), f);
    });
    if (list.length) return list; // cannot meaningfully continue

    if (!o.categories.includes(tpl.category)) issue(list, "enum", where("category"), tpl.category);
    if (!Object.values(o.archetypes).includes(tpl.archetype)) issue(list, "enum", where("archetype"), tpl.archetype);
    if (!(tpl.minStages >= o.minStages && tpl.maxStages <= o.maxStages && tpl.minStages <= tpl.maxStages)) {
      issue(list, "stageCount", where(), tpl.minStages + "–" + tpl.maxStages);
    }
    if (tpl.stages.length < tpl.maxStages) issue(list, "stageCount", where("stages"), tpl.stages.length + " < " + tpl.maxStages);
    const mandatory = tpl.stages.filter((s) => s.mandatory);
    if (mandatory.length > tpl.minStages) issue(list, "mandatoryCount", where(), mandatory.length + " > " + tpl.minStages);
    if (tpl.stages[0] && !tpl.stages[0].mandatory) issue(list, "firstStage", where(tpl.stages[0].id));

    // Roles.
    const roles = new Set(tpl.roles);
    tpl.roles.forEach((r) => {
      if (!BK.data.roles.get(r)) issue(list, "role", where("roles"), r);
    });
    const checkRole = (r, w) => {
      if (r && !roles.has(r)) issue(list, "role", w, r);
    };

    // Unique ids.
    const seen = new Map();
    const unique = (kind, id, w) => {
      const key = kind + ":" + id;
      if (!id) issue(list, "field", w, kind + ".id");
      else if (seen.has(key)) issue(list, "duplicateId", w, id);
      else seen.set(key, true);
    };
    tpl.learningObjectives.forEach((lo) => unique("lo", lo.id, where("learningObjectives")));
    checkObjectives(tpl, where, list);
    (tpl.hiddenFacts || []).forEach((hf) => unique("hf", hf.id, where("hiddenFacts")));

    const stageIndex = {};
    tpl.stages.forEach((s, i) => {
      unique("stage", s.id, where("stages[" + i + "]"));
      stageIndex[s.id] = i;
    });
    const loIds = new Set(tpl.learningObjectives.map((lo) => lo.id));
    const hfIds = new Set((tpl.hiddenFacts || []).map((hf) => hf.id));

    (tpl.hiddenFacts || []).forEach((hf) => {
      if (!(hf.revealStage in stageIndex)) issue(list, "reference", where("hiddenFacts." + hf.id), hf.revealStage);
    });

    // Stage-by-stage checks. Inject positions are collected up front so a `requires`
    // that points forward is reported as an ordering problem, not a missing reference.
    const injectOrder = {}; // id -> [stageIdx, position]
    tpl.stages.forEach((s, si) => (s.injects || []).forEach((x, xi) => (injectOrder[x.id] = [si, xi])));
    const decisions = {}; // id -> { stageIdx, options }
    let lastClock = -Infinity;
    let lastInjectAt = -Infinity;
    let causeScope = 0;

    tpl.stages.forEach((s, si) => {
      const w = where(s.id);
      if (!isBilingual(s.title) || !isBilingual(s.narrative)) issue(list, "stageContent", w, "title/narrative");
      if ((s.clock || 0) < lastClock) issue(list, "timeline", w, "stage clock " + s.clock + " < " + lastClock);
      lastClock = s.clock || 0;

      const injects = s.injects || [];
      const publicDefault = injects.filter((x) => !x.branchOnly && !x.optional && (x.visibility || "public") === "public");
      if (!publicDefault.length) issue(list, "stageContent", w, "no mandatory public inject");

      // Chart types must have a stage renderer (the stage would otherwise fall back to bars).
      (s.charts || []).forEach((c) => {
        if (!BK.data.options.chartTypes.includes(c.type)) issue(list, "enum", w + " › " + c.id, "chart type " + c.type);
      });

      injects.forEach((x) => {
        const iw = w + " › " + x.id;
        unique("inject", x.id, iw);
        checkThread(x, iw, list);
        if (!o.injectTypes.includes(x.type)) issue(list, "enum", iw, "type " + x.type);
        if (x.severity && !o.severities.includes(x.severity)) issue(list, "enum", iw, "severity " + x.severity);
        if (x.reliability && !o.reliabilities.includes(x.reliability)) issue(list, "enum", iw, "reliability " + x.reliability);
        const vis = x.visibility || "public";
        if (!(vis === "public" || vis === "facilitator" || /^role:\w+$/.test(vis))) issue(list, "enum", iw, "visibility " + vis);
        if (vis.startsWith("role:")) checkRole(vis.slice(5), iw);
        if ((x.reliability === "misleading" || x.reliability === "disputed") && !isBilingual(x.facilitatorNote)) issue(list, "misleadingNote", iw);
        if (x.pressure && !o.pressures.includes(x.pressure)) issue(list, "enum", iw, "pressure " + x.pressure);
        if (x.pressure && !x.optional && !x.substitute) issue(list, "pressureSubstitute", iw, x.pressure);
        if (x.source && x.source.startsWith("person.")) checkRole(x.source.slice(7), iw);
        else if (x.source && !o.sources.includes(x.source)) issue(list, "enum", iw, "source " + x.source);
        checkRole(x.fallbackRole, iw);
        if (!isBilingual(x.content) && !(x.variants && x.variants.every((v) => isBilingual(v.content)))) issue(list, "stageContent", iw, "content");
        (x.tests || []).forEach((lo) => {
          if (!loIds.has(lo)) issue(list, "reference", iw, "tests " + lo);
        });
        (x.reveals || []).forEach((hf) => {
          if (!hfIds.has(hf)) issue(list, "reference", iw, "reveals " + hf);
          else {
            const hfo = tpl.hiddenFacts.find((h) => h.id === hf);
            if (stageIndex[hfo.revealStage] > si) issue(list, "earlyReveal", iw, hf);
          }
        });
        if (!x.branchOnly) {
          const at = x.at || 0;
          if (at < lastInjectAt) issue(list, "timeline", iw, "at " + at + " < " + lastInjectAt);
          if (at < (s.clock || 0)) issue(list, "timeline", iw, "at " + at + " before stage clock " + (s.clock || 0));
          lastInjectAt = Math.max(lastInjectAt, at);
        }
      });

      // Dependencies must exist and come earlier.
      injects.forEach((x) =>
        (x.requires || []).forEach((r) => {
          const pos = injectOrder[r];
          if (!pos) issue(list, "reference", w + " › " + x.id, "requires " + r);
          else if (pos[0] > si || (pos[0] === si && pos[1] >= injectOrder[x.id][1])) issue(list, "dependency", w + " › " + x.id, r);
        })
      );

      // Questions: 2+ per audience, roles known, a revisit question after stage 1.
      const q = s.questions || {};
      ["technical", "executive"].forEach((aud) => {
        const arr = q[aud] || [];
        if (arr.length < 2) issue(list, "questions", w, aud + ": " + arr.length);
        arr.forEach((qq) => (qq.roles || []).forEach((r) => checkRole(r, w + " › " + aud)));
        if (si > 0 && !arr.some((qq) => qq.revisits)) issue(list, "revisit", w, aud);
      });

      const ch = s.challenges || [];
      if (ch.length < 1 || ch.length > 2) issue(list, "challenges", w, ch.length);

      if (s.decision) {
        const d = s.decision;
        unique("decision", d.id, w);
        if (!isBilingual(d.question)) issue(list, "decision", w, "question");
        checkRole(d.authority, w + " › " + d.id);
        decisions[d.id] = { stageIdx: si, options: (d.options || []).map((op) => op.key) };
      } else if (!isBilingual(s.noDecision)) {
        issue(list, "decision", w, "decision or noDecision");
      }

      if (si > 0) {
        if (!isBilingual(s.twist)) issue(list, "twist", w);
        if (!isBilingual(s.assumptionChallenged)) issue(list, "assumption", w);
        if (!o.twistKinds.includes(s.twistKind)) issue(list, "enum", w, "twistKind " + s.twistKind);
        if (s.twistKind === "cause" || s.twistKind === "scope") causeScope++;
      }

      // Stage reveals must agree with hidden facts' revealStage.
      (s.reveals || []).forEach((hf) => {
        const h = (tpl.hiddenFacts || []).find((x) => x.id === hf);
        if (!h) issue(list, "reference", w, "reveals " + hf);
        else if (h.revealStage !== s.id) issue(list, "reference", w, hf + " reveals at " + h.revealStage);
      });

      // Branches: earlier decision, existing option, branch-only injects of this stage, no structural keys.
      (s.branches || []).forEach((b, bi) => {
        const bw = w + " › branch " + (bi + 1);
        Object.keys(b).forEach((k) => {
          if (!BRANCH_KEYS.has(k)) issue(list, "branch", bw, k);
        });
        const d = b.when && decisions[b.when.decision];
        if (!d || d.stageIdx >= si) issue(list, "branch", bw, "decision " + (b.when && b.when.decision));
        else if (b.when.option && !d.options.includes(b.when.option)) issue(list, "branch", bw, "option " + b.when.option);
        (b.addInjects || []).forEach((id) => {
          const x = injects.find((i) => i.id === id);
          if (!x || !x.branchOnly) issue(list, "branch", bw, "inject " + id);
        });
      });
    });

    if (causeScope < 2) issue(list, "twistKinds", where(), causeScope);

    // Frameworks reference known ids.
    const fw = BK.data.frameworks;
    (tpl.mitre || []).forEach((id) => fw.mitre[id] || issue(list, "framework", where("mitre"), id));
    ((tpl.frameworks && tpl.frameworks.nistCsf) || []).forEach((id) => fw.nistCsf[id] || issue(list, "framework", where("nistCsf"), id));
    ((tpl.frameworks && tpl.frameworks.iso27001) || []).forEach((id) => fw.iso27001[id] || issue(list, "framework", where("iso27001"), id));

    // Debrief references.
    ((tpl.debrief && tpl.debrief.assumptionsVsReality) || []).forEach((a) => {
      if (a.stage && !(a.stage in stageIndex)) issue(list, "reference", where("debrief"), "stage " + a.stage);
    });
    ((tpl.debrief && tpl.debrief.suggestedActions) || []).forEach((a) => checkRole(a.ownerRole, where("debrief")));

    checkLanguages(stripFunctions(tpl), tpl.id, list);

    // Behavioural probes: if structure is sound, generated instances must validate at the extremes.
    if (!list.length && BK.engine.generator) probe(tpl, list);
    return list;
  }

  /** Inject checks shared by both formats (stage and page injects). */
  /** meta.thread: a two-way conversation shown on the slide; each turn has a side and bilingual text. */
  function checkThread(x, iw, list) {
    const th = x.meta && x.meta.thread;
    if (th == null) return;
    if (!Array.isArray(th) || !th.length) return issue(list, "field", iw, "meta.thread");
    th.forEach((turn, i) => {
      if (!turn || (turn.side !== "in" && turn.side !== "out")) issue(list, "enum", iw + " › thread[" + i + "]", "side " + (turn && turn.side));
      if (!turn || !isBilingual(turn.text)) issue(list, "language", iw + " › thread[" + i + "]", "text");
    });
  }

  function checkInject(x, iw, ctx, list) {
    const o = opts();
    checkThread(x, iw, list);
    if (!o.injectTypes.includes(x.type)) issue(list, "enum", iw, "type " + x.type);
    if (x.severity && !o.severities.includes(x.severity)) issue(list, "enum", iw, "severity " + x.severity);
    if (x.reliability && !o.reliabilities.includes(x.reliability)) issue(list, "enum", iw, "reliability " + x.reliability);
    const vis = x.visibility || "public";
    if (!(vis === "public" || vis === "facilitator" || /^role:\w+$/.test(vis))) issue(list, "enum", iw, "visibility " + vis);
    if (vis.startsWith("role:")) ctx.checkRole(vis.slice(5), iw);
    if ((x.reliability === "misleading" || x.reliability === "disputed") && !isBilingual(x.facilitatorNote)) issue(list, "misleadingNote", iw);
    if (x.pressure && !o.pressures.includes(x.pressure)) issue(list, "enum", iw, "pressure " + x.pressure);
    if (x.pressure && !x.optional && !x.substitute) issue(list, "pressureSubstitute", iw, x.pressure);
    if (x.source && x.source.startsWith("person.")) ctx.checkRole(x.source.slice(7), iw);
    else if (x.source && !o.sources.includes(x.source)) issue(list, "enum", iw, "source " + x.source);
    ctx.checkRole(x.fallbackRole, iw);
    if (!isBilingual(x.content) && !(x.variants && x.variants.every((v) => isBilingual(v.content)))) issue(list, "stageContent", iw, "content");
    (x.tests || []).forEach((lo) => {
      if (!ctx.loIds.has(lo)) issue(list, "reference", iw, "tests " + lo);
    });
  }

  /** Branching (gamebook) templates: shared checks plus the map rules in branching.js. */
  function validateBranchingTemplate(tpl) {
    const list = [];
    const o = opts();
    const where = (s) => tpl.id + (s ? " › " + s : "");
    ["id", "version", "category", "archetype", "title", "summary", "learningObjectives", "roles", "start", "pages", "debrief", "flags"].forEach((f) => {
      if (tpl[f] == null) issue(list, "field", where(), f);
    });
    if (list.length) return list;
    if (!o.categories.includes(tpl.category)) issue(list, "enum", where("category"), tpl.category);
    if (!Object.values(o.archetypes).includes(tpl.archetype)) issue(list, "enum", where("archetype"), tpl.archetype);

    const roles = new Set(tpl.roles);
    tpl.roles.forEach((r) => BK.data.roles.get(r) || issue(list, "role", where("roles"), r));
    const checkRole = (r, w) => {
      if (r && !roles.has(r)) issue(list, "role", w, r);
    };
    checkObjectives(tpl, where, list);
    const loIds = new Set(tpl.learningObjectives.map((lo) => lo.id));
    const ctx = { checkRole, loIds };
    const injectIds = new Set();

    tpl.pages.forEach((pg) => {
      const w = where(pg.id);
      if (!isBilingual(pg.title) || !isBilingual(pg.narrative)) issue(list, "stageContent", w, "title/narrative");
      (pg.injects || []).forEach((x) => {
        const iw = w + " › " + x.id;
        if (injectIds.has(x.id)) issue(list, "duplicateId", iw, x.id);
        injectIds.add(x.id);
        if (x.requires || x.reveals || x.branchOnly) issue(list, "branching", iw, "requires/reveals/branchOnly are not used in branching exercises");
        checkInject(x, iw, ctx, list);
      });
      if (pg.chart && !o.chartTypes.includes(pg.chart.type)) issue(list, "enum", w + " › " + pg.chart.id, "chart type " + pg.chart.type);
      (pg.discuss || []).forEach((q) => (q.roles || []).forEach((r) => checkRole(r, w + " › discuss")));
      if (pg.choice) {
        if (!isBilingual(pg.choice.strong)) issue(list, "branching", w, "choice needs a strong-team note");
        pg.choice.options.forEach((op) => isBilingual(op.why) || issue(list, "branching", w + " › " + op.key, "option needs a why note"));
      }
    });

    BK.engine.branching.validateMap(tpl, (code, w, detail) => issue(list, code, w, detail));

    const fw = BK.data.frameworks;
    (tpl.mitre || []).forEach((id) => fw.mitre[id] || issue(list, "framework", where("mitre"), id));
    ((tpl.frameworks && tpl.frameworks.nistCsf) || []).forEach((id) => fw.nistCsf[id] || issue(list, "framework", where("nistCsf"), id));
    ((tpl.frameworks && tpl.frameworks.iso27001) || []).forEach((id) => fw.iso27001[id] || issue(list, "framework", where("iso27001"), id));
    if (!(tpl.mitre || []).length) issue(list, "field", where(), "mitre");
    ((tpl.debrief && tpl.debrief.suggestedActions) || []).forEach((a) => checkRole(a.ownerRole, where("debrief")));
    ["keyLessons", "strengthsToLookFor", "commonGaps", "suggestedActions"].forEach((k) => ((tpl.debrief || {})[k] || []).length || issue(list, "field", where("debrief"), k));

    checkLanguages(stripFunctions(tpl), tpl.id, list);
    if (!list.length && BK.engine.generator) probeBranching(tpl, list);
    return list;
  }

  const BRANCH_PROBES = [
    { length: "short", mode: "pure", audience: "technical", difficulty: "advanced", injectDensity: "high" },
    { length: "long", mode: "hybrid", audience: "executive", difficulty: "introductory", injectDensity: "low", pressuresOff: true },
    { length: "long", mode: "hybrid", audience: "mixed", difficulty: "intermediate", injectDensity: "normal" }
  ];

  function probeBranching(tpl, list) {
    BRANCH_PROBES.forEach((pp, i) => {
      const params = Object.assign({}, pp, { seed: "PROBE-" + (2000 + i), jurisdiction: ["se", "eu", "generic"][i], environment: BK.data.environments.ids[i % BK.data.environments.ids.length] });
      if (pp.pressuresOff) params.pressures = { media: false, regulator: false, lawEnforcement: false, suppliers: false, customers: false };
      let inst;
      try {
        inst = BK.engine.generator.generate(tpl, params);
      } catch (err) {
        issue(list, "generate", tpl.id + " › probe " + (i + 1), err.message);
        return;
      }
      validateInstance(inst).forEach((x) => list.push(Object.assign({}, x, { where: tpl.id + " › probe " + (i + 1) + " › " + x.where })));
      if (i === 0) {
        const ctx = { entities: inst.entities, vars: inst.vars, clock: inst.entities.clock, currency: inst.currency, environment: params.environment, jurisdiction: params.jurisdiction };
        BK.engine.template.collectPlaceholders(stripFunctions(tpl)).forEach((path) => {
          if (BK.engine.template.lookup(path, ctx) === BK.engine.template.MISSING) issue(list, "placeholder", tpl.id, path);
        });
      }
    });
  }

  function stripFunctions(v) {
    if (typeof v === "function") return undefined;
    if (Array.isArray(v)) return v.map(stripFunctions);
    if (v && typeof v === "object") {
      const out = {};
      Object.keys(v).forEach((k) => {
        const r = stripFunctions(v[k]);
        if (r !== undefined) out[k] = r;
      });
      return out;
    }
    return v;
  }

  const PROBE_PARAMS = [
    { stage: "min", injectDensity: "high", audience: "technical", difficulty: "advanced" },
    { stage: "max", injectDensity: "high", audience: "executive", difficulty: "introductory" },
    { stage: "max", injectDensity: "low", audience: "mixed", difficulty: "intermediate", pressuresOff: true, decisionMode: "open" }
  ];

  function probe(tpl, list) {
    const gen = BK.engine.generator;
    PROBE_PARAMS.forEach((pp, i) => {
      const params = {
        seed: "PROBE-" + (1000 + i),
        stageCount: pp.stage === "min" ? tpl.minStages : tpl.maxStages,
        injectDensity: pp.injectDensity,
        audience: pp.audience,
        difficulty: pp.difficulty,
        decisionMode: pp.decisionMode || "options",
        jurisdiction: i === 0 ? "se" : i === 1 ? "eu" : "generic",
        environment: BK.data.environments.ids[i % BK.data.environments.ids.length]
      };
      if (pp.pressuresOff) params.pressures = { media: false, regulator: false, lawEnforcement: false, suppliers: false, customers: false };
      let inst;
      try {
        inst = gen.generate(tpl, params);
      } catch (err) {
        issue(list, "generate", tpl.id + " › probe " + (i + 1), err.message);
        return;
      }
      validateInstance(inst).forEach((x) => list.push(Object.assign({}, x, { where: tpl.id + " › probe " + (i + 1) + " › " + x.where })));

      // Every placeholder anywhere in the template must resolve (covers variants and substitutes too).
      const ctx = { entities: inst.entities, vars: inst.vars, clock: inst.entities.clock, currency: inst.currency, environment: params.environment, jurisdiction: params.jurisdiction };
      if (i === 0) {
        BK.engine.template.collectPlaceholders(stripFunctions(tpl)).forEach((path) => {
          if (BK.engine.template.lookup(path, ctx) === BK.engine.template.MISSING) issue(list, "placeholder", tpl.id, path);
        });
      }
    });
  }

  // ---- Instance -------------------------------------------------------------------------

  function validateInstance(inst) {
    const list = [];
    const o = opts();
    (inst.unresolved || []).forEach((p) => issue(list, "placeholder", "", p));
    if (inst.format === "branching") return validateBranchingInstance(inst, list);

    const n = (inst.stages || []).length;
    if (n < o.minStages || n > o.maxStages) issue(list, "stageCount", "", n);

    // Roles: exactly one person per role, no duplicate names.
    const names = new Set();
    Object.values(inst.entities.people).forEach((p) => {
      if (names.has(p.name)) issue(list, "duplicateId", "people", p.name);
      names.add(p.name);
    });

    const ids = new Set();
    const stageIdx = {};
    const enabled = new Set();
    let lastAt = -Infinity;
    let causeScope = 0;

    inst.stages.forEach((s, si) => {
      const w = s.id;
      stageIdx[s.id] = si;
      if (ids.has("s:" + s.id)) issue(list, "duplicateId", w, s.id);
      ids.add("s:" + s.id);

      if (!isBilingual(s.narrative)) issue(list, "stageContent", w, "narrative");
      if ((s.questions || []).length < 2) issue(list, "questions", w, (s.questions || []).length);
      if (!s.decision && !isBilingual(s.noDecision)) issue(list, "decision", w);
      if (si > 0) {
        if (!isBilingual(s.twist)) issue(list, "twist", w);
        if (!isBilingual(s.assumptionChallenged)) issue(list, "assumption", w);
        if (!(s.questions || []).some((q) => q.revisits)) issue(list, "revisit", w);
        if (s.twistKind === "cause" || s.twistKind === "scope") causeScope++;
      }

      s.injects.forEach((x) => {
        if (ids.has("i:" + x.id)) issue(list, "duplicateId", w, x.id);
        ids.add("i:" + x.id);
        if (x.enabled === false) return;
        if (x.at < lastAt) issue(list, "timeline", w + " › " + x.id, x.at + " < " + lastAt);
        lastAt = Math.max(lastAt, x.at);
        (x.requires || []).forEach((r) => {
          if (!enabled.has(r)) issue(list, "dependency", w + " › " + x.id, r);
        });
        enabled.add(x.id);
      });
      s.branchInjects.forEach((x) => ids.add("i:" + x.id));
    });

    if (causeScope < 2) issue(list, "twistKinds", "", causeScope);

    // No inject reveals a hidden fact before its reveal stage.
    const hfStage = {};
    (inst.hiddenFacts || []).forEach((hf) => {
      if (hf.revealStage !== "debrief" && !(hf.revealStage in stageIdx)) issue(list, "reference", "hiddenFacts." + hf.id, hf.revealStage);
      hfStage[hf.id] = hf.revealStage === "debrief" ? Infinity : stageIdx[hf.revealStage];
    });
    inst.stages.forEach((s, si) =>
      s.injects.concat(s.branchInjects).forEach((x) =>
        (x.reveals || []).forEach((hf) => {
          if (!(hf in hfStage)) issue(list, "reference", s.id + " › " + x.id, hf);
          else if (hfStage[hf] > si) issue(list, "earlyReveal", s.id + " › " + x.id, hf);
        })
      )
    );

    // Slides reference real content.
    (inst.slides || []).forEach((sl) => {
      if (sl.stageId && !(sl.stageId in stageIdx)) issue(list, "reference", "slide " + sl.id, sl.stageId);
      if (sl.injectId && !ids.has("i:" + sl.injectId)) issue(list, "reference", "slide " + sl.id, sl.injectId);
    });

    checkLanguages(
      { title: inst.title, summary: inst.summary, stages: inst.stages.map((s) => ({ title: s.title, narrative: s.narrative, twist: s.twist, injects: s.injects.map((x) => ({ content: x.content, headline: x.headline })), questions: s.questions.map((q) => ({ text: q.text })) })) },
      "",
      list
    );
    return list;
  }

  /** Branching instance: people, map still sound for its length, languages. */
  function validateBranchingInstance(inst, list) {
    const names = new Set();
    Object.values(inst.entities.people).forEach((p) => {
      if (names.has(p.name)) issue(list, "duplicateId", "people", p.name);
      names.add(p.name);
    });
    const a = BK.engine.branching.analyse(inst.pages, inst.start, inst.settings.length);
    a.problems.forEach((p) => issue(list, "branching", inst.settings.length, p));
    checkLanguages(
      { title: inst.title, summary: inst.summary, pages: inst.pages.map((p) => ({ title: p.title, narrative: p.narrative, injects: p.injects.map((x) => ({ content: x.content, headline: x.headline })) })) },
      "",
      list
    );
    return list;
  }

  /** Translated message for one issue. */
  function format(x, lang) {
    const msg = BK.t("validation." + x.code, { detail: x.detail }, lang);
    return (x.where ? x.where + ": " : "") + msg;
  }

  BK.engine.validator = { validateTemplate, validateInstance, format, isBilingual };
})();
