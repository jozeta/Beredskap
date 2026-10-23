/*
 * stage.js — Full-screen audience stage (#/stage/:sessionId) and the shared
 * slide renderer.
 *
 * The renderer draws a fixed 1920×1080 logical canvas from the AUDIENCE
 * projection only (BK.engine.session.project). It never receives the session, so
 * facilitator material cannot reach the stage DOM. The one exception is the
 * private overlay (N): built on demand from the facilitator view, framed in red,
 * and removed from the DOM when closed.
 *
 * Also exports BK.ui.runKeys, the keyboard/clicker map shared with the presenter.
 * Charts and artefacts come from BK.graphics; an inject type without a dedicated
 * mock-up falls back to a plain text card (genericArtefact).
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el, svgIcon } = BK.dom;
  const t = BK.t;

  const W = 1920;
  const H = 1080;

  // ---- Small helpers -----------------------------------------------------------------------

  function fmtTimer(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function wordmark() {
    return el("div", { class: "s-wordmark" }, svgIcon("mark", { size: 36 }), el("span", { text: t("app.name") }));
  }

  function emblem(name, size) {
    return el("div", { class: "s-emblem" }, BK.dom.emblem(name, { size: size || 160 }));
  }

  function kicker(text) {
    return el("p", { class: "s-kicker", text });
  }

  /** "Stage 2 of 8" in a discussion exercise, "§ 212" on a page of a branching one. */
  function whereLabel(s, p, lang) {
    return s.num != null ? t("branch.pageNum", { n: s.num }, lang) : t("stage.stageOf", { n: s.stageNumber, total: p.progress.stageCount }, lang);
  }

  // ---- Slide renderers (projection → DOM). Each receives (slide, p, lang). ------------------------

  const R = {};

  R.title = (s, p, lang) =>
    el(
      "div",
      { class: "s-title" },
      BK.graphics && BK.graphics.artwork ? BK.graphics.artwork(s, p) : el("div", { class: "s-title__art", "aria-hidden": "true" }),
      el("p", { class: "s-banner", text: s.banner }),
      emblem(s.emblem, 168),
      el("h1", { class: "s-title__heading", text: s.title }),
      s.title !== s.scenarioTitle ? el("p", { class: "s-title__sub", text: s.scenarioTitle }) : null,
      el("p", { class: "s-title__org", text: s.orgName }),
      el("p", { class: "s-title__meta", text: s.category + " · " + s.date })
    );

  R.briefing = (s, p, lang) =>
    el(
      "div",
      { class: "s-briefing" },
      el("h1", { class: "s-h1", text: t("stage.briefing", null, lang) }),
      el(
        "p",
        { class: "s-lead", text: s.choiceRange ? t("stage.durationBranching", { n: s.minutes, min: s.choiceRange[0], max: s.choiceRange[1] }, lang) : t("stage.duration", { n: s.minutes, stages: s.stageCount }, lang) }
      ),
      el(
        "div",
        { class: "s-cols" },
        el("section", null, el("h2", { class: "s-h2", text: t("stage.objectives", null, lang) }), el("ul", { class: "s-list" }, s.objectives.slice(0, 6).map((o) => el("li", { text: o })))),
        el(
          "section",
          null,
          el("h2", { class: "s-h2", text: t(s.choiceRange ? "stage.howItWorks" : "stage.rules", null, lang) }),
          el("ul", { class: "s-list s-list--small" }, s.rules.map((r) => el("li", { text: r }))),
          s.rounds.length ? el("h2", { class: "s-h2", text: t("stage.rounds", null, lang) }) : null,
          s.rounds.length ? el("ol", { class: "s-rounds" }, s.rounds.map((r) => el("li", { text: r }))) : null
        )
      )
    );

  R.context = (s, p, lang) =>
    el(
      "div",
      { class: "s-context" },
      kicker(t("stage.context", null, lang)),
      el("h1", { class: "s-h1", text: s.orgName }),
      el("p", { class: "s-lead", text: s.sector + " — " + s.model }),
      el("p", { class: "s-muted", text: t("stage.orgFacts", { headcount: s.headcount, sites: s.sites, city: s.city }, lang) }),
      el(
        "div",
        { class: "s-cols" },
        el(
          "section",
          null,
          el("h2", { class: "s-h2", text: t("stage.services", null, lang) }),
          // A list, not the diagram: at half width the diagram's text would be too small to project.
          el("ul", { class: "s-services" }, s.services.map((sv) => el("li", null, el("strong", { text: sv.name }), el("span", { text: sv.deps.map((d) => d.label).join(" · ") }))))
        ),
        el(
          "section",
          null,
          el("h2", { class: "s-h2", text: t("stage.roster", null, lang) }),
          el("ul", { class: "s-roster" }, s.roster.map((r) => el("li", null, el("span", { class: "s-avatar", "aria-hidden": "true", text: r.initials }), el("span", null, el("strong", { text: r.name }), el("small", { text: r.role })))))
        )
      )
    );

  /**
   * Story text: a blank line in the authored text starts a new paragraph, and a long story
   * gets a smaller type step so it stays readable from the back of the room.
   */
  function story(text, cls) {
    const paras = String(text || "").split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
    return el("div", { class: ["s-story", cls, String(text || "").length > 360 && "s-story--long"] }, paras.map((x) => el("p", { class: "s-narrative", text: x })));
  }

  R.situation = (s, p, lang) =>
    el(
      "div",
      { class: "s-situation" },
      el("div", { class: "s-situation__top" }, kicker(t("stage.stageOf", { n: s.stageNumber, total: s.stageCount }, lang)), el("p", { class: "s-clock", text: s.clock })),
      el("h1", { class: "s-h1", text: s.title }),
      story(s.narrative)
    );

  R.timeline = (s, p, lang) =>
    el(
      "div",
      { class: "s-timeline" },
      kicker(t("stage.stageOf", { n: s.stageNumber, total: p.progress.stageCount }, lang) + " · " + s.clock),
      el("h1", { class: "s-h1", text: t("stage.timeline", null, lang) }),
      // settle() may fold more of the oldest items into this count when they do not fit.
      el("p", { class: "s-muted s-tl__earlier", hidden: !s.earlierCount, dataset: { n: String(s.earlierCount || 0) }, text: t("stage.earlier", { n: s.earlierCount }, lang) }),
      el(
        "ol",
        { class: "s-tl" },
        s.items.map((it, i) =>
          el(
            "li",
            { class: ["s-tl__item", i === s.items.length - 1 && "is-new"] },
            el("span", { class: "s-tl__time", text: it.time }),
            el("span", { class: "s-tl__dot", "aria-hidden": "true" }),
            el("span", { class: "s-tl__body" }, el("small", { text: it.typeLabel + (it.source ? " · " + it.source : "") }), el("span", { text: it.headline }))
          )
        )
      )
    );

  const SEVERITY_ICON = { info: "info", low: "info", medium: "warning", high: "warning", critical: "warning" };

  function genericArtefact(inj, lang) {
    const meta = inj.meta || {};
    const metaRows = [
      meta.from ? [t("stage.from", null, lang), meta.from] : null,
      meta.to ? [t("stage.to", null, lang), meta.to] : null,
      meta.subject ? [t("stage.subject", null, lang), meta.subject] : null
    ].filter(Boolean);
    return el(
      "article",
      { class: ["s-artefact", "s-artefact--" + inj.type] },
      el(
        "header",
        { class: "s-artefact__head" },
        el("span", { class: "s-artefact__type", text: inj.typeLabel }),
        inj.severity ? el("span", { class: ["s-sev", "s-sev--" + inj.severity] }, svgIcon(SEVERITY_ICON[inj.severity], { size: 28 }), el("span", { text: inj.severityLabel })) : null,
        el("span", { class: "s-artefact__time", text: inj.time })
      ),
      inj.source ? el("p", { class: "s-artefact__source", text: inj.source }) : null,
      metaRows.length ? el("dl", { class: "s-artefact__meta" }, metaRows.map(([k, v]) => [el("dt", { text: k }), el("dd", { text: v })])) : null,
      inj.headline ? el("h2", { class: "s-artefact__headline", text: inj.headline }) : null,
      el("p", { class: "s-artefact__content", text: inj.content }),
      inj.statedReliability ? el("p", { class: "s-artefact__reliability", text: t("stage.statedReliability", { value: inj.statedReliability }, lang) }) : null
    );
  }

  R.inject = (s, p, lang) => {
    const inj = s.inject;
    const custom = BK.graphics && BK.graphics.artefact ? BK.graphics.artefact(inj, lang) : null;
    return el("div", { class: "s-inject" }, custom || genericArtefact(inj, lang));
  };

  R.data = (s, p, lang) => {
    const c = s.chart;
    const drawn = BK.graphics.chart(c, p);
    return el(
      "div",
      { class: "s-data" },
      el("div", { class: "s-data__top" }, kicker(whereLabel(s, p, lang)), el("span", { class: "s-data-label", text: s.label })),
      el("h1", { class: "s-h2 s-data__title", text: c.title }),
      el("div", { class: "s-data__chart" }, drawn),
      c.caption ? el("p", { class: "s-muted", text: c.caption + (c.unit ? " (" + c.unit + ")" : "") }) : null
    );
  };

  R.twist = (s, p, lang) =>
    el(
      "div",
      { class: "s-twist" },
      el("p", { class: "s-twist__flag" }, svgIcon("warning", { size: 48 }), el("span", { text: s.heading })),
      el("h1", { class: "s-twist__text", text: s.twist }),
      el("div", { class: "s-twist__assumption" }, el("p", { class: "s-kicker", text: t("stage.assumption", null, lang) }), el("p", { class: "s-strike", text: s.assumption }))
    );

  R.discussion = (s, p, lang) =>
    el(
      "div",
      { class: "s-discussion" },
      el("div", { class: "s-discussion__top" }, kicker(t("stage.discussion", null, lang) + " · " + whereLabel(s, p, lang)), timerBlock(p)),
      el(
        "ol",
        { class: "s-questions" },
        s.items.map((it, i) =>
          el(
            "li",
            { class: ["s-q", "s-q--" + it.kind, i === s.items.length - 1 && "is-new"] },
            el("span", { class: "s-q__kind" }, svgIcon(it.kind === "challenge" ? "warning" : "notes", { size: 32 }), el("span", { text: t(it.kind === "challenge" ? "stage.challenge" : "stage.question", null, lang) })),
            el("span", { class: "s-q__text", text: it.text }),
            it.roleNotPresent ? el("small", { class: "s-q__roles s-q__roles--missing", text: t("editor.roleNotPresent", null, lang) }) : it.targets && it.targets.length ? el("small", { class: "s-q__roles", text: it.targets.join(" · ") }) : null
          )
        )
      )
    );

  function timerBlock(p) {
    return el(
      "div",
      { class: ["s-timer", p.timer.running && "is-running", p.timer.remainingMs <= 0 && "is-done"], role: "timer", "aria-label": t("stage.timerLabel", null, p.lang) },
      svgIcon("hourglass", { size: 40 }),
      el("span", { class: "s-timer__value", dataset: { tick: "timer" }, text: fmtTimer(p.timer.remainingMs) })
    );
  }

  // Custom (builder) slides: content from custom-slide.js; a slide with a timer shows the countdown.
  R.custom = (s, p, lang) =>
    el("div", { class: "s-custom" }, s.slide ? BK.ui.customSlide.render(s.slide, lang) : null, s.timerMinutes > 0 ? el("div", { class: "s-custom__timer" }, timerBlock(p)) : null);

  R.decision = (s, p, lang) =>
    el(
      "div",
      { class: "s-decision" },
      kicker(t("stage.decision", null, lang) + " · " + t("stage.stageOf", { n: s.stageNumber, total: p.progress.stageCount }, lang)),
      el("h1", { class: "s-h1", text: s.question }),
      s.options.length ? el("ol", { class: "s-options" }, s.options.map((o) => el("li", null, el("span", { class: "s-options__key", text: o.key }), el("span", { text: o.text })))) : null,
      el("p", { class: "s-muted", text: t("stage.decisionNote", null, lang) }),
      s.authority ? el("p", { class: "s-muted", text: t("stage.decisionAuthority", { name: s.authority }, lang) + (s.authorityNotPresent ? " — " + t("editor.roleNotPresent", null, lang) : "") }) : null
    );

  // ---- Branching (gamebook) slides ----------------------------------------------------------------

  R.page = (s, p, lang) =>
    el(
      "div",
      { class: "s-page" },
      el(
        "div",
        { class: "s-page__side" },
        el("p", { class: "s-page__num", "aria-label": t("branch.pageNum", { n: s.num }, lang) }, el("span", { class: "s-page__mark", "aria-hidden": "true", text: "§" }), el("span", { text: String(s.num) })),
        el("div", { class: "s-page__emblem", "aria-hidden": "true" }, BK.dom.emblem(s.emblem, { size: 220 }))
      ),
      el("div", { class: "s-page__body" }, kicker(s.isEnding ? t("branch.epilogue", null, lang) : t("branch.choiceN", { n: s.choiceNumber }, lang)), el("h1", { class: "s-h1", text: s.title }), s.because ? el("p", { class: "s-page__because" }, svgIcon("link", { size: 32 }), el("span", { text: s.because })) : null, story(s.narrative))
    );

  R.choice = (s, p, lang) =>
    el(
      "div",
      { class: ["s-choice", s.chosen && "is-chosen"] },
      kicker(t("branch.decide", null, lang) + " · " + t("branch.pageNum", { n: s.num }, lang)),
      el("h1", { class: "s-h2 s-choice__q", text: s.question }),
      el(
        "ol",
        { class: ["s-paths", "s-paths--" + s.options.length] },
        s.options.map((o, i) =>
          el(
            "li",
            { class: ["s-path", s.chosen === o.key && "is-picked", s.chosen && s.chosen !== o.key && "is-dimmed"], style: { "--i": String(i) } },
            el("span", { class: "s-path__key", text: String(i + 1) }),
            el("span", { class: "s-path__text", text: o.text }),
            o.to != null ? el("span", { class: "s-path__turn", text: t("branch.turnTo", { n: o.to }, lang) }) : null
          )
        )
      ),
      s.chosen ? null : el("p", { class: "s-muted s-choice__hint", text: t("branch.choiceHint", null, lang) })
    );

  /** Five-step scale from "Contained" to "Disaster", the reached grade marked; words, never a score. */
  function gradeScale(scale, grade) {
    return el(
      "ol",
      { class: "s-grades" },
      scale.map((g) => el("li", { class: ["s-grade", "s-grade--" + g.grade, g.grade === grade && "is-reached"], "aria-current": g.grade === grade ? "true" : null, text: g.label }))
    );
  }

  R.ending = (s, p, lang) =>
    el(
      "div",
      { class: ["s-ending", "s-ending--" + s.grade] },
      el(
        "div",
        { class: "s-ending__text" },
        kicker(t("branch.ending", null, lang) + " · " + t("branch.pageNum", { n: s.num }, lang)),
        el("h1", { class: "s-h1 s-ending__label", text: s.label }),
        story(s.summary, "s-ending__summary"),
        gradeScale(s.scale, s.grade),
        el("p", { class: "s-muted", text: t("branch.choicesMade", { n: s.choices }, lang) })
      ),
      // A seal in the grade's tone, with the grade word: never colour alone, never a score.
      el("div", { class: "s-ending__seal", "aria-hidden": "true" }, el("span", { class: "s-ending__pips" }, [1, 2, 3, 4, 5].map((g) => el("i", { class: g <= s.grade ? "is-on" : null }))), el("span", { class: "s-ending__word", text: s.gradeLabel }))
    );

  function branchingDebrief(s, p, lang) {
    return el(
      "div",
      { class: "s-debrief s-debrief--branching" },
      kicker(t("stage.debrief", null, lang)),
      el("h1", { class: "s-h2", text: s.ending ? s.ending.label + " · " + s.ending.gradeLabel : t("stage.debrief", null, lang) }),
      el("div", { class: "s-routemap" }, BK.graphics.routeMap(s.map, { lang, title: t("branch.mapTitle", null, lang), choices: s.choices })),
      el("ul", { class: "s-list s-list--small s-debrief__lessons" }, s.lessons.slice(0, 3).map((x) => el("li", { text: x }))),
      el("p", { class: "s-mono s-muted", text: s.mitre.map((m) => m.id).join(" · ") + " — " + s.seedLine })
    );
  }

  R.recap = (s, p, lang) =>
    el(
      "div",
      { class: "s-recap" },
      kicker(t("stage.recap", null, lang)),
      el("h1", { class: "s-h2", text: s.question }),
      s.recorded
        ? el(
            "div",
            { class: "s-recap__entry" },
            s.option ? el("p", { class: "s-recap__option" }, el("span", { class: "s-options__key", text: s.option.key }), el("span", { text: s.option.text })) : null,
            s.text ? el("blockquote", { class: "s-recap__text", text: s.text }) : null
          )
        : el("p", { class: "s-lead", text: t("stage.recapNone", null, lang) })
    );

  R.debrief = (s, p, lang) =>
    s.format === "branching" ? branchingDebrief(s, p, lang) : el(
      "div",
      { class: "s-debrief" },
      el("h1", { class: "s-h1", text: t("stage.debrief", null, lang) }),
      el(
        "div",
        { class: "s-cols" },
        el(
          "section",
          null,
          el("h2", { class: "s-h2", text: t("stage.whatHappened", null, lang) }),
          el("p", { class: "s-small", text: s.rootCause }),
          el("h2", { class: "s-h2", text: t("stage.lessons", null, lang) }),
          el("ul", { class: "s-list s-list--small" }, s.lessons.slice(0, 5).map((x) => el("li", { text: x })))
        ),
        el(
          "section",
          null,
          el("h2", { class: "s-h2", text: t("stage.assumptionsReality", null, lang) }),
          el("ul", { class: "s-avr" }, s.assumptions.slice(0, 4).map((a) => el("li", null, el("span", { class: "s-strike", text: a.assumption }), el("span", { text: a.reality })))),
          el("h2", { class: "s-h2", text: t("stage.frameworks", null, lang) }),
          el("p", { class: "s-mono", text: s.mitre.map((m) => m.id).join(" · ") }),
          el("p", { class: "s-mono s-muted", text: s.seedLine })
        )
      )
    );

  const METER_ICON = { trust: "users", regulator: "scale", media: "newspaper" };

  /** The story's pressure meters: icon, label and five segments each. Text carries the value too. */
  function meters(p, lang) {
    if (!p.meters) return null;
    return el(
      "ul",
      { class: "s-meters", "aria-label": t("meters.title", null, lang) },
      p.meters.map((m) =>
        el(
          "li",
          { class: ["s-meter", "s-meter--" + m.id], title: m.label + ": " + m.value + "/" + m.max },
          svgIcon(METER_ICON[m.id] || "gauge", { size: 24 }),
          el("span", { class: "s-meter__label", text: t("meter.short." + m.id, null, lang) }),
          el("span", { class: "s-meter__bar", "aria-hidden": "true" }, Array.from({ length: m.max }, (_, i) => el("span", { class: i < m.value ? "is-on" : null }))),
          el("span", { class: "sr-only", text: m.value + "/" + m.max })
        )
      )
    );
  }

  function rail(p, lang) {
    const g = p.progress;
    if (g.branching) {
      return el(
        "footer",
        { class: "s-rail s-rail--branching" },
        el("span", { class: "s-rail__page", text: g.page != null ? t("branch.pageNum", { n: g.page }, lang) : "" }),
        el("span", { class: "s-rail__choices", text: t("branch.choicesMade", { n: g.choices }, lang) }),
        meters(p, lang),
        p.meters ? null : wordmark()
      );
    }
    return el(
      "footer",
      // Many stages plus meters: the meters drop their short labels (icons and segments remain).
      { class: ["s-rail", p.meters && g.stageCount >= 8 && "s-rail--dense"] },
      el(
        "ol",
        { class: "s-rail__stages", "aria-label": t("presenter.stages", null, lang) },
        Array.from({ length: g.stageCount }, (_, i) => el("li", { class: ["s-rail__seg", i < g.stageIndex && "is-done", i === g.stageIndex && "is-current"], text: String(i + 1) }))
      ),
      meters(p, lang),
      el("span", { class: "s-rail__clock", text: g.clock }),
      el("span", { class: "s-rail__count", text: g.slideNumber + " / " + g.slideCount }),
      p.meters ? null : wordmark()
    );
  }

  /** Render one complete 1920×1080 stage canvas from a projection. */
  function renderCanvas(p, opts) {
    const s = p.slide;
    const lang = p.lang;
    const renderer = R[s.type] || (() => el("div"));
    const canvas = el(
      "div",
      { class: ["stage", "stage--" + s.type, s.variant && "stage--" + s.variant, opts && opts.preview && "stage--preview", opts && opts.animate && "is-entering"], "data-theme": p.theme, lang },
      el("div", { class: "s-slide" }, renderer(s, p, lang)),
      s.type === "title" ? null : rail(p, lang)
    );
    if (p.complication && !p.paused && p.screen === "normal") {
      // A complication card covers the slide until the facilitator hides it.
      canvas.appendChild(
        el(
          "div",
          { class: "s-complication" },
          el(
            "div",
            { class: "s-complication__card" },
            el("p", { class: "s-complication__kicker" }, svgIcon("dice", { size: 40 }), el("span", { text: t("complication.title", null, lang) + " · " + p.complication.category })),
            el("h1", { class: "s-complication__title", text: p.complication.title }),
            el("p", { class: "s-complication__text", text: p.complication.text })
          )
        )
      );
    }
    if (p.paused) canvas.appendChild(el("div", { class: "s-paused" }, svgIcon("pause", { size: 96 }), el("h1", { class: "s-h1", text: t("stage.paused", null, lang) }), el("p", { class: "s-lead", text: t("stage.pausedBody", null, lang) })));
    if (p.ended && s.type !== "debrief") canvas.appendChild(el("div", { class: "s-paused" }, el("h1", { class: "s-h1", text: t("stage.ended", null, lang) })));
    if (p.screen !== "normal") canvas.appendChild(el("div", { class: "s-blank s-blank--" + p.screen }));
    return canvas;
  }

  // Text scale steps tried, largest first, when a slide's content does not fit.
  const FIT_STEPS = [1, 0.92, 0.85, 0.78, 0.72];

  /**
   * Make a rendered, attached canvas fit its slide area: step the text scale down
   * until nothing overflows. A timeline that still does not fit folds its oldest
   * items into the "earlier events" count, newest kept. Content is never clipped.
   */
  function settle(canvas) {
    const slide = canvas.querySelector(".s-slide");
    const root = slide && slide.firstElementChild;
    if (!root || !canvas.isConnected) return;
    const over = () => root.scrollHeight > root.clientHeight + 1 || root.scrollWidth > root.clientWidth + 1;
    for (const f of FIT_STEPS) {
      slide.style.setProperty("--fit", String(f));
      if (!over()) return;
    }
    const earlier = root.querySelector(".s-tl__earlier");
    const items = Array.from(root.querySelectorAll(".s-tl__item"));
    let hiddenCount = 0;
    while (earlier && over() && items.length - hiddenCount > 2) {
      items[hiddenCount].hidden = true;
      hiddenCount += 1;
      const n = Number(earlier.dataset.n) + hiddenCount;
      earlier.hidden = false;
      earlier.textContent = t("stage.earlier", { n }, canvas.getAttribute("lang"));
    }
  }

  /** Scale a canvas to fit a container (letterboxed, centred). */
  function fit(container, canvas) {
    const scale = Math.min(container.clientWidth / W, container.clientHeight / H) || 0.1;
    canvas.style.setProperty("--scale", String(scale));
  }

  /** Update ticking values (timer) inside a rendered canvas without re-rendering. */
  function tick(canvas, p) {
    const node = canvas && canvas.querySelector('[data-tick="timer"]');
    if (node) node.textContent = fmtTimer(p.timer.remainingMs);
    const box = node && node.parentElement;
    if (box) box.classList.toggle("is-done", p.timer.remainingMs <= 0);
  }

  // ---- Keyboard / clicker map (shared with the presenter) -------------------------------------------

  function typingTarget(target) {
    if (!target || !target.tagName) return false;
    return /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable;
  }

  /**
   * Translate a keydown into a session command. `extra` handles view-specific keys
   * (f, n, ?, Esc). Returns true when handled.
   */
  function runKeys(e, dispatch, extra) {
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    if (typingTarget(e.target) || document.querySelector("dialog[open]")) return false;
    const k = e.key;
    let cmd = null;
    // Forward keys follow the stage-click rule: start a discussion countdown before leaving the slide.
    if (k === "ArrowRight" || k === "ArrowDown" || k === " " || k === "PageDown") cmd = { type: "advance" };
    else if (k === "ArrowLeft" || k === "ArrowUp" || k === "PageUp") cmd = { type: "prev" };
    else if (k === "Home") cmd = { type: "first" };
    else if (k === "End") cmd = { type: "last" };
    else if (/^[0-9]$/.test(k)) cmd = { type: "gotoStage", index: k === "0" ? 9 : Number(k) - 1 };
    else if (k === "t" || k === "T") cmd = e.shiftKey ? { type: "timerReset" } : { type: "timerToggle" };
    else if (k === "+" || k === "=") cmd = { type: "timerAdd", ms: 60000 };
    else if (k === "-" || k === "_" || k === "−") cmd = { type: "timerAdd", ms: -60000 };
    else if (k === "p" || k === "P") cmd = { type: "pauseToggle" };
    else if (k === "b" || k === "B" || k === ".") cmd = { type: "screen", value: "black" };
    else if (k === "w" || k === "W") cmd = { type: "screen", value: "white" };
    else if (k === "l" || k === "L") cmd = { type: "langToggle" };
    else if (k === "d" || k === "D") cmd = { type: "themeToggle" };

    if (cmd) {
      e.preventDefault();
      dispatch(cmd);
      return true;
    }
    if (extra && extra(k, e)) {
      e.preventDefault();
      return true;
    }
    return false;
  }

  const SHORTCUTS = [
    ["→ Space PgDn", "shortcuts.next"], ["← PgUp", "shortcuts.prev"], ["Home End", "shortcuts.firstLast"], ["1–9 0", "shortcuts.jump"],
    ["T", "shortcuts.timer"], ["Shift+T", "shortcuts.timerReset"], ["+ −", "shortcuts.timerAdjust"], ["P", "shortcuts.pause"],
    ["N", "shortcuts.private"], ["B .", "shortcuts.black"], ["W", "shortcuts.white"], ["F", "shortcuts.fullscreen"],
    ["L", "shortcuts.lang"], ["D", "shortcuts.theme"], ["Esc", "shortcuts.esc"], ["?", "shortcuts.help"]
  ];

  /** Help list; in a branching run the digits choose an option instead of jumping to a stage, and custom decks have no stages. */
  function shortcutList(lang, format) {
    const fmt = format === true ? "branching" : format;
    const list = fmt === "branching" ? SHORTCUTS.map((x) => (x[1] === "shortcuts.jump" ? ["1 2 3 4", "shortcuts.choose"] : x)) : fmt === "custom" ? SHORTCUTS.filter((x) => x[1] !== "shortcuts.jump") : SHORTCUTS;
    return el("dl", { class: "shortcut-list" }, list.map(([keys, label]) => [el("dt", null, keys.split(" ").map((x) => el("kbd", { text: x }))), el("dd", { text: t(label, null, lang) })]));
  }

  // ---- Fullscreen --------------------------------------------------------------------------------

  function requestFullscreen() {
    const root = document.documentElement;
    if (!root.requestFullscreen) return Promise.reject(new Error("unsupported"));
    return root.requestFullscreen();
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) return document.exitFullscreen();
    return requestFullscreen().catch(() => BK.ui.toast(t("error.fullscreen"), "warn"));
  }

  // ---- Stage view ------------------------------------------------------------------------------------

  const view = { ctrl: null, cleanup: [], canvas: null, lastKey: null, overlay: null, escArmedAt: 0 };

  function privateOverlay(sess) {
    const f = BK.engine.session.facilitatorView(sess, Date.now());
    const box = el(
      "aside",
      { class: "private-overlay", role: "dialog", "aria-label": t("stage.private") },
      el("p", { class: "private-overlay__flag", text: t("stage.private") }),
      f.stage ? el("h2", { text: f.stage.title }) : null,
      f.stage && f.stage.notes ? el("p", { text: f.stage.notes }) : null,
      f.stage && f.stage.expected ? el("p", null, el("strong", { text: t("editor.expected") + ": " }), f.stage.expected) : null,
      f.slideNotes
        ? el(
            "div",
            null,
            el("p", null, el("strong", { text: t("presenter.trueReliability", { value: t("reliability." + f.slideNotes.reliability) }) })),
            f.slideNotes.facilitatorNote ? el("p", { text: f.slideNotes.facilitatorNote }) : null,
            f.slideNotes.expectedResponse ? el("p", { text: f.slideNotes.expectedResponse }) : null
          )
        : null,
      f.stage && f.stage.hints.length ? el("ul", null, f.stage.hints.map((h) => el("li", { text: h }))) : null,
      el("p", { class: "private-overlay__hint", text: "N" })
    );
    return box;
  }

  function closeOverlay() {
    if (view.overlay) {
      view.overlay.remove();
      view.overlay = null;
      return true;
    }
    return false;
  }

  function openOverlay(kind) {
    closeOverlay();
    const sess = view.ctrl.get();
    view.overlay =
      kind === "private"
        ? privateOverlay(sess)
        : el("aside", { class: "help-overlay", role: "dialog", "aria-label": t("shortcuts.title", null, sess.lang) }, el("h2", { text: t("shortcuts.title", null, sess.lang) }), shortcutList(sess.lang, sess.instance.format));
    view.overlay.dataset.kind = kind;
    view.viewport.appendChild(view.overlay);
  }

  function draw(sess) {
    const p = BK.engine.session.project(sess, Date.now());
    const key = [p.slide.id, p.slide.step, p.lang, p.theme, p.paused, p.screen, p.ended, p.rev, p.complication && p.complication.id].join("|");
    if (key === view.lastKey) {
      tick(view.canvas, p);
      return;
    }
    const slideChanged = !view.lastKey || view.lastKey.split("|")[0] !== p.slide.id;
    view.lastKey = key;
    const canvas = renderCanvas(p, { animate: slideChanged });
    if (view.canvas) view.canvas.replaceWith(canvas);
    else view.viewport.insertBefore(canvas, view.viewport.firstChild);
    view.canvas = canvas;
    document.documentElement.lang = p.lang;
    fit(view.viewport, canvas);
    settle(canvas);
    if (view.overlay && view.overlay.dataset.kind === "private") openOverlay("private");
  }

  function onEscape() {
    if (closeOverlay()) return true;
    if (document.fullscreenElement) return false; // the browser leaves fullscreen itself
    const now = Date.now();
    if (now - view.escArmedAt < 3000) {
      view.escArmedAt = 0;
      BK.ui.dialog
        .confirm({ title: t("stage.exitTitle"), message: t("stage.exitBody"), confirmLabel: t("stage.exitConfirm") })
        .then((ok) => ok && BK.router.navigate("#/presenter/" + encodeURIComponent(view.ctrl.get().id)));
    } else {
      view.escArmedAt = now;
      BK.ui.toast(t("stage.escAgain"), "info", 3000);
    }
    return true;
  }

  function extraKeys(k) {
    if (k === "f" || k === "F") return toggleFullscreen(), true;
    if (k === "n" || k === "N") return (view.overlay && view.overlay.dataset.kind === "private" ? closeOverlay() : openOverlay("private")), true;
    if (k === "?") return (view.overlay && view.overlay.dataset.kind === "help" ? closeOverlay() : openOverlay("help")), true;
    if (k === "Escape") return onEscape();
    return false;
  }

  BK.ui.stage = {
    bare: true,
    // The exercise title is public (it is on the title slide) and names the window on a projector.
    title: (ctx) => {
      const sess = BK.store.get("session:" + ctx.params.sessionId, null);
      return sess ? BK.loc(sess.instance.title, sess.lang) : t("app.name");
    },
    render(root, ctx) {
      view.lastKey = null;
      view.canvas = null;
      view.overlay = null;
      view.viewport = el("div", { class: "stage-viewport" });
      root.appendChild(view.viewport);

      view.ctrl = BK.sync.open(ctx.params.sessionId, draw);
      if (!view.ctrl) {
        view.viewport.appendChild(el("div", { class: "stage-missing" }, el("p", { text: t("stage.notFound") }), BK.ui.c.button({ label: t("notFound.home"), href: "#/" })));
        return;
      }
      draw(view.ctrl.get());

      const onKey = (e) => runKeys(e, view.ctrl.dispatch, extraKeys);
      const onResize = () => view.canvas && fit(view.viewport, view.canvas);
      const ticker = setInterval(() => draw(view.ctrl.get()), 250);
      document.addEventListener("keydown", onKey);
      window.addEventListener("resize", onResize);
      view.cleanup = [() => document.removeEventListener("keydown", onKey), () => window.removeEventListener("resize", onResize), () => clearInterval(ticker), () => view.ctrl.close()];

      // Clicking the stage advances, like most presentation software, but starts the discussion
      // countdown before it leaves a discussion slide (see "advance" in the session reducer).
      view.viewport.addEventListener("click", (e) => {
        if (e.target.closest("a, button, .help-overlay, .private-overlay")) return;
        view.ctrl.dispatch({ type: "advance" });
      });

      if (!document.fullscreenElement) BK.ui.toast(t(window.opener ? "stage.moveHint" : "stage.fullscreenHint"), "info", 6000);
    },
    unmount() {
      view.cleanup.forEach((fn) => fn());
      view.cleanup = [];
      view.ctrl = null;
      document.documentElement.lang = BK.i18n.getLang(); // the stage set the session's language
    }
  };

  BK.ui.stageRenderer = { renderCanvas, fit, settle, tick, fmtTimer, shortcutList, W, H };
  BK.ui.runKeys = runKeys;
  BK.ui.requestFullscreen = requestFullscreen;
})();
