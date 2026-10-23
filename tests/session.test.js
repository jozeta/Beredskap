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
      s = S().apply(s, { type: "decision", decisionId: "d1", entry: { option: "C", text: "Wait for the SOC" } }, T0);
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
