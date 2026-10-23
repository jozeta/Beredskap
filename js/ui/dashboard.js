/*
 * dashboard.js — Landing view: a hero with the quick-start actions and the
 * library at a glance, the two exercise formats, the active session and the
 * most recent exercises.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el, svgIcon } = BK.dom;
  const c = BK.ui.c;
  const t = BK.t;

  const RECENT_LIMIT = 6;

  function stat(n, label) {
    return el("li", { class: "hero__stat" }, el("strong", { class: "tabular", text: String(n) }), el("span", { text: label }));
  }

  function hero() {
    const all = BK.scenarios.list();
    const branching = all.filter((tpl) => tpl.format === "branching").length;
    const runs = BK.store.list("session").length;
    return el(
      "section",
      { class: "hero", "aria-labelledby": "hero-title" },
      el("div", { class: "hero__art" }, BK.graphics.illustration.hero()),
      el(
        "div",
        { class: "hero__body" },
        el("p", { class: "eyebrow hero__eyebrow", text: t("dashboard.hero.eyebrow") }),
        el("h1", { id: "hero-title", class: "hero__title", text: t("dashboard.hero.title") }),
        el("p", { class: "lead hero__lead", text: t("dashboard.intro") }),
        el(
          "div",
          { class: "actions" },
          c.button({ label: t("dashboard.quick.new"), icon: "plus", kind: "primary", size: "lg", href: "#/new" }),
          c.button({ label: t("dashboard.quick.surprise"), icon: "dice", size: "lg", href: "#/new?scenario=random" }),
          c.button({ label: t("import.button"), icon: "download", kind: "ghost", onClick: () => BK.ui.history.runImport() })
        ),
        el(
          "ul",
          { class: "hero__stats", "aria-label": t("dashboard.scenarioCount", { n: all.length }) },
          stat(all.length, t("dashboard.stats.scenarios")),
          stat(all.length - branching, t("dashboard.stats.discussion")),
          stat(branching, t("dashboard.stats.branching")),
          stat(runs, t("dashboard.stats.runs"))
        )
      )
    );
  }

  function formatCard(kind, icon, count) {
    return el(
      "a",
      { class: ["card", "format-card", "format-card--" + kind], href: "#/library?format=" + kind },
      el("span", { class: "format-card__icon" }, svgIcon(icon, { size: 28 })),
      el("h3", { class: "format-card__title", text: t("dashboard.formats." + kind + ".title") }),
      el("p", { class: "format-card__body", text: t("dashboard.formats." + kind + ".body") }),
      el("span", { class: "format-card__more" }, el("span", { text: t("dashboard.formats.browse", { n: count }) }), svgIcon("next", { size: 16 }))
    );
  }

  function formats() {
    const all = BK.scenarios.list();
    const branching = all.filter((tpl) => tpl.format === "branching").length;
    return el(
      "section",
      { class: "formats", "aria-labelledby": "formats-title" },
      el("h2", { id: "formats-title", class: "section-title", text: t("dashboard.formats.title") }),
      el("div", { class: "grid grid--two" }, formatCard("discussion", "timeline", all.length - branching), formatCard("branching", "route", branching))
    );
  }

  function activeSessionCard() {
    const active = BK.store.list("session").find((s) => s.status === "running" || s.status === "paused");
    return c.card(
      { class: "card card--session" },
      el("h2", { text: t("dashboard.resume.title") }),
      active
        ? el(
            "div",
            { class: "resume" },
            el("div", { class: "resume__who" }, BK.dom.emblem(active.instance.emblem, { size: 44 }), el("p", { class: "resume__title", text: BK.loc(active.title) || active.id })),
            c.button({ label: t("dashboard.resume.action"), icon: "play", kind: "primary", href: "#/presenter/" + encodeURIComponent(active.id) })
          )
        : c.emptyState("clock", t("dashboard.resume.empty"))
    );
  }

  function recentCard() {
    const exercises = BK.store.list("exercise").slice(0, RECENT_LIMIT);
    const lang = BK.i18n.getLang();
    return c.card(
      { class: "card" },
      el("h2", { text: t("dashboard.recent.title") }),
      exercises.length
        ? el(
            "ul",
            { class: "list" },
            exercises.map((ex) =>
              el(
                "li",
                { class: "list__item list__item--link" },
                el("span", { class: "list__emblem" }, BK.dom.emblem(ex.emblem, { size: 36 })),
                el(
                  "div",
                  { class: "list__main" },
                  el("span", { class: "list__title", text: BK.loc(ex.title) || ex.id }),
                  el("span", {
                    class: "muted small",
                    text: [ex.format === "branching" ? t("branch.format") : null, ex.format === "custom" ? t("category.custom") : ex.seed, ex.updatedAt ? BK.i18n.fmt.dateTime(new Date(ex.updatedAt), lang) : ""].filter(Boolean).join(" · ")
                  })
                ),
                c.button({ label: t("dashboard.recent.open"), icon: "edit", kind: "ghost", size: "sm", href: "#/edit/" + encodeURIComponent(ex.id) })
              )
            )
          )
        : c.emptyState("notes", t("dashboard.recent.empty"))
    );
  }

  BK.ui.dashboard = {
    title: () => t("dashboard.title"),
    render(root) {
      root.append(hero(), formats(), el("div", { class: "grid grid--dashboard" }, recentCard(), activeSessionCard()));
    }
  };
})();
