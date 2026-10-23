/*
 * scenarios.test.js — Every registered scenario: validation, determinism,
 * hidden-fact progressive disclosure at every stage count, and the stage
 * confidentiality sweep (projection JSON, rendered text and attributes, both
 * languages, one playthrough per branch option). Runs over the whole library, so new scenarios are
 * covered automatically.
 */
(function () {
  "use strict";

  const { suite, test, assert, deepEqual } = window.BKTest;
  const BK = window.BK;
  const S = () => BK.engine.session;

  function generate(tpl, params) {
    return BK.engine.generator.generate(tpl, Object.assign({ seed: "SAGA-2026" }, params || {}));
  }

  /** Public, participant-facing text of the stages before index `upTo`, both languages. */
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

  /** Every facilitator-only string longer than 12 characters, both languages. */
  function facilitatorStrings(inst) {
    const out = [];
    const add = (v) => v && ["en", "sv"].forEach((l) => v[l] && v[l].length > 12 && out.push(v[l]));
    inst.stages.forEach((st) => {
      add(st.facilitator.notes);
      add(st.facilitator.expected);
      (st.facilitator.hints || []).forEach(add);
      st.injects.concat(st.branchInjects).forEach((i) => {
        add(i.facilitatorNote);
        add(i.expectedResponse);
      });
      if (st.decision) {
        (st.decision.evaluation || []).forEach(add);
        Object.values(st.decision.tradeoffs || {}).forEach(add);
        // knowns are deliberately absent: they restate facts the room already has.
        (st.decision.uncertainties || []).forEach(add);
      }
    });
    inst.hiddenFacts.forEach((h) => add(h.text));
    return out;
  }

  /**
   * Decision choices for successive playthroughs so that every branch fires at
   * least once: pass k picks the k-th option any branch listens for.
   */
  function branchChoices(inst) {
    const byDecision = {};
    inst.stages.forEach((st) =>
      st.branches.forEach((b) => {
        const list = (byDecision[b.when.decision] = byDecision[b.when.decision] || []);
        const opt = b.when.option || "";
        if (!list.includes(opt)) list.push(opt);
      })
    );
    const passes = Math.max(1, ...Object.values(byDecision).map((l) => l.length));
    return Array.from({ length: passes }, (_, k) =>
      Object.keys(byDecision).reduce((c, id) => ((c[id] = byDecision[id][Math.min(k, byDecision[id].length - 1)]), c), {})
    );
  }

  /** Everything a stage viewer could perceive: rendered text plus every attribute value (aria-label, title, alt…). */
  function stageSurface(p) {
    const node = BK.ui.stageRenderer.renderCanvas(p, {});
    const attrs = [];
    [node].concat(Array.from(node.querySelectorAll("*"))).forEach((n) => Array.from(n.attributes).forEach((a) => attrs.push(a.value)));
    return node.textContent + "\n" + attrs.join("\n");
  }

  // Stage-based checks apply to discussion exercises; branching ones have their own suite.
  const discussion = () => BK.scenarios.list().filter((t) => t.format !== "branching");

  suite("scenario library", () => {
    test("every template passes validation", () => {
      BK.scenarios.list().forEach((t) => {
        const problems = BK.scenarios.problems(t.id).map((p) => BK.engine.validator.format(p, "en"));
        assert.deepEqual(problems, [], t.id);
      });
    });

    test("the briefing slide shows objective teasers, never the objectives themselves, every scenario, both languages", () => {
      BK.scenarios.list().forEach((t) => {
        const inst = Object.assign({ id: "ex-" + t.id }, generate(t));
        let sess = S().create(inst, 0);
        sess = S().apply(sess, { type: "gotoSlide", slideId: "briefing" }, 0);
        ["en", "sv"].forEach((lang) => {
          const p = S().project(Object.assign({}, sess, { lang }), 0);
          assert.equal(p.slide.type, "briefing", t.id);
          assert.deepEqual(p.slide.objectives, inst.objectives.map((o) => o.teaser[lang]), t.id + " " + lang);
          const json = JSON.stringify(p);
          inst.objectives.forEach((o) => assert.ok(!json.includes(o.text[lang]), t.id + " " + o.id + " objective text on stage (" + lang + ")"));
        });
      });
    });

    test("ids, emblems and categories are unique and known", () => {
      const list = BK.scenarios.list();
      assert.equal(new Set(list.map((t) => t.category)).size, list.length, "each scenario has its own category");
      assert.equal(new Set(list.map((t) => t.emblem)).size, list.length, "each scenario has its own emblem");
      list.forEach((t) => assert.ok(BK.icons.hasEmblem(t.emblem), t.id + " emblem " + t.emblem));
    });

    test("same seed gives an identical instance for every scenario", () => {
      BK.scenarios.list().forEach((t) => assert.ok(deepEqual(generate(t), generate(t)), t.id));
    });

    test("hidden facts never appear in public text before their reveal stage, at every stage count", () => {
      discussion().forEach((t) => {
        for (let n = t.minStages; n <= t.maxStages; n++) {
          const inst = generate(t, { stageCount: n, injectDensity: "high", difficulty: "advanced" });
          inst.hiddenFacts.forEach((hf) => {
            const idx = hf.revealStage === "debrief" ? inst.stages.length : inst.stages.findIndex((s) => s.id === hf.revealStage);
            const before = publicTextBefore(inst, idx);
            assert.ok(!before.includes(hf.text.en) && !before.includes(hf.text.sv), t.id + " " + hf.id + " leaked (n=" + n + ")");
          });
        }
      });
    });

    test("confidentiality: no facilitator text, hidden fact or unreleased inject reaches any projection or stage DOM, every scenario, every branch, both languages", () => {
      const leaks = new Set();
      const check = (ok, msg) => ok || leaks.add(msg);
      discussion().forEach((t) => {
        const inst = Object.assign({ id: "ex-" + t.id }, generate(t, { stageCount: t.maxStages, injectDensity: "high", audience: "mixed", difficulty: "advanced" }));
        const secrets = facilitatorStrings(inst);
        const injects = [];
        inst.stages.forEach((st) => st.injects.concat(st.branchInjects).forEach((i) => injects.push(i)));
        branchChoices(inst).forEach((choice, pass) => {
          let s = S().create(inst, 0);
          Object.keys(choice).forEach((decisionId) => (s = S().apply(s, { type: "decision", decisionId, entry: { option: choice[decisionId], text: "" } }, 0)));
          const where = (p) => t.id + " pass " + pass + " at " + p.slide.id + " (" + p.lang + ")";
          for (let i = 0; i < 600; i++) {
            ["en", "sv"].forEach((lang) => {
              const p = S().project(Object.assign({}, s, { lang }), 0);
              const json = JSON.stringify(p);
              const dom = stageSurface(p);
              ["facilitatorNote", "expectedResponse", "hiddenFacts", '"groundTruth"', '"reliability"'].forEach((k) => check(!json.includes(k), k + " key in projection, " + where(p)));
              secrets.forEach((x) => {
                check(!json.includes(x), "facilitator text in projection, " + where(p) + ": " + x.slice(0, 40));
                check(!dom.includes(x), "facilitator text on stage, " + where(p) + ": " + x.slice(0, 40));
              });
              if (p.slide.type !== "debrief") {
                injects.forEach((inj) => {
                  const st = s.injects[inj.id];
                  if (st && st.state === "released") return;
                  check(!dom.includes(inj.content[lang]), "unreleased inject " + inj.id + " visible, " + where(p));
                });
              }
            });
            if (S().locate(s).slide.type === "debrief") break;
            s = S().apply(s, { type: "next" }, i);
          }
          assert.equal(S().locate(s).slide.type, "debrief", t.id + " playthrough did not finish");
        });
      });
      assert.ok(!leaks.size, leaks.size + " leak(s):\n" + Array.from(leaks).slice(0, 40).join("\n"));
    });

    test("no generated text, in any scenario or format, keeps an unresolved placeholder", () => {
      const bad = [];
      const scan = (v, path, id) => {
        if (typeof v === "string") {
          if (/\{\{|⟦/.test(v)) bad.push(id + " " + path + ": " + v.slice(0, 60));
        } else if (Array.isArray(v)) v.forEach((x, i) => scan(x, path + "[" + i + "]", id));
        else if (v && typeof v === "object") Object.keys(v).forEach((k) => scan(v[k], path + "." + k, id));
      };
      BK.scenarios.list().forEach((t) => {
        const params = t.format === "branching" ? { length: "long", mode: "hybrid", injectDensity: "high" } : { stageCount: t.maxStages, injectDensity: "high" };
        ["se", "eu"].forEach((jurisdiction) => scan(generate(t, Object.assign({ jurisdiction }, params)), "", t.id));
      });
      assert.ok(!bad.length, bad.length + " unresolved:\n" + bad.slice(0, 20).join("\n"));
    });

    test("every chart in every scenario renders in both languages", () => {
      // Localise a chart the way the audience projection does: { en, sv } -> string.
      const localise = (v, lang) =>
        v && typeof v === "object"
          ? Array.isArray(v)
            ? v.map((x) => localise(x, lang))
            : BK.engine.template.isText(v)
              ? v[lang]
              : Object.keys(v).reduce((o, k) => ((o[k] = localise(v[k], lang)), o), {})
          : v;
      BK.scenarios.list().forEach((t) => {
        const inst = generate(t, { stageCount: t.maxStages, audience: "technical", length: "long" });
        (inst.format === "branching" ? inst.pages.filter((pg) => pg.chart).map((pg) => ({ charts: [pg.chart] })) : inst.stages).forEach((st) =>
          st.charts.forEach((c) =>
            ["en", "sv"].forEach((lang) => {
              const node = BK.graphics.chart(Object.assign(localise(c, lang), { markers: [] }), { lang, slide: { currency: inst.currency } });
              assert.ok(node, t.id + " " + c.id + " (" + c.type + ")");
              assert.ok(!/NaN|undefined|\[object Object\]/.test(node.outerHTML), t.id + " " + c.id + " has invalid values (" + lang + ")");
            })
          )
        );
      });
    });
  });
})();
