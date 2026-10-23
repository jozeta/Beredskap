/*
 * history.js — Past and running sessions: open presenter, debrief, export,
 * run again, archive and delete (destructive actions are confirmed). Also the
 * entry point for importing an exported exercise or session.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el } = BK.dom;
  const c = BK.ui.c;
  const t = BK.t;

  let showArchived = false;

  const STATUS_TONE = { running: "ok", paused: "warn", ended: "neutral" };
  const STATUS_ICON = { running: "play", paused: "pause", ended: "flag" };

  /** Shared import flow (also used by the dashboard). */
  async function runImport() {
    try {
      const res = await BK.io.import.pickAndImport();
      if (!res) return;
      if (res.deck) {
        BK.ui.toast(t("import.ok", { title: res.deck.title }), "ok");
        BK.router.navigate("#/builder/" + encodeURIComponent(res.deck.id));
        return;
      }
      BK.ui.toast(t("import.ok", { title: BK.loc(res.exercise.title) }), "ok");
      BK.router.navigate(res.session ? "#/debrief/" + encodeURIComponent(res.session.id) : "#/edit/" + encodeURIComponent(res.exercise.id));
    } catch (err) {
      const reason = err && err.reason ? t("import.reason." + err.reason) : t("import.reason.invalid");
      BK.ui.toast(t("error.import", { reason }) + (err && err.detail ? " (" + err.detail + ")" : ""), "danger", 10000);
    }
  }

  function save(sess) {
    BK.store.putItem("session", sess);
    BK.router.refresh();
  }

  async function remove(sess) {
    const ok = await BK.ui.dialog.confirm({ title: t("history.deleteTitle"), message: t("history.deleteBody", { title: BK.loc(sess.title) }), confirmLabel: t("common.delete"), danger: true });
    if (!ok) return;
    BK.store.removeItem("session", sess.id);
    BK.store.remove("presence:" + sess.id);
    BK.ui.toast(t("history.deleted"), "ok");
    BK.router.refresh();
  }

  /** Branching runs: format, length/mode and the ending reached. */
  function branchBadges(sess) {
    if (sess.instance.format !== "branching") return null;
    const B = BK.engine.branching;
    const last = B.page(sess.instance, sess.route[sess.route.length - 1].pageId);
    return [
      c.badge(t("branch.format") + " · " + t("branch.length." + sess.instance.settings.length) + " · " + t("branch.mode." + sess.instance.settings.mode), "info", "route"),
      last && last.ending ? c.badge(B.gradeLabel(last.ending.grade) + " · " + BK.loc(last.ending.label), last.ending.grade <= 2 ? "ok" : last.ending.grade === 3 ? "warn" : "danger", "flag") : null
    ];
  }

  function row(sess, lang) {
    const exercise = Object.assign({ id: sess.exerciseId }, sess.instance);
    const decided = Object.keys(sess.decisions).length;
    return el(
      "li",
      { class: ["list__item", "history-item", sess.archived && "is-archived"] },
      el(
        "div",
        { class: "list__main" },
        el("span", { class: "list__title", text: BK.loc(sess.title) || sess.id }),
        el(
          "span",
          { class: "badges" },
          c.badge(t("history.status." + sess.status), STATUS_TONE[sess.status], STATUS_ICON[sess.status]),
          sess.archived ? c.badge(t("history.archived"), "neutral") : null,
          sess.imported ? c.badge(t("history.imported"), "info") : null,
          branchBadges(sess),
          el("span", { class: "muted small", text: BK.i18n.fmt.dateTime(new Date(sess.createdAt), lang) + " · " + t("history.decisions", { n: decided }) + " · " + t("history.observations", { n: sess.observations.length }) })
        )
      ),
      el(
        "div",
        { class: "actions history-item__actions" },
        // Icon-only, always the same six in the same places; an action that does not apply is shown disabled.
        // Each label shows as a tooltip and is the accessible name.
        sess.status !== "ended"
          ? c.button({ label: t("history.presenter"), icon: "play", iconOnly: true, size: "sm", href: "#/presenter/" + encodeURIComponent(sess.id) })
          : c.button({ label: t("history.presenterEnded"), icon: "play", iconOnly: true, size: "sm", disabled: true }),
        c.button({ label: t("history.debrief"), icon: "notes", iconOnly: true, size: "sm", href: "#/debrief/" + encodeURIComponent(sess.id) }),
        c.button({ label: t("export.json"), icon: "download", iconOnly: true, size: "sm", onClick: () => BK.io.export.downloadJSON(exercise, sess) }),
        c.button({ label: t("history.runAgain"), icon: "dice", iconOnly: true, size: "sm", onClick: () => BK.ui.startExercise(exercise) }),
        c.button({ label: sess.archived ? t("history.unarchive") : t("history.archive"), icon: "archive", iconOnly: true, size: "sm", onClick: () => save(Object.assign({}, sess, { archived: !sess.archived })) }),
        c.button({ label: t("common.delete"), icon: "trash", iconOnly: true, size: "sm", className: "btn--danger-hover", onClick: () => remove(sess) })
      )
    );
  }

  /** Open improvement actions across every session, soonest due first, each linking to its debrief. */
  function openActions(all, lang) {
    const today = new Date().toISOString().slice(0, 10);
    const items = [];
    all.forEach((s) => (s.actions || []).forEach((a) => {
      if (a.status === "open" || a.status === "progress") items.push({ a, s });
    }));
    items.sort((x, y) => (x.a.due || "9999") .localeCompare(y.a.due || "9999"));
    return c.card(
      { class: "card card--wide history-actions" },
      el("h2", { text: t("history.openActions") }),
      el("p", { class: "muted", text: items.length ? t("history.openActionsIntro") : t("history.openActionsNone") }),
      items.length
        ? el(
            "ul",
            { class: "list" },
            items.map(({ a, s }) =>
              el(
                "li",
                { class: "list__item list__item--link history-actions__item" },
                el(
                  "a",
                  { class: "list__main", href: "#/debrief/" + encodeURIComponent(s.id) },
                  el("span", { class: "list__title", text: a.text }),
                  el(
                    "span",
                    { class: "badges" },
                    c.badge(t("plan.st." + a.status), a.status === "progress" ? "info" : "neutral"),
                    a.due ? c.badge(a.due, a.due < today ? "warn" : "neutral", "clock") : null,
                    a.due && a.due < today ? c.badge(t("plan.overdue"), "warn") : null,
                    a.owner ? c.badge(a.owner, "neutral", "user") : null,
                    el("span", { class: "muted small", text: BK.loc(s.title, lang) })
                  )
                )
              )
            )
          )
        : null
    );
  }

  BK.ui.history = {
    title: () => t("history.title"),
    render(root) {
      const lang = BK.i18n.getLang();
      const all = BK.store.list("session");
      const sessions = all.filter((s) => showArchived || !s.archived);
      root.append(
        c.pageHeader(t("history.title"), t("history.intro"), [c.button({ label: t("import.button"), icon: "download", onClick: runImport })]),
        c.card(
          { class: "card card--wide" },
          all.some((s) => s.archived)
            ? c.checkbox(t("history.showArchived"), showArchived, (on) => {
                showArchived = on;
                BK.router.refresh();
              })
            : null,
          sessions.length ? el("ul", { class: "list" }, sessions.map((s) => row(s, lang))) : c.emptyState("timeline", t("history.empty"))
        ),
        all.length ? openActions(all, lang) : null
      );
    },
    runImport
  };
})();
