/*
 * facilitation.test.js — Phase 5: decision/observation/objective/scorecard
 * commands, report model, Markdown and CSV exports, JSON export → import
 * round trip, hostile and malformed imports, editing operations, print documents.
 */
(function () {
  "use strict";

  const { suite, test, assert, deepEqual } = window.BKTest;
  const BK = window.BK;
  const S = () => BK.engine.session;
  const T0 = Date.UTC(2026, 9, 21, 10, 0, 0);

  function exercise(params) {
    const inst = BK.engine.generator.generate(BK.scenarios.get("s01-ransomware-vpn"), Object.assign({ seed: "FJORD-4821", stageCount: 4, jurisdiction: "se" }, params || {}));
    return Object.assign({ id: "ex-fx", createdAt: "2026-10-21T10:00:00.000Z", updatedAt: "2026-10-21T10:00:00.000Z", edited: false }, inst);
  }

  /** A session with a realistic set of facilitation records. */
  function richSession(params) {
    let s = S().create(exercise(params), T0);
    const cmds = [
      { type: "decision", decisionId: "d1", entry: { option: "B", text: "Koppla bort VPN — nattskiftet får vänta", rationale: "Stoppa spridningen", dissent: "Verksamheten ville vänta", openQuestions: "Vem informerar kunderna i natt?", owner: "incidentCommander" } },
      { type: "observationAdd", entry: { observation: "Ingen visste vem som får stoppa nattskiftet", category: "authority", impact: "20 minuters fördröjning", action: "Dokumentera mandat utanför kontorstid", owner: "ceo", priority: "high", due: "2026-12-01", status: "open" } },
      { type: "observationAdd", entry: { observation: "Bra eskalering till SOC", category: "escalation", status: "closed" } },
      { type: "objective", objectiveId: "lo1", status: "partial", note: "Beslut fattades men sent" },
      { type: "score", criterionId: "d1-e1", rating: "partly", comment: "Mandatet var oklart" },
      { type: "notes", text: "Åäö fungerar." }
    ];
    cmds.forEach((c, i) => (s = S().apply(s, c, T0 + i * 1000)));
    return s;
  }

  suite("facilitation: session records", () => {
    test("decision log keeps every field", () => {
      const d = richSession().decisions.d1;
      ["option", "text", "rationale", "dissent", "openQuestions", "owner", "at"].forEach((k) => assert.ok(d[k], "missing " + k));
    });

    test("observations can be added, updated and removed", () => {
      let s = richSession();
      assert.equal(s.observations.length, 2);
      const id = s.observations[0].id;
      s = S().apply(s, { type: "observationUpdate", id, patch: { status: "inProgress", id: "hijack" } }, T0);
      assert.equal(s.observations[0].status, "inProgress");
      assert.equal(s.observations[0].id, id, "id cannot be overwritten by a patch");
      s = S().apply(s, { type: "observationRemove", id }, T0);
      assert.equal(s.observations.length, 1);
    });

    test("objectives, scorecard and notes are stored", () => {
      const s = richSession();
      assert.equal(s.objectives.lo1.status, "partial");
      assert.equal(s.scorecard["d1-e1"].rating, "partly");
      assert.equal(s.notes, "Åäö fungerar.");
    });

    test("scorecard criteria come from the decisions' evaluation criteria", () => {
      const crit = S().criteria(exercise());
      assert.ok(crit.length >= 4);
      assert.ok(crit.every((c) => /^d\d+-e\d+$/.test(c.id)));
    });
  });

  suite("improvement plan", () => {
    test("actions are added, normalised, updated, completed and removed", () => {
      let s = richSession();
      s = S().apply(s, { type: "actionAdd", entry: { text: "  Write an out-of-hours mandate  ", owner: "CEO", due: "2026-12-01", verify: "Signed by the board", priority: "high", status: "bogus", extra: "dropped" } }, T0);
      const a = s.actions[0];
      assert.equal(a.text, "Write an out-of-hours mandate");
      assert.equal(a.status, "open", "unknown status falls back to open");
      assert.ok(!("extra" in a), "unknown fields are dropped");
      s = S().apply(s, { type: "actionUpdate", id: a.id, patch: { status: "done", due: "not a date" } }, T0 + 5000);
      assert.equal(s.actions[0].status, "done");
      assert.ok(s.actions[0].doneAt, "completion time recorded");
      assert.equal(s.actions[0].due, "", "invalid date cleared");
      s = S().apply(s, { type: "actionRemove", id: a.id }, T0);
      assert.equal(s.actions.length, 0);
    });

    test("the report lists the plan, then suggestions not yet adopted", () => {
      let s = richSession();
      const before = BK.io.export.report(s, "en").actions;
      assert.ok(before.some((x) => x.kind === "observation") && before.some((x) => x.kind === "suggested"));
      const sug = before.find((x) => x.kind === "suggested");
      s = S().apply(s, { type: "actionAdd", entry: { text: sug.text, source: "suggested", sourceRef: sug.id } }, T0);
      const after = BK.io.export.report(s, "en").actions;
      assert.equal(after[0].kind, "plan");
      assert.ok(!after.some((x) => x.kind === "suggested" && x.id === sug.id), "adopted suggestion no longer listed separately");
    });

    test("action plan CSV, Markdown and import round trip", () => {
      let s = richSession();
      s = S().apply(s, { type: "actionAdd", entry: { text: "Test restores quarterly", owner: "IT", verify: "Restore within 8 h", due: "2027-01-15" } }, T0);
      const csv = BK.io.export.csv(s, "actions", "en");
      assert.ok(csv.includes("Test restores quarterly") && csv.includes("Restore within 8 h"));
      assert.ok(BK.io.export.markdown(s, "en").includes("Restore within 8 h"));
      const ex = Object.assign({ id: s.exerciseId }, s.instance);
      const res = BK.io.import.validate(BK.io.export.toJSON(ex, s));
      assert.ok(deepEqual(res.session.actions, s.actions), "actions survive export and import");
      const bad = JSON.parse(BK.io.export.toJSON(ex, s));
      bad.session.actions[0].status = "<script>";
      let reason = null;
      try { BK.io.import.validate(JSON.stringify(bad)); } catch (err) { reason = err.reason; }
      assert.equal(reason, "shape", "unknown action status is rejected");
    });
  });

  suite("report and exports", () => {
    test("report collects decisions, unresolved risks and actions", () => {
      const r = BK.io.export.report(richSession(), "sv");
      const d1 = r.decisions.find((d) => d.id === "d1");
      assert.ok(d1.recorded && d1.option.startsWith("B — "));
      assert.ok(r.unresolved.some((u) => u.text === "Vem informerar kunderna i natt?"), "open question listed");
      assert.ok(r.unresolved.some((u) => u.text.includes("nattskiftet")), "open observation listed");
      assert.ok(!r.unresolved.some((u) => u.text === "Bra eskalering till SOC"), "closed observation not listed");
      assert.ok(r.unresolved.some((u) => u.source === BK.t("report.neverSurfaced", null, "sv")), "hidden facts never surfaced are unresolved");
      assert.ok(r.actions.some((a) => a.kind === "observation") && r.actions.some((a) => a.kind === "suggested"));
    });

    test("Markdown contains the report sections and records, with å/ä/ö intact", () => {
      const md = BK.io.export.markdown(richSession(), "sv");
      ["# ", BK.t("report.decisions", null, "sv"), BK.t("report.observations", null, "sv"), BK.t("report.scorecardNote", null, "sv"), "Koppla bort VPN — nattskiftet får vänta", "Dokumentera mandat utanför kontorstid", "T1486"].forEach((s) =>
        assert.ok(md.includes(s), "missing: " + s)
      );
    });

    test("CSV: BOM, locale separator, quoting and formula-injection guard", () => {
      const sv = BK.io.export.csv(richSession(), "decisions", "sv");
      const en = BK.io.export.csv(richSession({ lang: "en" }), "decisions", "en");
      assert.equal(sv.charCodeAt(0), 0xfeff);
      assert.ok(sv.split("\r\n")[0].includes(";"));
      assert.ok(en.split("\r\n")[0].includes(","));
      assert.ok(sv.includes("Koppla bort VPN"));
      assert.equal(BK.io.export.csvCell("=HYPERLINK(1)", ","), "'=HYPERLINK(1)");
      assert.equal(BK.io.export.csvCell('a "b", c', ","), '"a ""b"", c"');
      const obs = BK.io.export.csv(richSession(), "observations", "sv");
      assert.equal(obs.trim().split("\r\n").length, 3, "header + 2 observations");
      const inj = BK.io.export.csv(richSession(), "injects", "sv");
      assert.ok(inj.includes("i1-1"));
    });

    test("export filename follows the spec", () => {
      const name = BK.io.export.filename(exercise(), "json");
      assert.ok(/^beredskap-s01-ransomware-vpn-fjord-4821-\d{4}-\d{2}-\d{2}\.json$/.test(name), name);
    });
  });

  suite("import", () => {
    function strip(ex) {
      const c = JSON.parse(JSON.stringify(ex));
      ["id", "createdAt", "updatedAt", "edited", "imported"].forEach((k) => delete c[k]);
      return c;
    }

    test("JSON export → import round-trip preserves exercise and session", () => {
      const sess = richSession();
      const ex = Object.assign({ id: sess.exerciseId }, sess.instance);
      const res = BK.io.import.validate(BK.io.export.toJSON(ex, sess));
      assert.ok(deepEqual(strip(res.exercise), strip(ex)), "exercise differs");
      ["decisions", "observations", "objectives", "scorecard", "injects", "position", "notes", "lang"].forEach((k) => assert.ok(deepEqual(res.session[k], sess[k]), "session." + k + " differs"));
      assert.notEqual(res.exercise.id, ex.id, "import must use a new id");
      assert.notEqual(res.session.id, sess.id);
      assert.equal(res.session.exerciseId, res.exercise.id);
    });

    test("exercise-only export round-trips", () => {
      const ex = exercise();
      const res = BK.io.import.validate(BK.io.export.toJSON(ex, null));
      assert.equal(res.session, null);
      assert.ok(deepEqual(strip(res.exercise), strip(ex)));
    });

    function rejects(text, reason) {
      try {
        BK.io.import.validate(text);
      } catch (err) {
        assert.equal(err.reason, reason, "wrong reason: " + err.message);
        return;
      }
      assert.ok(false, "expected rejection: " + reason);
    }

    test("malformed input is rejected with a clear reason", () => {
      const good = JSON.parse(BK.io.export.toJSON(exercise(), richSession()));
      rejects("{not json", "json");
      rejects(JSON.stringify(Object.assign({}, good, { schema: "something.else" })), "schema");
      rejects(JSON.stringify(Object.assign({}, good, { schemaVersion: 99 })), "version");
      rejects(JSON.stringify(Object.assign({}, good, { kind: "both" })), "kind");
      const badRef = JSON.parse(JSON.stringify(good));
      badRef.session.injects["no-such-inject"] = { state: "released", stageId: "p1" };
      rejects(JSON.stringify(badRef), "reference");
      const huge = JSON.parse(JSON.stringify(good));
      huge.exercise.stages[0].narrative.en = "x".repeat(25000);
      rejects(JSON.stringify(huge), "size");
      const broken = JSON.parse(JSON.stringify(good));
      broken.exercise.stages[1].twist = null;
      rejects(JSON.stringify(broken), "invalid");
      const badId = JSON.parse(JSON.stringify(good));
      badId.exercise.stages[0].id = "<script>";
      rejects(JSON.stringify(badId), "shape");
    });

    test("prototype pollution keys are dropped", () => {
      const good = JSON.parse(BK.io.export.toJSON(exercise(), null));
      const text = JSON.stringify(good).replace('"schema":', '"__proto__":{"polluted":true},"schema":');
      BK.io.import.validate(text);
      assert.ok(!({}).polluted, "Object.prototype was polluted");
    });

    test("hostile strings are accepted as text and rendered inert", () => {
      const ex = exercise();
      const hostile = '<img src=x onerror="window.__pwned=1">';
      ex.stages[0].narrative = { en: hostile, sv: hostile };
      ex.stages[0].injects[0].content = { en: hostile, sv: hostile };
      const res = BK.io.import.validate(BK.io.export.toJSON(ex, null));
      let s = S().create(res.exercise, T0);
      const host = document.createElement("div");
      for (let i = 0; i < 12; i++) {
        host.appendChild(BK.ui.stageRenderer.renderCanvas(S().project(s, T0), {}));
        s = S().apply(s, { type: "next" }, T0);
      }
      assert.ok(host.textContent.includes(hostile), "text should be shown literally");
      assert.equal(host.querySelectorAll("img").length, 0);
      assert.ok(!window.__pwned);
    });

    test("import stores a new copy and never overwrites; a failed import changes nothing", () => {
      const sess = richSession();
      const ex = Object.assign({ id: sess.exerciseId }, sess.instance);
      const before = BK.store.keys("").length;
      const res = BK.io.import.importText(BK.io.export.toJSON(ex, sess));
      assert.equal(BK.store.keys("").length, before + 2);
      try {
        BK.io.import.importText("{broken");
      } catch (err) {
        /* expected */
      }
      assert.equal(BK.store.keys("").length, before + 2, "failed import must not write");
      BK.store.removeItem("exercise", res.exercise.id);
      BK.store.removeItem("session", res.session.id);
    });
  });

  suite("editing", () => {
    const E = () => BK.engine.edit;

    test("setText changes one language only and marks the exercise edited", () => {
      const ex = exercise();
      const next = E().setText(ex, ["stages", 0, "narrative"], "sv", "Ny berättelse");
      assert.equal(next.stages[0].narrative.sv, "Ny berättelse");
      assert.equal(next.stages[0].narrative.en, ex.stages[0].narrative.en);
      assert.ok(next.edited);
      assert.notEqual(ex.stages[0].narrative.sv, "Ny berättelse", "original untouched");
    });

    test("only optional injects can be excluded, and excluded injects never reach a session", () => {
      const ex = exercise({ injectDensity: "high" });
      const optional = ex.stages[0].injects.find((i) => i.optional);
      const mandatory = ex.stages[0].injects.find((i) => !i.optional);
      assert.equal(E().toggleInject(ex, mandatory.id, false), ex, "mandatory inject unchanged");
      const next = E().toggleInject(ex, optional.id, false);
      const sess = S().create(next, T0);
      assert.ok(!sess.injects[optional.id]);
      assert.ok(!S().slides(sess).some((s) => s.injectId === optional.id));
    });

    test("inject time is clamped to its stage and keeps order, label and markers consistent", () => {
      const ex = exercise({ injectDensity: "high" });
      const id = ex.stages[0].injects[0].id;
      const next = E().setInjectTime(ex, id, 99999);
      const b = E().timeBounds(ex, id);
      const inj = next.stages[0].injects.find((i) => i.id === id);
      assert.equal(inj.at, b.max);
      assert.equal(next.stages[0].injects[next.stages[0].injects.length - 1].id, id, "re-sorted to the end");
      assert.notEqual(inj.atLabel.en, ex.stages[0].injects[0].atLabel.en);
      const marker = next.stages[0].charts[0].markers.find((m) => m.injectId === id);
      if (marker) assert.equal(marker.at, b.max);
    });

    test("slides move only within their stage", () => {
      const ex = exercise();
      const stageSlides = ex.slides.filter((s) => s.stageId === "p1");
      const moved = E().moveSlide(ex, stageSlides[1].id, -1);
      assert.equal(moved.slides.filter((s) => s.stageId === "p1")[0].id, stageSlides[1].id);
      const first = stageSlides[0];
      const blocked = E().moveSlide(ex, first.id, -1); // the slide before belongs to the intro
      assert.equal(blocked, ex);
    });

    test("regenerate keeps the id and changes the stage count; duplicate gets a new id", () => {
      const ex = E().setText(exercise(), ["stages", 0, "title"], "en", "Edited");
      const regen = E().regenerate(ex, { stageCount: 6 });
      assert.equal(regen.id, ex.id);
      assert.equal(regen.stages.length, 6);
      assert.ok(!regen.edited);
      const dup = E().duplicate(ex, { en: "(copy)", sv: "(kopia)" });
      assert.notEqual(dup.id, ex.id);
      assert.ok(dup.title.sv.endsWith("(kopia)"));
    });
  });

  suite("print documents", () => {
    test("facilitator guide is marked confidential and contains facilitator notes", () => {
      const ex = exercise();
      const doc = BK.io.print.guide(ex, "en");
      assert.ok(doc.textContent.includes(BK.t("guide.confidential", null, "en")));
      assert.ok(doc.textContent.includes(ex.stages[0].facilitator.notes.en));
      assert.ok(doc.textContent.includes(ex.hiddenFacts[0].text.en));
    });

    test("role cards give private information only to its role", () => {
      const ex = exercise({ stageCount: 4 });
      const cards = BK.io.print.roleCardData(ex, "en");
      const legal = cards.find((c) => c.role === "legal");
      const itOps = cards.find((c) => c.role === "itOps");
      const ceo = cards.find((c) => c.role === "ceo");
      assert.ok(legal.privateInfo.some((p) => p.text.includes("7.3")));
      assert.ok(itOps.privateInfo.some((p) => p.text.includes("secondary VPN node")));
      assert.equal(ceo.privateInfo.length, 0);
      assert.ok(ceo.decisions.length > 0, "the CEO owns decisions in s01");
      const doc = BK.io.print.roleCards(ex, "en");
      assert.ok(!doc.textContent.includes(ex.stages[0].facilitator.notes.en), "no facilitator notes on role cards");
    });

    test("after-action report contains decisions, scorecard note and the timeline chart", () => {
      const doc = BK.io.print.aar(richSession(), "sv");
      assert.ok(doc.textContent.includes("Koppla bort VPN"));
      assert.ok(doc.textContent.includes(BK.t("report.scorecardNote", null, "sv")));
      assert.ok(doc.querySelector(".chart--timeline svg"));
    });
  });
})();
