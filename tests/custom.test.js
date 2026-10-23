/*
 * custom.test.js — The slide builder's data model: deck normalisation (the only
 * gate for builder and imported content), templates, runs read back from the
 * DOM, custom exercises in the session reducer (timers, notes kept off the
 * stage), and deck / custom-session import and export.
 */
(function () {
  "use strict";

  const { suite, test, assert } = window.BKTest;
  const BK = window.BK;
  const C = () => BK.engine.custom;
  const S = () => BK.engine.session;
  const T0 = Date.UTC(2026, 9, 23, 9, 0, 0);
  const NOTE = "Facilitator only: the backups are fine, let them sweat";

  function deck() {
    const d = C().normaliseDeck({ id: "deck-test", title: "Test deck", lang: "en", slides: ["title", "situation", "questions", "chat-thread", "decision"].map((id) => C().fromTemplate(id, "en")) });
    d.slides[1].notes = NOTE;
    d.slides[2].timerMinutes = 5;
    return d;
  }

  function run(sess, cmds) {
    let now = T0;
    cmds.forEach((c) => (sess = S().apply(sess, c, (now += 1000))));
    return sess;
  }

  suite("custom exercises", () => {
    test("normaliseDeck drops unknown fields, block types and unsafe image sources", () => {
      const d = C().normaliseDeck({
        title: "x".repeat(500),
        evil: "<script>",
        slides: [
          {
            kind: "blocks",
            layout: "nope",
            onclick: "alert(1)",
            blocks: [
              { type: "heading", runs: [{ t: "Hi", b: 1, style: "color:red" }], html: "<img onerror=x>" },
              { type: "marquee", runs: [{ t: "gone" }] },
              { type: "image", src: "javascript:alert(1)" },
              { type: "image", src: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=" },
              { type: "image", src: "data:image/png;base64,iVBORw0KGgo=" }
            ]
          }
        ]
      });
      assert.ok(!("evil" in d), "unknown deck field kept");
      assert.ok(d.title.length <= 160, "title not capped");
      const s = d.slides[0];
      assert.equal(s.layout, "content");
      assert.ok(!("onclick" in s));
      assert.equal(s.blocks[0].runs[0].t, "Hi");
      assert.ok(!("style" in s.blocks[0].runs[0]) && !("html" in s.blocks[0]));
      assert.ok(!s.blocks.some((b) => b.type === "marquee"), "unknown block type kept");
      const srcs = s.blocks.filter((b) => b.type === "image").map((b) => b.src || "");
      assert.ok(!srcs.some((x) => /javascript|svg/.test(x)), "unsafe image source kept: " + srcs.join(","));
      assert.ok(srcs.includes("data:image/png;base64,iVBORw0KGgo="), "safe PNG dropped");
    });

    test("every template builds in both languages and survives normalisation unchanged", () => {
      C().TEMPLATES.forEach((tpl) =>
        ["en", "sv"].forEach((l) => {
          const s = C().fromTemplate(tpl.id, l);
          assert.ok(s && (s.kind === "blocks" || s.kind === "artefact"), tpl.id);
          const again = C().normaliseSlide(JSON.parse(JSON.stringify(s)));
          assert.deepEqual(Object.assign({}, again, { id: s.id }), s, tpl.id + " " + l + " changed on renormalisation");
          assert.ok(C().slideLabel(s, l).length > 0, tpl.id + " has no label");
        })
      );
      assert.ok(C().TEMPLATES.length >= 40, "template catalogue shrank");
      C().GROUPS.forEach((g) => assert.ok(C().TEMPLATES.some((x) => x.group === g), "empty group " + g));
    });

    test("readRuns reads bold, italic, underline and line breaks back from the DOM", () => {
      const runs = [{ t: "Plain " }, { t: "bold", b: 1 }, { t: " and " }, { t: "both", b: 1, i: 1 }, { t: "\nnext line", u: 1 }];
      const p = document.createElement("p");
      BK.ui.customSlide.runNodes(runs).forEach((n) => p.appendChild(n));
      assert.deepEqual(BK.ui.customSlide.readRuns(p), runs);
      const q = document.createElement("p");
      q.appendChild(document.createTextNode("a"));
      const strong = document.createElement("strong");
      strong.textContent = "b";
      q.appendChild(strong);
      const div = document.createElement("div");
      div.textContent = "c";
      q.appendChild(div);
      assert.deepEqual(BK.ui.customSlide.readRuns(q), [{ t: "a" }, { t: "b", b: 1 }, { t: "\nc" }]);
    });

    test("a custom exercise runs slide by slide; a timed slide starts its timer before moving on", () => {
      const ex = Object.assign(C().toExercise(deck()), { id: "ex-custom" });
      assert.equal(ex.format, "custom");
      let s = S().create(ex, T0);
      assert.equal(S().slides(s).length, 5);
      s = run(s, [{ type: "next" }, { type: "next" }]);
      assert.equal(S().locate(s).idx, 2);
      assert.ok(s.timer.durationMs === 5 * 60000, "timer armed from the slide");
      s = run(s, [{ type: "advance" }]);
      assert.equal(S().locate(s).idx, 2, "first advance should start the timer");
      assert.ok(s.timer.runningSince != null, "timer running");
      s = run(s, [{ type: "advance" }]);
      assert.equal(S().locate(s).idx, 3, "second advance moves on");
      assert.deepEqual(S().criteria(s.instance, s), [], "custom runs have no scorecard criteria");
    });

    test("presenter notes never reach the projection or the stage DOM", () => {
      const ex = Object.assign(C().toExercise(deck()), { id: "ex-custom2" });
      let s = S().create(ex, T0);
      s = run(s, [{ type: "next" }]);
      const p = S().project(s, T0);
      assert.ok(!JSON.stringify(p).includes(NOTE), "note in projection");
      const canvas = BK.ui.stageRenderer.renderCanvas(p, { preview: true });
      assert.ok(!canvas.textContent.includes(NOTE), "note in stage DOM");
      assert.equal(S().facilitatorView(s).custom.notes, NOTE, "presenter should still see the note");
    });

    test("the debrief report works for a custom run", () => {
      const ex = Object.assign(C().toExercise(deck()), { id: "ex-custom3" });
      let s = S().create(ex, T0);
      s = run(s, [{ type: "next" }, { type: "observationAdd", entry: { text: "Good call on comms" } }, { type: "end" }]);
      const r = BK.io.export.report(s, "en");
      assert.ok(r, "report built");
      assert.ok(typeof BK.io.export.markdown(s, "en") === "string");
    });

    test("deck export imports back as a new deck; custom sessions round-trip through import", () => {
      const d = deck();
      const text = JSON.stringify({ schema: BK.config.schemaId, schemaVersion: BK.config.schemaVersion, kind: "deck", deck: d });
      const res = BK.io.import.validate(text);
      assert.ok(res.deck && res.deck.id !== d.id, "deck gets a new id");
      assert.equal(res.deck.slides.length, d.slides.length);
      assert.equal(res.deck.slides[1].notes, NOTE);

      const ex = Object.assign(C().toExercise(d), { id: "ex-custom4" });
      const s = run(S().create(ex, T0), [{ type: "next" }]);
      const back = BK.io.import.validate(BK.io.export.toJSON(ex, s));
      assert.equal(back.exercise.format, "custom");
      assert.equal(back.exercise.slides.length, 5);

      // Imported slides are repaired by the same normaliser as edits: unknown blocks go, the rest is plain data.
      const bad = JSON.parse(BK.io.export.toJSON(ex, s));
      bad.exercise.slides[0].blocks[0].type = "script";
      bad.exercise.slides[0].blocks.push({ type: "image", src: "javascript:alert(1)" });
      const fixed = BK.io.import.validate(JSON.stringify(bad)).exercise.slides[0];
      assert.ok(!fixed.blocks.some((b) => b.type === "script"), "unknown block kept");
      assert.ok(!JSON.stringify(fixed).includes("javascript:"), "unsafe image source kept");
      const none = JSON.parse(BK.io.export.toJSON(ex, s));
      none.exercise.slides = [];
      assert.throws(() => BK.io.import.validate(JSON.stringify(none)), "exercise without slides accepted");

      const lost = JSON.parse(BK.io.export.toJSON(ex, s));
      lost.session.position.slideId = "nowhere";
      assert.throws(() => BK.io.import.validate(JSON.stringify(lost)), "unknown position accepted");
    });
  });
})();
