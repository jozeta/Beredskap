/*
 * presenter.js — Facilitator presenter view (#/presenter/:sessionId) and the
 * Start flow (BK.ui.startExercise).
 *
 * Shows the current and next slide (rendered from the audience projection, so
 * the previews are exactly what the room sees), facilitator notes, hidden facts,
 * inject release controls, the discussion timer, pacing status, the decision
 * log and the jump-to-stage list. Synced with the stage through BK.sync.
 *
 * Re-renders on every change; typed drafts live in BK.ui.facilitation and
 * focus is restored by element id, so remote updates never eat input.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el, svgIcon } = BK.dom;
  const c = BK.ui.c;
  const t = BK.t;
  const S = () => BK.engine.session;

  const view = { ctrl: null, root: null, cleanup: [], open: {}, lastRev: null };

  // ---- Start flow ------------------------------------------------------------------------------------

  function stageUrl(id) {
    return window.location.href.split("#")[0] + "#/stage/" + encodeURIComponent(id);
  }

  function openStageWindow(id) {
    const win = window.open(stageUrl(id), "beredskap-stage-" + id, "popup,width=1280,height=720");
    if (!win) BK.ui.toast(t("presenter.popupBlocked"), "warn", 8000);
    return win;
  }

  /** Create a session from an exercise and open it in the chosen layout. */
  async function startExercise(exercise) {
    let fullscreenAsked = false;
    const choice = await BK.ui.dialog.open({
      title: t("run.startTitle"),
      body: el("p", { text: t("run.startBody") }),
      actions: [
        { label: t("common.cancel"), value: null, kind: "ghost" },
        {
          label: t("run.single"),
          value: "single",
          kind: "secondary",
          // Fullscreen must be requested inside the click (a user gesture).
          onClick: () => {
            fullscreenAsked = true;
            BK.ui.requestFullscreen().catch(() => BK.ui.toast(t("error.fullscreen"), "warn", 6000));
          }
        },
        { label: t("run.dual"), value: "dual", kind: "primary", autofocus: true }
      ]
    });
    if (!choice) {
      if (fullscreenAsked && document.fullscreenElement) document.exitFullscreen();
      return null;
    }
    const session = S().create(exercise, Date.now());
    BK.store.putItem("session", session);
    if (choice === "dual") {
      openStageWindow(session.id);
      BK.router.navigate("#/presenter/" + encodeURIComponent(session.id));
    } else {
      BK.router.navigate("#/stage/" + encodeURIComponent(session.id));
    }
    return session;
  }

  // ---- Pieces ------------------------------------------------------------------------------------------

  function preview(p, label, cls) {
    const frame = el("div", { class: ["stage-frame", cls] });
    if (p) {
      const canvas = BK.ui.stageRenderer.renderCanvas(p, { preview: true });
      frame.appendChild(canvas);
      requestAnimationFrame(() => BK.ui.stageRenderer.fit(frame, canvas));
    } else {
      frame.appendChild(el("p", { class: "stage-frame__empty", text: t("presenter.endOfDeck") }));
    }
    return el("figure", { class: "preview" }, el("figcaption", { class: "eyebrow", text: label }), frame);
  }

  function topBar(sess, f) {
    const pace = f.pacing;
    const paceText = pace.state === "behind" ? t("presenter.behind", { n: pace.delta }) : pace.state === "ahead" ? t("presenter.ahead", { n: -pace.delta }) : t("presenter.onTime");
    const paceTone = pace.state === "behind" ? "warn" : pace.state === "ahead" ? "info" : "ok";
    const d = (cmd) => () => view.ctrl.dispatch(cmd);
    return el(
      "header",
      { class: "pres-top" },
      el("a", { class: "wordmark", href: "#/edit/" + encodeURIComponent(sess.exerciseId), title: t("presenter.back") }, svgIcon("mark", { size: 24, className: "wordmark__mark" }), el("span", { class: "wordmark__name", text: t("app.name") })),
      el("h1", { class: "pres-top__title", text: BK.loc(sess.title) }),
      el(
        "div",
        { class: "pres-top__status" },
        el("span", { class: "pres-clock tabular", dataset: { tick: "elapsed" }, text: t("presenter.elapsed", { elapsed: Math.floor(pace.elapsedMin), total: pace.totalMin }) }),
        c.badge(paceText, paceTone, pace.state === "behind" ? "warning" : "clock"),
        sess.status === "ended" ? c.badge(t("presenter.ended"), "neutral") : null
      ),
      el(
        "div",
        { class: "pres-top__tools" },
        c.button({ label: sess.paused ? t("presenter.resume") : t("presenter.pause"), icon: sess.paused ? "play" : "pause", kind: sess.paused ? "primary" : "secondary", size: "sm", onClick: d({ type: "pauseToggle" }), disabled: sess.status === "ended" }),
        c.segmented({
          label: t("presenter.screen"),
          name: "pr-screen",
          className: "segmented-field--inline",
          value: sess.screen,
          options: [{ value: "normal", label: t("presenter.screenNormal") }, { value: "black", label: t("presenter.screenBlack") }, { value: "white", label: t("presenter.screenWhite") }],
          onChange: (v) => view.ctrl.dispatch(v === "normal" ? { type: "screen", value: sess.screen } : { type: "screen", value: v })
        }),
        c.segmented({
          label: t("presenter.stageLang"),
          name: "pr-lang",
          className: "segmented-field--inline",
          value: sess.lang,
          options: BK.i18n.LANGS.map((l) => ({ value: l, label: l.toUpperCase() })),
          onChange: (v) => view.ctrl.dispatch({ type: "lang", value: v })
        }),
        c.segmented({
          label: t("presenter.stageTheme"),
          name: "pr-theme",
          className: "segmented-field--inline",
          value: BK.theme.resolved(sess.stageTheme),
          options: [{ value: "light", label: t("theme.light") }, { value: "dark", label: t("theme.dark") }],
          onChange: (v) => view.ctrl.dispatch({ type: "theme", value: v })
        }),
        c.button({ label: t("presenter.openStage"), icon: "fullscreen", size: "sm", onClick: () => openStageWindow(sess.id) }),
        c.button({ label: t("presenter.debrief"), icon: "notes", kind: sess.status === "ended" ? "primary" : "secondary", size: "sm", href: "#/debrief/" + encodeURIComponent(sess.id) }),
        c.button({ label: t("presenter.end"), icon: "flag", kind: "danger", size: "sm", onClick: endExercise, disabled: sess.status === "ended" })
      )
    );
  }

  async function endExercise() {
    const ok = await BK.ui.dialog.confirm({ title: t("presenter.endTitle"), message: t("presenter.endBody"), confirmLabel: t("presenter.end"), danger: true });
    if (ok) view.ctrl.dispatch({ type: "end" });
  }

  function navCard(sess, f) {
    const now = Date.now();
    const current = S().project(sess, now);
    const nextPos = S().nextPosition(sess);
    const next = nextPos ? S().projectSlide(sess, nextPos.slideId, nextPos.step, now) : null;
    return el(
      "section",
      { class: "pres-nav" },
      preview(current, t("presenter.current"), "stage-frame--current"),
      el(
        "div",
        { class: "pres-nav__controls" },
        c.button({ label: t("presenter.prevBtn"), icon: "prev", size: "lg", onClick: () => view.ctrl.dispatch({ type: "prev" }) }),
        el("span", { class: "tabular pres-nav__count", text: current.progress.slideNumber + " / " + current.progress.slideCount }),
        c.button({ label: t("presenter.nextBtn"), icon: "next", kind: "primary", size: "lg", onClick: () => view.ctrl.dispatch({ type: "next" }) })
      ),
      el(
        "div",
        { class: "pres-nav__lower" },
        preview(next, t("presenter.next"), "stage-frame--next"),
        el(
          "nav",
          { class: "pres-stages", "aria-label": t("presenter.stages") },
          el("h2", { class: "eyebrow", text: t("presenter.stages") }),
          el(
            "ol",
            null,
            f.stages.map((s) =>
              el(
                "li",
                null,
                el(
                  "button",
                  { type: "button", class: ["pres-stage", s.current && "is-current"], "aria-current": s.current ? "step" : null, on: { click: () => view.ctrl.dispatch({ type: "gotoStage", index: s.index }) } },
                  el("span", { class: "pres-stage__num", text: String(s.index + 1) }),
                  el("span", { text: s.title })
                )
              )
            )
          )
        )
      )
    );
  }

  function timerCard(sess) {
    const remaining = S().timerRemaining(sess, Date.now());
    const running = !!sess.timer.runningSince;
    const d = (cmd) => () => view.ctrl.dispatch(cmd);
    return c.card(
      { class: "card pres-card" },
      el("h2", { text: t("presenter.timer") }),
      el("p", { class: ["pres-timer", "tabular", remaining <= 0 && sess.timer.durationMs > 0 && "is-done"], dataset: { tick: "timer" }, text: BK.ui.stageRenderer.fmtTimer(Math.max(0, remaining)) }),
      el(
        "div",
        { class: "actions" },
        c.button({ label: running ? t("presenter.timerPause") : t("presenter.timerStart"), icon: running ? "pause" : "play", kind: "primary", size: "sm", onClick: d({ type: "timerToggle" }), disabled: !sess.timer.durationMs || sess.paused }),
        c.button({ label: t("presenter.timerReset"), size: "sm", onClick: d({ type: "timerReset" }) }),
        c.button({ label: t("presenter.minusOne"), size: "sm", kind: "ghost", onClick: d({ type: "timerAdd", ms: -60000 }) }),
        c.button({ label: t("presenter.plusOne"), size: "sm", kind: "ghost", onClick: d({ type: "timerAdd", ms: 60000 }) })
      )
    );
  }

  function notesCard(f) {
    if (!f.stage && !f.slideNotes) return null;
    const st = f.stage;
    return c.card(
      { class: "card pres-card pres-card--notes" },
      el("h2", { text: t("presenter.notes") }),
      f.slideNotes
        ? el(
            "div",
            { class: "pres-slide-notes" },
            el("h3", { class: "eyebrow", text: t("presenter.slideNotes") }),
            c.badge(t("presenter.trueReliability", { value: t("reliability." + f.slideNotes.reliability) }), f.slideNotes.reliability === "confirmed" ? "ok" : "warn", f.slideNotes.reliability === "confirmed" ? "verified" : f.slideNotes.reliability),
            f.slideNotes.facilitatorNote ? el("p", { text: f.slideNotes.facilitatorNote }) : null,
            f.slideNotes.expectedResponse ? el("p", null, el("strong", { text: t("editor.expected") + ": " }), f.slideNotes.expectedResponse) : null,
            f.slideNotes.tests.length ? el("p", { class: "muted small", text: t("presenter.tests", { list: f.slideNotes.tests.join("; ") }) }) : null
          )
        : null,
      st && st.notes ? el("p", { text: st.notes }) : null,
      st && st.expected ? el("p", null, el("strong", { text: t("editor.expected") + ": " }), st.expected) : null,
      st && st.hints.length
        ? el("div", null, el("p", { class: "muted small", text: t("editor.hints") + " — " + t("editor.hintPolicy." + st.hintPolicy) }), el("ul", { class: "bullets" }, st.hints.map((h) => el("li", { text: h }))))
        : null
    );
  }

  function decisionCard(sess, f) {
    if (!f.decision || !f.stage) return null;
    const stage = sess.instance.stages[f.stage.index];
    return c.card({ class: "card pres-card" }, el("h2", { text: t("presenter.decision") }), BK.ui.facilitation.decisionForm(sess, view.ctrl.dispatch, stage.decision));
  }

  /** Foldable facilitation panels; open/closed state survives re-renders. */
  function fold(key, title, count, ...content) {
    return el(
      "details",
      { class: "card pres-card pres-fold", open: !!view.open[key], on: { toggle: (e) => (view.open[key] = e.target.open) } },
      el("summary", null, el("h2", { text: title }), count != null ? c.badge(String(count), "neutral") : null),
      content
    );
  }

  function facilitationCards(sess) {
    const F = BK.ui.facilitation;
    const d = view.ctrl.dispatch;
    const assessed = Object.keys(sess.objectives).length;
    return [
      fold("obs", t("presenter.observations"), sess.observations.length, F.observationForm(sess, d), F.observationList(sess, d)),
      fold("obj", t("presenter.objectives"), assessed + "/" + sess.instance.objectives.length, F.objectivesEditor(sess, d)),
      fold("notes", t("presenter.notesField"), null, F.notesEditor(sess, d))
    ];
  }

  function roleName(roleId) {
    const r = BK.data.roles.get(roleId);
    return r ? BK.loc(r.label) : roleId;
  }

  function injectsCard(f) {
    const d = (cmd) => () => view.ctrl.dispatch(cmd);
    return c.card(
      { class: "card pres-card" },
      el("h2", { text: t("presenter.injects") }),
      f.pacing.suggestSkip ? el("p", { class: "notice notice--warn small", text: t("presenter.suggestSkip") }) : null,
      f.injects.length
        ? el(
            "ul",
            { class: "pres-injects" },
            f.injects.map((i) =>
              el(
                "li",
                { class: ["pres-inject", "is-" + i.state, i.suggested && "is-suggested"] },
                el(
                  "div",
                  { class: "pres-inject__head" },
                  el("span", { class: "tabular muted", text: i.time }),
                  c.badge(t("presenter.state." + i.state), i.state === "released" ? "ok" : i.state === "skipped" ? "neutral" : "info"),
                  c.badge(t("reliability." + i.reliability), i.reliability === "confirmed" ? "ok" : "warn", i.reliability === "confirmed" ? "verified" : i.reliability),
                  i.visibility === "facilitator" ? c.badge(t("visibility.facilitator"), "danger", "eye-off") : null,
                  i.visibility.startsWith("role:") ? c.badge(t("visibility.role", { role: roleName(i.visibility.slice(5)) }), "info", "user") : null,
                  i.optional ? c.badge(t("editor.optional"), "neutral") : null,
                  i.moved ? c.badge(t("presenter.moved"), "info") : null,
                  i.branch ? c.badge(t("presenter.branch"), "accent") : null,
                  i.suggested ? c.badge(t("presenter.suggested"), "warn", "clock") : null
                ),
                el("p", { class: "pres-inject__label", text: i.label }),
                el(
                  "div",
                  { class: "actions" },
                  i.state === "released"
                    ? i.hasSlide ? c.button({ label: t("presenter.reshow"), size: "sm", kind: "ghost", onClick: d({ type: "gotoInject", injectId: i.id }) }) : null
                    : i.state === "skipped"
                      ? c.button({ label: t("presenter.unskip"), size: "sm", kind: "ghost", onClick: d({ type: "unskip", injectId: i.id }) })
                      : [
                          i.visibility === "public" ? c.button({ label: t("presenter.release"), size: "sm", kind: "primary", onClick: d({ type: "release", injectId: i.id }) }) : null,
                          c.button({ label: t("presenter.postpone"), size: "sm", onClick: d({ type: "postpone", injectId: i.id }) }),
                          i.optional ? c.button({ label: t("presenter.skip"), size: "sm", kind: "ghost", onClick: d({ type: "skip", injectId: i.id }) }) : null
                        ]
                )
              )
            )
          )
        : el("p", { class: "muted", text: t("presenter.noInjects") })
    );
  }

  function roleCard(f) {
    if (!f.roleInjects.length) return null;
    return c.card(
      { class: "card pres-card" },
      el("h2", { text: t("presenter.roleInjects") }),
      el("ul", { class: "bullets" }, f.roleInjects.map((r) => el("li", null, el("strong", { text: r.role + ": " }), r.content)))
    );
  }

  function factsCard(f) {
    return c.card(
      { class: "card pres-card" },
      el("h2", { text: t("presenter.hiddenFacts") }),
      el(
        "ul",
        { class: "fact-list" },
        f.hiddenFacts.map((hf) =>
          el(
            "li",
            { class: hf.revealed ? "is-revealed" : null },
            c.badge(
              (hf.stageNumber ? t("editor.revealAt", { n: hf.stageNumber }) : t("editor.revealDebrief")) + " · " + t(hf.revealed ? "presenter.revealed" : "presenter.notRevealed"),
              hf.revealed ? "ok" : "warn",
              hf.revealed ? "check" : "warning"
            ),
            el("p", { text: hf.text })
          )
        )
      )
    );
  }

  // ---- Render ---------------------------------------------------------------------------------------------

  function draw(sess) {
    const activeId = document.activeElement && document.activeElement.id;
    const f = S().facilitatorView(sess, Date.now());
    view.lastRev = sess.rev;
    BK.dom.mount(
      view.root,
      el(
        "div",
        { class: "presenter" },
        topBar(sess, f),
        el(
          "div",
          { class: "pres-main" },
          navCard(sess, f),
          el("div", { class: "pres-side" }, timerCard(sess), notesCard(f), decisionCard(sess, f), injectsCard(f), roleCard(f), facilitationCards(sess), factsCard(f))
        )
      )
    );
    if (activeId) {
      const again = document.getElementById(activeId);
      if (again) again.focus();
    }
  }

  function tick() {
    const sess = view.ctrl.get();
    const now = Date.now();
    const timer = view.root.querySelector('.pres-timer[data-tick="timer"]');
    if (timer) timer.textContent = BK.ui.stageRenderer.fmtTimer(Math.max(0, S().timerRemaining(sess, now)));
    const elapsed = view.root.querySelector('[data-tick="elapsed"]');
    if (elapsed) elapsed.textContent = t("presenter.elapsed", { elapsed: Math.floor(S().elapsedMs(sess, now) / 60000), total: sess.instance.pacing.totalMinutes });
    view.root.querySelectorAll(".stage-frame--current .stage").forEach((canvas) => BK.ui.stageRenderer.tick(canvas, S().project(sess, now)));
  }

  BK.ui.presenter = {
    bare: true,
    title: () => t("presenter.title"),
    render(root, ctx) {
      view.root = el("div", { class: "presenter-root" });
      root.appendChild(view.root);
      view.open = {};
      view.ctrl = BK.sync.open(ctx.params.sessionId, draw);
      if (!view.ctrl) {
        root.appendChild(c.card(null, c.emptyState("info", t("stage.notFound"), c.button({ label: t("notFound.home"), href: "#/" }))));
        return;
      }
      draw(view.ctrl.get());
      if (view.ctrl.recovered) BK.ui.toast(t("presenter.recovered"), "info", 8000);

      const onKey = (e) => BK.ui.runKeys(e, view.ctrl.dispatch, (k) => k === "Escape" && false);
      const onResize = () => view.root.querySelectorAll(".stage-frame").forEach((frame) => frame.firstChild && frame.firstChild.classList && BK.ui.stageRenderer.fit(frame, frame.firstChild));
      const ticker = setInterval(tick, 500);
      document.addEventListener("keydown", onKey);
      window.addEventListener("resize", onResize);
      view.cleanup = [() => document.removeEventListener("keydown", onKey), () => window.removeEventListener("resize", onResize), () => clearInterval(ticker), () => view.ctrl.close()];
    },
    unmount() {
      view.cleanup.forEach((fn) => fn());
      view.cleanup = [];
      view.ctrl = null;
    }
  };

  BK.ui.startExercise = startExercise;
})();
