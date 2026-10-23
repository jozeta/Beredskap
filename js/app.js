/*
 * app.js — Application bootstrap: applies preferences, builds the operator
 * shell (header, navigation, language/theme switches, save status), registers
 * routes and surfaces storage problems (spec section 15) on start-up.
 *
 * Loaded last; every other module is already attached to window.BK.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el, svgIcon } = BK.dom;
  const t = BK.t;

  const NAV = [
    { hash: "#/", key: "nav.dashboard", icon: "gauge", match: (p) => p === "/" },
    // Exercises start from the library ("Use scenario" or a custom exercise), so setup, editing and the builder belong to it.
    { hash: "#/library", key: "nav.library", icon: "book", match: (p) => p.startsWith("/library") || p.startsWith("/new") || p.startsWith("/edit") || p.startsWith("/builder") },
    { hash: "#/history", key: "nav.history", icon: "timeline", match: (p) => p.startsWith("/history") || p.startsWith("/debrief") },
    { hash: "#/settings", key: "nav.settings", icon: "settings", match: (p) => p.startsWith("/settings") },
    { hash: "#/help", key: "nav.help", icon: "question", match: (p) => p.startsWith("/help") }
  ];

  const THEME_ICON = { light: "sun", dark: "moon", system: "theme-system" };

  let lastStatus = null; // most recent store:status payload, re-rendered after language switches

  // ---- Shell --------------------------------------------------------------------

  function wordmark() {
    return el(
      "a",
      { class: "wordmark", href: "#/", "aria-label": t("app.name") + " — " + t("nav.dashboard") },
      svgIcon("mark", { size: 28, className: "wordmark__mark" }),
      el("span", { class: "wordmark__text" }, el("span", { class: "wordmark__name", text: t("app.name") }), el("span", { class: "wordmark__tagline", text: t("app.tagline") }))
    );
  }

  function nav(path) {
    return el(
      "nav",
      { class: "nav", "aria-label": t("nav.label") },
      el(
        "ul",
        null,
        NAV.map((item) =>
          el(
            "li",
            null,
            el(
              "a",
              { href: item.hash, class: "nav__link", "aria-current": item.match(path) ? "page" : null },
              svgIcon(item.icon, { size: 18 }),
              el("span", { text: t(item.key) })
            )
          )
        )
      )
    );
  }

  function langSwitch() {
    const current = BK.i18n.getLang();
    return el(
      "div",
      { class: "lang-switch", role: "group", "aria-label": t("lang.switch") },
      BK.i18n.LANGS.map((l) =>
        el("button", {
          type: "button",
          id: "hdr-lang-" + l,
          class: "lang-switch__btn",
          lang: l,
          "aria-pressed": String(l === current),
          title: t("lang." + l),
          text: l.toUpperCase(),
          on: { click: () => setLanguage(l) }
        })
      )
    );
  }

  function themeToggle() {
    const mode = BK.store.prefs.get().uiTheme;
    return el(
      "button",
      {
        type: "button",
        id: "hdr-theme",
        class: "btn btn--ghost btn--icon",
        "aria-label": t("theme.toggle", { mode: t("theme." + mode) }),
        title: t("theme.toggle", { mode: t("theme." + mode) }),
        on: { click: () => BK.theme.setUiTheme(BK.theme.nextMode(mode)) }
      },
      svgIcon(THEME_ICON[mode])
    );
  }

  function saveStatus() {
    return el("span", { id: "save-status", class: "save-status", role: "status", "aria-live": "polite" });
  }

  function renderStatus(payload) {
    const node = document.getElementById("save-status");
    if (!node || !payload) return;
    const map = {
      saving: { text: t("status.saving"), tone: "muted" },
      saved: { text: t("status.saved", { time: BK.i18n.fmt.time(payload.at) }), tone: "ok" },
      memory: { text: t("status.memory"), tone: "warn" },
      error: { text: t("status.error"), tone: "danger" }
    };
    const s = map[payload.state];
    BK.dom.mount(node, payload.state === "saved" ? svgIcon("check", { size: 16 }) : payload.state === "saving" ? null : svgIcon("warning", { size: 16 }), el("span", { text: s.text }));
    node.dataset.tone = s.tone;
  }

  function renderShell() {
    const header = document.getElementById("app-header");
    const path = BK.router.parseHash(window.location.hash).path;
    const activeId = document.activeElement && document.activeElement.id;
    BK.dom.mount(
      header,
      el(
        "div",
        { class: "app-header__inner" },
        wordmark(),
        nav(path),
        el("div", { class: "app-header__tools" }, saveStatus(), langSwitch(), themeToggle())
      )
    );
    document.getElementById("skip-link").textContent = t("app.skip");
    renderStatus(lastStatus);
    renderStorageBanner();
    // Keep keyboard focus on the control that triggered the re-render.
    if (activeId && activeId.startsWith("hdr-")) {
      const again = document.getElementById(activeId);
      if (again) again.focus();
    }
  }

  function renderStorageBanner() {
    const banner = document.getElementById("storage-banner");
    if (BK.store.available) {
      banner.hidden = true;
      return;
    }
    banner.hidden = false;
    BK.dom.mount(banner, svgIcon("warning"), el("span", { text: t("error.storageUnavailable") }));
  }

  // ---- View entrance ------------------------------------------------------------------

  let enterTimer = null;
  /** Mark <main> for the entrance animation on navigation only (re-renders keep still). */
  function enterView() {
    const main = document.getElementById("main");
    clearTimeout(enterTimer);
    main.classList.remove("is-entering");
    void main.offsetWidth; // restart the animation when navigating between two views of the same kind
    main.classList.add("is-entering");
    enterTimer = setTimeout(() => main.classList.remove("is-entering"), 700);
  }

  // ---- Language -------------------------------------------------------------------

  function setLanguage(lang) {
    BK.i18n.setLang(lang);
    BK.store.prefs.set({ lang });
  }

  // ---- Start-up checks ---------------------------------------------------------------

  async function checkCorruption() {
    const damaged = BK.store.scan();
    if (!damaged.length) return;
    const choice = await BK.ui.dialog.open({
      title: t("error.corrupt.title"),
      body: el("p", { text: t("error.corrupt.body", { n: damaged.length }) }),
      actions: [
        { label: t("common.later"), value: "later", kind: "ghost" },
        { label: t("error.corrupt.export"), value: "export", kind: "secondary", onClick: () => { BK.ui.settings.exportRaw(); return false; } },
        { label: t("error.corrupt.reset"), value: "reset", kind: "danger" }
      ]
    });
    if (choice === "reset") {
      BK.store.resetCorrupt();
      BK.ui.toast(t("error.corrupt.done"), "ok");
    }
  }

  const notFound = {
    title: () => t("notFound.title"),
    render(root) {
      root.append(
        BK.ui.c.pageHeader(t("notFound.title"), t("notFound.body")),
        BK.ui.c.button({ label: t("notFound.home"), kind: "primary", href: "#/" })
      );
    }
  };

  function registerRoutes() {
    const r = BK.router.register;
    r("#/", BK.ui.dashboard);
    r("#/library", BK.ui.library);
    r("#/new", BK.ui.wizard);
    r("#/edit/:instanceId", BK.ui.editor);
    r("#/builder/:deckId", BK.ui.builder);
    r("#/presenter/:sessionId", BK.ui.presenter);
    r("#/stage/:sessionId", BK.ui.stage);
    r("#/debrief/:sessionId", BK.ui.debrief);
    r("#/history", BK.ui.history);
    r("#/settings", BK.ui.settings);
    r("#/help", BK.ui.help);
    r("#/help/:topic", BK.ui.help);
  }

  // ---- Boot -------------------------------------------------------------------------

  function boot() {
    const prefs = BK.store.prefs.get();
    BK.icons.inject();
    BK.i18n.setLang(prefs.lang, { silent: true });
    BK.theme.apply(prefs.uiTheme);

    BK.events.on("lang", () => {
      renderShell();
      BK.router.refresh();
    });
    BK.events.on("theme", renderShell);
    BK.events.on("route", renderShell);
    BK.events.on("route", enterView);
    BK.events.on("store:status", (payload) => {
      lastStatus = payload;
      renderStatus(payload);
      if (payload.state === "error") BK.ui.toast(t(payload.detail === "quota" ? "error.quota" : "error.write"), "danger");
    });

    // The skip link must not change the hash: "#main" would be routed as a page.
    document.getElementById("skip-link").addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("main").focus();
    });

    registerRoutes();
    BK.router.start(document.getElementById("main"), notFound);
    checkCorruption();
  }

  BK.app = { setLanguage, boot };
  boot();
})();
