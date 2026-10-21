/*
 * scenarios.test.js — Every registered scenario: validation, determinism,
 * hidden-fact progressive disclosure at every stage count, and the stage
 * confidentiality sweep. Runs over the whole library, so new scenarios are
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

  suite("scenario library", () => {
    test("every template passes validation", () => {
      BK.scenarios.list().forEach((t) => {
        const problems = BK.scenarios.problems(t.id).map((p) => BK.engine.validator.format(p, "en"));
        assert.deepEqual(problems, [], t.id);
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
      BK.scenarios.list().forEach((t) => {
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

    test("no facilitator text reaches the stage in a full playthrough of every scenario", () => {
      BK.scenarios.list().forEach((t) => {
        const inst = Object.assign({ id: "ex-" + t.id }, generate(t, { stageCount: t.maxStages, injectDensity: "high", audience: "mixed" }));
        let s = S().create(inst, 0);
        const secrets = [];
        inst.stages.forEach((st) => {
          [st.facilitator.notes, st.facilitator.expected].concat(st.facilitator.hints || []).forEach((v) => v && secrets.push(v.en, v.sv));
          st.injects.concat(st.branchInjects).forEach((i) => [i.facilitatorNote, i.expectedResponse].forEach((v) => v && secrets.push(v.en, v.sv)));
        });
        inst.hiddenFacts.forEach((h) => secrets.push(h.text.en, h.text.sv));
        const host = document.createElement("div");
        for (let i = 0; i < 600; i++) {
          const p = S().project(s, 0);
          host.textContent = "";
          host.appendChild(BK.ui.stageRenderer.renderCanvas(p, {}));
          const dom = host.textContent;
          secrets.filter((x) => x && x.length > 12).forEach((x) => assert.ok(!dom.includes(x), t.id + " leaked at " + p.slide.id + ": " + x.slice(0, 40)));
          if (S().locate(s).slide.type === "debrief") break;
          s = S().apply(s, { type: "next" }, i);
        }
        assert.equal(S().locate(s).slide.type, "debrief", t.id + " playthrough did not finish");
      });
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
        const inst = generate(t, { stageCount: t.maxStages, audience: "technical" });
        inst.stages.forEach((st) =>
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
