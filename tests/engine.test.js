/*
 * engine.test.js — Phase 2 engine tests: resolver, generator determinism and
 * variation, entity consistency, timeline and reveal rules, control effects,
 * pacing, slide compilation and template validation (spec 16).
 */
(function () {
  "use strict";

  const { suite, test, assert, deepEqual } = window.BKTest;
  const BK = window.BK;
  const gen = () => BK.engine.generator;
  const tpl = () => BK.scenarios.get("s01-ransomware-vpn");

  function make(params) {
    return gen().generate(tpl(), Object.assign({ seed: "FJORD-4821" }, params || {}));
  }

  /** All public, participant-facing text of the stages before index `upTo` (exclusive), in both languages. */
  function publicTextBefore(inst, upTo) {
    const parts = [];
    inst.stages.slice(0, upTo).forEach((s) => {
      parts.push(s.title.en, s.title.sv, s.narrative.en, s.narrative.sv);
      s.injects.filter((i) => i.visibility === "public").forEach((i) => {
        if (i.headline) parts.push(i.headline.en, i.headline.sv);
        parts.push(i.content.en, i.content.sv);
      });
    });
    return parts.join("\n");
  }

  suite("template resolver", () => {
    const ctx = () => {
      const inst = make();
      return { entities: inst.entities, vars: inst.vars, clock: inst.entities.clock, currency: "SEK", environment: "m365", jurisdiction: "se" };
    };

    test("resolves into both languages with identical facts", () => {
      const c = ctx();
      const r = BK.engine.template.resolveText({ en: "{{org.name}} has {{num.hosts}} hosts", sv: "{{org.name}} har {{num.hosts}} datorer" }, c);
      assert.ok(r.en.includes(c.entities.org.name) && r.sv.includes(c.entities.org.name));
    });

    test("environment vocabulary and cap formatter", () => {
      const r = BK.engine.template.resolveText({ en: "{{env.edrAlert|cap}}", sv: "{{env.edrAlert|cap}}" }, ctx());
      assert.equal(r.en, "Defender for Endpoint alert");
      assert.equal(r.sv, "Larm från Defender for Endpoint");
    });

    test("lcfirst keeps acronyms", () => {
      const c = ctx();
      assert.equal(BK.engine.template.resolveString("{{reg.csirt|lcfirst}}", "en", c, new Set()), "CERT-SE");
    });

    test("jurisdiction references", () => {
      assert.equal(BK.engine.template.resolveString("{{reg.dpaShort}}", "sv", ctx(), new Set()), "IMY");
    });

    test("unknown placeholders are reported, never silently dropped", () => {
      const missing = new Set();
      const out = BK.engine.template.resolveString("x {{nope.nothing}} y", "en", ctx(), missing);
      assert.ok(out.includes("⟦nope.nothing⟧"));
      assert.ok(missing.has("nope.nothing"));
    });

    test("time placeholders use a 24-hour clock relative to T+0", () => {
      const c = ctx();
      const at0 = BK.engine.template.resolveString("{{time.T+0|clock}}", "en", c, new Set());
      const at60 = BK.engine.template.resolveString("{{time.T+60|clock}}", "en", c, new Set());
      const h = (s) => Number(s.split(":")[0]);
      assert.ok(/^\d\d:\d\d$/.test(at0));
      assert.equal((h(at60) - h(at0) + 24) % 24, 1);
    });
  });

  suite("scenario s01 validation", () => {
    test("registers without validation problems", () => {
      const problems = BK.scenarios.problems("s01-ransomware-vpn");
      assert.deepEqual(problems.map((p) => BK.engine.validator.format(p, "en")), []);
    });

    test("every stage count min..max produces a valid instance", () => {
      for (let n = tpl().minStages; n <= tpl().maxStages; n++) {
        const issues = BK.engine.validator.validateInstance(make({ stageCount: n }));
        assert.deepEqual(issues.map((x) => BK.engine.validator.format(x, "en")), [], "stageCount " + n);
      }
    });

    test("parameter grid produces valid instances (audience × density × difficulty × jurisdiction × environment)", () => {
      const o = BK.data.options;
      let count = 0;
      o.audiences.forEach((audience) =>
        o.densities.forEach((injectDensity) =>
          o.difficulties.forEach((difficulty, di) => {
            const inst = make({
              audience, injectDensity, difficulty,
              jurisdiction: o.jurisdictions[di % 3],
              environment: BK.data.environments.ids[(count++) % 7],
              seed: "GRID-" + count,
              pressures: { media: di % 2 === 0, regulator: di % 2 === 1, lawEnforcement: false, suppliers: true, customers: di > 1 }
            });
            const issues = BK.engine.validator.validateInstance(inst);
            assert.deepEqual(issues.map((x) => BK.engine.validator.format(x, "en")), [], [audience, injectDensity, difficulty].join("/"));
          })
        )
      );
    });

    test("validator catches a broken template", () => {
      const broken = JSON.parse(JSON.stringify(tpl(), (k, v) => (typeof v === "function" ? undefined : v)));
      broken.id = "broken";
      broken.stages[1].twist = null;
      broken.stages[0].questions.technical = broken.stages[0].questions.technical.slice(0, 1);
      broken.stages[0].narrative = { en: "Only English" };
      broken.stages[2].injects[0].requires = ["i8-1"];
      const codes = BK.engine.validator.validateTemplate(broken).map((x) => x.code);
      ["twist", "questions", "language", "dependency"].forEach((c) => assert.ok(codes.includes(c), "expected " + c + " in " + codes.join(",")));
    });
  });

  suite("generator determinism and variation", () => {
    test("same seed + params ⇒ deep-equal instance", () => {
      const a = make({ stageCount: 6 });
      const b = make({ stageCount: 6 });
      assert.ok(deepEqual(a, b), "instances differ");
      assert.equal(JSON.stringify(a), JSON.stringify(b));
    });

    test("different seeds change entities, numbers and at least one variant", () => {
      const base = make({ seed: "FJORD-4821" });
      let orgChanged = false;
      let numbersChanged = false;
      let variantChanged = false;
      ["BIRCH-1111", "LYNX-2222", "TIDE-3333", "RAVEN-4444", "PINE-5555"].forEach((seed) => {
        const other = make({ seed });
        if (other.entities.org.name !== base.entities.org.name || other.entities.people.ciso.name !== base.entities.people.ciso.name) orgChanged = true;
        if (other.vars.ransom !== base.vars.ransom || other.vars.gbExfil !== base.vars.gbExfil) numbersChanged = true;
        if (other.stages[0].injects[0].variant !== base.stages[0].injects[0].variant) variantChanged = true;
      });
      assert.ok(orgChanged, "entities never changed");
      assert.ok(numbersChanged, "numbers never changed");
      assert.ok(variantChanged, "variant never changed");
    });

    test("named sub-streams: changing stage count does not reshuffle people", () => {
      const a = make({ stageCount: 4 });
      const b = make({ stageCount: 8 });
      assert.deepEqual(a.entities.people, b.entities.people);
      assert.equal(a.entities.org.name, b.entities.org.name);
    });

    test("no unresolved placeholders anywhere in the instance", () => {
      const json = JSON.stringify(make({ stageCount: 8, injectDensity: "high" }));
      assert.ok(!json.includes("⟦"), "unresolved marker found");
      assert.ok(!json.includes("{{"), "raw placeholder found");
    });

    test("instances are plain JSON (no functions survive)", () => {
      const inst = make();
      assert.ok(deepEqual(JSON.parse(JSON.stringify(inst)), inst));
    });
  });

  suite("entity consistency", () => {
    test("each role maps to exactly one distinct person", () => {
      const inst = make();
      const people = Object.values(inst.entities.people);
      assert.equal(people.length, tpl().roles.length);
      assert.equal(new Set(people.map((p) => p.name)).size, people.length);
      people.forEach((p) => assert.ok(tpl().roles.includes(p.role)));
    });

    test("a person is referred to by the same name everywhere", () => {
      const inst = make({ stageCount: 8 });
      const ceo = inst.entities.people.ceo;
      const p6 = inst.stages.find((s) => s.id === "p6");
      assert.ok(p6.narrative.en.includes(ceo.firstName) && p6.narrative.sv.includes(ceo.firstName));
      const msg = p6.injects.find((i) => i.id === "i6-2");
      assert.ok(msg.sourceLabel.en.startsWith(ceo.name));
    });

    test("domains are reserved .example and IPs are RFC 5737", () => {
      const inst = make();
      const json = JSON.stringify(inst);
      (json.match(/[a-z0-9-]+\.(com|net|org|se|io)\b/g) || []).forEach((d) => assert.ok(false, "non-reserved domain " + d));
      (json.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g) || []).forEach((ip) =>
        assert.ok(/^(192\.0\.2|198\.51\.100|203\.0\.113)\./.test(ip), "non-documentation IP " + ip)
      );
      assert.ok(inst.entities.org.domain.endsWith(".example"));
    });

    test("names follow jurisdiction: Swedish legal suffix for Sweden", () => {
      let swedish = 0;
      for (let i = 0; i < 10; i++) {
        const name = make({ jurisdiction: "se", seed: "NAME-" + i }).entities.org.name;
        if (/ AB$|kommun|^Region /.test(name)) swedish++;
      }
      assert.equal(swedish, 10);
    });

    test("fixed organisation name and real participant names are used", () => {
      const inst = make({ orgName: "Testbolaget AB", useRealNames: true, participantNames: { ciso: "Kim Svensson" }, roles: ["ciso", "ceo", "itOps"] });
      assert.equal(inst.entities.org.name, "Testbolaget AB");
      assert.equal(inst.entities.people.ciso.name, "Kim Svensson");
      assert.ok(inst.entities.people.ciso.realName);
    });
  });

  suite("timeline and progressive disclosure", () => {
    test("inject timestamps are monotonic and dependencies precede dependants", () => {
      const inst = make({ stageCount: 8, injectDensity: "high" });
      let last = -Infinity;
      const seen = new Set();
      inst.stages.forEach((s) =>
        s.injects.forEach((i) => {
          assert.ok(i.at >= last, i.id + " out of order");
          last = i.at;
          i.requires.forEach((r) => assert.ok(seen.has(r), i.id + " requires " + r));
          seen.add(i.id);
        })
      );
    });

    test("hidden facts are never in public text before their reveal stage", () => {
      for (let n = tpl().minStages; n <= tpl().maxStages; n++) {
        const inst = make({ stageCount: n, injectDensity: "high" });
        inst.hiddenFacts.forEach((hf) => {
          const idx = hf.revealStage === "debrief" ? inst.stages.length : inst.stages.findIndex((s) => s.id === hf.revealStage);
          const before = publicTextBefore(inst, idx);
          assert.ok(!before.includes(hf.text.en) && !before.includes(hf.text.sv), hf.id + " leaked before stage " + (idx + 1) + " (n=" + n + ")");
        });
      }
    });

    test("dropping a reveal stage moves the reveal forward, never back", () => {
      const inst = make({ stageCount: 4 });
      const hf = inst.hiddenFacts.find((h) => h.id === "hf-persistence");
      assert.equal(hf.revealStage, "debrief");
      const inst5 = make({ stageCount: 5 });
      assert.equal(inst5.hiddenFacts.find((h) => h.id === "hf-persistence").revealStage, "p8");
    });

    test("stage selection keeps mandatory stages and authored order", () => {
      const ids = make({ stageCount: 5 }).stages.map((s) => s.id);
      assert.deepEqual(ids, ["p1", "p2", "p3", "p4", "p8"]);
    });
  });

  suite("every control changes the exercise", () => {
    test("audience selects question sets", () => {
      const tech = make({ audience: "technical" }).stages[0].questions.map((q) => q.audience);
      const exec = make({ audience: "executive" }).stages[0].questions.map((q) => q.audience);
      const mixed = make({ audience: "mixed" }).stages[0].questions.map((q) => q.audience);
      assert.ok(tech.every((a) => a === "technical"));
      assert.ok(exec.every((a) => a === "executive"));
      assert.ok(mixed.includes("technical") && mixed.includes("executive"));
    });

    test("later stages always include a question revisiting an earlier decision", () => {
      ["technical", "executive", "mixed"].forEach((audience) =>
        make({ audience, stageCount: 8 }).stages.slice(1).forEach((s) => assert.ok(s.questions.some((q) => q.revisits), s.id + " " + audience))
      );
    });

    test("difficulty gates misleading injects", () => {
      const intro = make({ difficulty: "introductory", injectDensity: "high" }).stages[0].injects.map((i) => i.id);
      const adv = make({ difficulty: "advanced", injectDensity: "high" }).stages[0].injects.map((i) => i.id);
      assert.ok(!intro.includes("i1-3"));
      assert.ok(adv.includes("i1-3"));
    });

    test("inject density selects among optional injects", () => {
      const count = (d) => make({ injectDensity: d, stageCount: 8 }).stages.reduce((n, s) => n + s.injects.length, 0);
      assert.ok(count("low") < count("normal") && count("normal") < count("high"));
    });

    test("disabling a pressure removes its injects", () => {
      const on = make({ stageCount: 8, injectDensity: "high" });
      const off = make({ stageCount: 8, injectDensity: "high", pressures: { media: false } });
      const has = (inst, id) => inst.stages.some((s) => s.injects.some((i) => i.id === id));
      assert.ok(has(on, "i4-2") && !has(off, "i4-2"));
    });

    test("absent role: inject re-targeted, question flagged", () => {
      const inst = make({ roles: ["incidentCommander", "ciso", "socLead", "itOps", "legal", "comms", "ceo"] }); // no dpo, no serviceOwner
      const i43 = inst.stages[3].injects.find((i) => i.id === "i4-3");
      assert.equal(i43.sourceRole, "legal");
      assert.ok(i43.retargeted);
      const flagged = inst.stages.some((s) => s.questions.some((q) => q.roleNotPresent));
      assert.ok(flagged || inst.stages.every((s) => s.questions.every((q) => q.targets.length > 0)));
    });

    test("decision mode 'open' strips options", () => {
      assert.equal(make({ decisionMode: "open" }).stages[0].decision.options.length, 0);
      assert.equal(make({ decisionMode: "options" }).stages[0].decision.options.length, 3);
    });

    test("environment changes vocabulary", () => {
      const head = (env) => make({ environment: env }).stages[0].injects.find((i) => i.id === "i1-2").headline.en;
      assert.ok(head("m365").startsWith("Defender for Endpoint alert"));
      assert.ok(head("generic").startsWith("EDR alert"));
    });

    test("jurisdiction sets currency and regulator", () => {
      const se = make({ jurisdiction: "se", stageCount: 8 });
      const eu = make({ jurisdiction: "eu", stageCount: 8 });
      assert.equal(se.currency, "SEK");
      assert.equal(eu.currency, "EUR");
      assert.ok(se.stages[3].decision.question.en.includes("IMY"));
      assert.ok(!eu.stages[3].decision.question.en.includes("IMY"));
    });

    test("organisation size scales numbers", () => {
      let small = 0;
      let large = 0;
      for (let i = 0; i < 12; i++) {
        small += make({ orgSize: "small", seed: "SIZE-" + i, jurisdiction: "se" }).vars.ransom;
        large += make({ orgSize: "large", seed: "SIZE-" + i, jurisdiction: "se" }).vars.ransom;
      }
      assert.ok(large > small * 2, "large " + large + " vs small " + small);
    });

    test("learning objectives: deselect and add custom", () => {
      const inst = make({ objectives: { deselected: ["lo2"], custom: ["Test the new escalation chart"] } });
      const ids = inst.objectives.map((o) => o.id);
      assert.ok(!ids.includes("lo2") && ids.includes("custom-1"));
    });

    test("exercise title override and stage theme/settings are carried", () => {
      const inst = make({ title: "Höstövning 2026", stageTheme: "light", injectRelease: "timer" });
      assert.equal(inst.title.sv, "Höstövning 2026");
      assert.equal(inst.settings.stageTheme, "light");
      assert.equal(inst.settings.injectRelease, "timer");
    });

    test("start window: Friday evening", () => {
      for (let i = 0; i < 10; i++) {
        const c = make({ seed: "CLOCK-" + i }).entities.clock;
        const d = new Date(c.y, c.m - 1, c.d, c.h, c.mi);
        assert.equal(d.getDay(), 5, "not a Friday");
        assert.ok(c.h >= 16 && (c.h < 18 || (c.h === 18 && c.mi <= 30)), "time " + c.h + ":" + c.mi);
      }
    });

    test("surprise me picks a template deterministically from the seed", () => {
      const a = gen().pickTemplate({ scenarioId: "random", seed: "SAGA-1234" });
      const b = gen().pickTemplate({ scenarioId: "random", seed: "SAGA-1234" });
      assert.ok(a && a === b);
    });
  });

  suite("pacing and slides", () => {
    test("pacing adds up to the chosen duration", () => {
      [30, 60, 90, 180].forEach((m) => {
        const p = make({ durationMinutes: m }).pacing;
        const sum = p.briefing + p.debrief + p.stages.reduce((a, s) => a + s.minutes, 0);
        assert.equal(sum, p.totalMinutes);
        assert.equal(p.totalMinutes, m, "duration " + m);
      });
    });

    test("discussion override is honoured", () => {
      make({ discussionMinutes: 5 }).pacing.stages.forEach((s) => assert.ok(s.discussion <= 5));
    });

    test("pacing status reports behind schedule", () => {
      const p = make({ durationMinutes: 60 }).pacing;
      const s0 = p.stages[0];
      assert.equal(BK.engine.pacing.status(p, 0, s0.start + 1).state, "onTime");
      assert.equal(BK.engine.pacing.status(p, 0, s0.start + s0.minutes + 8).state, "behind");
    });

    test("slides follow the stage pattern and reference real content", () => {
      const inst = make({ stageCount: 4 });
      const types = inst.slides.map((s) => s.type);
      assert.equal(types[0], "title");
      assert.equal(types[types.length - 1], "debrief");
      assert.ok(types.includes("twist") && types.includes("decision") && types.includes("recap"));
      const firstStage = inst.slides.filter((s) => s.stageId === "p1").map((s) => s.type);
      assert.ok(!firstStage.includes("twist"), "no twist slide in stage 1");
    });

    test("executive audience gets fewer slides than technical", () => {
      const tech = make({ audience: "technical", injectDensity: "high", stageCount: 8 }).slides.length;
      const exec = make({ audience: "executive", injectDensity: "high", stageCount: 8 }).slides.length;
      assert.ok(exec < tech, exec + " vs " + tech);
    });

    test("non-public injects never get a stage slide", () => {
      const inst = make({ stageCount: 8, injectDensity: "high" });
      inst.slides.filter((s) => s.injectId).forEach((s) => {
        const stage = inst.stages.find((x) => x.id === s.stageId);
        const inj = stage.injects.concat(stage.branchInjects).find((i) => i.id === s.injectId);
        assert.equal(inj.visibility, "public");
      });
    });

    test("branch inject slides are conditional", () => {
      const slide = make({ stageCount: 4 }).slides.find((s) => s.injectId === "i2-spread");
      assert.ok(slide && slide.condition && slide.condition.decision === "d1");
    });
  });
})();
