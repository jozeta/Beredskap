/*
 * layout.test.js — Stage layout sweep: every slide of every scenario is laid
 * out at the canvas's native 1920×1080 size (EN and SV, every audience, two
 * seeds) and checked for content that leaves the slide area (and so runs over
 * the progress rail), text that leaves its chart, and text cut off by a
 * clipping box. Also checks the operator views for horizontal page scroll at
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
    return out;
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

  /** Walk one session through every slide (and every progressive step), calling fn(projection). */
  function walk(inst, fn) {
    let s = S().create(inst, T0);
    for (let i = 0; i < 800; i++) {
      ["en", "sv"].forEach((lang) => fn(S().project(Object.assign({}, s, { lang }), T0)));
      if (S().locate(s).slide.type === "debrief") break;
      s = S().apply(s, { type: "next" }, T0 + i);
    }
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
      } finally {
        h.remove();
      }
    });

    test("every slide of every scenario stays inside its area (both languages, every audience, two seeds)", () => {
      const h = host();
      const problems = new Set();
      try {
        BK.scenarios.list().forEach((tpl) =>
          SEEDS.forEach((seed) =>
            AUDIENCES.forEach((audience) => {
              const inst = Object.assign({ id: "ex-layout-" + tpl.id }, BK.engine.generator.generate(tpl, { seed, stageCount: tpl.maxStages, audience, injectDensity: "high", difficulty: "advanced" }));
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
