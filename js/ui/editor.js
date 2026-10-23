/*
 * editor.js — Private preview and editor of a generated exercise (#/edit/:id).
 *
 * Shows the facilitator everything: entities, hidden facts with their reveal
 * stage, the ground truth, every inject with reliability and visibility badges,
 * questions, decisions, facilitator notes, pacing and slide order. Operator-only;
 * never rendered on the stage.
 *
 * Edit mode (spec 9.4): edit any text (in the preview language), include or
 * exclude optional injects, retime injects within their stage, reorder slides
 * within a stage, change the stage count or reroll (both regenerate with the
 * template and discard text edits after confirmation). Every change is saved
 * and re-validated immediately. All edit operations live in BK.engine.edit.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el, svgIcon } = BK.dom;
  const c = BK.ui.c;
  const t = BK.t;
  const E = () => BK.engine.edit;

  const RELIABILITY = {
    confirmed: { tone: "ok", icon: "verified" },
    unverified: { tone: "warn", icon: "unverified" },
    misleading: { tone: "danger", icon: "misleading" },
    disputed: { tone: "info", icon: "disputed" }
  };
  const SEVERITY = { info: "neutral", low: "neutral", medium: "info", high: "warn", critical: "danger" };

  const state = { lang: null, forId: null, editMode: false, root: null, ctx: null, openStages: {} };

  function L(obj) {
    return BK.loc(obj, state.lang);
  }

  // ---- Persistence and re-rendering ---------------------------------------------------------------

  function load() {
    return BK.store.getItem("exercise", state.ctx.params.instanceId);
  }

  function commit(next) {
    BK.store.putItem("exercise", next);
    rerender();
  }

  function rerender() {
    const activeId = document.activeElement && document.activeElement.id;
    const y = window.scrollY;
    BK.dom.clear(state.root);
    build(state.root);
    window.scrollTo(0, y);
    if (activeId) {
      const again = document.getElementById(activeId);
      if (again) again.focus({ preventScroll: true });
    }
  }

  /**
   * A text block: plain paragraph in preview mode, textarea in edit mode.
   * `path` addresses a bilingual object inside the exercise.
   */
  function editable(ex, path, opts) {
    const o = opts || {};
    const value = E().getAt(ex, path);
    if (!value) return null;
    if (!state.editMode) return el(o.tag || "p", { class: o.className || null, text: L(value) });
    const id = "ed-" + path.join("-") + "-" + state.lang;
    return el("textarea", {
      id,
      class: ["input", "textarea", "editable", o.className],
      rows: o.rows || 2,
      maxlength: 4000,
      "aria-label": (o.label || t("editor.text")) + " (" + t("lang." + state.lang) + ")",
      value: L(value),
      on: { change: (e) => commit(E().setText(load(), path, state.lang, e.target.value)) }
    });
  }

  function section(title, ...children) {
    return c.card({ class: "card preview-section" }, el("h2", { text: title }), children);
  }

  function dl(rows) {
    return el("dl", { class: "kv" }, rows.filter(Boolean).map(([k, v]) => [el("dt", { text: k }), el("dd", null, v)]));
  }

  // ---- Actions ------------------------------------------------------------------------------------------

  async function regenerate(patch, titleKey, bodyKey) {
    const ex = load();
    const ok = !ex.edited || (await BK.ui.dialog.confirm({ title: t(titleKey), message: t(bodyKey), confirmLabel: t("common.confirm") }));
    if (!ok) {
      rerender(); // reset the stage-count select
      return;
    }
    commit(E().regenerate(ex, patch));
  }

  async function remove(ex) {
    const ok = await BK.ui.dialog.confirm({ title: t("editor.deleteTitle"), message: t("editor.deleteBody"), confirmLabel: t("common.delete"), danger: true });
    if (!ok) return;
    BK.store.removeItem("exercise", ex.id);
    BK.ui.toast(t("editor.deleted"), "ok");
    BK.router.navigate("#/");
  }

  function duplicate(ex) {
    const copy = E().duplicate(ex, { en: t("editor.copySuffix", null, "en"), sv: t("editor.copySuffix", null, "sv") });
    BK.store.putItem("exercise", copy);
    BK.ui.toast(t("editor.duplicated"), "ok");
    BK.router.navigate("#/edit/" + encodeURIComponent(copy.id));
  }

  function stageCountControl(ex) {
    const tpl = BK.scenarios.get(ex.templateId);
    if (!tpl) return null;
    if (ex.format === "branching") return branchingControls(ex);
    const opts = [];
    for (let n = tpl.minStages; n <= tpl.maxStages; n++) opts.push({ value: String(n), label: t("editor.stagesCount", { n }) });
    const sel = c.select(opts, String(ex.stages.length), (v) => regenerate({ stageCount: Number(v) }, "editor.regenTitle", "editor.regenBody"));
    sel.setAttribute("aria-label", t("wizard.stages"));
    sel.id = "ed-stage-count";
    sel.classList.add("input--sm", "input--auto");
    return sel;
  }

  /** Branching: length and run mode regenerate the exercise, like the stage count does. */
  function branchingControls(ex) {
    const make = (id, label, values, current, key) => {
      const sel = c.select(values.map((v) => ({ value: v, label: t(key + v) })), current, (v) => regenerate({ [id]: v }, "editor.regenTitle", "editor.regenBody"));
      sel.setAttribute("aria-label", label);
      sel.id = "ed-" + id;
      sel.classList.add("input--sm", "input--auto");
      return sel;
    };
    return [make("length", t("wizard.length"), ["short", "long"], ex.settings.length, "branch.length."), make("mode", t("wizard.mode"), ["pure", "hybrid"], ex.settings.mode, "branch.mode.")];
  }

  // ---- Header -------------------------------------------------------------------------------------------

  function header(ex, issues) {
    const p = ex.params;
    return el(
      "div",
      { class: "stack" },
      c.pageHeader(L(ex.title), t("editor.intro"), [
        c.segmented({
          label: state.editMode ? t("editor.editLang") : t("editor.previewLang"),
          name: "pv-lang",
          value: state.lang,
          options: BK.i18n.LANGS.map((l) => ({ value: l, label: t("lang." + l) })),
          onChange: (v) => {
            state.lang = v;
            rerender();
          }
        })
      ]),
      el(
        "div",
        { class: "badges" },
        c.badge(t("category." + ex.category), "accent"),
        c.badge(t("difficulty." + p.difficulty), "neutral"),
        c.badge(t("audience." + p.audience), "neutral", "users"),
        ex.format === "branching"
          ? [c.badge(t("branch.format"), "info", "route"), c.badge(t("branch.choiceRange", { min: ex.pacing.choiceRange[0], max: ex.pacing.choiceRange[1] }), "neutral", "decision")]
          : c.badge(t("editor.stagesCount", { n: ex.stages.length }), "neutral", "timeline"),
        c.badge(t("common.minutes", { n: ex.pacing.totalMinutes }), "neutral", "clock"),
        ex.format === "branching" ? null : c.badge(t("editor.slidesCount", { n: ex.slides.length }), "neutral"),
        c.badge(t("editor.seed", { seed: ex.seed }), "neutral", "dice"),
        ex.edited ? c.badge(t("editor.edited"), "warn", "edit") : null,
        ex.imported ? c.badge(t("history.imported"), "info") : null
      ),
      issues.length
        ? el(
            "div",
            { class: "notice notice--danger", role: "alert" },
            el("p", { class: "notice__title" }, svgIcon("warning", { size: 18 }), el("span", { text: t("editor.invalid") })),
            el("ul", { class: "bullets" }, issues.map((x) => el("li", { text: BK.engine.validator.format(x) })))
          )
        : el("p", { class: "notice notice--ok" }, svgIcon("check", { size: 18 }), el("span", { text: t("editor.valid") })),
      el(
        "div",
        { class: "actions" },
        c.button({ label: t("editor.start"), icon: "play", kind: "primary", disabled: issues.length > 0, onClick: () => BK.ui.startExercise(load()) }),
        c.button({
          label: state.editMode ? t("editor.done") : t("editor.edit"),
          icon: state.editMode ? "check" : "edit",
          kind: state.editMode ? "primary" : "secondary",
          id: "ed-toggle",
          onClick: () => {
            state.editMode = !state.editMode;
            rerender();
          }
        }),
        stageCountControl(ex),
        c.button({ label: t("editor.reroll"), icon: "dice", onClick: () => regenerate({ seed: BK.rng.newSeed() }, "editor.rerollTitle", "editor.regenBody") }),
        c.button({ label: t("editor.duplicate"), icon: "save", kind: "ghost", onClick: () => duplicate(load()) }),
        c.button({ label: t("editor.printGuide"), icon: "print", kind: "ghost", onClick: () => BK.io.print.printGuide(load(), state.lang) }),
        c.button({ label: t("editor.printRoles"), icon: "users", kind: "ghost", onClick: () => BK.io.print.printRoleCards(load(), state.lang) }),
        c.button({ label: t("export.json"), icon: "download", kind: "ghost", onClick: () => BK.io.export.downloadJSON(load(), null) }),
        c.button({ label: t("editor.delete"), icon: "trash", kind: "danger", onClick: () => remove(load()) })
      ),
      state.editMode ? el("p", { class: "notice small", text: t("editor.editHint", { lang: t("lang." + state.lang) }) }) : null
    );
  }

  // ---- Overview -------------------------------------------------------------------------------------------

  function overview(ex) {
    const e = ex.entities;
    const org = e.org;
    const peopleTable = el(
      "table",
      { class: "table" },
      el("thead", null, el("tr", null, el("th", { text: t("editor.role") }), el("th", { text: t("editor.person") }), el("th", { text: t("editor.jobTitle") }), el("th", { text: t("editor.present") }))),
      el(
        "tbody",
        null,
        Object.values(e.people).map((p) =>
          el(
            "tr",
            null,
            el("td", { text: L(p.roleLabel) }),
            el("td", null, el("span", { class: "avatar", "aria-hidden": "true", text: p.initials }), " ", p.name),
            el("td", { text: L(p.title) }),
            el("td", null, p.present ? c.badge(t("editor.present"), "ok", "check") : c.badge(t("editor.absent"), "warn", "warning"))
          )
        )
      )
    );
    return el(
      "div",
      { class: "grid grid--overview" },
      section(
        t("editor.organisation"),
        dl([
          [t("wizard.orgName"), org.name],
          [t("wizard.sector"), t("sector." + org.sector)],
          [t("wizard.orgSize"), t("size." + org.size)],
          [t("editor.model"), L(org.model)],
          [t("editor.location"), org.city + " · " + org.domain],
          [t("editor.headcount"), t("editor.headcountValue", { n: BK.i18n.fmt.number(org.headcount, state.lang), sites: org.sites })]
        ]),
        el("h3", { class: "eyebrow", text: t("editor.services") }),
        el("ul", { class: "bullets" }, Object.values(org.services).map((s) => el("li", null, L(s.name) + " — ", el("span", { class: "muted", text: t("editor.rtoRpo", { rto: s.rto, rpo: s.rpo }) })))),
        el("h3", { class: "eyebrow", text: t("editor.actor") }),
        el("p", null, el("strong", { text: e.actor.name }), " · " + L(e.actor.type) + " · " + L(e.actor.motivation))
      ),
      ex.format === "branching"
        ? section(
            t("editor.pacing"),
            el("p", { text: t("wizard.lengthOption", { n: ex.pacing.totalMinutes, min: ex.pacing.choiceRange[0], max: ex.pacing.choiceRange[1] }) + " · " + t("branch.length." + ex.settings.length) + " · " + t("branch.mode." + ex.settings.mode) }),
            el("h3", { class: "eyebrow", text: t("editor.objectives") }),
            el("ul", { class: "bullets" }, ex.objectives.map((o) => el("li", { text: L(o.text) }))),
            el("h3", { class: "eyebrow", text: t("report.lessons") }),
            el("ul", { class: "bullets" }, (ex.debrief.keyLessons || []).map((x) => el("li", { text: L(x) })))
          )
        : section(
        t("editor.pacing"),
        el(
          "ol",
          { class: "pacing" },
          el("li", null, el("span", { text: t("editor.briefing") }), el("span", { class: "tabular", text: t("editor.minutesShort", { n: ex.pacing.briefing }) })),
          ex.pacing.stages.map((s, i) => el("li", null, el("span", { text: t("editor.stageN", { n: i + 1 }) + " · " + L(ex.stages[i].title) }), el("span", { class: "tabular", text: t("editor.minutesShort", { n: s.minutes }) + " (" + t("editor.discussion", { n: s.discussion }) + ")" }))),
          el("li", null, el("span", { text: t("editor.debrief") }), el("span", { class: "tabular", text: t("editor.minutesShort", { n: ex.pacing.debrief }) }))
        ),
        el("h3", { class: "eyebrow", text: t("editor.objectives") }),
        el("ul", { class: "bullets" }, ex.objectives.map((o) => el("li", { text: L(o.text) }))),
        el("h3", { class: "eyebrow", text: t("report.lessons") }),
        el("ul", { class: "bullets" }, (ex.debrief.keyLessons || []).map((x) => el("li", { text: L(x) })))
      ),
      el("div", { class: "card--wide" }, section(t("editor.people"), el("div", { class: "table-wrap" }, peopleTable)))
    );
  }

  function stageNumber(ex, stageId) {
    const i = ex.stages.findIndex((s) => s.id === stageId);
    return i >= 0 ? i + 1 : null;
  }

  function truth(ex) {
    return el(
      "div",
      { class: "grid grid--overview" },
      section(
        t("editor.hiddenFacts"),
        el(
          "ul",
          { class: "fact-list" },
          ex.hiddenFacts.map((hf, hi) =>
            el(
              "li",
              null,
              c.badge(hf.revealStage === "debrief" ? t("editor.revealDebrief") : t("editor.revealAt", { n: stageNumber(ex, hf.revealStage) }), "warn", "warning"),
              editable(ex, ["hiddenFacts", hi, "text"], { label: t("editor.hiddenFacts") })
            )
          )
        )
      ),
      section(
        t("editor.groundTruth"),
        el("p", { text: L(ex.groundTruth.rootCause) }),
        el("h3", { class: "eyebrow", text: t("editor.attackerTimeline") }),
        el("ol", { class: "timeline-list" }, ex.groundTruth.attackerTimeline.map((e) => el("li", null, el("span", { class: "tabular muted", text: L(e.atLabel) }), el("span", { text: L(e.text) }))))
      )
    );
  }

  // ---- Stages ---------------------------------------------------------------------------------------------

  function visibilityBadge(inj, ex) {
    if (inj.visibility === "public") return null;
    if (inj.visibility === "facilitator") return c.badge(t("visibility.facilitator"), "danger", "eye-off");
    const role = inj.visibility.slice(5);
    const person = ex.entities.people[role];
    return c.badge(t("visibility.role", { role: person ? L(person.roleLabel) : role }), "info", "user");
  }

  function injectItem(ex, si, xi, inj, isBranch) {
    const rel = RELIABILITY[inj.reliability] || RELIABILITY.confirmed;
    const base = ["stages", si, isBranch ? "branchInjects" : "injects", xi];
    const disabled = inj.enabled === false;
    const bounds = !isBranch && state.editMode ? E().timeBounds(ex, inj.id) : null;
    return el(
      "li",
      { class: ["inject", disabled && "is-disabled"] },
      el(
        "div",
        { class: "inject__head" },
        bounds
          ? el(
              "label",
              { class: "inject__timeedit" },
              el("span", { class: "sr-only", text: t("editor.time") }),
              el("span", { class: "muted small", text: "T+" }),
              el("input", {
                id: "ed-time-" + inj.id,
                class: "input input--sm input--num",
                type: "number",
                min: bounds.min,
                max: bounds.max,
                step: 5,
                value: inj.at,
                on: { change: (e) => commit(E().setInjectTime(load(), inj.id, e.target.value)) }
              }),
              el("span", { class: "muted small tabular", text: L(inj.atLabel) })
            )
          : el("span", { class: "inject__time tabular", text: L(inj.atLabel) }),
        c.badge(t("injectType." + inj.type), "neutral"),
        c.badge(t("severity." + inj.severity), SEVERITY[inj.severity]),
        c.badge(t("reliability." + inj.reliability), rel.tone, rel.icon),
        visibilityBadge(inj, ex),
        inj.optional ? c.badge(t("editor.optional"), "neutral") : null,
        inj.substituted ? c.badge(t("editor.substituted"), "info") : null,
        inj.roleNotPresent ? c.badge(t("editor.roleNotPresent"), "warn", "warning") : null,
        inj.retargeted ? c.badge(t("editor.retargeted"), "info") : null,
        state.editMode && inj.optional && !isBranch
          ? (() => {
              const box = c.checkbox(t("editor.include"), !disabled, (on) => commit(E().toggleInject(load(), inj.id, on)));
              box.querySelector("input").id = "ed-incl-" + inj.id;
              return box;
            })()
          : null
      ),
      inj.sourceLabel ? el("p", { class: "muted small", text: L(inj.sourceLabel) }) : null,
      editable(ex, base.concat("headline"), { className: "inject__headline", label: t("editor.injects") }),
      editable(ex, base.concat("content"), { rows: 3, label: t("editor.injects") }),
      inj.expectedResponse ? el("div", { class: "facilitator-text" }, el("strong", { text: t("editor.expected") }), editable(ex, base.concat("expectedResponse"), { label: t("editor.expected") })) : null,
      inj.facilitatorNote ? el("div", { class: "facilitator-text" }, el("strong", { text: t("editor.facilitatorNote") }), editable(ex, base.concat("facilitatorNote"), { label: t("editor.facilitatorNote") })) : null
    );
  }

  function slideOrder(ex, s) {
    const slides = ex.slides.filter((sl) => sl.stageId === s.id);
    return el(
      "ol",
      { class: "slide-order" },
      slides.map((sl, i) =>
        el(
          "li",
          null,
          el("span", { class: "tabular muted", text: String(i + 1) }),
          el("span", { class: "slide-order__type", text: t("editor.slideType." + sl.type) + (sl.injectId ? " · " + sl.injectId : "") + (sl.chartId ? " · " + sl.chartId : "") }),
          state.editMode
            ? el(
                "span",
                { class: "slide-order__btns" },
                c.button({ label: t("editor.moveUp"), icon: "prev", iconOnly: true, size: "sm", kind: "ghost", id: "ed-up-" + sl.id.replace(/:/g, "_"), disabled: i === 0, onClick: () => commit(E().moveSlide(load(), sl.id, -1)) }),
                c.button({ label: t("editor.moveDown"), icon: "next", iconOnly: true, size: "sm", kind: "ghost", id: "ed-down-" + sl.id.replace(/:/g, "_"), disabled: i === slides.length - 1, onClick: () => commit(E().moveSlide(load(), sl.id, 1)) })
              )
            : null
        )
      )
    );
  }

  function stageCard(ex, s, si) {
    const n = si + 1;
    const fac = s.facilitator || {};
    const p = ["stages", si];
    const open = state.openStages[s.id] !== undefined ? state.openStages[s.id] : n === 1;
    return el(
      "details",
      { class: "card stage-preview", open, on: { toggle: (e) => (state.openStages[s.id] = e.target.open) } },
      el(
        "summary",
        null,
        el("span", { class: "stage-preview__num tabular", text: String(n) }),
        el("span", { class: "stage-preview__title" }, el("strong", { text: L(s.title) }), el("span", { class: "muted small", text: L(s.clockLabel) })),
        s.twistKind ? c.badge(t("twistKind." + s.twistKind), s.twistKind === "cause" || s.twistKind === "scope" ? "warn" : "neutral") : null,
        svgIcon("chevron-down", { className: "advanced__chevron" })
      ),
      el(
        "div",
        { class: "stack" },
        state.editMode ? editable(ex, p.concat("title"), { label: t("editor.stageTitle"), className: "editable--title" }) : null,
        editable(ex, p.concat("narrative"), { rows: 4, label: t("editor.narrative") }),
        s.twist
          ? el(
              "div",
              { class: "twist-preview" },
              el("strong", { text: t("editor.twist") }),
              editable(ex, p.concat("twist"), { label: t("editor.twist") }),
              el("strong", { class: "muted", text: t("editor.assumption") }),
              editable(ex, p.concat("assumptionChallenged"), { label: t("editor.assumption") })
            )
          : null,
        el("h3", { class: "eyebrow", text: t("editor.injects") }),
        el("ul", { class: "inject-list" }, s.injects.map((x, xi) => injectItem(ex, si, xi, x, false))),
        s.branches.length
          ? el(
              "div",
              null,
              el("h3", { class: "eyebrow", text: t("editor.branchInjects") }),
              s.branches.map((b) =>
                el(
                  "div",
                  { class: "branch" },
                  el("p", { class: "muted small", text: t("editor.branchWhen", { decision: b.when.decision, option: b.when.option }) }),
                  el("ul", { class: "inject-list" }, s.branchInjects.map((x, xi) => (b.addInjects.includes(x.id) ? injectItem(ex, si, xi, x, true) : null)))
                )
              )
            )
          : null,
        s.charts.length ? [el("h3", { class: "eyebrow", text: t("editor.charts") }), el("ul", { class: "bullets" }, s.charts.map((ch) => el("li", { text: L(ch.title) + " (" + ch.type + ")" })))] : null,
        el("h3", { class: "eyebrow", text: t("editor.questions") }),
        el(
          "ul",
          { class: "question-list" },
          s.questions.map((q, qi) =>
            el(
              "li",
              null,
              editable(ex, p.concat("questions", qi, "text"), { label: t("editor.questions") }),
              el(
                "div",
                { class: "badges" },
                c.badge(t("editor.audienceTag." + q.audience), "neutral"),
                q.targets.length ? c.badge(q.targets.join(", "), "neutral", "user") : null,
                q.roleNotPresent ? c.badge(t("editor.roleNotPresent"), "warn", "warning") : null,
                q.revisits ? c.badge(t("editor.revisits"), "accent") : null
              )
            )
          )
        ),
        el("h3", { class: "eyebrow", text: t("editor.challenges") }),
        el("ul", { class: "bullets" }, s.challenges.map((ch, ci) => el("li", null, editable(ex, p.concat("challenges", ci, "text"), { label: t("editor.challenges") })))),
        el("h3", { class: "eyebrow", text: t("editor.decision") }),
        s.decision
          ? el(
              "div",
              { class: "decision-preview" },
              editable(ex, p.concat("decision", "question"), { className: "decision-preview__q", label: t("editor.decision") }),
              s.decision.authorityName ? el("p", { class: "muted small", text: t("editor.authority", { name: s.decision.authorityName }) }) : null,
              s.decision.authorityNotPresent ? c.badge(t("editor.roleNotPresent"), "warn", "warning") : null,
              s.decision.options.length ? el("ol", { class: "options", type: "A" }, s.decision.options.map((o, oi) => el("li", null, editable(ex, p.concat("decision", "options", oi, "text"), { label: t("presenter.decisionOption") + " " + o.key })))) : null
            )
          : el("p", { class: "muted", text: s.noDecision ? L(s.noDecision) : t("editor.noDecision") }),
        el("h3", { class: "eyebrow", text: t("editor.facilitator") }),
        el(
          "div",
          { class: "facilitator-text" },
          editable(ex, p.concat("facilitator", "notes"), { rows: 3, label: t("editor.facilitator") }),
          fac.expected ? el("div", null, el("strong", { text: t("editor.expected") }), editable(ex, p.concat("facilitator", "expected"), { label: t("editor.expected") })) : null,
          fac.hints && fac.hints.length
            ? [el("p", null, el("strong", { text: t("editor.hints") + " — " }), t("editor.hintPolicy." + fac.hintPolicy)), el("ul", { class: "bullets" }, fac.hints.map((h, hi) => el("li", null, editable(ex, p.concat("facilitator", "hints", hi), { label: t("editor.hints") }))))]
            : null
        ),
        el("h3", { class: "eyebrow", text: t("editor.slideOrder") }),
        slideOrder(ex, s)
      )
    );
  }

  // ---- Branching pages --------------------------------------------------------------------------------------

  /** The page map (with titles on hover/focus) and one card per page; text is editable, structure is not. */
  function branchingPages(ex) {
    const B = BK.engine.branching;
    const map = B.mapGraph(ex, [], state.lang, null);
    const titles = {};
    ex.pages.forEach((pg) => (titles[pg.num] = L(pg.title)));
    const byId = {};
    ex.pages.forEach((pg) => (byId[pg.id] = pg));
    const numOf = (id) => (byId[id] ? byId[id].num : "?");
    const shown = ex.pages.filter((pg) => !(ex.settings.length === "short" && pg.long));
    return [
      el("h2", { class: "section-title", text: t("editor.pageMap") }),
      c.card({ class: "card preview-section" }, el("div", { class: "routemap-wrap" }, BK.graphics.routeMap(map, { lang: state.lang, title: t("editor.pageMap"), titles })), el("p", { class: "muted small", text: t("editor.structureLocked") })),
      el("h2", { class: "section-title", text: t("editor.pages") }),
      el("div", { class: "stack" }, shown.map((pg) => pageCard(ex, pg, ex.pages.indexOf(pg), numOf)))
    ];
  }

  function pageCard(ex, pg, pi, numOf) {
    const p = ["pages", pi];
    const kind = pg.ending ? c.badge(t("editor.ending", { grade: BK.engine.branching.gradeLabel(pg.ending.grade, state.lang) }), "accent", "flag") : pg.route ? c.badge(t("editor.routePage"), "neutral", "route") : null;
    const open = state.openStages[pg.id] !== undefined ? state.openStages[pg.id] : pg.id === ex.start;
    return el(
      "details",
      { class: "card stage-preview", open, on: { toggle: (e) => (state.openStages[pg.id] = e.target.open) } },
      el(
        "summary",
        null,
        el("span", { class: "stage-preview__num tabular", text: "§" + pg.num }),
        el("span", { class: "stage-preview__title" }, el("strong", { text: pg.ending ? L(pg.ending.label) : L(pg.title) })),
        kind,
        pg.long ? c.badge(t("editor.longOnly"), "info") : null,
        svgIcon("chevron-down", { className: "advanced__chevron" })
      ),
      el("div", { class: "stack" }, pageBody(ex, pg, p, numOf))
    );
  }

  function pageBody(ex, pg, p, numOf) {
    return [
      pg.route
        ? el("p", { class: "muted small", text: pg.route.map((r) => (r.if ? [].concat(r.if).join(" + ") : "—") + " → § " + numOf(r.to)).join(" · ") })
        : null,
      pg.ending
        ? [editable(ex, p.concat("ending", "label"), { className: "decision-preview__q", label: t("editor.ending", { grade: "" }) }), editable(ex, p.concat("ending", "summary"), { rows: 3, label: t("editor.text") })]
        : pg.route
          ? null
          : [
              state.editMode ? editable(ex, p.concat("title"), { label: t("editor.stageTitle"), className: "editable--title" }) : null,
              editable(ex, p.concat("narrative"), { rows: 3, label: t("editor.narrative") }),
              pg.variants.map((v, vi) => el("div", { class: "variant" }, c.badge("§ " + v.num + " · " + [].concat(v.if).join(" + "), "neutral"), editable(ex, p.concat("variants", vi, "narrative"), { rows: 2, label: t("editor.text") })))
            ],
      pg.injects.length ? el("ul", { class: "bullets" }, pg.injects.map((i) => el("li", { text: t("injectType." + i.type) + " — " + (L(i.headline) || L(i.content)) }))) : null,
      pg.choice
        ? el(
            "div",
            { class: "decision-preview" },
            editable(ex, p.concat("choice", "question"), { className: "decision-preview__q", label: t("editor.decision") }),
            el(
              "ol",
              { class: "options" },
              pg.choice.options.map((o, oi) =>
                el(
                  "li",
                  null,
                  editable(ex, p.concat("choice", "options", oi, "text"), { label: t("presenter.decisionOption") + " " + o.key }),
                  el("p", { class: "muted small", text: "→ § " + numOf(o.to) + (o.set.length ? " · " + t("presenter.setsFlags", { list: o.set.map((f) => BK.engine.branching.flagLabel(ex, f, state.lang)).join(", ") }) : "") }),
                  el("div", { class: "small" }, el("strong", { text: t("editor.whyNote") + ": " }), editable(ex, p.concat("choice", "options", oi, "why"), { label: t("editor.whyNote") }))
                )
              )
            ),
            el("div", { class: "small" }, el("strong", { text: t("editor.strongNote") + ": " }), editable(ex, p.concat("choice", "strong"), { label: t("editor.strongNote") }))
          )
        : null,
      pg.facilitator && pg.facilitator.notes ? el("div", { class: "facilitator-text" }, editable(ex, p.concat("facilitator", "notes"), { rows: 2, label: t("editor.facilitator") })) : null
    ];
  }

  // ---- View -----------------------------------------------------------------------------------------------

  function build(root) {
    const ex = load();
    if (!ex) {
      root.append(c.pageHeader(t("editor.title")), c.card(null, c.emptyState("info", t("editor.notFound"), c.button({ label: t("notFound.home"), href: "#/" }))));
      return;
    }
    if (state.forId !== ex.id) {
      state.forId = ex.id;
      state.lang = ex.params.lang;
      state.editMode = false;
      state.openStages = {};
    }
    const issues = BK.engine.validator.validateInstance(ex);
    // append() takes nodes only: flatten the format-specific parts and drop empty slots.
    const parts = [
      header(ex, issues),
      state.editMode ? editable(ex, ["title"], { label: t("wizard.exerciseTitle"), className: "editable--title" }) : null,
      el("h2", { class: "section-title", text: t("editor.overview") }),
      overview(ex)
    ].concat(ex.format === "branching" ? branchingPages(ex) : [truth(ex), el("div", { class: "stack" }, ex.stages.map((s, si) => stageCard(ex, s, si)))]);
    root.append(...parts.filter(Boolean));
  }

  BK.ui.editor = {
    title: (ctx) => {
      const ex = BK.store.getItem("exercise", ctx.params.instanceId);
      return ex ? BK.loc(ex.title) : t("editor.title");
    },
    render(root, ctx) {
      // Custom exercises are edited in the slide builder; an imported one gets its deck back first.
      const ex = BK.store.getItem("exercise", ctx.params.instanceId);
      if (ex && ex.format === "custom") {
        let deckId = ex.deckId;
        if (!deckId || !BK.store.getItem("deck", deckId)) {
          const d = BK.engine.custom.normaliseDeck({ title: BK.loc(ex.title), summary: BK.loc(ex.summary), lang: ex.settings.lang, stageTheme: ex.settings.stageTheme, minutes: ex.pacing.totalMinutes, meters: ex.settings.meters, complications: ex.settings.complications, slides: ex.slides });
          BK.store.putItem("deck", d);
          deckId = d.id;
          BK.store.putItem("exercise", Object.assign({}, ex, { deckId }));
        }
        window.location.replace("#/builder/" + encodeURIComponent(deckId));
        return;
      }
      state.root = root;
      state.ctx = ctx;
      build(root);
    }
  };
})();
