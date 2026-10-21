/*
 * dashboard.js — Landing view: quick start, resume an active session,
 * and the most recent exercises.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el } = BK.dom;
  const c = BK.ui.c;
  const t = BK.t;

  const RECENT_LIMIT = 6;

  function quickStartCard() {
    const count = BK.scenarios.count();
    return c.card(
      { class: "card card--hero" },
      el("h2", { text: t("dashboard.quick.title") }),
      el("p", { text: t("dashboard.quick.body") }),
      el(
        "div",
        { class: "actions" },
        c.button({ label: t("dashboard.quick.new"), icon: "plus", kind: "primary", href: "#/new" }),
        c.button({ label: t("dashboard.quick.surprise"), icon: "dice", href: "#/new?scenario=random" }),
        c.button({ label: t("dashboard.quick.library"), icon: "book", kind: "ghost", href: "#/library" }),
        c.button({ label: t("import.button"), icon: "download", kind: "ghost", onClick: () => BK.ui.history.runImport() })
      ),
      el("p", { class: "muted small", text: t("dashboard.scenarioCount", { n: count }) })
    );
  }

  function activeSessionCard() {
    const active = BK.store.list("session").find((s) => s.status === "running" || s.status === "paused");
    return c.card(
      null,
      el("h2", { text: t("dashboard.resume.title") }),
      active
        ? el(
            "div",
            { class: "resume" },
            el("p", { class: "resume__title", text: BK.loc(active.title) || active.id }),
            c.button({ label: t("dashboard.resume.action"), icon: "play", kind: "primary", href: "#/presenter/" + encodeURIComponent(active.id) })
          )
        : c.emptyState("clock", t("dashboard.resume.empty"))
    );
  }

  function recentCard() {
    const exercises = BK.store.list("exercise").slice(0, RECENT_LIMIT);
    const lang = BK.i18n.getLang();
    return c.card(
      { class: "card card--wide" },
      el("h2", { text: t("dashboard.recent.title") }),
      exercises.length
        ? el(
            "ul",
            { class: "list" },
            exercises.map((ex) =>
              el(
                "li",
                { class: "list__item" },
                el(
                  "div",
                  { class: "list__main" },
                  el("span", { class: "list__title", text: BK.loc(ex.title) || ex.id }),
                  el("span", {
                    class: "muted small",
                    text: [ex.seed, ex.updatedAt ? BK.i18n.fmt.dateTime(new Date(ex.updatedAt), lang) : ""].filter(Boolean).join(" · ")
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
      root.append(
        c.pageHeader(t("dashboard.title"), t("dashboard.intro")),
        el("div", { class: "grid grid--dashboard" }, quickStartCard(), activeSessionCard(), recentCard())
      );
    }
  };
})();
