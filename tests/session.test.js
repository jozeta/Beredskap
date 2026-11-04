/*
 * session.test.js — Phase 3 tests: session reducer, navigation boundaries,
 * timers, branches, inject release controls, the confidentiality boundary
 * (projection and rendered stage DOM), recovery after reload, keyboard map.
 */
(function () {
  "use strict";

  const { suite, test, assert } = window.BKTest;
  const BK = window.BK;
  const S = () => BK.engine.session;

  const T0 = Date.UTC(2026, 9, 21, 10, 0, 0);

  function exercise(params) {
    const inst = BK.engine.generator.generate(BK.scenarios.get("s01-ransomware-vpn"), Object.assign({ seed: "FJORD-4821" }, params || {}));
    return Object.assign({ id: "ex-test" }, inst);
  }

  function session(params) {
    return S().create(exercise(params), T0);
  }

  /** Apply a list of commands at increasing times. */
  function run(sess, cmds, start) {
    let now = start || T0;
    cmds.forEach((c) => {
      now += 1000;
      sess = S().apply(sess, c, now);
    });
    return sess;
  }

  function current(sess) {
    return S().locate(sess).slide;
  }

  function forward(sess, n) {
    for (let i = 0; i < n; i++) sess = S().apply(sess, { type: "next" }, T0 + i);
    return sess;
  }

  /** Every facilitator-only string in an instance (both languages). */
  function facilitatorStrings(inst) {
    const out = [];
    const add = (v) => v && ["en", "sv"].forEach((l) => v[l] && v[l].length > 12 && out.push(v[l]));
    inst.stages.forEach((s) => {
      add(s.facilitator.notes);
      add(s.facilitator.expected);
      (s.facilitator.hints || []).forEach(add);
      s.injects.concat(s.branchInjects).forEach((i) => {
        add(i.facilitatorNote);
        add(i.expectedResponse);
      });
      if (s.decision) {
        (s.decision.evaluation || []).forEach(add);
        Object.values(s.decision.tradeoffs || {}).forEach(add);
        // knowns are deliberately absent: they restate facts the room already has.
        (s.decision.uncertainties || []).forEach(add);
      }
    });
    inst.hiddenFacts.forEach((h) => add(h.text));
    return out;
  }

  suite("session: navigation", () => {
    test("starts on the title slide with all injects pending", () => {
      const s = session();
      assert.equal(current(s).type, "title");
      assert.ok(Object.values(s.injects).every((x) => x.state === "pending"));
    });

    test("prev at the start and next at the end stay in bounds", () => {
      let s = session();
      s = S().apply(s, { type: "prev" }, T0);
      assert.equal(current(s).type, "title");
      s = S().apply(s, { type: "last" }, T0);
      assert.equal(current(s).type, "debrief");
      s = S().apply(s, { type: "next" }, T0);
      assert.equal(current(s).type, "debrief");
    });

    test("playing through reaches the debrief and visits every slide", () => {
      let s = session({ stageCount: 6 });
      const seen = new Set([current(s).id]);
      for (let i = 0; i < 400 && current(s).type !== "debrief"; i++) {
        s = S().apply(s, { type: "next" }, T0 + i);
        seen.add(current(s).id);
      }
      assert.equal(current(s).type, "debrief");
      assert.equal(seen.size, S().slides(s).length);
    });

    test("timeline reveals one inject per step and releases it", () => {
      let s = session();
      s = run(s, [{ type: "gotoStage", index: 0 }]);
      while (current(s).type !== "timeline") s = S().apply(s, { type: "next" }, T0);
      const p1 = S().project(s, T0);
      assert.equal(p1.slide.items.length, 1);
      const released = Object.keys(s.injects).filter((k) => s.injects[k].state === "released");
      assert.equal(released.length, 1);
      s = S().apply(s, { type: "next" }, T0);
      assert.equal(S().project(s, T0).slide.items.length, 2);
    });

    test("number keys jump to a stage", () => {
      let s = session({ stageCount: 6 });
      s = S().apply(s, { type: "gotoStage", index: 2 }, T0);
      assert.equal(current(s).stageId, s.instance.stages[2].id);
    });

    test("going back from a stepped slide steps back first", () => {
      let s = session();
      while (current(s).type !== "discussion") s = S().apply(s, { type: "next" }, T0);
      s = S().apply(s, { type: "next" }, T0);
      assert.equal(s.position.step, 2);
      s = S().apply(s, { type: "prev" }, T0);
      assert.equal(s.position.step, 1);
      assert.equal(current(s).type, "discussion");
    });
  });

  suite("session: timers and pause", () => {
    test("entering a discussion arms the stage timer; toggling runs it", () => {
      let s = session();
      while (current(s).type !== "discussion") s = S().apply(s, { type: "next" }, T0);
      const ms = s.instance.stages[0].discussionMinutes * 60000;
      assert.equal(s.timer.durationMs, ms);
      s = S().apply(s, { type: "timerToggle" }, T0);
      assert.equal(S().timerRemaining(s, T0 + 30000), ms - 30000);
      s = S().apply(s, { type: "timerAdd", ms: 60000 }, T0 + 30000);
      assert.equal(S().timerRemaining(s, T0 + 30000), ms + 30000);
      s = S().apply(s, { type: "timerReset" }, T0 + 40000);
      assert.equal(s.timer.runningSince, null);
    });

    test("a stage click on a fully revealed discussion starts the timer first, then moves on", () => {
      let s = session();
      while (current(s).type !== "discussion") s = S().apply(s, { type: "next" }, T0);
      const slideId = current(s).id;
      const steps = S().stepCount(s, current(s));
      while (s.position.step < steps) {
        s = S().apply(s, { type: "advance" }, T0);
        assert.equal(s.timer.runningSince, null, "revealing questions does not start the timer");
      }
      s = S().apply(s, { type: "advance" }, T0 + 1000);
      assert.equal(current(s).id, slideId, "the click after the last question stays on the slide");
      assert.equal(s.timer.runningSince, T0 + 1000);
      s = S().apply(s, { type: "advance" }, T0 + 5000);
      assert.ok(current(s).id !== slideId, "a click while the countdown runs moves on");
    });

    test("a stage click moves on when the countdown has already run out", () => {
      let s = session();
      while (current(s).type !== "discussion") s = S().apply(s, { type: "next" }, T0);
      const slideId = current(s).id;
      s = S().apply(s, { type: "gotoSlide", slideId }, T0);
      for (let i = 0; i < 20 && s.position.step < S().stepCount(s, current(s)); i++) s = S().apply(s, { type: "next" }, T0);
      s = S().apply(s, { type: "timerAdd", ms: -s.timer.durationMs }, T0);
      s = S().apply(s, { type: "advance" }, T0);
      assert.ok(current(s).id !== slideId, "nothing left to count down");
    });

    test("pause freezes both clocks and resume continues", () => {
      let s = session();
      while (current(s).type !== "discussion") s = S().apply(s, { type: "next" }, T0);
      s = S().apply(s, { type: "timerToggle" }, T0);
      s = S().apply(s, { type: "pauseToggle" }, T0 + 10000);
      const frozenTimer = S().timerRemaining(s, T0 + 999999);
      const frozenClock = S().elapsedMs(s, T0 + 999999);
      assert.equal(S().timerRemaining(s, T0 + 10000), frozenTimer);
      assert.equal(S().elapsedMs(s, T0 + 10000), frozenClock);
      assert.ok(S().project(s, T0).paused);
      s = S().apply(s, { type: "pauseToggle" }, T0 + 20000);
      assert.equal(S().timerRemaining(s, T0 + 25000), frozenTimer - 5000);
    });
  });

  suite("session: injects and branches", () => {
    test("a recorded decision activates its branch inject slide", () => {
      let s = session();
      assert.ok(!S().slides(s).some((x) => x.injectId === "i2-spread"));
      // Options are shown in a seeded order; the branch follows the authored option C ("wait").
      const wait = s.instance.stages[0].decision.options.find((o) => o.authored === "C").key;
      s = S().apply(s, { type: "decision", decisionId: "d1", entry: { option: wait, text: "Wait for the SOC" } }, T0);
      assert.ok(S().slides(s).some((x) => x.injectId === "i2-spread"));
      assert.ok(S().stageInjects(s, "p2").some((i) => i.id === "i2-spread"));
    });

    test("skip removes optional injects only", () => {
      let s = session({ injectDensity: "high", difficulty: "advanced" });
      s = S().apply(s, { type: "skip", injectId: "i1-3" }, T0);
      assert.equal(s.injects["i1-3"].state, "skipped");
      assert.ok(!S().slides(s).some((x) => x.injectId === "i1-3"));
      s = S().apply(s, { type: "skip", injectId: "i1-1" }, T0);
      assert.equal(s.injects["i1-1"].state, "pending", "mandatory inject must not be skippable");
      s = S().apply(s, { type: "unskip", injectId: "i1-3" }, T0);
      assert.ok(S().slides(s).some((x) => x.injectId === "i1-3"));
    });

    test("postpone moves an inject to the next stage", () => {
      let s = session({ injectDensity: "high" });
      s = S().apply(s, { type: "postpone", injectId: "i1-4" }, T0);
      assert.equal(s.injects["i1-4"].stageId, "p2");
      const moved = S().slides(s).find((x) => x.injectId === "i1-4");
      assert.equal(moved.stageId, "p2");
      assert.ok(S().stageInjects(s, "p2").some((i) => i.id === "i1-4"));
    });

    test("release jumps to the inject and marks it released", () => {
      let s = session();
      s = S().apply(s, { type: "release", injectId: "i1-2" }, T0);
      assert.equal(s.injects["i1-2"].state, "released");
      assert.equal(current(s).injectId, "i1-2");
    });

    test("language toggles without changing position or facts", () => {
      let s = forward(session(), 4);
      const before = S().project(s, T0);
      s = S().apply(s, { type: "langToggle" }, T0);
      const after = S().project(s, T0);
      assert.equal(before.slide.id, after.slide.id);
      assert.notEqual(before.lang, after.lang);
    });
  });

  suite("pressure meters and complication deck", () => {
    test("meters appear only when switched on, and the facilitator moves them within 0–5", () => {
      assert.equal(S().project(session(), T0).meters, null, "off by default");
      let s = session({ meters: true });
      const start = S().project(s, T0).meters;
      assert.deepEqual(start.map((m) => [m.id, m.value]), [["trust", 4], ["regulator", 1], ["media", 1]]);
      for (let i = 0; i < 8; i++) s = S().apply(s, { type: "meterAdjust", meter: "trust", delta: 1 }, T0);
      assert.equal(S().meterValues(s)[0].value, 5, "clamped at 5");
      for (let i = 0; i < 9; i++) s = S().apply(s, { type: "meterAdjust", meter: "trust", delta: -1 }, T0);
      assert.equal(S().meterValues(s)[0].value, 0, "clamped at 0");
      s = S().apply(s, { type: "meterAdjust", meter: "trust", delta: 1 }, T0);
      assert.equal(S().meterValues(s)[0].value, 1, "one step back up from the floor");
    });

    test("branching option effects move the meters, and undoing the choice undoes them", () => {
      const tpl = BK.scenarios.get("b01-lost-laptop");
      const inst = Object.assign({ id: "ex-m" }, BK.engine.generator.generate(tpl, { seed: "FJORD-4821", meters: true, length: "short" }));
      let s = S().create(inst, T0);
      // Walk to the 72-hour page and choose "decide it is not notifiable" (regulator +2).
      for (let i = 0; i < 400 && !(S().locate(s).slide.type === "choice" && S().locate(s).slide.pageId === "c8"); i++) {
        const sl = S().locate(s).slide;
        s = S().apply(s, sl.type === "choice" ? { type: "choose", nth: 1 } : { type: "next" }, T0 + i);
      }
      const before = S().meterValues(s).find((m) => m.id === "regulator").value;
      s = S().apply(s, { type: "choose", option: "C" }, T0 + 9000);
      assert.equal(S().meterValues(s).find((m) => m.id === "regulator").value, Math.min(5, before + 2));
      s = S().apply(s, { type: "unchoose" }, T0 + 9500);
      assert.equal(S().meterValues(s).find((m) => m.id === "regulator").value, before);
    });

    test("draws are seeded, never repeat, and only unseen cards go back", () => {
      let a = session();
      let b = session();
      for (let i = 0; i < 5; i++) {
        a = S().apply(a, { type: "complicationDraw" }, T0 + i);
        b = S().apply(b, { type: "complicationDraw" }, T0 + i);
      }
      assert.deepEqual(a.complications.map((c) => c.id), b.complications.map((c) => c.id), "same seed, same cards");
      assert.equal(new Set(a.complications.map((c) => c.id)).size, 5, "no repeats");
      const [first, second] = a.complications.map((c) => c.id);
      a = S().apply(a, { type: "complicationShow", id: first }, T0);
      a = S().apply(a, { type: "complicationDiscard", id: first }, T0);
      a = S().apply(a, { type: "complicationDiscard", id: second }, T0);
      assert.ok(a.complications.some((c) => c.id === first), "a shown card stays on record");
      assert.ok(!a.complications.some((c) => c.id === second), "an unseen card goes back");
    });

    test("only the shown card's title and text reach the stage; the facilitator note never does", () => {
      let s = session();
      s = S().apply(s, { type: "complicationDraw" }, T0);
      const id = s.complications[0].id;
      assert.equal(S().project(s, T0).complication, null, "drawn is not shown");
      s = S().apply(s, { type: "complicationShow", id }, T0);
      const card = BK.data.complications.get(id);
      ["en", "sv"].forEach((lang) => {
        const p = S().project(Object.assign({}, s, { lang }), T0);
        assert.equal(p.complication.title, card.title[lang]);
        const json = JSON.stringify(p);
        const dom = BK.ui.stageRenderer.renderCanvas(p, {}).textContent;
        assert.ok(!json.includes(card.note[lang]) && !dom.includes(card.note[lang]), "note leaked (" + lang + ")");
        assert.ok(dom.includes(card.text[lang]), "card text on stage");
      });
      s = S().apply(s, { type: "complicationHide" }, T0);
      assert.equal(S().project(s, T0).complication, null);
    });

    test("auto mode readies one card per new stage, not on stage one", () => {
      let s = session({ complications: "auto", stageCount: 4 });
      for (let i = 0; i < 400 && S().locate(s).slide.type !== "debrief"; i++) s = S().apply(s, { type: "next" }, T0 + i);
      const keys = s.complications.map((c) => c.key);
      assert.equal(keys.length, 3, "stages 2–4 each got one: " + keys.join(","));
      assert.ok(!keys.includes(s.instance.stages[0].id));
      assert.ok(s.complications.every((c) => !c.shownAt), "auto never shows a card by itself");
    });

    test("the validator rejects unknown or oversized meter effects", () => {
      const tpl = JSON.parse(JSON.stringify(BK.scenarios.get("b11-reply-all"), (k, v) => (typeof v === "function" ? undefined : v)));
      const t2 = Object.assign({}, BK.scenarios.get("b11-reply-all"));
      t2.pages = tpl.pages;
      t2.pages[0].choice.options[0].effects = { morale: 1, trust: 5 };
      const issues = BK.engine.validator.validateTemplate(t2).map((x) => x.detail).join(" ");
      assert.ok(issues.includes("effect morale") && issues.includes("effect trust 5"), issues);
    });
  });

  suite("option order and reconsider", () => {
    test("options are shown in a seeded order: deterministic, not always authored order, re-lettered A–D", () => {
      const a = exercise({ stageCount: 8 });
      const b = exercise({ stageCount: 8 });
      assert.deepEqual(a.stages.map((st) => st.decision.options.map((o) => o.authored)), b.stages.map((st) => st.decision.options.map((o) => o.authored)), "same seed, same order");
      a.stages.forEach((st) => assert.deepEqual(st.decision.options.map((o) => o.key), "ABCD".slice(0, st.decision.options.length).split(""), "re-lettered by position"));
      // Across every discussion scenario and two seeds, the authored first option is often not shown first.
      let firstKept = 0, total = 0;
      BK.scenarios.list().filter((t) => t.format !== "branching").forEach((tpl) =>
        ["FJORD-4821", "LYNX-1002"].forEach((seed) =>
          BK.engine.generator.generate(tpl, { seed, stageCount: tpl.maxStages }).stages.forEach((st) => {
            if (!st.decision || st.decision.options.length < 2) return;
            total++;
            if (st.decision.options[0].authored === "A") firstKept++;
          })
        )
      );
      assert.ok(firstKept / total < 0.6, "authored A still first in " + firstKept + " of " + total);
    });

    test("a consequence rule follows its authored option after the shuffle", () => {
      const ex = exercise({ stageCount: 8 });
      const shown = ex.stages[0].decision.options.find((o) => o.authored === "C").key;
      const br = ex.stages[1].branches.find((x) => x.when.decision === "d1");
      assert.equal(br.when.option, shown);
    });

    test("reconsider slides appear only where the earlier decision is in the run, and show the room's own decision", () => {
      const full = exercise({ stageCount: 8 });
      const types = (ex) => BK.engine.slides.compile(ex).filter((x) => x.type === "reconsider").map((x) => x.stageId + ">" + x.decisionId);
      assert.deepEqual(types(full), ["p3>d1", "p5>d4", "p6>d3", "p8>d2"]);
      const short = exercise({ stageCount: BK.scenarios.get("s01-ransomware-vpn").minStages });
      types(short).forEach((x) => {
        const [sid, did] = x.split(">");
        const idx = short.stages.findIndex((st) => st.id === sid);
        assert.ok(short.stages.slice(0, idx).some((st) => st.decision && st.decision.id === did), x + " revisits a decision outside the run");
      });
      let s = S().create(full, T0);
      const opt = full.stages[0].decision.options[1];
      s = S().apply(s, { type: "decision", decisionId: "d1", entry: { option: opt.key, text: "Our own words" } }, T0);
      const slide = S().slides(s).find((x) => x.type === "reconsider" && x.stageId === "p3");
      s = S().apply(s, { type: "gotoSlide", slideId: slide.id }, T0);
      const p = S().project(s, T0);
      assert.equal(p.slide.type, "reconsider");
      assert.equal(p.slide.option.text, opt.text.en);
      assert.equal(p.slide.text, "Our own words");
      assert.ok(p.slide.pressure.length > 20 && p.slide.fromStageNumber === 1);
      const canvas = BK.ui.stageRenderer.renderCanvas(p, { preview: true });
      assert.ok(canvas.textContent.includes("Our own words") && canvas.textContent.includes(p.slide.pressure));
    });

    test("the verdict is recorded, validated, reported and survives export and import", () => {
      const ex = exercise({ stageCount: 8 });
      let s = S().create(ex, T0);
      s = S().apply(s, { type: "decision", decisionId: "d1", entry: { option: "A", text: "" } }, T0);
      assert.equal(S().apply(s, { type: "reconsider", stageId: "p3", verdict: "maybe" }, T0).reconsider.p3, undefined, "unknown verdict ignored");
      assert.equal(S().apply(s, { type: "reconsider", stageId: "p2", verdict: "keep" }, T0).reconsider.p2, undefined, "stage without reconsider ignored");
      s = S().apply(s, { type: "reconsider", stageId: "p3", verdict: "reverse", note: "The VPN is the way in" }, T0);
      assert.equal(s.reconsider.p3.verdict, "reverse");
      assert.equal(S().facilitatorView(Object.assign({}, s, { position: { slideId: S().slides(s).find((x) => x.stageId === "p3").id, step: 0 } }), T0).reconsider.verdict, "reverse");
      const r = BK.io.export.report(s, "en");
      const row = r.reconsidered.find((x) => x.stage === 3);
      assert.ok(row && row.verdict === "reverse" && row.note === "The VPN is the way in" && row.original.startsWith("A — "));
      assert.ok(BK.io.export.markdown(s, "en").includes("Decisions reconsidered"));
      const back = BK.io.import.validate(BK.io.export.toJSON(ex, s));
      assert.equal(back.session.reconsider.p3.verdict, "reverse");
      const bad = JSON.parse(BK.io.export.toJSON(ex, s));
      bad.session.reconsider.p3.verdict = "<script>";
      assert.throws(() => BK.io.import.validate(JSON.stringify(bad)), "tampered verdict accepted");
    });

    test("the validator rejects a reconsider that points forward or lacks bilingual pressure", () => {
      const tpl = JSON.parse(JSON.stringify(BK.scenarios.get("s01-ransomware-vpn"), (k, v) => (typeof v === "function" ? undefined : v)));
      const codes = (t) => BK.engine.validator.validateTemplate(t).filter((x) => x.code === "reconsider").length;
      const t1 = JSON.parse(JSON.stringify(tpl));
      t1.stages[1].reconsider = { decision: "d5", pressure: { en: "x", sv: "y" } };
      assert.ok(codes(t1) >= 1, "forward reference accepted");
      const t2 = JSON.parse(JSON.stringify(tpl));
      t2.stages[2].reconsider = { decision: "d1", pressure: "English only" };
      assert.ok(codes(t2) >= 1, "monolingual pressure accepted");
    });
  });

  suite("decision deadline and challenge cards", () => {
    test("moving into another stage always starts that stage's countdown fresh and stopped", () => {
      const ex = exercise({ stageCount: 8 });
      let s = S().create(ex, T0);
      const disc = S().slides(s).find((x) => x.type === "discussion" && x.stageId === "p1");
      s = S().apply(s, { type: "gotoSlide", slideId: disc.id }, T0);
      s = S().apply(s, { type: "timerToggle" }, T0);
      const firstOfP2 = S().slides(s).find((x) => x.stageId === "p2");
      // Still running when the room moves on, and long past zero: either way stage 2 starts fresh.
      [T0 + 60000, T0 + 24 * 3600000].forEach((at) => {
        const n = S().apply(s, { type: "gotoSlide", slideId: firstOfP2.id }, at);
        assert.equal(n.timer.stageId, "p2");
        assert.equal(n.timer.runningSince, null, "stopped");
        assert.equal(S().timerRemaining(n, at + 5000), ex.stages[1].discussionMinutes * 60000, "full time");
      });
    });

    test("in a branching run with discussion stops, a new page never inherits the last page's countdown", () => {
      const inst = Object.assign({ id: "ex-t" }, BK.engine.generator.generate(BK.scenarios.get("b01-lost-laptop"), { seed: "FJORD-4821", mode: "hybrid" }));
      let s = S().create(inst, T0);
      let i = 0;
      for (; i < 60 && S().locate(s).slide.type !== "discussion"; i++) s = S().apply(s, { type: "next" }, T0 + i);
      const page = S().locate(s).slide.pageId;
      s = S().apply(s, { type: "timerToggle" }, T0 + i);
      for (; i < 120 && S().locate(s).slide.type !== "choice"; i++) s = S().apply(s, { type: "next" }, T0 + i);
      s = S().apply(s, { type: "choose", nth: 1 }, T0 + 10 * 3600000);
      assert.notEqual(S().locate(s).slide.pageId, page);
      assert.ok(s.timer.stageId !== page && !s.timer.runningSince, "fresh on the new page");
    });

    /** A session on stage 1's first discussion slide with its countdown running from `at`. */
    function onDiscussion(params, at) {
      const ex = exercise(Object.assign({ stageCount: 8 }, params));
      let s = S().create(ex, T0);
      const slide = S().slides(s).find((x) => x.type === "discussion" && x.stageId === "p1");
      s = S().apply(s, { type: "gotoSlide", slideId: slide.id }, at);
      s = S().apply(s, { type: "timerToggle" }, at);
      return { ex, s };
    }

    test("with the setting off, a countdown that runs out changes nothing", () => {
      const { s } = onDiscussion({}, T0);
      const late = T0 + s.timer.durationMs + 1000;
      assert.equal(S().apply(s, { type: "deadline" }, late), s, "deadline ignored when the setting is off");
    });

    test("when time runs out undecided, the decision owner picks a seeded option the room can overrule", () => {
      const { ex, s } = onDiscussion({ decisionDeadline: true }, T0);
      assert.equal(S().apply(s, { type: "deadline" }, T0 + 1000), s, "not before the countdown ends");
      const late = T0 + s.timer.durationMs + 1000;
      const a = S().apply(s, { type: "deadline" }, late);
      const pick = a.deadlines.d1.option;
      assert.ok(ex.stages[0].decision.options.some((o) => o.key === pick), "picked one of the options");
      assert.equal(a.decisions.d1.option, pick, "recorded as the room's decision, so consequences follow it");
      assert.equal(onDiscussion({ decisionDeadline: true }, T0).s.instance.seed, s.instance.seed);
      assert.equal(S().apply(onDiscussion({ decisionDeadline: true }, T0).s, { type: "deadline" }, late).deadlines.d1.option, pick, "same seed, same pick");
      assert.equal(S().apply(a, { type: "deadline" }, late + 1000), a, "fires once");
      const p = S().project(a, late);
      assert.equal(p.deadline.option.key, pick);
      const canvas = BK.ui.stageRenderer.renderCanvas(p, { preview: true });
      assert.ok(canvas.textContent.includes(p.deadline.option.text), "the stage shows what was chosen");
      // A decision the room already made is never overwritten.
      const decided = S().apply(s, { type: "decision", decisionId: "d1", entry: { option: "A", text: "" } }, T0 + 500);
      assert.equal(S().apply(decided, { type: "deadline" }, late), decided);
      // The room overrules it; the report says so. Moving on clears the card.
      const other = ex.stages[0].decision.options.find((o) => o.key !== pick).key;
      const b = S().apply(a, { type: "decision", decisionId: "d1", entry: { option: other, text: "" } }, late + 2000);
      const row = BK.io.export.report(b, "en").deadlines[0];
      assert.ok(row.overruled && row.picked.startsWith(pick + " — ") && row.final.startsWith(other + " — "));
      assert.equal(S().apply(b, { type: "next" }, late + 3000).activeDeadline, null);
      const back = BK.io.import.validate(BK.io.export.toJSON(ex, b));
      assert.equal(back.session.deadlines.d1.option, pick);
    });

    test("in a branching run, a choice gets its own countdown and the story chooses when it runs out", () => {
      const tpl = BK.scenarios.get("b01-lost-laptop");
      const inst = Object.assign({ id: "ex-d" }, BK.engine.generator.generate(tpl, { seed: "FJORD-4821", decisionDeadline: true }));
      let s = S().create(inst, T0);
      let i = 0;
      for (; i < 50 && S().locate(s).slide.type !== "choice"; i++) s = S().apply(s, { type: "next" }, T0 + i);
      const page = S().locate(s).slide.pageId;
      assert.ok(s.timer.runningSince && s.timer.durationMs === S().CHOICE_DEADLINE_MINUTES * 60000, "countdown starts on the choice");
      assert.ok(S().project(s, T0 + i).timer.active, "the stage shows it");
      const late = T0 + i + s.timer.durationMs + 1000;
      const a = S().apply(s, { type: "deadline" }, late);
      assert.ok(a.deadlines[page] && a.decisions[page].option === a.deadlines[page].option, "the story chose");
      assert.notEqual(a.route[a.route.length - 1].pageId, page, "and moved on");
      assert.ok(S().project(a, late).deadline.branching);
      const back = BK.io.import.validate(BK.io.export.toJSON(inst, a));
      assert.ok(back.session.deadlines[page]);
    });

    test("challenge cards need a recorded decision, are seeded, never repeat back to back, and report the response", () => {
      const ex = exercise({ stageCount: 8 });
      let s = S().create(ex, T0);
      assert.equal(S().apply(s, { type: "challengeDraw", key: "d1" }, T0), s, "nothing to challenge yet");
      const chosen = ex.stages[0].decision.options[0];
      s = S().apply(s, { type: "decision", decisionId: "d1", entry: { option: chosen.key, text: "" } }, T0);
      const a = S().apply(s, { type: "challengeDraw", key: "d1" }, T0);
      assert.equal(S().apply(s, { type: "challengeDraw", key: "d1" }, T0).challenges.d1.id, a.challenges.d1.id, "seeded");
      const b = S().apply(a, { type: "challengeDraw", key: "d1" }, T0);
      assert.notEqual(b.challenges.d1.id, a.challenges.d1.id, "a new card on each draw");
      let c = S().apply(b, { type: "challengeShow", key: "d1" }, T0);
      const p = S().project(c, T0);
      assert.ok(p.challenge && p.challenge.title && !/[{}]/.test(p.challenge.title + p.challenge.text), "placeholders filled");
      assert.ok(BK.ui.stageRenderer.renderCanvas(p, { preview: true }).textContent.includes(p.challenge.text));
      assert.equal(S().apply(c, { type: "challengeOutcome", key: "d1", outcome: "maybe" }, T0), c, "unknown response ignored");
      c = S().apply(c, { type: "challengeOutcome", key: "d1", outcome: "held" }, T0);
      c = S().apply(c, { type: "challengeHide" }, T0);
      assert.equal(S().project(c, T0).challenge, null);
      // Moving on takes the card off the stage, and the "next" preview never shows it.
      const shown = S().apply(c, { type: "challengeShow", key: "d1" }, T0);
      const nx = S().nextPosition(shown);
      assert.equal(S().projectSlide(shown, nx.slideId, nx.step, T0).challenge, null, "next preview shows no challenge");
      assert.equal(S().apply(shown, { type: "next" }, T0).activeChallenge, null, "next clears it");
      assert.equal(S().apply(shown, { type: "gotoStage", index: 2 }, T0).activeChallenge, null, "jumping clears it");
      const row = BK.io.export.report(c, "en").challenges[0];
      assert.ok(row && row.outcome === "held" && row.card === S().challengeContent(c, "d1", "en").title);
      assert.ok(BK.io.export.markdown(c, "en").includes("Challenged decisions"));
      const back = BK.io.import.validate(BK.io.export.toJSON(ex, c));
      assert.equal(back.session.challenges.d1.outcome, "held");
      const bad = JSON.parse(BK.io.export.toJSON(ex, c));
      bad.session.challenges.d1.id = "<script>";
      assert.throws(() => BK.io.import.validate(JSON.stringify(bad)), "unknown card accepted");
    });

    test("every challenge card, in both languages, is built from public text only", () => {
      const ex = exercise({ stageCount: 8, lang: "sv" });
      const secret = facilitatorStrings(ex);
      let s = S().create(ex, T0);
      ex.stages.filter((st) => st.decision).forEach((st) => (s = S().apply(s, { type: "decision", decisionId: st.decision.id, entry: { option: st.decision.options[1].key, text: "" } }, T0)));
      const seen = new Set();
      ex.stages.filter((st) => st.decision).forEach((st) => {
        for (let i = 0; i < 14; i++) {
          s = S().apply(s, { type: "challengeDraw", key: st.decision.id }, T0);
          seen.add(s.challenges[st.decision.id].id);
          ["en", "sv"].forEach((lang) => {
            const ch = S().challengeContent(s, st.decision.id, lang);
            const text = ch.title + " " + ch.text;
            assert.ok(!/[{}]/.test(text), "unfilled placeholder: " + text);
            secret.forEach((x) => assert.ok(!text.includes(x), "facilitator text in a challenge card"));
          });
        }
      });
      assert.equal(seen.size, BK.data.challenges.cards.length, "every card can be drawn");
    });
  });

  suite("confidentiality boundary", () => {
    const configs = [
      { stageCount: 4, audience: "technical", injectDensity: "high", difficulty: "advanced" },
      { stageCount: 8, audience: "executive", injectDensity: "high", difficulty: "intermediate", jurisdiction: "se" },
      { stageCount: 6, audience: "mixed", injectDensity: "normal", lang: "sv" }
    ];

    test("no facilitator text, hidden fact or unreleased inject in any projection or stage DOM", () => {
      configs.forEach((cfg) => {
        let s = session(cfg);
        // Activate a branch too, so branch injects are covered.
        s = S().apply(s, { type: "decision", decisionId: "d1", entry: { option: "C", text: "" } }, T0);
        const secret = facilitatorStrings(s.instance);
        const allInjects = [];
        s.instance.stages.forEach((st) => st.injects.concat(st.branchInjects).forEach((i) => allInjects.push(i)));

        const host = document.createElement("div");
        for (let i = 0; i < 500; i++) {
          ["en", "sv"].forEach((lang) => {
            const p = S().project(Object.assign({}, s, { lang }), T0);
            const json = JSON.stringify(p);
            host.textContent = "";
            host.appendChild(BK.ui.stageRenderer.renderCanvas(p, {}));
            const dom = host.textContent;

            assert.ok(!/"reliability"\s*:/.test(json), "true reliability leaked at " + p.slide.id);
            ["facilitatorNote", "expectedResponse", "hiddenFacts", "groundTruth\""].forEach((k) => assert.ok(!json.includes(k), k + " key leaked at " + p.slide.id));
            secret.forEach((txt) => {
              assert.ok(!json.includes(txt), "facilitator text in projection at " + p.slide.id + ": " + txt.slice(0, 40));
              assert.ok(!dom.includes(txt), "facilitator text in stage DOM at " + p.slide.id + ": " + txt.slice(0, 40));
            });
            allInjects.forEach((inj) => {
              const st = s.injects[inj.id];
              if (st && st.state === "released") return;
              if (p.slide.type === "debrief") return;
              const text = inj.content[lang];
              assert.ok(!dom.includes(text), "unreleased inject " + inj.id + " visible at " + p.slide.id);
            });
          });
          if (current(s).type === "debrief") break;
          s = S().apply(s, { type: "next" }, T0 + i);
        }
        assert.equal(current(s).type, "debrief", "playthrough did not finish");
      });
    });

    test("role-card and facilitator-visibility injects never get stage slides", () => {
      const s = session({ stageCount: 8, injectDensity: "high" });
      S().slides(s).filter((x) => x.injectId).forEach((x) => {
        const st = s.instance.stages.find((y) => y.id === x.stageId);
        const inj = st.injects.concat(st.branchInjects).find((i) => i.id === x.injectId) || S().stageInjects(s, x.stageId).find((i) => i.id === x.injectId);
        assert.equal(inj.visibility, "public");
      });
    });
  });

  suite("session recovery", () => {
    test("reload with no other window open restores slide and logs with timers paused", () => {
      let s = forward(session(), 6);
      s = S().apply(s, { type: "decision", decisionId: "d1", entry: { option: "B", text: "Disconnect" } }, Date.now());
      s.clock.runningSince = Date.now() - 60000; // clock was running when the tab closed
      BK.store.putItem("session", s);
      BK.store.remove("presence:" + s.id);

      const ctrl = BK.sync.open(s.id, () => {});
      const r = ctrl.get();
      ctrl.close();
      assert.ok(ctrl.recovered, "should recover");
      assert.equal(r.clock.runningSince, null);
      assert.equal(r.position.slideId, s.position.slideId);
      assert.equal(r.decisions.d1.option, "B");
      BK.store.removeItem("session", s.id);
      BK.store.remove("presence:" + s.id);
    });

    test("recovery never calls back before open() returns (presenter reload regression)", () => {
      const s = forward(session(), 6);
      s.clock.runningSince = Date.now() - 60000;
      BK.store.putItem("session", s);
      BK.store.remove("presence:" + s.id);
      let ctrl = null;
      let early = 0;
      let calls = 0;
      ctrl = BK.sync.open(s.id, () => {
        calls++;
        if (!ctrl) early++;
      });
      assert.ok(ctrl.recovered, "should recover");
      assert.equal(early, 0, "onChange ran before the controller existed");
      ctrl.dispatch({ type: "next" });
      assert.equal(calls, 1, "later changes still notify");
      ctrl.close();
      BK.store.removeItem("session", s.id);
      BK.store.remove("presence:" + s.id);
    });

    test("does not pause when another window is still running the session", () => {
      const s = session();
      s.clock.runningSince = Date.now();
      BK.store.putItem("session", s);
      BK.store.set("presence:" + s.id, { "tab-other": Date.now() }, { silent: true });
      const ctrl = BK.sync.open(s.id, () => {});
      const r = ctrl.get();
      ctrl.close();
      assert.ok(!ctrl.recovered);
      assert.ok(r.clock.runningSince);
      BK.store.removeItem("session", s.id);
      BK.store.remove("presence:" + s.id);
    });

    test("dispatch persists and re-reads the latest stored state", () => {
      const s = session();
      BK.store.putItem("session", s);
      BK.store.set("presence:" + s.id, { "tab-other": Date.now() }, { silent: true });
      const a = BK.sync.open(s.id, () => {});
      const b = BK.sync.open(s.id, () => {});
      a.dispatch({ type: "next" });
      b.dispatch({ type: "next" }); // b must build on a's change, not overwrite it
      const stored = BK.store.getItem("session", s.id);
      a.close();
      b.close();
      assert.equal(stored.rev, s.rev + 2);
      assert.equal(S().locate(stored).idx, 2);
      BK.store.removeItem("session", s.id);
      BK.store.remove("presence:" + s.id);
    });
  });

  suite("keyboard and clicker map", () => {
    function press(key, extra, target) {
      const cmds = [];
      const e = Object.assign({ key, shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, target: target || document.body, preventDefault() {} }, extra || {});
      BK.ui.runKeys(e, (c) => cmds.push(c));
      return cmds[0] || null;
    }

    test("clicker keys navigate", () => {
      assert.equal(press("PageDown").type, "advance");
      assert.equal(press("PageUp").type, "prev");
      assert.equal(press(" ").type, "advance");
      assert.equal(press("ArrowRight").type, "advance");
      assert.equal(press("ArrowDown").type, "advance");
      assert.equal(press("ArrowLeft").type, "prev");
      assert.equal(press(".").value, "black");
      assert.equal(press("b").value, "black");
    });

    test("control keys", () => {
      assert.equal(press("0").index, 9);
      assert.equal(press("3").index, 2);
      assert.equal(press("t").type, "timerToggle");
      assert.equal(press("T", { shiftKey: true }).type, "timerReset");
      assert.equal(press("+").ms, 60000);
      assert.equal(press("-").ms, -60000);
      assert.equal(press("p").type, "pauseToggle");
      assert.equal(press("l").type, "langToggle");
      assert.equal(press("d").type, "themeToggle");
      assert.equal(press("w").value, "white");
    });

    test("shortcuts are disabled while typing", () => {
      const input = document.createElement("input");
      assert.equal(press("ArrowRight", null, input), null);
      assert.equal(press("p", null, document.createElement("textarea")), null);
    });
  });
})();
