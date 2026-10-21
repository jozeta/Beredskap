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
          el("span", { class: "muted small", text: BK.i18n.fmt.dateTime(new Date(sess.createdAt), lang) + " · " + t("history.decisions", { n: decided }) + " · " + t("history.observations", { n: sess.observations.length }) })
        )
      ),
      el(
        "div",
        { class: "actions" },
        sess.status !== "ended" ? c.button({ label: t("history.presenter"), icon: "play", size: "sm", href: "#/presenter/" + encodeURIComponent(sess.id) }) : null,
        c.button({ label: t("history.debrief"), icon: "notes", size: "sm", kind: sess.status === "ended" ? "primary" : "secondary", href: "#/debrief/" + encodeURIComponent(sess.id) }),
        c.button({ label: t("export.json"), icon: "download", size: "sm", kind: "ghost", onClick: () => BK.io.export.downloadJSON(exercise, sess) }),
        c.button({ label: t("history.runAgain"), icon: "dice", size: "sm", kind: "ghost", onClick: () => BK.ui.startExercise(exercise) }),
        c.button({ label: sess.archived ? t("history.unarchive") : t("history.archive"), size: "sm", kind: "ghost", onClick: () => save(Object.assign({}, sess, { archived: !sess.archived })) }),
        c.button({ label: t("common.delete"), icon: "trash", size: "sm", kind: "ghost", onClick: () => remove(sess) })
      )
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
        )
      );
    },
    runImport
  };
})();
