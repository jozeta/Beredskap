/*
 * a11y.test.js — Automated part of the accessibility pass (spec section 15).
 *
 * Renders every operator view (and every stage slide) in both languages and
 * audits the DOM: accessible names on interactive elements, labels on form
 * controls, unique ids, valid id references, no positive tabindex, heading
 * levels that never skip, text alternatives for SVG, valid ARIA states. Also
 * checks dialog focus handling and WCAG AA contrast of the colour tokens.
 *
 * These checks catch structural mistakes; they do not replace a manual pass
 * with a keyboard and a screen reader (see README, "Limitations").
 */
(function () {
  "use strict";

  const { suite, test, assert } = window.BKTest;
  const BK = window.BK;
  const S = () => BK.engine.session;
  const LANGS = ["en", "sv"];

  // ---- Audit ------------------------------------------------------------------------------

  const INTERACTIVE =
    'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="tab"], [role="checkbox"], [role="switch"], [tabindex]:not([tabindex="-1"])';

  const hiddenFromAT = (node) => !!node.closest('[aria-hidden="true"], [hidden], [inert]');

  function textOf(node) {
    return (node.textContent || "").replace(/\s+/g, " ").trim();
  }

  /** A pragmatic subset of the accessible-name computation, enough for our markup. */
  function accessibleName(node) {
    const by = node.getAttribute("aria-labelledby");
    if (by) return by.split(/\s+/).map((id) => textOf(document.getElementById(id) || document.createElement("i"))).join(" ").trim();
    const label = (node.getAttribute("aria-label") || "").trim();
    if (label) return label;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(node.tagName)) {
      const forLabel = node.id && document.querySelector('label[for="' + CSS.escape(node.id) + '"]');
      if (forLabel) return textOf(forLabel);
      const wrap = node.closest("label");
      if (wrap) return textOf(wrap);
    } else if (textOf(node)) {
      return textOf(node);
    }
    return (node.getAttribute("title") || "").trim();
  }

  function describe(node) {
    const cls = typeof node.className === "string" ? node.className : node.getAttribute("class") || "";
    return node.tagName.toLowerCase() + (node.id ? "#" + node.id : "") + (cls ? "." + cls.trim().split(/\s+/).join(".") : "");
  }

  /** Returns a list of human-readable problems found under `root` (which must be in the document). */
  function audit(root) {
    const problems = [];
    const add = (node, msg) => problems.push(describe(node) + ": " + msg);

    root.querySelectorAll(INTERACTIVE).forEach((n) => {
      if (!hiddenFromAT(n) && !accessibleName(n)) add(n, "no accessible name");
    });

    const reported = new Set();
    root.querySelectorAll("[id]").forEach((n) => {
      if (reported.has(n.id) || document.querySelectorAll("#" + CSS.escape(n.id)).length < 2) return;
      reported.add(n.id);
      add(n, "duplicate id");
    });

    root.querySelectorAll("[aria-labelledby], [aria-describedby], [aria-controls], label[for]").forEach((n) => {
      ["aria-labelledby", "aria-describedby", "aria-controls", "for"].forEach((attr) => {
        const v = n.getAttribute(attr);
        if (v) v.split(/\s+/).forEach((id) => document.getElementById(id) || add(n, attr + " points to missing #" + id));
      });
    });

    root.querySelectorAll("[tabindex]").forEach((n) => Number(n.getAttribute("tabindex")) > 0 && add(n, "positive tabindex"));

    root.querySelectorAll("[aria-pressed], [aria-expanded], [aria-checked], [aria-selected]").forEach((n) => {
      ["aria-pressed", "aria-expanded", "aria-checked", "aria-selected"].forEach((attr) => {
        const v = n.getAttribute(attr);
        if (v !== null && !["true", "false", "mixed"].includes(v)) add(n, attr + '="' + v + '"');
      });
    });

    root.querySelectorAll("svg").forEach((n) => {
      if (hiddenFromAT(n) || n.parentNode.closest("svg")) return; // nested SVG belongs to its outer graphic
      const named = n.getAttribute("aria-label") || n.getAttribute("aria-labelledby") || (n.querySelector(":scope > title") && textOf(n.querySelector(":scope > title")));
      if (n.getAttribute("role") !== "img" || !named) add(n, "visible SVG without role=img and a text alternative");
    });

    root.querySelectorAll("img").forEach((n) => n.hasAttribute("alt") || add(n, "img without alt"));

    root.querySelectorAll("dialog, [role='dialog']").forEach((n) => accessibleName(n) || add(n, "dialog without a name"));

    let prev = 0;
    root.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
      if (hiddenFromAT(h)) return;
      const level = Number(h.tagName[1]);
      if (prev && level > prev + 1) add(h, "heading jumps from h" + prev + " to h" + level + " (" + textOf(h).slice(0, 30) + ")");
      prev = level;
    });

    return problems;
  }

  function assertClean(problems, label) {
    assert.ok(!problems.length, label + ": " + problems.length + " problem(s):\n" + Array.from(new Set(problems)).slice(0, 25).join("\n"));
  }

  // ---- Fixtures ---------------------------------------------------------------------------

  const T0 = Date.UTC(2026, 9, 21, 8, 0, 0);
  const created = [];

  function fixtureExercise() {
    const tpl = BK.scenarios.get("s01-ransomware-vpn");
    const ex = BK.engine.generator.toExercise(BK.engine.generator.generate(tpl, { seed: "A11Y-0001", stageCount: 6, audience: "mixed", injectDensity: "high" }));
    BK.store.putItem("exercise", ex);
    created.push("exercise:" + ex.id);
    return ex;
  }

  function fixtureDeck() {
    const C = BK.engine.custom;
    const d = C.normaliseDeck({ id: "deck-a11y", title: "A11y deck", lang: "en", slides: ["title", "questions", "chat-thread", "call", "siem", "kpi", "image", "decision"].map((id) => C.fromTemplate(id, "en")) });
    BK.store.putItem("deck", d);
    created.push("deck:" + d.id);
    return d;
  }

  function fixtureSession(ex) {
    let s = S().create(ex, T0);
    // Move into the exercise and log something, so presenter and debrief have content.
    for (let i = 0; i < 12; i++) s = S().apply(s, { type: "next" }, T0 + i * 1000);
    const d = ex.stages.find((st) => st.decision);
    if (d) s = S().apply(s, { type: "decision", decisionId: d.decision.id, entry: { option: (d.decision.options[0] || {}).id || "", text: "Isolate the VPN" } }, T0);
    s = S().apply(s, { type: "observationAdd", observation: { category: "communication", text: "Clear hand-over", stageId: ex.stages[0].id } }, T0);
    BK.store.putItem("session", s);
    created.push("session:" + s.id);
    return s;
  }

  function cleanup() {
    created.splice(0).forEach((k) => BK.store.remove(k));
  }

  /** Render a router view into an attached host in `lang` and return the audit problems. */
  function auditView(view, ctx, lang) {
    BK.i18n.setLang(lang, { silent: true });
    const host = document.createElement("div");
    document.body.appendChild(host);
    try {
      view.render(host, Object.assign({ params: {}, query: {} }, ctx));
      return audit(host);
    } finally {
      if (view.unmount) view.unmount();
      host.remove();
      BK.i18n.setLang("en", { silent: true });
    }
  }

  // ---- Contrast ---------------------------------------------------------------------------

  function luminance(hex) {
    const v = hex.replace("#", "");
    const c = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function contrast(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }

  function tokens(mode) {
    const scope = document.createElement("div");
    BK.theme.apply(mode, scope);
    document.body.appendChild(scope);
    const cs = getComputedStyle(scope);
    const read = (n) => cs.getPropertyValue("--" + n).trim();
    const out = {};
    ["bg", "surface", "surface-2", "ink", "ink-muted", "line-strong", "accent", "on-accent", "ok", "warn", "danger", "info", "ok-soft", "warn-soft", "danger-soft", "info-soft", "accent-soft"].forEach((n) => (out[n] = read(n)));
    scope.remove();
    return out;
  }

  // ---- Tests ------------------------------------------------------------------------------

  suite("accessibility", () => {
    test("the audit itself catches unnamed buttons, missing labels, duplicate ids and skipped headings", () => {
      const host = document.createElement("div");
      host.append(
        BK.dom.el("button", { type: "button" }, BK.dom.svgIcon("cross")),
        BK.dom.el("input", { type: "text", id: "a11y-x" }),
        BK.dom.el("span", { id: "a11y-x" }),
        BK.dom.el("h2", { text: "A" }),
        BK.dom.el("h4", { text: "B" })
      );
      document.body.appendChild(host);
      const problems = audit(host);
      host.remove();
      assert.ok(problems.some((p) => p.startsWith("button") && p.includes("no accessible name")), "unnamed icon button");
      assert.ok(problems.some((p) => p.startsWith("input") && p.includes("no accessible name")), "unlabelled input");
      assert.ok(problems.some((p) => p.includes("duplicate id")), "duplicate id");
      assert.ok(problems.some((p) => p.includes("heading jumps")), "skipped heading level");
    });

    test("operator views pass the audit in both languages (empty storage)", () => {
      [["dashboard", BK.ui.dashboard], ["library", BK.ui.library], ["wizard", BK.ui.wizard], ["history", BK.ui.history], ["settings", BK.ui.settings], ["help", BK.ui.help]].forEach(([name, view]) =>
        LANGS.forEach((lang) => assertClean(auditView(view, {}, lang), name + " (" + lang + ")"))
      );
    });

    test("views with an exercise and a running session pass the audit in both languages", () => {
      try {
        const ex = fixtureExercise();
        const s = fixtureSession(ex);
        const views = [
          ["dashboard", BK.ui.dashboard, {}],
          ["history", BK.ui.history, {}],
          ["wizard (scenario chosen)", BK.ui.wizard, { query: { scenario: "s07-mfa-fatigue-aitm" } }],
          ["editor", BK.ui.editor, { params: { instanceId: ex.id } }],
          ["presenter", BK.ui.presenter, { params: { sessionId: s.id } }],
          ["debrief", BK.ui.debrief, { params: { sessionId: s.id } }],
          ["builder", BK.ui.builder, { params: { deckId: fixtureDeck().id } }],
          ["library (with a custom exercise)", BK.ui.library, {}]
        ];
        views.forEach(([name, view, ctx]) => LANGS.forEach((lang) => assertClean(auditView(view, ctx, lang), name + " (" + lang + ")")));
      } finally {
        cleanup();
      }
    });

    test("every stage slide of every scenario passes the audit in both languages (branching: two playthroughs)", () => {
      const host = document.createElement("div");
      document.body.appendChild(host);
      try {
        BK.scenarios.list().forEach((tpl) => {
          const inst = Object.assign({ id: "ex-a11y-" + tpl.id }, BK.engine.generator.generate(tpl, { seed: "A11Y-0002", stageCount: tpl.maxStages, audience: "technical", injectDensity: "high", length: "long", mode: "hybrid" }));
          // Branching: two playthroughs reach every slide type (page, choice, ending, map).
          window.BKTest.walk.any(inst, T0, (s) =>
            LANGS.forEach((lang) => {
              const p = S().project(Object.assign({}, s, { lang }), T0);
              host.textContent = "";
              host.appendChild(BK.ui.stageRenderer.renderCanvas(p, {}));
              assertClean(audit(host), tpl.id + " " + p.slide.id + " (" + lang + ")");
            }), 2);
        });
      } finally {
        host.remove();
      }
    });

    test("dialogs are modal, named, focus their default action and return focus on close", async () => {
      const opener = BK.dom.el("button", { type: "button", text: "open" });
      document.body.appendChild(opener);
      opener.focus();
      const pending = BK.ui.dialog.open({ title: "Confirm", body: BK.dom.el("p", { text: "Body" }), actions: [{ label: "No", value: false }, { label: "Yes", value: true, autofocus: true }] });
      const dialog = document.querySelector("dialog.dialog");
      try {
        assert.ok(dialog && dialog.open, "dialog opened");
        assert.ok(dialog.matches(":modal"), "opened with showModal (rest of the page inert)");
        assert.equal(accessibleName(dialog), "Confirm", "named by its title");
        assert.ok(dialog.contains(document.activeElement), "focus moved into the dialog");
        assert.equal(document.activeElement.textContent, "Yes", "default action focused");
        assertClean(audit(dialog), "dialog content");
      } finally {
        const yes = Array.from(dialog.querySelectorAll("button")).find((b) => b.textContent === "Yes");
        yes.click();
      }
      assert.equal(await pending, true, "resolves with the action value");
      assert.equal(document.activeElement, opener, "focus returned to the opener");
      assert.ok(!document.querySelector("dialog.dialog"), "dialog removed");
      opener.remove();
    });

    test("text and status colours meet WCAG AA contrast in light and dark themes", () => {
      ["light", "dark"].forEach((mode) => {
        const c = tokens(mode);
        const check = (fg, bg, min) => {
          const r = contrast(c[fg], c[bg]);
          assert.ok(r >= min, mode + ": " + fg + " on " + bg + " is " + r.toFixed(2) + ":1 (needs " + min + ")");
        };
        ["ink", "ink-muted", "accent", "ok", "warn", "danger", "info"].forEach((fg) => ["bg", "surface", "surface-2"].forEach((bg) => check(fg, bg, 4.5)));
        ["accent", "ok", "warn", "danger", "info"].forEach((tone) => check(tone, tone + "-soft", 4.5)); // badges and notices
        check("on-accent", "accent", 4.5); // primary buttons
        ["bg", "surface", "surface-2"].forEach((bg) => check("line-strong", bg, 3)); // form-control borders (1.4.11)
        ["bg", "surface"].forEach((bg) => check("accent", bg, 3)); // focus ring
      });
    });

    test("icon-only buttons in the shell components carry a label", () => {
      const btn = BK.ui.c.button({ icon: "cross", label: "Close", iconOnly: true });
      document.body.appendChild(btn);
      assert.ok(accessibleName(btn), "named");
      btn.remove();
    });
  });

  BK.testing = Object.assign(BK.testing || {}, { audit, accessibleName });
})();
