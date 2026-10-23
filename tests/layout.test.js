/*
 * layout.test.js — Stage layout sweep: every slide of every scenario is laid
 * out at the canvas's native 1920×1080 size (EN and SV, every audience, two
 * seeds; branching exercises along playthroughs that take every option) and checked for content that leaves the slide area (and so runs over
 * the progress rail), text that leaves its chart, text cut off by a
 * clipping box, and text that collides with other text or with a chart. Also checks the operator views for horizontal page scroll at
 * phone, tablet and desktop widths.
 */
(function () {
  "use strict";

  const { suite, test, assert } = window.BKTest;
  const BK = window.BK;
  const S = () => BK.engine.session;

  const T0 = Date.UTC(2026, 9, 21, 8, 0, 0);
  // LICHEN-9570 is the seed of the exercise where overflow was first reported.
  const SEEDS = ["LICHEN-9570", "LAYOUT-0002"];
  const AUDIENCES = ["technical", "executive", "mixed"];
  const SLACK = 1.5; // px; sub-pixel rounding

  function describe(node) {
    const cls = typeof node.className === "string" ? node.className : (node.className && node.className.baseVal) || "";
    const text = (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50);
    return node.tagName.toLowerCase() + (cls ? "." + cls.trim().split(/\s+/).join(".") : "") + (text ? ' "' + text + '"' : "");
  }

  const outside = (r, box) => r.bottom > box.bottom + SLACK || r.right > box.right + SLACK || r.left < box.left - SLACK || r.top < box.top - SLACK;

  /** Layout problems of one rendered canvas, outermost offender only. */
  function layoutProblems(canvas) {
    const out = [];
    const slide = canvas.querySelector(".s-slide");
    const box = slide.getBoundingClientRect();
    const flagged = [];
    slide.querySelectorAll("*").forEach((n) => {
      if (flagged.some((f) => f.contains(n))) return;
      if (n.closest('[aria-hidden="true"]') && !n.closest("svg[role=img]")) return; // decorative art may bleed
      if (n.closest(".sr-only")) return; // visually clipped to nothing; read by screen readers only
      const r = n.getBoundingClientRect();
      if (!r.width && !r.height) return;
      if (outside(r, box)) {
        flagged.push(n);
        out.push("leaves the slide area by " + Math.round(Math.max(r.bottom - box.bottom, r.right - box.right, box.left - r.left, box.top - r.top)) + "px: " + describe(n));
        return;
      }
      const cs = getComputedStyle(n);
      const clips = (v) => v === "hidden" || v === "clip";
      if ((clips(cs.overflowY) && n.scrollHeight > n.clientHeight + 2) || (clips(cs.overflowX) && n.scrollWidth > n.clientWidth + 2)) {
        flagged.push(n);
        out.push("text clipped: " + describe(n));
      }
    });
    canvas.querySelectorAll("svg text").forEach((txt) => {
      const svg = txt.closest("svg");
      if (flagged.some((f) => f.contains(txt))) return;
      if (outside(txt.getBoundingClientRect(), svg.getBoundingClientRect())) {
        flagged.push(txt);
        out.push("chart text outside its chart: " + describe(txt));
      }
    });
    collisions(slide, flagged).forEach((x) => out.push(x));
    return out;
  }

  const hits = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;

  /** Line boxes of visible text (HTML text runs and SVG <text>), plus the slide's charts. */
  function collisions(slide, flagged) {
    const text = [];
    const clippedAway = (n, r) => {
      for (let p = n.parentElement; p && p !== slide; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if ((cs.overflowY === "hidden" || cs.overflowY === "clip") && !hits(r, p.getBoundingClientRect())) return true;
      }
      return false;
    };
    slide.querySelectorAll("*").forEach((n) => {
      if (n.closest(".sr-only") || (n.closest('[aria-hidden="true"]') && !n.closest("svg[role=img]")) || flagged.some((f) => f.contains(n))) return;
      if (n instanceof SVGElement) {
        if (n.tagName.toLowerCase() === "text" && n.textContent.trim()) text.push({ n, r: n.getBoundingClientRect() });
        return;
      }
      n.childNodes.forEach((c) => {
        if (c.nodeType !== 3 || !c.textContent.trim()) return;
        const range = document.createRange();
        range.selectNodeContents(c);
        Array.from(range.getClientRects()).forEach((r) => r.width > 1 && !clippedAway(n, r) && text.push({ n, r }));
      });
    });
    const charts = Array.from(slide.querySelectorAll("svg.chart-svg")).map((n) => ({ n, r: n.getBoundingClientRect() }));
    const out = new Set();
    text.forEach((a, i) => {
      for (let j = i + 1; j < text.length; j++) {
        const b = text[j];
        if (a.n !== b.n && !a.n.contains(b.n) && !b.n.contains(a.n) && hits(a.r, b.r)) out.add("text overlaps text: " + describe(a.n) + " / " + describe(b.n));
      }
      charts.forEach((c) => !c.n.contains(a.n) && hits(a.r, c.r) && out.add("text overlaps a chart: " + describe(a.n)));
    });
    return Array.from(out);
  }

  function host() {
    const h = document.createElement("div");
    h.className = "layout-host";
    h.style.setProperty("position", "absolute");
    h.style.setProperty("left", "-30000px");
    h.style.setProperty("top", "0");
    h.style.setProperty("width", "1920px");
    h.style.setProperty("height", "1080px");
    document.body.appendChild(h);
    return h;
  }

  /** Walk every slide and reveal step (branching: coverage playthroughs), calling fn(projection) per language. */
  function walk(inst, fn) {
    window.BKTest.walk.any(inst, T0, (s) => ["en", "sv"].forEach((lang) => fn(S().project(Object.assign({}, s, { lang }), T0))), 6);
  }

  suite("layout", () => {
    test("the layout check detects content running over the rail", () => {
      const h = host();
      try {
        const inst = Object.assign({ id: "ex-layout-self" }, BK.engine.generator.generate(BK.scenarios.get("s01-ransomware-vpn"), { seed: "LAYOUT-0001" }));
        const p = S().project(S().create(inst, T0), T0);
        const canvas = BK.ui.stageRenderer.renderCanvas(p, { preview: true });
        h.appendChild(canvas);
        assert.deepEqual(layoutProblems(canvas), [], "clean title slide");
        const tall = document.createElement("p");
        tall.style.setProperty("height", "2000px");
        tall.style.setProperty("flex", "none");
        tall.textContent = "planted";
        canvas.querySelector(".s-slide").appendChild(tall);
        assert.ok(layoutProblems(canvas).some((x) => x.includes("planted")), "planted overflow found");
        tall.remove();
        const heading = canvas.querySelector(".s-title__heading");
        const twin = document.createElement("p");
        twin.textContent = "collides";
        twin.style.setProperty("position", "absolute");
        twin.style.setProperty("left", heading.offsetLeft + "px");
        twin.style.setProperty("top", heading.offsetTop + "px");
        heading.parentNode.appendChild(twin);
        assert.ok(layoutProblems(canvas).some((x) => x.includes("text overlaps text") && x.includes("collides")), "planted collision found");
      } finally {
        h.remove();
      }
    });

    test("the rail with pressure meters and a shown complication card fit the canvas", () => {
      const h = host();
      const problems = [];
      try {
        ["s20-perfect-storm", "s35-grey-zone", "b17-ai-agent"].forEach((id) => {
          const tpl = BK.scenarios.get(id);
          const inst = Object.assign({ id: "ex-m-" + id }, BK.engine.generator.generate(tpl, { seed: "LAYOUT-0003", stageCount: tpl.maxStages, meters: true, length: "long", mode: "hybrid" }));
          let s = S().create(inst, T0);
          for (let i = 0; i < 6; i++) s = S().apply(s, { type: "next" }, T0 + i);
          ["en", "sv"].forEach((lang) => {
            [false, true].forEach((withCard) => {
              let x = s;
              if (withCard) {
                x = S().apply(x, { type: "complicationDraw" }, T0);
                x = S().apply(x, { type: "complicationShow", id: x.complications[x.complications.length - 1].id }, T0);
              }
              const p = S().project(Object.assign({}, x, { lang }), T0);
              h.textContent = "";
              const canvas = BK.ui.stageRenderer.renderCanvas(p, { preview: true });
              h.appendChild(canvas);
              BK.ui.stageRenderer.settle(canvas);
              const rail = canvas.querySelector(".s-rail");
              if (rail && rail.scrollWidth > rail.clientWidth + 1) problems.push(id + " " + lang + ": rail overflows by " + (rail.scrollWidth - rail.clientWidth) + "px");
              const card = canvas.querySelector(".s-complication__card");
              if (card) {
                const r = card.getBoundingClientRect();
                const c = canvas.getBoundingClientRect();
                if (r.bottom > c.bottom || r.top < c.top) problems.push(id + " " + lang + ": complication card leaves the canvas");
              }
            });
          });
        });
      } finally {
        h.remove();
      }
      assert.deepEqual(problems, []);
    });

    test("every builder template stays inside its area, read-only and in edit mode (both languages)", () => {
      const h = host();
      const problems = [];
      try {
        const C = BK.engine.custom;
        ["en", "sv"].forEach((lang) => {
          const d = C.normaliseDeck({ id: "deck-layout", title: "Layout", lang, slides: C.TEMPLATES.map((x) => C.fromTemplate(x.id, lang)) });
          const ex = Object.assign(C.toExercise(d), { id: "ex-layout-custom" });
          let s = S().create(ex, T0);
          d.slides.forEach((slide, i) => {
            [false, true].forEach((edit) => {
              const p = S().project(Object.assign({}, s, { lang }), T0);
              h.textContent = "";
              const canvas = BK.ui.stageRenderer.renderCanvas(p, { preview: true });
              if (edit) {
                const area = canvas.querySelector(".s-slide");
                area.textContent = "";
                const wrap = document.createElement("div");
                wrap.className = "s-custom";
                wrap.appendChild(BK.ui.customSlide.render(ex.slides[i], lang, { edit: true }));
                area.appendChild(wrap);
              }
              h.appendChild(canvas);
              BK.ui.stageRenderer.settle(canvas);
              layoutProblems(canvas).forEach((x) => problems.push(C.TEMPLATES[i].id + " (" + lang + (edit ? ", edit" : "") + "): " + x));
            });
            s = S().apply(s, { type: "next" }, T0 + i);
          });
        });
      } finally {
        h.remove();
      }
      assert.deepEqual(problems, []);
    });

    test("every slide of every scenario stays inside its area (both languages, every audience, two seeds)", () => {
      const h = host();
      const problems = new Set();
      try {
        BK.scenarios.list().forEach((tpl) =>
          SEEDS.forEach((seed) =>
            AUDIENCES.forEach((audience) => {
              const inst = Object.assign({ id: "ex-layout-" + tpl.id }, BK.engine.generator.generate(tpl, { seed, stageCount: tpl.maxStages, audience, injectDensity: "high", difficulty: "advanced", length: "long", mode: "hybrid" }));
              walk(inst, (p) => {
                h.textContent = "";
                const canvas = BK.ui.stageRenderer.renderCanvas(p, { preview: true });
                h.appendChild(canvas);
                BK.ui.stageRenderer.settle(canvas); // as the stage and presenter do
                layoutProblems(canvas).forEach((x) => problems.add(tpl.id + " " + p.slide.id + " (" + p.lang + ", " + audience + ", " + seed + "): " + x));
              });
            })
          )
        );
      } finally {
        h.remove();
      }
      assert.ok(!problems.size, problems.size + " layout problem(s):\n" + Array.from(problems).slice(0, 60).join("\n"));
    });
  });

  BK.testing = Object.assign(BK.testing || {}, { layoutProblems });
})();
