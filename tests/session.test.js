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
      assert.equal(press("PageDown").type, "next");
      assert.equal(press("PageUp").type, "prev");
      assert.equal(press(" ").type, "next");
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
