/*
 * library.js — Scenario library: cards for every registered template with
 * search, category and structure (archetype) filters, and a template preview.
 *
 * The preview shows only what an operator needs to choose a scenario (summary,
 * objectives, stage titles, framework references) — never hidden facts or
 * the ground truth, which belong to a generated, privately previewed instance.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el, svgIcon } = BK.dom;
  const c = BK.ui.c;
  const t = BK.t;
  const opts = BK.data.options;

  // Filter state survives re-renders (e.g. language switch) during the session.
  const state = { query: "", category: "", archetype: "", format: "" };

  const formatOf = (tpl) => (tpl.format === "branching" ? "branching" : "discussion");

  /** Lower-cased haystack in both languages so search works regardless of UI language. */
  function searchText(tpl) {
    const parts = [tpl.id, t("category." + tpl.category, null, "en"), t("category." + tpl.category, null, "sv")];
    ["en", "sv"].forEach((l) => {
      parts.push(BK.loc(tpl.title, l), BK.loc(tpl.summary, l));
      (tpl.learningObjectives || []).forEach((lo) => parts.push(BK.loc(lo.text, l)));
    });
    parts.push((tpl.mitre || []).join(" "));
    return parts.join(" ").toLowerCase();
  }

  function matches(tpl) {
    if (state.category && tpl.category !== state.category) return false;
    if (state.archetype && opts.archetypeLetter(tpl.archetype) !== state.archetype) return false;
    if (state.format && formatOf(tpl) !== state.format) return false;
    const q = state.query.trim().toLowerCase();
    return !q || searchText(tpl).includes(q);
  }

  /** Emblem on a disc tinted with the category's hue (decorative identity, same as the title artwork). */
  function emblem(tpl, size) {
    const hue = (BK.graphics.CATEGORY_HUE && BK.graphics.CATEGORY_HUE[tpl.category]) || "accent";
    return el("div", { class: "emblem", dataset: { category: tpl.category }, style: { "--hue": "var(--" + hue + ")" } }, BK.dom.emblem(tpl.emblem, { size: size || 56 }));
  }

  /** One quiet line of facts: format, size and length. */
  function metaLine(tpl) {
    if (tpl.format !== "branching") {
      return el("p", { class: "scenario-card__meta" }, svgIcon("timeline", { size: 16 }), el("span", { text: t("branch.formatDiscussion") + " · " + t("library.meta.stages", { min: tpl.minStages, max: tpl.maxStages }) }));
    }
    const st = BK.engine.branching.stats(tpl.pages, tpl.start);
    return el("p", { class: "scenario-card__meta scenario-card__meta--branching" }, svgIcon("route", { size: 16 }), el("span", { text: t("branch.format") + " · " + t("library.meta.branching", { min: st.short[0], max: st.long[1], endings: st.endings }) }));
  }

  function archetypeBadge(tpl) {
    const letter = opts.archetypeLetter(tpl.archetype);
    return c.badge(letter + " · " + t("archetype." + letter), "neutral");
  }

  /** Stage range for discussion exercises; format, choices and endings for branching ones. */
  function sizeBadges(tpl) {
    if (tpl.format !== "branching") return c.badge(t("common.stageRange", { min: tpl.minStages, max: tpl.maxStages }), "neutral", "timeline");
    const st = BK.engine.branching.stats(tpl.pages, tpl.start);
    return [
      c.badge(t("branch.format"), "info", "route"),
      c.badge(t("branch.choiceRange", { min: st.short[0], max: st.long[1] }), "neutral", "decision"),
      c.badge(t("branch.endings", { n: st.endings }), "neutral", "flag")
    ];
  }

  function scenarioCard(tpl) {
    const problems = BK.scenarios.problems(tpl.id);
    return el(
      "article",
      { class: ["card", "scenario-card", tpl.format === "branching" && "scenario-card--branching"] },
      el(
        "div",
        { class: "scenario-card__head" },
        emblem(tpl),
        el("div", { class: "scenario-card__heading" }, el("p", { class: "eyebrow scenario-card__category", text: t("category." + tpl.category) }), el("h2", { class: "scenario-card__title", text: BK.loc(tpl.title) }))
      ),
      el("p", { class: "scenario-card__summary", text: BK.loc(tpl.summary) }),
      metaLine(tpl),
      problems.length ? c.badge(t("library.invalid", { n: problems.length }), "danger", "warning") : null,
      el(
        "div",
        { class: "actions" },
        c.button({ label: t("library.preview"), icon: "notes", kind: "ghost", onClick: () => preview(tpl) }),
        c.button({ label: t("library.use"), icon: "play", kind: "primary", href: "#/new?scenario=" + encodeURIComponent(tpl.id) })
      )
    );
  }

  /** Branching preview: the size of the map, never the pages themselves (they are the surprise). */
  function mapOutline(tpl) {
    const st = BK.engine.branching.stats(tpl.pages, tpl.start);
    const range = (r) => r[0] + "–" + r[1];
    return [
      el("h3", { class: "eyebrow", text: t("library.mapOutline") }),
      el("p", { text: t("library.mapSummary", { pages: tpl.pages.filter((p) => !p.route).length, endings: st.endings, short: range(st.short), long: range(st.long) }) })
    ];
  }

  function preview(tpl) {
    const body = el(
      "div",
      { class: "stack" },
      el("div", { class: "scenario-card__head" }, emblem(tpl, 40), el("div", { class: "badges" }, c.badge(t("category." + tpl.category), "accent"), archetypeBadge(tpl), sizeBadges(tpl))),
      el("p", { text: BK.loc(tpl.summary) }),
      el("h3", { class: "eyebrow", text: t("library.objectives") }),
      el("ul", { class: "bullets" }, (tpl.learningObjectives || []).map((lo) => el("li", { text: BK.loc(lo.text) }))),
      tpl.format === "branching" ? mapOutline(tpl) : [el("h3", { class: "eyebrow", text: t("library.stagesOutline") }), el("ol", { class: "bullets" }, (tpl.stages || []).map((s) => el("li", { text: BK.loc(s.title) })))],
      el("h3", { class: "eyebrow", text: t("library.attack") }),
      el("p", { class: "mono small", text: (tpl.mitre || []).join(" · ") })
    );
    BK.ui.dialog.open({
      title: BK.loc(tpl.title),
      body,
      wide: true,
      actions: [
        { label: t("common.close"), value: null, kind: "secondary" },
        { label: t("library.use"), value: "use", kind: "primary", onClick: () => BK.router.navigate("#/new?scenario=" + encodeURIComponent(tpl.id)) }
      ]
    });
  }

  function renderResults(container, all) {
    const shown = all.filter(matches);
    BK.dom.mount(
      container,
      el("p", { class: "muted small", role: "status", text: t("library.count", { n: shown.length, total: all.length }) }),
      all.length === 0
        ? c.emptyState("book", t("library.empty"))
        : shown.length === 0
          ? c.emptyState("search", t("library.noMatch"))
          : el("div", { class: "grid grid--cards" }, shown.map(scenarioCard))
    );
  }

  function filters(onChange) {
    const search = el("input", {
      class: "input",
      type: "search",
      value: state.query,
      placeholder: t("library.searchPlaceholder"),
      on: { input: (e) => { state.query = e.target.value; onChange(); } }
    });

    const categoryOptions = [{ value: "", label: t("library.allCategories") }].concat(
      opts.categories.map((id) => ({ value: id, label: t("category." + id) }))
    );
    const archetypeOptions = [{ value: "", label: t("library.allArchetypes") }].concat(
      Object.keys(opts.archetypes).map((k) => ({ value: k, label: k + " · " + t("archetype." + k) }))
    );

    return el(
      "div",
      { class: "toolbar" },
      c.field({ label: t("library.search"), control: search, className: "field--grow" }),
      c.field({ label: t("library.category"), control: c.select(categoryOptions, state.category, (v) => { state.category = v; onChange(); }) }),
      c.field({ label: t("library.archetype"), control: c.select(archetypeOptions, state.archetype, (v) => { state.archetype = v; onChange(); }) }),
      c.field({
        label: t("library.format"),
        control: c.select(
          [{ value: "", label: t("library.allFormats") }, { value: "discussion", label: t("branch.formatDiscussion") }, { value: "branching", label: t("branch.format") }],
          state.format,
          (v) => { state.format = v; onChange(); }
        )
      })
    );
  }

  BK.ui.library = {
    title: () => t("library.title"),
    render(root, ctx) {
      // The dashboard's format cards link here with ?format=.
      if (ctx && ctx.query && ["discussion", "branching"].includes(ctx.query.format)) state.format = ctx.query.format;
      const all = BK.scenarios.list();
      const results = el("div", { class: "results" });
      root.append(c.pageHeader(t("library.title"), t("library.intro")), filters(() => renderResults(results, all)), results);
      renderResults(results, all);
    }
  };
})();
