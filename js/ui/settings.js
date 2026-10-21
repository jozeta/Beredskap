/*
 * settings.js — Preferences (language, UI theme, default stage theme, default
 * duration) and local-data management (raw export, double-confirmed wipe).
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el } = BK.dom;
  const c = BK.ui.c;
  const t = BK.t;

  function exportRaw() {
    const stamp = new Date().toISOString().slice(0, 10);
    BK.dom.download("beredskap-raw-" + stamp + ".json", JSON.stringify(BK.store.rawDump(), null, 2));
  }

  async function clearAll() {
    const first = await BK.ui.dialog.confirm({
      title: t("settings.clear1.title"),
      message: t("settings.clear1.body"),
      confirmLabel: t("settings.clear1.confirm"),
      danger: true
    });
    if (!first) return;
    const second = await BK.ui.dialog.confirm({
      title: t("settings.clear2.title"),
      message: t("settings.clear2.body"),
      confirmLabel: t("settings.clear2.confirm"),
      danger: true
    });
    if (!second) return;
    BK.store.clearAll();
    BK.ui.toast(t("settings.cleared"), "ok");
    BK.router.refresh();
  }

  function generalCard() {
    const prefs = BK.store.prefs.get();
    const themeOptions = BK.theme.MODES.map((m) => ({ value: m, label: t("theme." + m) }));
    return c.card(
      { class: "card form-section" },
      el("h2", { text: t("settings.general") }),
      c.segmented({
        label: t("settings.language"),
        name: "st-lang",
        value: BK.i18n.getLang(),
        options: BK.i18n.LANGS.map((l) => ({ value: l, label: t("lang." + l) })),
        onChange: (v) => BK.app.setLanguage(v)
      }),
      c.segmented({
        label: t("settings.uiTheme"),
        name: "st-ui-theme",
        value: prefs.uiTheme,
        options: themeOptions,
        onChange: (v) => BK.theme.setUiTheme(v)
      }),
      c.segmented({
        label: t("settings.stageTheme"),
        name: "st-stage-theme",
        value: prefs.stageTheme,
        options: themeOptions,
        hint: t("settings.stageThemeHint"),
        onChange: (v) => BK.store.prefs.set({ stageTheme: v })
      }),
      c.segmented({
        label: t("settings.defaultDuration"),
        name: "st-duration",
        value: String(prefs.defaultDuration),
        options: BK.data.options.durations.map((m) => ({ value: String(m), label: t("common.minutes", { n: m }) })),
        onChange: (v) => BK.store.prefs.set({ defaultDuration: Number(v) })
      })
    );
  }

  function dataCard() {
    const count = BK.store.keys("").length;
    return c.card(
      { class: "card form-section" },
      el("h2", { text: t("settings.data") }),
      el("p", { text: t("settings.dataBody") }),
      BK.store.available ? null : el("p", { class: "notice notice--warn", text: t("error.storageUnavailable") }),
      el("p", { class: "muted small", text: t("settings.dataCount", { n: count }) }),
      el(
        "div",
        { class: "actions" },
        c.button({ label: t("settings.exportRaw"), icon: "download", onClick: exportRaw }),
        c.button({ label: t("settings.clearAll"), icon: "trash", kind: "danger", onClick: clearAll })
      )
    );
  }

  BK.ui.settings = {
    title: () => t("settings.title"),
    render(root) {
      root.append(c.pageHeader(t("settings.title")), el("div", { class: "grid grid--two" }, generalCard(), dataCard()));
    },
    exportRaw
  };
})();
