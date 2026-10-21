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
  const state = { query: "", category: "", archetype: "" };

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
    const q = state.query.trim().toLowerCase();
    return !q || searchText(tpl).includes(q);
  }

  function emblem(tpl, size) {
    const name = tpl.emblem && BK.icons.has(tpl.emblem) ? tpl.emblem : "shield";
    return el("div", { class: "emblem", dataset: { category: tpl.category } }, svgIcon(name, { size: size || 32 }));
  }

  function archetypeBadge(tpl) {
    const letter = opts.archetypeLetter(tpl.archetype);
    return c.badge(letter + " · " + t("archetype." + letter), "neutral");
  }

  function scenarioCard(tpl) {
    const problems = BK.scenarios.problems(tpl.id);
    return el(
      "article",
      { class: "card scenario-card" },
      el(
        "div",
        { class: "scenario-card__head" },
        emblem(tpl),
        el(
          "div",
          null,
          el("h2", { class: "scenario-card__title", text: BK.loc(tpl.title) }),
          el(
            "div",
            { class: "badges" },
            c.badge(t("category." + tpl.category), "accent"),
            archetypeBadge(tpl),
            c.badge(t("common.stageRange", { min: tpl.minStages, max: tpl.maxStages }), "neutral", "timeline")
          )
        )
      ),
      el("p", { class: "scenario-card__summary", text: BK.loc(tpl.summary) }),
      el("h3", { class: "eyebrow", text: t("library.objectives") }),
      el("ul", { class: "bullets" }, (tpl.learningObjectives || []).slice(0, 3).map((lo) => el("li", { text: BK.loc(lo.text) }))),
      tpl.mitre && tpl.mitre.length
        ? el("p", { class: "mono small muted" }, el("span", { class: "sr-only", text: t("library.attack") + ": " }), tpl.mitre.join(" · "))
        : null,
      problems.length ? c.badge(t("library.invalid", { n: problems.length }), "danger", "warning") : null,
      el(
        "div",
        { class: "actions" },
        c.button({ label: t("library.preview"), icon: "notes", kind: "ghost", onClick: () => preview(tpl) }),
        c.button({ label: t("library.use"), icon: "play", kind: "primary", href: "#/new?scenario=" + encodeURIComponent(tpl.id) })
      )
    );
  }

  function preview(tpl) {
    const body = el(
      "div",
      { class: "stack" },
      el("div", { class: "scenario-card__head" }, emblem(tpl, 40), el("div", { class: "badges" }, c.badge(t("category." + tpl.category), "accent"), archetypeBadge(tpl))),
      el("p", { text: BK.loc(tpl.summary) }),
      el("h3", { class: "eyebrow", text: t("library.objectives") }),
      el("ul", { class: "bullets" }, (tpl.learningObjectives || []).map((lo) => el("li", { text: BK.loc(lo.text) }))),
      el("h3", { class: "eyebrow", text: t("library.stagesOutline") }),
      el("ol", { class: "bullets" }, (tpl.stages || []).map((s) => el("li", { text: BK.loc(s.title) }))),
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
      c.field({ label: t("library.archetype"), control: c.select(archetypeOptions, state.archetype, (v) => { state.archetype = v; onChange(); }) })
    );
  }

  BK.ui.library = {
    title: () => t("library.title"),
    render(root) {
      const all = BK.scenarios.list();
      const results = el("div", { class: "results" });
      root.append(c.pageHeader(t("library.title"), t("library.intro")), filters(() => renderResults(results, all)), results);
      renderResults(results, all);
    }
  };
})();
