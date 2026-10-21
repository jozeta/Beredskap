/*
 * history.js — Past sessions: reopen debrief, export, duplicate, archive, delete.
 *
 * Phase 1 lists stored sessions; the actions arrive with sessions and debrief
 * in phases 3 and 5.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el } = BK.dom;
  const c = BK.ui.c;
  const t = BK.t;

  BK.ui.history = {
    title: () => t("history.title"),
    render(root) {
      const sessions = BK.store.list("session");
      const lang = BK.i18n.getLang();
      root.append(
        c.pageHeader(t("history.title"), t("history.intro")),
        c.card(
          { class: "card card--wide" },
          sessions.length
            ? el(
                "ul",
                { class: "list" },
                sessions.map((s) =>
                  el(
                    "li",
                    { class: "list__item" },
                    el(
                      "div",
                      { class: "list__main" },
                      el("span", { class: "list__title", text: s.title || s.id }),
                      el("span", { class: "muted small", text: s.updatedAt ? BK.i18n.fmt.dateTime(new Date(s.updatedAt), lang) : "" })
                    )
                  )
                )
              )
            : c.emptyState("timeline", t("history.empty"))
        )
      );
    }
  };
})();
