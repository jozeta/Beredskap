/*
 * branching.test.js — The gamebook format (design §5): map validation (each rule
 * with a failing fixture), the session reducer (choose, undo, digits, short and
 * long runs, route pages), path analysis over every branching scenario, the
 * confidentiality sweep along playthroughs that take every option, and import
 * of branching sessions.
 */
(function () {
  "use strict";

  const { suite, test, assert, deepEqual } = window.BKTest;
  const BK = window.BK;
  const S = () => BK.engine.session;
  const B = () => BK.engine.branching;
  const T0 = Date.UTC(2026, 9, 22, 8, 0, 0);

  const branchingTemplates = () => BK.scenarios.list().filter((t) => t.format === "branching");

  function generate(tpl, params) {
    return Object.assign({ id: "ex-" + tpl.id }, BK.engine.generator.generate(tpl, Object.assign({ seed: "GAMEBOOK-0001" }, params || {})));
  }

  // ---- A small valid map, built so each rule can be broken one at a time ------------------------

  const T = (en) => ({ en, sv: en + " (sv)" });

  /**
   * Spine p1…p8 (short: 8 choices) with long pages l1…l4 (long: 12), a rejoin at
   * p3, a break-away from p5 (x1…x5 → e4), and a route page choosing e1/e2/e3.
   */
  function fixture() {
    const o = (key, to, extra) => Object.assign({ key, text: T("Option " + key + " to " + to), to, why: T("Why " + key), set: [] }, extra || {});
    const page = (id, choice, extra) => Object.assign({ id, title: T("Title " + id), narrative: T("Narrative " + id) }, choice ? { choice: { question: T("Question " + id), strong: T("Strong " + id), options: choice } } : {}, extra || {});
    const pages = [
      page("p1", [o("A", "p2", { set: ["early"] }), o("B", "p2b")]),
      page("p2", [o("A", "l1"), o("B", "l1")], { variants: [{ if: "early", narrative: T("Variant early"), because: T("Because early") }] }),
      page("p2b", [o("A", "l1"), o("B", "l1")]),
      page("l1", [o("A", "p3"), o("B", "p3")], { long: true, skipTo: "p3" }),
      page("p3", [o("A", "l2"), o("B", "l2"), o("C", "l2", { requires: "early" })]),
      page("l2", [o("A", "p4"), o("B", "p4")], { long: true, skipTo: "p4" }),
      page("p4", [o("A", "p5", { set: ["notified"] }), o("B", "p5")]),
      page("p5", [o("A", "l3"), o("B", "l3"), o("C", "x1")]),
      page("l3", [o("A", "p6"), o("B", "p6")], { long: true, skipTo: "p6" }),
      page("p6", [o("A", "p7"), o("B", "p7")]),
      page("p7", [o("A", "l4"), o("B", "l4")]),
      page("l4", [o("A", "p8"), o("B", "p8")], { long: true, skipTo: "p8" }),
      page("p8", [o("A", "r"), o("B", "r", { set: ["denied"] })]),
      page("r", null, { route: [{ if: ["early", "notified", "!denied"], to: "e1" }, { if: "!denied", to: "e2" }, { to: "e3" }] }),
      page("x1", [o("A", "x2"), o("B", "x2")]),
      page("x2", [o("A", "x3"), o("B", "x3")]),
      page("x3", [o("A", "x4"), o("B", "x4")]),
      page("x4", [o("A", "x5"), o("B", "x5")]),
      page("x5", [o("A", "e4"), o("B", "e4")]),
      page("e1", null, { ending: { grade: 1, label: T("Ending one"), summary: T("Summary one") } }),
      page("e2", null, { ending: { grade: 2, label: T("Ending two"), summary: T("Summary two") } }),
      page("e3", null, { ending: { grade: 4, label: T("Ending three"), summary: T("Summary three") } }),
      page("e4", null, { ending: { grade: 5, label: T("Ending four"), summary: T("Summary four") } })
    ];
    return { id: "fx", start: "p1", flags: { early: T("Early"), notified: T("Notified"), denied: T("Denied") }, pages };
  }

  function mapIssues(tpl) {
    const out = [];
    B().validateMap(tpl, (code, where, detail) => out.push(code + ": " + where + ": " + detail));
    return out;
  }

  const mutate = (fn) => {
    const tpl = JSON.parse(JSON.stringify(fixture()));
    fn(tpl, (id) => tpl.pages.find((p) => p.id === id));
    return mapIssues(tpl).join("\n");
  };

  suite("branching map", () => {
    test("the fixture map is valid and has the intended path lengths", () => {
      assert.deepEqual(mapIssues(fixture()), []);
      const st = B().stats(fixture().pages, "p1");
      assert.deepEqual(st.short, [8, 10]);
      assert.deepEqual(st.long, [12, 12]);
    });

    test("each map rule rejects a broken map", () => {
      const cases = [
        ["unreachable", (t) => t.pages.push({ id: "orphan", title: T("x"), narrative: T("x"), ending: { grade: 3, label: T("x"), summary: T("x") } }), /unreachable/],
        ["cycle", (t, p) => (p("p6").choice.options[0].to = "p4"), /cycle/],
        ["too few options", (t, p) => (p("p6").choice.options = p("p6").choice.options.slice(0, 1)), /offers 1 options/],
        ["requires leaves one option", (t, p) => (p("p4").choice.options[1].requires = "early"), /offers 1 options/],
        ["missing target", (t, p) => (p("p6").choice.options[0].to = "nowhere"), /reference/],
        ["short path too short", (t, p) => (p("p2").choice.options[0].to = "p4"), /choices \(8–12 needed\)/],
        ["long page without skipTo", (t, p) => delete p("l2").skipTo, /skipTo/],
        ["two kinds on one page", (t, p) => (p("p6").ending = { grade: 3, label: T("x"), summary: T("x") }), /exactly one/],
        ["flag checked, never set", (t, p) => (p("p3").choice.options[2].requires = "ghost"), /never set/],
        ["flag without a label", (t) => delete t.flags.notified, /no label/],
        ["no grade-1 ending", (t, p) => (p("e1").ending.grade = 2), /grade-1/],
        ["too few endings", (t, p) => { p("p8").choice.options[1].to = "e2"; p("p8").choice.options[0].to = "e2"; t.pages = t.pages.filter((x) => x.id !== "e1" && x.id !== "e3" && x.id !== "r"); }, /endings \(3–5 needed\)/],
        ["no break-away", (t, p) => { p("p5").choice.options[2].to = "l3"; t.pages = t.pages.filter((x) => !/^x\d$|^e4$/.test(x.id)); }, /no break-away/]
      ];
      cases.forEach(([name, fn, pattern]) => assert.ok(pattern.test(mutate(fn)), name + " not caught:\n" + mutate(fn)));
    });

    test("route pages and long pages resolve to the page the room lands on", () => {
      const byId = {};
      fixture().pages.forEach((p) => (byId[p.id] = p));
      assert.deepEqual(B().resolveTarget(byId, "l1", [], "short"), { pageId: "p3", through: [] });
      assert.deepEqual(B().resolveTarget(byId, "l1", [], "long"), { pageId: "l1", through: [] });
      assert.deepEqual(B().resolveTarget(byId, "r", ["early", "notified"], "short"), { pageId: "e1", through: ["r"] });
      assert.deepEqual(B().resolveTarget(byId, "r", ["early", "notified", "denied"], "short"), { pageId: "e3", through: ["r"] });
      assert.ok(B().cond(["a", "!b"], ["a"]) && !B().cond(["a", "!b"], ["a", "b"]) && B().cond(null, []));
    });
  });

  suite("branching scenarios", () => {
    test("every branching scenario: 8–12 choices short, 12–20 long, 3–5 endings all reachable", () => {
      branchingTemplates().forEach((t) => {
        const st = B().stats(t.pages, t.start);
        assert.ok(st.short[0] >= 8 && st.short[1] <= 12, t.id + " short " + st.short);
        assert.ok(st.long[0] >= 12 && st.long[1] <= 20, t.id + " long " + st.long);
        assert.ok(st.endings >= 3 && st.endings <= 5, t.id + " endings " + st.endings);
        const reached = new Set([...B().analyse(t.pages, t.start, "short").endings, ...B().analyse(t.pages, t.start, "long").endings]);
        t.pages.filter((p) => p.ending).forEach((p) => assert.ok(reached.has(p.id), t.id + " ending " + p.id + " unreachable"));
      });
    });

    test("same seed gives the same branching instance; page numbers are unique, start is § 1", () => {
      branchingTemplates().forEach((t) => {
        const a = generate(t, { length: "long" });
        assert.ok(deepEqual(a, generate(t, { length: "long" })), t.id + " not deterministic");
        const nums = a.pages.map((p) => p.num).concat(...a.pages.map((p) => p.variants.map((v) => v.num)));
        assert.equal(new Set(nums).size, nums.length, t.id + " duplicate page numbers");
        assert.equal(B().page(a, a.start).num, 1, t.id + " start page");
        assert.ok(!deepEqual(a.pages.map((p) => p.num), generate(t, { length: "long", seed: "OTHER-0002" }).pages.map((p) => p.num)), t.id + " numbers ignore the seed");
      });
    });

    test("length and mode change the run: long adds choices, hybrid adds discussion slides and minutes", () => {
      branchingTemplates().forEach((t) => {
        const shortPure = generate(t, { length: "short", mode: "pure" });
        const longHybrid = generate(t, { length: "long", mode: "hybrid" });
        assert.ok(longHybrid.pacing.choiceRange[1] > shortPure.pacing.choiceRange[1], t.id + " long adds no choices");
        assert.ok(longHybrid.pacing.totalMinutes > shortPure.pacing.totalMinutes, t.id + " minutes");
        const seen = (inst) => {
          let n = 0;
          window.BKTest.walk.branching(inst, T0, (s) => S().locate(s).slide.type === "discussion" && n++, 1);
          return n;
        };
        assert.equal(seen(shortPure), 0, t.id + " pure mode shows discussion slides");
        assert.ok(seen(longHybrid) > 0, t.id + " hybrid mode shows no discussion slides");
      });
    });
  });

  suite("branching session", () => {
    const b01 = () => generate(BK.scenarios.get("b01-lost-laptop"), { length: "short" });
    const toChoice = (s) => {
      for (let i = 0; i < 40 && S().locate(s).slide.type !== "choice"; i++) s = S().apply(s, { type: "next" }, T0 + i);
      return s;
    };

    test("next stops on an unmade choice; choosing moves to the landing page and logs the decision", () => {
      let s = toChoice(S().create(b01(), T0));
      const at = s.position.slideId;
      assert.equal(S().apply(s, { type: "next" }, T0).position.slideId, at, "next passed an unmade choice");
      const opts = B().offered(B().page(s.instance, "c1").choice, s.flags);
      s = S().apply(s, { type: "choose", option: opts[0].key }, T0 + 5000);
      assert.equal(S().locate(s).slide.type, "page");
      assert.equal(s.decisions.c1.option, opts[0].key);
      assert.ok(s.flags.includes("sessionsRevoked"), "option flag set");
      assert.equal(s.route.length, 2);
    });

    test("digit keys choose only on a choice slide; prev/next walk back over a made choice without undoing it", () => {
      let s = S().create(b01(), T0);
      s = S().apply(s, { type: "gotoStage", index: 1 }, T0);
      assert.equal(s.route.length, 1, "digit chose on the title slide");
      s = toChoice(s);
      s = S().apply(s, { type: "gotoStage", index: 1 }, T0);
      assert.equal(s.route[0].option, B().offered(B().page(s.instance, "c1").choice, [])[1].key, "digit 2 chose the second option");
      s = S().apply(s, { type: "prev" }, T0);
      assert.equal(S().locate(s).slide.type, "choice");
      s = S().apply(s, { type: "next" }, T0);
      assert.equal(S().locate(s).slide.type, "page", "next over a made choice");
      assert.equal(s.route.length, 2);
    });

    test("undo restores route, flags, decisions and the choice slide", () => {
      let s = toChoice(S().create(b01(), T0));
      const before = JSON.stringify({ route: s.route, flags: s.flags, decisions: s.decisions });
      s = S().apply(s, { type: "choose", option: "A" }, T0);
      s = S().apply(s, { type: "unchoose" }, T0);
      assert.equal(JSON.stringify({ route: s.route, flags: s.flags, decisions: s.decisions }), before);
      assert.equal(S().locate(s).slide.id, "choice:c1");
      assert.deepEqual(S().apply(s, { type: "unchoose" }, T0).route, s.route, "nothing to undo is a no-op");
    });

    test("short runs skip long pages; long runs visit them", () => {
      const pagesOn = (inst) => window.BKTest.walk.branching(inst, T0, null, 1)[0].route.map((r) => r.pageId);
      const short = pagesOn(b01());
      const long = pagesOn(generate(BK.scenarios.get("b01-lost-laptop"), { length: "long" }));
      assert.ok(!short.some((id) => B().page(b01(), id).long), "short run visited a long page");
      assert.ok(long.length > short.length, "long run is not longer");
    });

    test("an ended session cannot choose", () => {
      let s = toChoice(S().create(b01(), T0));
      s = S().apply(s, { type: "end" }, T0);
      assert.equal(S().apply(s, { type: "choose", option: "A" }, T0).route.length, 1);
    });

    test("scorecard criteria follow the choices made", () => {
      const s = window.BKTest.walk.branching(b01(), T0, null, 1)[0];
      const crit = S().criteria(s.instance, s);
      assert.equal(crit.length, s.route.filter((r) => r.option).length);
      assert.ok(crit.every((c) => BK.loc(c.text).length > 0));
    });
  });

  // ---- Confidentiality ------------------------------------------------------------------------------

  /** Facilitator-only strings (> 12 characters) of a branching instance, both languages. */
  function facilitatorStrings(inst) {
    const out = [];
    const add = (v) => v && ["en", "sv"].forEach((l) => v[l] && v[l].length > 12 && out.push(v[l]));
    inst.pages.forEach((pg) => {
      if (pg.facilitator) {
        add(pg.facilitator.notes);
        add(pg.facilitator.expected);
        (pg.facilitator.hints || []).forEach(add);
      }
      if (pg.choice) {
        add(pg.choice.strong);
        pg.choice.options.forEach((o) => add(o.why));
      }
      pg.injects.forEach((i) => {
        add(i.facilitatorNote);
        add(i.expectedResponse);
      });
    });
    Object.values(inst.flagLabels || {}).forEach(add);
    return out;
  }

  /** Participant text of one page (> 12 characters): visible only once the room is there. */
  function pageStrings(pg) {
    const out = [];
    const add = (v) => v && ["en", "sv"].forEach((l) => v[l] && v[l].length > 12 && out.push(v[l]));
    add(pg.narrative);
    pg.variants.forEach((v) => {
      add(v.narrative);
      add(v.because);
    });
    if (pg.choice) {
      add(pg.choice.question);
      pg.choice.options.forEach((o) => add(o.text));
    }
    if (pg.ending) {
      add(pg.ending.label);
      add(pg.ending.summary);
    }
    pg.injects.forEach((i) => add(i.content));
    return out;
  }

  function stageSurface(p) {
    const node = BK.ui.stageRenderer.renderCanvas(p, {});
    const attrs = [];
    [node].concat(Array.from(node.querySelectorAll("*"))).forEach((n) => Array.from(n.attributes).forEach((a) => attrs.push(a.value)));
    return node.textContent + "\n" + attrs.join("\n");
  }

  suite("branching confidentiality", () => {
    test("no facilitator text, flag or unvisited page reaches the projection or stage DOM (every option taken, both lengths, both languages)", () => {
      const leaks = new Set();
      const check = (ok, msg) => ok || leaks.add(msg);
      branchingTemplates().forEach((t) =>
        ["short", "long"].forEach((length) => {
          const inst = generate(t, { length, mode: "hybrid", injectDensity: "high", audience: "mixed", difficulty: "advanced" });
          const secrets = facilitatorStrings(inst);
          window.BKTest.walk.branching(inst, T0, (s) => {
            const visited = new Set(s.route.map((r) => r.pageId));
            // Text shared with a visited page (repeated wording) may legitimately be on screen.
            const seen = [].concat(...inst.pages.filter((pg) => visited.has(pg.id)).map(pageStrings));
            const hidden = [].concat(...inst.pages.filter((pg) => !visited.has(pg.id)).map(pageStrings)).filter((x) => !seen.some((y) => y.includes(x)));
            ["en", "sv"].forEach((lang) => {
              const p = S().project(Object.assign({}, s, { lang }), T0);
              const json = JSON.stringify(p);
              const dom = stageSurface(p);
              const where = t.id + " " + length + " at " + p.slide.id + " (" + lang + ")";
              ['"flags"', '"why"', '"strong"', '"route"', '"facilitator', '"if"'].forEach((k) => check(!json.includes(k), k + " key in projection, " + where));
              secrets.forEach((x) => check(!json.includes(x) && !dom.includes(x), "facilitator text, " + where + ": " + x.slice(0, 40)));
              hidden.forEach((x) => check(!json.includes(x) && !dom.includes(x), "unvisited page text, " + where + ": " + x.slice(0, 40)));
            });
          }, 40);
        })
      );
      assert.ok(!leaks.size, leaks.size + " leak(s):\n" + Array.from(leaks).slice(0, 30).join("\n"));
    });
  });

  // ---- Import / export ---------------------------------------------------------------------------------

  suite("debrief route map", () => {
    test("decision points list the options and mark the room's choice; the stage map has no tooltips", () => {
      const s = window.BKTest.walk.branching(generate(BK.scenarios.get("b01-lost-laptop"), { length: "short" }), T0, null, 1)[0];
      const r = BK.io.export.report(s, "en");
      const pts = r.branch.points;
      const reached = Object.keys(pts).filter((k) => pts[k].reached);
      assert.equal(reached.length, r.decisions.length, "one reached point per choice made");
      assert.ok(Object.keys(pts).some((k) => !pts[k].reached), "unreached decisions are listed too");
      reached.forEach((k) => assert.ok(pts[k].options.some((o) => o.key === pts[k].chosen), "chosen option offered at § " + k));
      const host = document.createElement("div");
      host.className = "routemap-wrap";
      document.body.appendChild(host);
      try {
        const map = BK.graphics.routeMap(r.branch.map, { lang: "en", title: "Route", titles: r.branch.titles, points: pts, spread: true });
        host.appendChild(map);
        const node = map.querySelector(".rm-node--point.is-visited[tabindex]");
        assert.ok(node, "focusable decision point");
        node.dispatchEvent(new FocusEvent("focus"));
        const tip = host.querySelector(".rm-tip");
        assert.ok(tip && !tip.hidden, "tooltip shown on focus");
        assert.ok(tip.querySelector(".rm-tip__opt.is-chosen"), "chosen option marked");
        assert.ok(tip.querySelectorAll(".rm-tip__opt").length >= 2, "options listed");
        node.dispatchEvent(new FocusEvent("blur"));
        assert.ok(tip.hidden, "tooltip hidden on blur");
        const stageMap = BK.graphics.routeMap(r.branch.map, { lang: "en", title: "Route" });
        assert.ok(!stageMap.querySelector("[tabindex]") && stageMap.getAttribute("role") === "img", "stage map stays a plain image");
      } finally {
        host.remove();
      }
    });
  });

  suite("branching import", () => {
    const session = () => window.BKTest.walk.branching(generate(BK.scenarios.get("b01-lost-laptop"), { length: "short" }), T0, null, 1)[0];

    test("a finished branching session round-trips through JSON export and import", () => {
      const s = session();
      const ex = Object.assign({ id: s.exerciseId }, s.instance);
      const back = BK.io.import.validate(BK.io.export.toJSON(ex, s));
      assert.equal(back.exercise.format, "branching");
      assert.deepEqual(back.session.route.map((r) => r.pageId), s.route.map((r) => r.pageId));
      assert.deepEqual(back.session.flags, s.flags);
      const r = BK.io.export.report(back.session, "en");
      assert.ok(r.branch && r.branch.ending, "report has the ending");
    });

    test("a tampered route or flag list is rejected", () => {
      const s = session();
      const ex = Object.assign({ id: s.exerciseId }, s.instance);
      const bad1 = JSON.parse(BK.io.export.toJSON(ex, s));
      bad1.session.route[1].pageId = "c9"; // jumps the map
      assert.throws(() => BK.io.import.validate(JSON.stringify(bad1)), "route jump accepted");
      const bad2 = JSON.parse(BK.io.export.toJSON(ex, s));
      bad2.session.flags.push("ghostFlag");
      assert.throws(() => BK.io.import.validate(JSON.stringify(bad2)), "invented flag accepted");
    });

    test("a schema version 1 (discussion) export still imports", () => {
      const tpl = BK.scenarios.get("s01-ransomware-vpn");
      const ex = Object.assign({ id: "ex-v1" }, BK.engine.generator.generate(tpl, { seed: "OLD-0001", stageCount: 4 }));
      const json = JSON.parse(BK.io.export.toJSON(ex, null));
      json.schemaVersion = 1;
      json.exercise.schemaVersion = 1;
      delete json.exercise.format;
      assert.ok(BK.io.import.validate(JSON.stringify(json)).exercise);
    });
  });
})();
