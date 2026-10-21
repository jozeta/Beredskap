/*
 * generator.js — Template + params + seed → exercise instance.
 *
 * generate() is pure and deterministic: the same template version, params and
 * seed always give a deep-equal instance. It never stamps ids or timestamps;
 * generateFromParams() wraps the instance into a stored exercise record.
 *
 * Pipeline:
 *   1. normalise params               5. stage selection (mandatory + priority)
 *   2. entity graph (org, people,     6. per stage: injects (difficulty, pressure,
 *      actor, suppliers, assets)         density, variants, role targeting),
 *   3. variables (size + currency)       questions (audience), decision, charts
 *   4. in-scenario clock              7. hidden facts, objectives, frameworks,
 *                                         debrief, pacing, slides
 * Every random choice draws from a named fork, so adding content in one area
 * never reshuffles another (spec 5.2).
 */
(function () {
  "use strict";

  const BK = window.BK;
  const N = () => BK.data.names;
  const T = () => BK.engine.template;
  const opts = () => BK.data.options;

  // ---- 1. Params --------------------------------------------------------------------

  const DEFAULT_PARAMS = {
    title: "",
    lang: "en",
    difficulty: "intermediate",
    durationMinutes: 60,
    stageCount: null,
    audience: "mixed",
    stageTheme: "dark",
    sector: "random",
    orgSize: "medium",
    orgName: "",
    environment: "generic",
    jurisdiction: "eu",
    pressures: { media: true, regulator: true, lawEnforcement: true, suppliers: true, customers: true },
    injectDensity: "normal",
    roles: null, // null = every template role is present
    useRealNames: false,
    participantNames: {},
    objectives: { deselected: [], custom: [] },
    discussionMinutes: null,
    injectRelease: "manual",
    decisionMode: "options",
    seed: "FJORD-1000"
  };

  function normalizeParams(template, params) {
    const p = Object.assign({}, DEFAULT_PARAMS, JSON.parse(JSON.stringify(params || {})));
    p.pressures = Object.assign({}, DEFAULT_PARAMS.pressures, p.pressures || {});
    p.objectives = Object.assign({ deselected: [], custom: [] }, p.objectives || {});
    p.participantNames = p.participantNames || {};
    p.seed = BK.rng.normalizeSeed(p.seed) || DEFAULT_PARAMS.seed;
    p.scenarioId = template.id;
    p.stageCount = clampStages(template, p.stageCount || suggestStages(template, p.durationMinutes));
    if (!Array.isArray(p.roles) || p.roles.length === 0) p.roles = template.roles.slice();
    return p;
  }

  /** ~15 minutes per stage, clamped to the template's bounds. */
  function suggestStages(template, minutes) {
    return clampStages(template, Math.round((minutes || 60) / 15));
  }

  function clampStages(template, n) {
    return Math.max(template.minStages, Math.min(template.maxStages, Math.round(n)));
  }

  /** Names follow jurisdiction: Swedish names for Sweden, international otherwise. */
  function nameLocale(p) {
    if (p.jurisdiction === "se") return "sv";
    if (p.jurisdiction === "eu") return "en";
    return p.lang;
  }

  /** Fixed at generation so switching language never changes an amount. */
  function currencyFor(p) {
    if (p.jurisdiction === "se") return "SEK";
    if (p.jurisdiction === "eu") return "EUR";
    return p.lang === "sv" ? "SEK" : "EUR";
  }

  // ---- 2. Entity graph ------------------------------------------------------------------

  function legalStem(name) {
    return name.replace(/\s+(AB|Ltd|Group|Trust|Borough Council|City Council|Regional Authority)$/i, "").replace(/s kommun$/, "").replace(/^Region\s+/, "");
  }

  function buildOrg(rng, template, p) {
    const loc = nameLocale(p);
    const constraintSectors = (template.constraints && template.constraints.sectors) || [];
    const sector = p.sector !== "random" ? p.sector : rng.pick(constraintSectors.length ? constraintSectors : BK.data.sectors.ids);
    const catalogue = BK.data.sectors.catalogue[sector];
    const size = BK.data.sectors.sizes[p.orgSize] || BK.data.sectors.sizes.medium;

    const core = rng.pick(N().orgCores[loc]);
    const pattern = rng.pick(N().orgPatterns[sector][loc]);
    const generatedName = pattern.replace("{core}", core);
    const name = (p.orgName || "").trim() || generatedName;
    const stem = p.orgName ? legalStem(name) : legalStem(generatedName);
    const shortName = p.orgName ? stem.split(/\s+/)[0] : core;

    const services = {};
    Object.keys(catalogue.services).forEach((slot) => {
      const s = catalogue.services[slot];
      services[slot] = { id: slot, name: s.name, rto: s.rto, rpo: s.rpo, deps: s.deps.slice() };
    });

    return {
      name,
      shortName,
      sector,
      size: p.orgSize,
      domain: N().domain(stem),
      city: rng.pick(N().cities[loc]),
      model: catalogue.model,
      headcount: roundTo(rng.int(size.headcount[0], size.headcount[1]), 10),
      sites: rng.int(size.sites[0], size.sites[1]),
      services,
      crownJewels: catalogue.crownJewels
    };
  }

  function buildPeople(rng, template, p, org) {
    const pool = N().people[nameLocale(p)];
    const roles = template.roles;
    const firsts = rng.pickN(pool.first, roles.length);
    const lasts = rng.pickN(pool.last, roles.length);
    const present = new Set(p.roles);
    const people = {};

    roles.forEach((roleId, i) => {
      const role = BK.data.roles.get(roleId);
      const real = p.useRealNames && present.has(roleId) ? String(p.participantNames[roleId] || "").trim() : "";
      const firstName = real ? real.split(/\s+/)[0] : firsts[i];
      const lastName = real ? real.split(/\s+/).slice(1).join(" ") : lasts[i];
      const name = real || firstName + " " + lastName;
      const local = N().slugify(firstName) + (lastName ? "." + N().slugify(lastName) : "");
      people[roleId] = {
        role: roleId,
        name,
        firstName,
        lastName,
        initials: N().initials(name),
        title: role ? role.title : { en: roleId, sv: roleId },
        roleLabel: role ? role.label : { en: roleId, sv: roleId },
        email: local + "@" + org.domain,
        present: present.has(roleId),
        realName: !!real
      };
    });
    return people;
  }

  function buildActor(rng, template) {
    const spec = template.actor || {};
    const type = rng.pick(spec.types && spec.types.length ? spec.types : ["unknown"]);
    const named = N().actorName(rng, type);
    const letters = named.slug.replace(/[^a-z]/g, "");
    return {
      name: named.name,
      slug: named.slug,
      type: { en: BK.t("actorType." + type, null, "en"), sv: BK.t("actorType." + type, null, "sv") },
      typeId: type,
      motivation: spec.motivation || { en: "", sv: "" },
      capability: spec.capability || "medium",
      leakSite: "leaks-" + named.slug + ".example",
      contact: "negotiation@" + named.slug + "-support.example",
      extension: "." + letters.slice(0, 6)
    };
  }

  function buildSuppliers(rng) {
    const kinds = Object.keys(N().supplierPatterns);
    const cores = rng.pickN(N().supplierCores, kinds.length);
    const out = {};
    kinds.forEach((kind, i) => {
      const name = rng.pick(N().supplierPatterns[kind]).replace("{core}", cores[i]);
      out[kind] = { kind, name, domain: N().domain(name) };
    });
    return out;
  }

  function pad(n, w) {
    return String(n).padStart(w, "0");
  }

  function buildAssets(rng, org, actor) {
    const n = (max) => pad(rng.int(1, max), 2);
    const stem = org.domain.replace(/\.example$/, "");
    return {
      fileServer: "SRV-FILE-" + n(6),
      fileServer2: "SRV-FILE-" + pad(rng.int(7, 9), 2),
      domainController: "SRV-DC-" + n(4),
      backupServer: "SRV-BKP-" + n(3),
      vpnGateway: "VPN-GW-" + n(2),
      webServer: "SRV-WEB-" + n(5),
      dbServer: "SRV-SQL-" + n(5),
      erpServer: "SRV-ERP-" + n(3),
      jumpHost: "SRV-JUMP-" + n(2),
      buildServer: "SRV-BUILD-" + n(3),
      hypervisor: "ESX-" + n(9),
      workstationFin: "WKS-FIN-" + rng.int(101, 189),
      workstationIt: "WKS-IT-" + pad(rng.int(10, 60), 3),
      workstationHr: "WKS-HR-" + pad(rng.int(10, 60), 3),
      engWorkstation: "EWS-OT-" + n(4),
      plc: "PLC-LINE-" + n(8),
      hmi: "HMI-" + n(12),
      backupAdmin: "svc-backup-adm",
      serviceAccount: "svc-sync-" + n(9),
      adminAccount: "adm-" + rng.pick(["it", "ops", "infra", "sys"]) + n(9),
      attackerIp: N().ip(rng, 2),
      attackerIp2: N().ip(rng, 1),
      orgPublicIp: N().ip(rng, 0),
      c2Domain: "cdn-" + rng.pick(["update", "sync", "telemetry", "assets"]) + "-" + rng.int(10, 99) + ".example",
      phishDomain: stem + "-" + rng.pick(["support", "login", "secure", "portal"]) + ".example",
      lookalikeDomain: stem.replace(/([aeiou])/, "$1$1") + ".example",
      vulnId: "VSA-" + rng.int(2024, 2026) + "-" + pad(rng.int(1, 999), 4),
      ticketId: "INC-" + pad(rng.int(10000, 99999), 5),
      ransomExt: actor.extension
    };
  }

  // ---- 3. Variables ---------------------------------------------------------------------------

  // Position within a variable's range for each organisation size (overlapping bands
  // keep the sizes plausible without making them predictable).
  const SIZE_BAND = { small: [0, 0.4], medium: [0.3, 0.7], large: [0.6, 1] };
  const SEK_PER_EUR = 11;

  function roundTo(v, step) {
    return Math.round(v / step) * step;
  }

  /** Round to `sig` significant figures (used after currency conversion). */
  function niceRound(v, sig) {
    if (v === 0) return 0;
    const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(v))) - (sig - 1));
    return Math.round(v / mag) * mag;
  }

  /**
   * Roll one variable. Wide ranges (max/min ≥ 4) interpolate on a log scale so a
   * "small" organisation gets a proportionally small number rather than a
   * linear slice dominated by the large end.
   */
  function rollVariable(rng, spec, size, currency) {
    const band = spec.scaleBy === "size" ? SIZE_BAND[size] || SIZE_BAND.medium : [0, 1];
    const u = rng.float(band[0], band[1]);
    const logScale = spec.min > 0 && spec.max / spec.min >= 4;
    let v = logScale
      ? Math.exp(Math.log(spec.min) + u * (Math.log(spec.max) - Math.log(spec.min)))
      : spec.min + u * (spec.max - spec.min);
    v = roundTo(v, spec.step || 1);
    v = Math.max(spec.min, Math.min(spec.max, v));
    if (spec.currency && currency === "EUR") v = niceRound(v / SEK_PER_EUR, 2);
    return v;
  }

  function buildVariables(rng, template, p, currency, entities) {
    const vars = {};
    const specs = template.variables || {};
    Object.keys(specs).forEach((name) => {
      const spec = specs[name];
      if (typeof spec.derive === "function") return; // second pass
      vars[name] = rollVariable(rng.fork(name), spec, p.orgSize, currency);
    });
    Object.keys(specs).forEach((name) => {
      const spec = specs[name];
      if (typeof spec.derive === "function") vars[name] = spec.derive(vars, { org: entities.org, rng: rng.fork(name), currency });
    });
    // Always-available organisation numbers.
    vars.headcount = entities.org.headcount;
    vars.sites = entities.org.sites;
    return vars;
  }

  // ---- 4. Clock -----------------------------------------------------------------------------

  // Holiday eves (Swedish calendar, 2026): Maundy Thursday, Midsummer Eve, Christmas Eve, New Year's Eve.
  const HOLIDAY_EVES = [[2026, 4, 2], [2026, 6, 19], [2026, 12, 24], [2026, 12, 31]];

  /**
   * In-scenario start time honouring the template's start window. The year is
   * fixed internally so generation is reproducible; scenario text never shows it.
   */
  function buildClock(rng, window, startTime) {
    const minuteIn = (h0, m0, h1, m1) => {
      const from = h0 * 60 + m0;
      const to = h1 * 60 + m1;
      const t = from + rng.int(0, Math.floor((to - from) / 5)) * 5;
      return [Math.floor(t / 60), t % 60];
    };
    // weekday: 0 = Monday … 6 = Sunday, in a random week of 2026.
    const dayIn = (weekday) => {
      const week = rng.int(2, 48);
      const d = new Date(2026, 0, 5 + week * 7 + weekday); // 5 Jan 2026 is a Monday
      return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
    };

    let date;
    let time;
    switch (window) {
      case "friday-evening": date = dayIn(4); time = minuteIn(16, 0, 18, 30); break;
      case "weekend": date = dayIn(rng.pick([5, 6])); time = minuteIn(7, 0, 22, 0); break;
      case "night": date = dayIn(rng.int(0, 4)); time = minuteIn(1, 0, 4, 30); break;
      case "business-hours": date = dayIn(rng.int(0, 3)); time = minuteIn(8, 30, 15, 30); break;
      case "monday-morning": date = dayIn(0); time = minuteIn(6, 30, 9, 0); break;
      case "holiday-eve": date = rng.pick(HOLIDAY_EVES); time = minuteIn(13, 0, 17, 0); break;
      default: date = dayIn(rng.int(0, 6)); time = minuteIn(7, 0, 20, 0);
    }
    // A template may pin the exact start time (e.g. a title that names "03:00").
    const pinned = /^(\d{2}):(\d{2})$/.exec(startTime || "");
    if (pinned) time = [Number(pinned[1]), Number(pinned[2])];
    return { y: date[0], m: date[1], d: date[2], h: time[0], mi: time[1], window: window || "any" };
  }

  // ---- 5. Stage selection -------------------------------------------------------------------

  /** Mandatory stages always; optional stages by ascending priority; authored order kept. */
  function selectStages(template, count) {
    const mandatory = template.stages.filter((s) => s.mandatory);
    const optional = template.stages
      .map((s, i) => ({ s, i }))
      .filter((x) => !x.s.mandatory)
      .sort((a, b) => (a.s.priority || 99) - (b.s.priority || 99) || a.i - b.i)
      .slice(0, Math.max(0, count - mandatory.length))
      .map((x) => x.s.id);
    const keep = new Set(mandatory.map((s) => s.id).concat(optional));
    return template.stages.filter((s) => keep.has(s.id));
  }

  /** A hidden fact whose reveal stage was dropped is revealed at the next included stage (or the debrief). */
  function remapReveals(template, selected) {
    const order = template.stages.map((s) => s.id);
    const included = new Set(selected.map((s) => s.id));
    const map = {};
    (template.hiddenFacts || []).forEach((hf) => {
      const from = order.indexOf(hf.revealStage);
      const next = order.slice(Math.max(0, from)).find((id) => included.has(id));
      map[hf.id] = next || "debrief";
    });
    return map;
  }

  // ---- 6. Stage content ----------------------------------------------------------------------

  function bothLangs(fn) {
    return { en: fn("en"), sv: fn("sv") };
  }

  /** "Name, title". Swedish titles are lower-case after a name ("vd", "IT-chef" keeps its acronym). */
  function personLabel(person) {
    return bothLangs((l) => {
      const title = BK.loc(person.title, l);
      const shown = l === "sv" && !/^[A-ZÅÄÖ]{2}/.test(title) ? title.charAt(0).toLowerCase() + title.slice(1) : title;
      return person.name + ", " + shown;
    });
  }

  /**
   * Who an inject comes from. "person.<role>" resolves to that person (re-targeted to
   * `fallbackRole` when the role is not at the table); other keys use the source catalogue.
   */
  function resolveSource(inject, people) {
    const out = { sourceLabel: null, sourceRole: null, roleNotPresent: false };
    const src = inject.source || "";
    if (src.startsWith("person.")) {
      let roleId = src.slice(7);
      let person = people[roleId];
      if (person && !person.present && inject.fallbackRole && people[inject.fallbackRole] && people[inject.fallbackRole].present) {
        roleId = inject.fallbackRole;
        person = people[roleId];
        out.retargeted = true;
      }
      if (person) {
        out.sourceRole = roleId;
        out.sourceLabel = personLabel(person);
        out.roleNotPresent = !person.present;
      }
    } else if (src) {
      out.sourceLabel = bothLangs((l) => BK.t("source." + src, null, l));
    }
    return out;
  }

  /** Inject candidates for a stage after difficulty, branch, pressure and density rules. */
  function candidateInjects(stage, p, rng) {
    const pool = [];
    (stage.injects || []).forEach((inj) => {
      if (inj.branchOnly) return;
      if (inj.difficulties && !inj.difficulties.includes(p.difficulty)) return;
      if (inj.pressure && p.pressures[inj.pressure] === false) {
        if (inj.substitute) pool.push(Object.assign({}, inj, inj.substitute, { pressure: null, substituted: true }));
        return;
      }
      pool.push(inj);
    });

    const optional = pool.filter((i) => i.optional);
    let keepOptional;
    if (p.injectDensity === "low") keepOptional = new Set();
    else if (p.injectDensity === "high") keepOptional = new Set(optional.map((i) => i.id));
    else keepOptional = new Set(rng.fork("density:" + stage.id).pickN(optional, Math.ceil(optional.length / 2)).map((i) => i.id));

    return pool.filter((i) => !i.optional || keepOptional.has(i.id));
  }

  /** Pick one variant (if authored) and merge it over the base inject. */
  function applyVariant(inj, rng) {
    if (!inj.variants || !inj.variants.length) return inj;
    const v = rng.fork("variant:" + inj.id).weighted(inj.variants, (x) => x.weight || 1);
    const merged = Object.assign({}, inj, v, { id: inj.id, variant: v.id });
    delete merged.variants;
    return merged;
  }

  function buildInject(inj, ctx, people, stageId, missing) {
    const R = T();
    const src = resolveSource(inj, people);
    const at = inj.at || 0;
    return {
      id: inj.id,
      stageId,
      at,
      atLabel: bothLangs((l) => BK.i18n.fmt.time(R.clockDate(ctx.clock, at), l)),
      type: inj.type,
      severity: inj.severity || "info",
      reliability: inj.reliability || "confirmed",
      visibility: inj.visibility || "public",
      statedReliability: R.resolveDeep(inj.statedReliability || null, ctx, missing),
      source: inj.source || null,
      sourceLabel: inj.from ? R.resolveText(inj.from, ctx, missing) : src.sourceLabel,
      sourceRole: src.sourceRole,
      roleNotPresent: src.roleNotPresent,
      retargeted: !!src.retargeted,
      headline: R.resolveDeep(inj.headline || null, ctx, missing),
      content: R.resolveDeep(inj.content || null, ctx, missing),
      meta: R.resolveDeep(inj.meta || null, ctx, missing),
      tests: (inj.tests || []).slice(),
      expectedResponse: R.resolveDeep(inj.expectedResponse || null, ctx, missing),
      facilitatorNote: R.resolveDeep(inj.facilitatorNote || null, ctx, missing),
      requires: (inj.requires || []).slice(),
      reveals: (inj.reveals || []).slice(),
      pressure: inj.pressure || null,
      substituted: !!inj.substituted,
      optional: !!inj.optional,
      variant: inj.variant || null,
      enabled: true
    };
  }

  /** Pick questions for the audience; guarantee a "revisit an earlier decision" question after stage 1. */
  function pickQuestions(stage, p, people, ctx, stageIndex, missing) {
    const q = stage.questions || {};
    const tech = (q.technical || []).map((x, i) => Object.assign({ audience: "technical", key: "t" + (i + 1) }, x));
    const exec = (q.executive || []).map((x, i) => Object.assign({ audience: "executive", key: "e" + (i + 1) }, x));

    let chosen;
    if (p.audience === "technical") chosen = tech.slice(0, 4);
    else if (p.audience === "executive") chosen = exec.slice(0, 4);
    else chosen = tech.slice(0, 2).concat(exec.slice(0, 2));

    if (stageIndex > 0 && !chosen.some((x) => x.revisits)) {
      const pool = p.audience === "technical" ? tech : p.audience === "executive" ? exec : tech.concat(exec);
      const revisit = pool.find((x) => x.revisits);
      if (revisit) chosen[chosen.length - 1] = revisit;
    }

    return chosen.map((x) => {
      const roles = x.roles || [];
      const presentRoles = roles.filter((r) => people[r] && people[r].present);
      return {
        id: stage.id + "-" + (x.id || x.key),
        audience: x.audience,
        text: T().resolveText(x.text, ctx, missing),
        roles,
        targets: presentRoles.map((r) => people[r].name),
        roleNotPresent: roles.length > 0 && presentRoles.length === 0,
        revisits: x.revisits || false
      };
    });
  }

  function buildDecision(decision, p, people, ctx, missing) {
    if (!decision) return null;
    const R = T();
    const authority = people[decision.authority];
    return {
      id: decision.id,
      question: R.resolveText(decision.question, ctx, missing),
      authority: decision.authority || null,
      authorityName: authority ? authority.name : null,
      authorityNotPresent: !!authority && !authority.present,
      options: p.decisionMode === "open" ? [] : R.resolveDeep(decision.options || [], ctx, missing),
      knowns: R.resolveDeep(decision.knowns || [], ctx, missing),
      uncertainties: R.resolveDeep(decision.uncertainties || [], ctx, missing),
      tradeoffs: R.resolveDeep(decision.tradeoffs || {}, ctx, missing),
      evaluation: R.resolveDeep(decision.evaluation || [], ctx, missing),
      discussionMinutes: decision.discussionMinutes || null
    };
  }

  function buildCharts(stage, ctx, entities, vars, rng, injects, missing) {
    const R = T();
    return (stage.charts || []).map((chart) => {
      const chartCtx = {
        vars,
        org: entities.org,
        clock: ctx.clock,
        stage: { id: stage.id, clock: stage.clock || 0 },
        sizeFactor: BK.data.sectors.sizes[entities.org.size].factor,
        currency: ctx.currency,
        rng: rng.fork("chart:" + chart.id)
      };
      const data = typeof chart.data === "function" ? chart.data(chartCtx) : chart.data || null;
      const markers =
        chart.markers === "injects"
          ? injects.filter((i) => i.visibility === "public").map((i) => ({ injectId: i.id, at: i.at, label: i.headline || i.content, severity: i.severity }))
          : [];
      return {
        id: chart.id,
        type: chart.type,
        title: R.resolveDeep(chart.title || null, ctx, missing),
        caption: R.resolveDeep(chart.caption || null, ctx, missing),
        unit: R.resolveDeep(chart.unit || null, ctx, missing),
        metric: chart.metric || null,
        data: R.resolveDeep(data, ctx, missing),
        markers
      };
    });
  }

  const HINT_POLICY = { introductory: "offer", intermediate: "onRequest", advanced: "withhold", executive: "onRequest" };

  // ---- 7. Whole instance ----------------------------------------------------------------------

  function generate(template, rawParams) {
    const p = normalizeParams(template, rawParams);
    const R = T();
    const root = BK.rng.create(p.seed + "/" + template.id + "@" + template.version);
    const currency = currencyFor(p);

    const org = buildOrg(root.fork("org"), template, p);
    const people = buildPeople(root.fork("people"), template, p, org);
    const actor = buildActor(root.fork("actor"), template);
    const suppliers = buildSuppliers(root.fork("suppliers"));
    const assets = buildAssets(root.fork("assets"), org, actor);
    const clock = buildClock(root.fork("clock"), template.constraints && template.constraints.startWindow, template.constraints && template.constraints.startTime);
    const entities = { org, people, actor, suppliers, assets, clock };
    const vars = buildVariables(root.fork("numbers"), template, p, currency, entities);

    const ctx = { entities, vars, clock, currency, environment: p.environment, jurisdiction: p.jurisdiction };
    const missing = new Set();

    const selected = selectStages(template, p.stageCount);
    const revealAt = remapReveals(template, selected);
    const available = new Set(); // inject ids included so far (for `requires`)

    const stages = selected.map((stage, index) => {
      const injects = [];
      candidateInjects(stage, p, root).forEach((raw) => {
        const inj = applyVariant(raw, root);
        if ((inj.requires || []).some((r) => !available.has(r))) return; // dependency was dropped
        available.add(inj.id);
        injects.push(buildInject(inj, ctx, people, stage.id, missing));
      });

      const branchInjects = (stage.injects || [])
        .filter((i) => i.branchOnly)
        .map((raw) => buildInject(applyVariant(raw, root), ctx, people, stage.id, missing));

      return {
        id: stage.id,
        index,
        clock: stage.clock || 0,
        clockLabel: bothLangs((l) => BK.i18n.fmt.weekdayDate(R.clockDate(clock, stage.clock || 0), l) + " " + BK.i18n.fmt.time(R.clockDate(clock, stage.clock || 0), l)),
        title: R.resolveText(stage.title, ctx, missing),
        narrative: R.resolveText(stage.narrative, ctx, missing),
        twist: index > 0 && stage.twist ? R.resolveText(stage.twist, ctx, missing) : null,
        twistKind: index > 0 ? stage.twistKind || null : null,
        assumptionChallenged: index > 0 && stage.assumptionChallenged ? R.resolveText(stage.assumptionChallenged, ctx, missing) : null,
        reveals: (template.hiddenFacts || []).filter((hf) => revealAt[hf.id] === stage.id).map((hf) => hf.id),
        injects,
        branchInjects,
        branches: (stage.branches || []).map((b) => ({
          when: Object.assign({}, b.when),
          addInjects: (b.addInjects || []).slice(),
          narrativeAppend: R.resolveDeep(b.narrativeAppend || null, ctx, missing),
          facilitatorNote: R.resolveDeep(b.facilitatorNote || null, ctx, missing)
        })),
        charts: buildCharts(stage, ctx, entities, vars, root, injects, missing),
        questions: pickQuestions(stage, p, people, ctx, index, missing),
        challenges: R.resolveDeep(stage.challenges || [], ctx, missing),
        decision: buildDecision(stage.decision, p, people, ctx, missing),
        noDecision: R.resolveDeep(stage.noDecision || null, ctx, missing),
        facilitator: Object.assign(R.resolveDeep(stage.facilitator || {}, ctx, missing), { hintPolicy: HINT_POLICY[p.difficulty] }),
        complexity: stage.complexity || 0,
        mandatory: !!stage.mandatory
      };
    });

    const deselected = new Set(p.objectives.deselected || []);
    const objectives = (template.learningObjectives || [])
      .filter((lo) => !deselected.has(lo.id))
      .map((lo) => ({ id: lo.id, text: R.resolveText(lo.text, ctx, missing), custom: false }))
      .concat(
        (p.objectives.custom || [])
          .filter((t) => String(t).trim())
          .map((t, i) => ({ id: "custom-" + (i + 1), text: { en: String(t), sv: String(t) }, custom: true }))
      );

    const fw = BK.data.frameworks;
    const frameworks = {
      mitre: (template.mitre || []).map((id) => ({ id, name: fw.mitre[id] || null })),
      nistCsf: ((template.frameworks && template.frameworks.nistCsf) || []).map((id) => ({ id, name: fw.nistCsf[id] || null })),
      iso27001: ((template.frameworks && template.frameworks.iso27001) || []).map((id) => ({ id, name: fw.iso27001[id] || null }))
    };

    const gt = template.groundTruth || {};
    const instance = {
      schema: BK.config.schemaId,
      schemaVersion: BK.config.schemaVersion,
      templateId: template.id,
      templateVersion: template.version,
      seed: p.seed,
      params: p,
      title: p.title && p.title.trim() ? { en: p.title.trim(), sv: p.title.trim() } : R.resolveText(template.title, ctx, missing),
      scenarioTitle: R.resolveText(template.title, ctx, missing),
      summary: R.resolveText(template.summary, ctx, missing),
      category: template.category,
      archetype: template.archetype,
      emblem: template.emblem,
      currency,
      entities,
      vars,
      objectives,
      frameworks,
      groundTruth: {
        rootCause: R.resolveText(gt.rootCause, ctx, missing),
        attackerTimeline: (gt.attackerTimeline || []).map((e) => ({
          at: e.at,
          atLabel: bothLangs((l) => BK.i18n.fmt.weekdayDate(R.clockDate(clock, e.at), l) + " " + BK.i18n.fmt.time(R.clockDate(clock, e.at), l)),
          text: R.resolveText(e.text, ctx, missing)
        }))
      },
      hiddenFacts: (template.hiddenFacts || []).map((hf) => ({
        id: hf.id,
        revealStage: revealAt[hf.id],
        authoredRevealStage: hf.revealStage,
        text: R.resolveText(hf.text, ctx, missing)
      })),
      stages,
      resolution: template.resolution ? { type: template.resolution.type, text: R.resolveText(template.resolution.text, ctx, missing) } : null,
      debrief: R.resolveDeep(template.debrief || {}, ctx, missing),
      settings: {
        audience: p.audience,
        difficulty: p.difficulty,
        injectRelease: p.injectRelease,
        decisionMode: p.decisionMode,
        stageTheme: p.stageTheme,
        lang: p.lang
      },
      unresolved: []
    };

    instance.pacing = BK.engine.pacing.plan(instance, p.durationMinutes, p.discussionMinutes);
    instance.stages.forEach((s, i) => (s.discussionMinutes = instance.pacing.stages[i].discussion));
    instance.slides = BK.engine.slides.compile(instance);
    instance.unresolved = Array.from(missing).sort();
    return instance;
  }

  // ---- Wizard hook: params → stored exercise → preview ------------------------------------------

  /** Resolve "Surprise me" deterministically from the seed. */
  function pickTemplate(params) {
    if (params.scenarioId && params.scenarioId !== "random") return BK.scenarios.get(params.scenarioId);
    let pool = BK.scenarios.list();
    if (params.randomCategory) {
      const inCat = pool.filter((t) => t.category === params.randomCategory);
      if (inCat.length) pool = inCat;
    }
    return BK.rng.create(BK.rng.normalizeSeed(params.seed) + "/scenario").pick(pool);
  }

  /** Wrap an instance into a stored exercise record (adds id + timestamps). */
  function toExercise(instance) {
    const now = new Date().toISOString();
    return Object.assign({ id: BK.dom.uid("ex"), createdAt: now, updatedAt: now, edited: false }, instance);
  }

  function generateFromParams(params) {
    const template = pickTemplate(params);
    if (!template) return null;
    const p = Object.assign({}, params, { scenarioId: template.id });
    if (params.scenarioId === "random") p.stageCount = null; // bounds belong to the drawn template
    const exercise = toExercise(generate(template, p));
    BK.store.putItem("exercise", exercise);
    BK.router.navigate("#/edit/" + encodeURIComponent(exercise.id));
    return exercise;
  }

  BK.engine.generator = {
    generate,
    generateFromParams,
    toExercise,
    normalizeParams,
    suggestStages,
    pickTemplate,
    // exposed for tests
    _internal: { rollVariable, buildClock, selectStages, remapReveals, niceRound, currencyFor, nameLocale }
  };
})();
