/*
 * graphics.test.js — Phase 4: icon set and emblems, chart renderers (every
 * chart s01 can produce, in both languages), artefact renderers for every
 * inject type, seeded title artwork, accessibility affordances.
 */
(function () {
  "use strict";

  const { suite, test, assert } = window.BKTest;
  const BK = window.BK;
  const S = () => BK.engine.session;

  const SPEC_ICONS = "shield, shield-alert, bug, skull-lock, hook, mail, mail-alert, user, users, user-secret, server, database, cloud, cloud-off, network, wifi-off, globe, flood, key, lock, unlock, fingerprint, eye, eye-off, terminal, code-branch, package, factory, hospital, phone, sms, newspaper, megaphone, scale, coins, clock, hourglass, timeline, flag, decision, question, lightbulb, check, cross, warning, fire, power, thermometer, link, dns, chart-line, chart-bar, gauge, play, pause, next, prev, fullscreen, sun, moon, globe-lang, settings, dice, save, download, print, edit, notes, verified, unverified, misleading, disputed".split(", ");

  /** Projected data slides for every chart of an s01 configuration. */
  function projectedCharts(params) {
    const inst = BK.engine.generator.generate(BK.scenarios.get("s01-ransomware-vpn"), Object.assign({ seed: "FJORD-4821", stageCount: 8, injectDensity: "high" }, params));
    let s = S().create(Object.assign({ id: "ex-g" }, inst), 0);
    const out = [];
    for (let i = 0; i < 400; i++) {
      const p = S().project(s, 0);
      if (p.slide.type === "data") out.push(p);
      if (p.slide.type === "debrief") break;
      s = S().apply(s, { type: "next" }, i);
    }
    return out;
  }

  suite("icons and emblems", () => {
    test("every icon named in the spec exists", () => {
      const missing = SPEC_ICONS.filter((n) => !BK.icons.has(n));
      assert.deepEqual(missing, []);
    });

    test("an emblem for every scenario, and s01's emblem is one of them", () => {
      assert.ok(BK.icons.emblems.length >= BK.scenarios.count(), BK.icons.emblems.length + " emblems for " + BK.scenarios.count() + " scenarios");
      assert.ok(BK.icons.hasEmblem(BK.scenarios.get("s01-ransomware-vpn").emblem));
    });

    test("unknown emblem falls back to the shield icon", () => {
      const node = BK.dom.emblem("no-such-emblem");
      assert.equal(node.querySelector("use").getAttribute("href"), "#i-shield");
    });

    test("the sprite is injected once and contains icons and emblems", () => {
      BK.icons.inject();
      BK.icons.inject();
      assert.equal(document.querySelectorAll("#bk-sprite").length, 1);
      assert.ok(document.getElementById("i-skull-lock") && document.getElementById("e-skull-lock"));
    });
  });

  suite("charts", () => {
    test("every s01 chart renders in both languages with title, description and data table", () => {
      const seen = new Set();
      ["technical", "executive"].forEach((audience) =>
        ["en", "sv"].forEach((lang) =>
          projectedCharts({ audience, lang }).forEach((p) => {
            const node = BK.graphics.chart(p.slide.chart, p);
            assert.ok(node, "no renderer for " + p.slide.chart.type);
            seen.add(p.slide.chart.type);
            const html = node.outerHTML;
            assert.ok(!/NaN|undefined|Infinity/.test(html), p.slide.chart.id + " has invalid numbers");
            const svgEl = node.querySelector("svg.chart-svg");
            if (!svgEl) assert.ok(node.querySelector("[role=list][aria-label]"), "KPI tiles need an accessible label");
            if (svgEl) {
              assert.ok(svgEl.querySelector("title").textContent.length > 0, "missing <title> in " + p.slide.chart.id);
              assert.ok(svgEl.querySelector("desc").textContent.length > 0, "missing <desc> in " + p.slide.chart.id);
              assert.ok(node.querySelector("table.sr-only"), "missing data table in " + p.slide.chart.id);
            }
          })
        )
      );
      ["line", "bar", "kpi", "blast", "dependency", "donut", "rto"].forEach((type) => assert.ok(seen.has(type), "s01 never produced a " + type + " chart"));
    });

    test("charts with two or more series have a legend; single series do not", () => {
      const p = { lang: "en", slide: {} };
      const two = BK.graphics.chart({ type: "bar", title: "x", data: { categories: [1, 2], series: [{ label: "A", values: [1, 2] }, { label: "B", values: [2, 1] }] } }, p);
      const one = BK.graphics.chart({ type: "line", title: "y", data: { series: [{ label: "A", points: [[0, 1], [1, 2]] }] } }, p);
      assert.ok(two.querySelector(".c-legend"));
      assert.ok(!one.querySelector(".c-legend"));
    });

    test("categorical series use fixed slots; status tones only when declared", () => {
      const node = BK.graphics.chart({ type: "bar", title: "x", data: { categories: [1], series: [{ label: "A", values: [1] }, { label: "B", values: [1] }, { label: "C", values: [1], tone: "warn" }] } }, { lang: "en", slide: {} });
      const cls = Array.from(node.querySelectorAll("rect.c-bar")).map((r) => r.getAttribute("class"));
      assert.ok(cls[0].includes("c-s1") && cls[1].includes("c-s2") && cls[2].includes("c-warn"));
    });

    test("only released inject markers are drawn", () => {
      const ps = projectedCharts({ audience: "technical" });
      const line = ps.find((p) => p.slide.chart.type === "line" && p.slide.chart.id === "c1-filemods");
      assert.ok(line);
      line.slide.chart.markers.forEach((m) => assert.ok(m.label.length > 0));
    });

    test("gauge and incident timeline render", () => {
      const g = BK.graphics.chart({ type: "gauge", title: "Availability", data: { value: 62, max: 100, label: "%" } }, { lang: "sv", slide: {} });
      assert.ok(g.querySelector("svg path.c-gauge"));
      const tl = BK.graphics.charts.timeline({ title: "T", events: [{ at: -7200, label: "VPN login", kind: "attacker" }, { at: 0, label: "Ticket", kind: "inject" }, { at: 30, label: "Disconnect", kind: "decision" }] }, "en");
      assert.equal(tl.querySelectorAll(".c-tl").length, 3);
      assert.ok(tl.querySelector(".c-tl--decision rect"), "decisions are diamonds");
    });

    test("nice ticks cover the range", () => {
      const r = BK.graphics.charts.niceTicks(0, 1937, 5);
      assert.ok(r.lo <= 0 && r.hi >= 1937 && r.ticks.length >= 3);
    });
  });

  suite("artefacts", () => {
    function inj(type, extra) {
      return Object.assign({ id: "x", type, typeLabel: BK.t("injectType." + type), time: "17:20", source: "Ana Silva, CISO", headline: "Headline " + type, content: "Body text for " + type + ". Second sentence.", meta: { from: "a@b.example", subject: "Subject" }, statedReliability: "", severity: "high", severityLabel: "High" }, extra || {});
    }

    test("every inject type renders a mock-up containing its content", () => {
      BK.data.options.injectTypes.forEach((type) => {
        const node = BK.graphics.artefact(inj(type), "en");
        assert.ok(node, "no artefact for " + type);
        assert.ok(node.textContent.includes("Body text for " + type), type + " lost its content");
      });
    });

    test("hostile content stays inert in every artefact", () => {
      const hostile = '<img src=x onerror="window.__pwned=1"><script>window.__pwned=1</script>';
      BK.data.options.injectTypes.forEach((type) => {
        const node = BK.graphics.artefact(inj(type, { content: hostile, headline: hostile, source: hostile, meta: { from: hostile, subject: hostile } }), "en");
        assert.equal(node.querySelectorAll("img, script").length, 0, type);
      });
      assert.ok(!window.__pwned);
    });

    test("narration and speech are split: the caption carries who, the bubble carries the words", () => {
      ["chat", "phoneTranscript", "sms", "email", "socialPost"].forEach((type) => {
        const node = BK.graphics.artefact(inj(type, { content: "The CEO calls from the car: “Is this serious?”" }), "en");
        const said = node.querySelector(".a-msg__bubble, .a-callscreen__quote, .a-phone__bubble, .a-mail__body, .a-post__text");
        assert.equal(said.textContent, "Is this serious?", type);
        assert.ok(node.textContent.includes("The CEO calls from the car"), type + " lost the narration");
      });
      const plain = BK.graphics.artefact(inj("chat", { content: "No quote here: just a note." }), "en");
      assert.equal(plain.querySelector(".a-msg__bubble").textContent, "No quote here: just a note.");
    });

    test("a two-way thread renders one turn per message, on its own side, and stays inert", () => {
      const hostile = '<img src=x onerror="window.__pwned=1">';
      const meta = { thread: [{ side: "out", name: "On call", text: "Was that you?" }, { side: "in", text: hostile }] };
      ["chat", "sms", "phoneTranscript"].forEach((type) => {
        const node = BK.graphics.artefact(inj(type, { meta }), "en");
        assert.ok(node.textContent.includes("Was that you?") && node.textContent.includes(hostile), type);
        assert.equal(node.querySelectorAll("img").length, 0, type);
        assert.equal(node.querySelectorAll(".a-msg--out, .a-phone__bubble--out, .is-out").length, 1, type + " out turn");
        assert.equal(node.querySelectorAll(".a-msg--in, .a-phone__bubble--in, .is-in").length, 1, type + " in turn");
      });
    });

    test("people get initials, organisations an icon avatar", () => {
      const person = BK.graphics.artefact(inj("chat", { sourceKind: "person", speaker: { name: "Ana Silva", title: "CISO" } }), "en");
      const org = BK.graphics.artefact(inj("email", { sourceKind: "bank", source: "Bank", speaker: null }), "en");
      assert.equal(person.querySelector(".a-avatar").textContent, "AS");
      assert.ok(org.querySelector(".a-avatar svg"), "bank avatar is an icon");
    });

    test("stated reliability is shown only when the source states it", () => {
      const a = BK.graphics.artefact(inj("threatIntel", { statedReliability: "Assessed as likely" }), "en");
      const b = BK.graphics.artefact(inj("threatIntel"), "en");
      assert.ok(a.textContent.includes("Assessed as likely"));
      assert.ok(!b.querySelector(".a-reliability"));
    });
  });

  suite("title artwork", () => {
    test("same seed gives the same artwork; a different seed changes it", () => {
      const a = BK.graphics.artwork({ seed: "FJORD-4821", categoryId: "ransomware" }).outerHTML;
      const b = BK.graphics.artwork({ seed: "FJORD-4821", categoryId: "ransomware" }).outerHTML;
      const c = BK.graphics.artwork({ seed: "BIRCH-1000", categoryId: "ransomware" }).outerHTML;
      assert.equal(a, b);
      assert.notEqual(a, c);
    });

    test("artwork is decorative and coloured by category", () => {
      const node = BK.graphics.artwork({ seed: "X", categoryId: "supply-chain" });
      assert.equal(node.getAttribute("aria-hidden"), "true");
      assert.ok(node.style.getPropertyValue("--art").includes("series-3"));
    });

    test("every category has a hue", () => {
      BK.data.options.categories.forEach((cat) => assert.ok(BK.graphics.CATEGORY_HUE[cat], cat));
    });
  });
})();
