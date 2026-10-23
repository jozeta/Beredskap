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

  suite("help guide", () => {
    test("every help topic has a title, an icon in the sprite and text in both languages", () => {
      const seen = new Set();
      const both = (v, where) => assert.ok(v && typeof v.en === "string" && v.en.trim() && typeof v.sv === "string" && v.sv.trim(), "missing language in " + where);
      BK.data.help.SECTIONS.forEach((s) => {
        assert.ok(!seen.has(s.id), "duplicate topic " + s.id);
        seen.add(s.id);
        assert.ok(BK.icons.names.includes(s.icon), "unknown icon " + s.icon);
        both(s.title, s.id);
        s.blocks.forEach((b, i) => {
          const w = s.id + " block " + (i + 1);
          ["p", "tip"].forEach((k) => b[k] && both(b[k], w));
          ["list", "steps"].forEach((k) => b[k] && b[k].forEach((x) => both(x, w)));
          if (b.terms) b.terms.forEach(([a, d]) => (both(a, w), both(d, w)));
        });
      });
      ["start", "setup", "builder", "run", "keys", "debrief", "exports"].forEach((id) => assert.ok(seen.has(id), "topic missing: " + id));
    });

    test("the help search filters topics and the keyboard topic shows the real shortcut list", () => {
      const host = document.createElement("div");
      document.body.appendChild(host);
      try {
        BK.ui.help.render(host, { params: {}, query: {} });
        assert.ok(host.querySelector("#help-keys .shortcut-list kbd"), "shortcut list rendered");
        const input = host.querySelector("#help-search");
        input.value = "complication";
        input.dispatchEvent(new Event("input"));
        const visible = Array.from(host.querySelectorAll(".help__section")).filter((n) => !n.hidden).map((n) => n.dataset.topic);
        assert.ok(visible.includes("pressure") && visible.length < BK.data.help.SECTIONS.length, "filtered to " + visible.join(","));
        input.value = "zzqx-nothing";
        input.dispatchEvent(new Event("input"));
        assert.ok(!host.querySelector(".help__empty").hidden, "no-match message shown");
      } finally {
        host.remove();
      }
    });
  });

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

    test("builder: edits made after an autosave are kept, and leaving the builder never brings back a deleted deck", async () => {
      const d = C().normaliseDeck({ id: "deck-edit-test", title: "Edit test", lang: "en", slides: [C().fromTemplate("text", "en"), C().fromTemplate("chat", "en")] });
      BK.store.putItem("deck", d);
      const host = document.createElement("div");
      document.body.appendChild(host);
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const type = (node, text) => {
        node.textContent = text;
        node.dispatchEvent(new Event("input", { bubbles: true }));
      };
      try {
        BK.ui.builder.render(host, { params: { deckId: d.id }, query: {} });
        type(host.querySelector(".builder__canvas .cs-h1, .builder__canvas .cs-h2"), "First edit");
        await wait(650); // past the autosave
        type(host.querySelector(".builder__canvas .cs-text"), "Second edit");
        await wait(650);
        let stored = BK.store.getItem("deck", d.id);
        assert.equal(C().runsText(stored.slides[0].blocks[0].runs), "First edit");
        assert.ok(stored.slides[0].blocks.some((b) => b.type === "text" && C().runsText(b.runs) === "Second edit"), "second edit lost");
        // Artefact fields: two edits in a row on the chat slide both survive.
        host.querySelectorAll(".builder__thumb-btn")[1].click();
        const fields = host.querySelectorAll(".builder__canvas .cs-editable");
        assert.ok(fields.length >= 2, "editable artefact fields");
        type(fields[0], "Field A");
        await wait(650);
        type(fields[1], "Field B");
        BK.ui.builder.unmount();
        stored = BK.store.getItem("deck", d.id);
        const json = JSON.stringify(stored.slides[1].inject);
        assert.ok(json.includes("Field A") && json.includes("Field B"), "artefact edits lost: " + json.slice(0, 200));
        // Deleted elsewhere, then the builder is opened on it and left: it must stay deleted.
        BK.store.removeItem("deck", d.id);
        host.textContent = "";
        BK.ui.builder.render(host, { params: { deckId: d.id }, query: {} });
        BK.ui.builder.unmount();
        assert.equal(BK.store.getItem("deck", d.id), null, "deleted deck came back");
      } finally {
        BK.ui.builder.unmount();
        BK.store.removeItem("deck", d.id);
        host.remove();
      }
    });

    test("opening a custom exercise in the editor sends it to the builder, rebuilding a missing deck from its slides", () => {
      const d = deck();
      const ex = C().toExercise(d);
      assert.equal(ex.id, "ex-" + d.id, "one exercise per deck");
      ex.deckId = "deck-gone";
      BK.store.putItem("exercise", ex);
      const before = window.location.hash;
      const host = document.createElement("div");
      try {
        BK.ui.editor.render(host, { params: { instanceId: ex.id }, query: {} });
        const again = BK.store.getItem("exercise", ex.id);
        assert.ok(again.deckId && again.deckId !== "deck-gone", "exercise points at the rebuilt deck");
        const rebuilt = BK.store.getItem("deck", again.deckId);
        assert.ok(rebuilt && rebuilt.slides.length === d.slides.length, "deck rebuilt with every slide");
        assert.ok(window.location.hash.indexOf("#/builder/" + again.deckId) === 0, "redirected to the builder");
        assert.equal(host.textContent, "", "the editor itself did not render");
        BK.store.removeItem("deck", again.deckId);
      } finally {
        BK.store.removeItem("exercise", ex.id);
        window.history.replaceState(null, "", before || "#");
      }
    });

    test("count strings use the singular for exactly one", () => {
      assert.equal(BK.t("history.observations", { n: 1 }, "en"), "1 observation");
      assert.equal(BK.t("history.observations", { n: 2 }, "en"), "2 observations");
      assert.equal(BK.t("history.observations", { n: 1 }, "sv"), "1 observation");
      assert.equal(BK.t("history.observations", { n: 0 }, "sv"), "0 observationer");
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
