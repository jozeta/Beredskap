/*
 * debrief.js — Debrief view (#/debrief/:sessionId) and the after-action report.
 *
 * Summary, objectives and their status, the ground-truth reveal (including
 * hidden facts the room never surfaced), the full incident timeline with
 * decisions, assumptions versus reality, observations, unresolved risks,
 * improvement actions, the facilitator scorecard and framework mapping, plus
 * every export. Content comes from BK.io.export.report() so the view, the
 * printed report and the Markdown/CSV files always agree.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el } = BK.dom;
  const c = BK.ui.c;
  const t = BK.t;
  const F = () => BK.ui.facilitation;

  const view = { ctrl: null, root: null, lang: null, sessionId: null };

  function section(title, ...children) {
    return c.card({ class: "card preview-section" }, el("h2", { text: title }), children);
  }

  function table(headers, rows) {
    return el(
      "div",
      { class: "table-wrap" },
      el(
        "table",
        { class: "table" },
        el("thead", null, el("tr", null, headers.map((h) => el("th", { text: h })))),
        el("tbody", null, rows.map((r) => el("tr", null, r.map((cell) => el("td", null, cell)))))
      )
    );
  }

  // ---- Branching sections -------------------------------------------------------------------------------

  function endingSection(b, l) {
    return section(
      t("report.endingReached", null, l),
      b.ending
        ? [el("p", null, c.badge(b.ending.gradeLabel, b.ending.grade <= 2 ? "ok" : b.ending.grade === 3 ? "warn" : "danger", "flag"), " ", el("strong", { text: b.ending.label })), el("p", { text: b.ending.summary })]
        : el("p", { class: "muted", text: t("report.noEnding", null, l) }),
      el("h3", { class: "eyebrow", text: t("report.otherEndings", null, l) }),
      el("ul", { class: "bullets" }, b.otherEndings.map((e) => el("li", null, el("strong", { text: e.label }), " — " + e.gradeLabel))),
      b.flags.length ? [el("h3", { class: "eyebrow", text: t("presenter.flags", null, l) }), el("div", { class: "badges" }, b.flags.map((f) => c.badge(f, "accent")))] : null
    );
  }

  /** Every choice: the option taken and why it mattered, and the roads not taken. */
  function choicesSection(r, l) {
    return section(
      t("report.choices", null, l),
      table(
        ["#", "§", t("csv.question", null, l), t("report.field.option", null, l), t("presenter.choiceWhy", null, l), t("report.notTaken", null, l)],
        r.decisions.map((d) => [
          String(d.stage),
          String(d.num),
          d.question,
          d.option,
          d.why,
          d.notTaken.length ? el("ul", { class: "bullets" }, d.notTaken.map((n) => el("li", null, n.key + " — " + n.text, n.leadsTo ? el("span", { class: "muted", text: " → " + n.leadsTo }) : null))) : "—"
        ])
      )
    );
  }

  function exportsBar(sess) {
    const ex = Object.assign({ id: sess.exerciseId }, sess.instance);
    const io = BK.io.export;
    return el(
      "div",
      { class: "actions" },
      c.button({ label: t("export.print"), icon: "print", kind: "primary", onClick: () => BK.io.print.printReport(view.ctrl.get(), view.lang) }),
      c.button({ label: t("export.md"), icon: "download", onClick: () => io.downloadMarkdown(view.ctrl.get()) }),
      c.button({ label: t("export.json"), icon: "download", onClick: () => io.downloadJSON(ex, view.ctrl.get()) }),
      c.button({ label: t("export.csvInjects"), icon: "download", kind: "ghost", onClick: () => io.downloadCSV(view.ctrl.get(), "injects") }),
      c.button({ label: t("export.csvDecisions"), icon: "download", kind: "ghost", onClick: () => io.downloadCSV(view.ctrl.get(), "decisions") }),
      c.button({ label: t("export.csvObservations"), icon: "download", kind: "ghost", onClick: () => io.downloadCSV(view.ctrl.get(), "observations") }),
      c.button({ label: t("export.csvActions"), icon: "download", kind: "ghost", onClick: () => io.downloadCSV(view.ctrl.get(), "actions") })
    );
  }

  function draw(sess) {
    const activeId = document.activeElement && document.activeElement.id;
    const r = BK.io.export.report(sess, view.lang);
    const l = r.lang;
    const dispatch = view.ctrl.dispatch;

    BK.dom.mount(
      view.root,
      c.pageHeader(r.title + " — " + t("debrief.title"), t("debrief.intro"), [
        c.segmented({
          label: t("editor.previewLang"),
          name: "db-lang",
          value: l,
          options: BK.i18n.LANGS.map((x) => ({ value: x, label: t("lang." + x) })),
          onChange: (v) => {
            view.lang = v;
            draw(view.ctrl.get());
          }
        })
      ]),
      el(
        "div",
        { class: "badges" },
        c.badge(r.orgName, "accent"),
        c.badge(r.date, "neutral", "clock"),
        c.badge(t("report.duration", { planned: r.plannedMin, actual: r.actualMin }, l), "neutral", "hourglass"),
        c.badge(t("editor.seed", { seed: r.seed }), "neutral", "dice"),
        sess.status === "ended" ? c.badge(t("presenter.ended"), "neutral", "flag") : c.button({ label: t("debrief.backToPresenter"), icon: "prev", kind: "ghost", size: "sm", href: "#/presenter/" + encodeURIComponent(sess.id) })
      ),
      exportsBar(sess),

      el(
        "div",
        { class: "grid grid--overview" },
        section(t("report.objectives", null, l), F().objectivesEditor(sess, dispatch, l)),
        r.branch ? endingSection(r.branch, l) : section(
          t("report.groundTruth", null, l),
          el("p", { text: r.rootCause }),
          el("h3", { class: "eyebrow", text: t("editor.hiddenFacts", null, l) }),
          el(
            "ul",
            { class: "fact-list" },
            r.hiddenFacts.map((h) =>
              el(
                "li",
                null,
                h.state === "revealed"
                  ? c.badge(t("debrief.surfaced", { n: h.stage }, l), "ok", "check")
                  : h.state === "pending"
                    ? c.badge(t("presenter.notRevealed", null, l) + " (" + t("editor.stageN", { n: h.stage }, l) + ")", "neutral", "clock")
                    : c.badge(t("report.neverSurfaced", null, l), "warn", "eye-off"),
                el("p", { text: h.text })
              )
            )
          )
        )
      ),

      r.branch
        ? section(t("report.route", null, l), el("div", { class: "routemap-wrap" }, BK.graphics.routeMap(r.branch.map, { lang: l, title: t("report.route", null, l), choices: r.decisions.length, titles: r.branch.titles })))
        : section(t("report.timeline", null, l), BK.graphics.charts.timeline({ title: t("report.timeline", null, l), events: r.timeline }, l)),

      r.branch ? choicesSection(r, l) : section(
        t("report.decisions", null, l),
        table(
          [t("csv.stage", null, l), t("csv.question", null, l), t("report.field.option", null, l), t("report.field.text", null, l), t("report.field.rationale", null, l), t("report.field.dissent", null, l), t("report.field.owner", null, l)],
          r.decisions.map((d) => [String(d.stage), d.question, d.recorded ? d.option || "—" : c.badge(t("report.notRecorded", null, l), "warn", "warning"), d.text, d.rationale, d.dissent, d.owner])
        )
      ),

      section(t("report.assumptions", null, l), table([t("stage.assumed", null, l), t("stage.reality", null, l)], r.assumptions.map((a) => [el("span", { class: "strike", text: a.assumption }), a.reality]))),

      el(
        "div",
        { class: "grid grid--overview" },
        section(t("report.observations", null, l), F().observationList(sess, dispatch), el("h3", { class: "eyebrow", text: t("obs.add") }), F().observationForm(sess, dispatch)),
        section(
          t("report.unresolved", null, l),
          r.unresolved.length ? el("ul", { class: "bullets" }, r.unresolved.map((u) => el("li", null, el("strong", { text: u.source + ": " }), u.text))) : el("p", { class: "muted", text: t("debrief.noUnresolved", null, l) }),
          el("h3", { class: "eyebrow", text: t("report.lessons", null, l) }),
          el("ul", { class: "bullets" }, r.lessons.map((x) => el("li", { text: x })))
        )
      ),

      r.complications.length || r.meters
        ? section(
            t("meters.title", null, l),
            r.meters ? [el("h3", { class: "eyebrow", text: t("report.meters", null, l) }), el("div", { class: "badges" }, r.meters.map((m) => c.badge(m.label + ": " + m.value + "/5", "neutral")))] : null,
            r.complications.length
              ? [el("h3", { class: "eyebrow", text: t("report.complications", null, l) }), el("ul", { class: "bullets" }, r.complications.map((x) => el("li", null, el("strong", { text: x.category + " · " + x.title + ": " }), x.text)))]
              : null
          )
        : null,
      section(t("plan.title", null, l), F().actionPlanEditor(sess, dispatch, l, r)),

      section(t("report.scorecard", null, l), F().scorecardEditor(sess, dispatch, l)),

      el(
        "div",
        { class: "grid grid--overview" },
        section(
          t("report.frameworks", null, l),
          table(["", "", ""], [].concat(r.frameworks.mitre.map((m) => ["MITRE ATT&CK", m.id, m.name || ""]), r.frameworks.nistCsf.map((m) => ["NIST CSF 2.0", m.id, m.name || ""]), r.frameworks.iso27001.map((m) => ["ISO/IEC 27001:2022", m.id, m.name || ""])))
        ),
        section(t("report.notes", null, l), F().notesEditor(sess, dispatch), el("p", { class: "muted small", text: t("report.meta", { seed: r.seed, id: r.templateId, version: r.templateVersion, date: r.date }, l) }))
      )
    );
    if (activeId) {
      const again = document.getElementById(activeId);
      if (again) again.focus();
    }
  }

  BK.ui.debrief = {
    title: () => t("debrief.title"),
    render(root, ctx) {
      view.root = el("div", { class: "debrief stack" });
      root.appendChild(view.root);
      if (view.sessionId !== ctx.params.sessionId) view.lang = null;
      view.sessionId = ctx.params.sessionId;
      view.ctrl = BK.sync.open(ctx.params.sessionId, draw);
      if (!view.ctrl) {
        BK.dom.mount(view.root, c.pageHeader(t("debrief.title")), c.card(null, c.emptyState("info", t("stage.notFound"), c.button({ label: t("notFound.home"), href: "#/" }))));
        return;
      }
      if (!view.lang) view.lang = view.ctrl.get().lang;
      draw(view.ctrl.get());
    },
    unmount() {
      if (view.ctrl) view.ctrl.close();
      view.ctrl = null;
    }
  };
})();
