/*
 * editor.js — Private preview of a generated exercise instance (#/edit/:id).
 *
 * Shows the facilitator everything: entities, hidden facts with their reveal
 * stage, the ground truth, every inject with reliability and visibility badges,
 * questions, decisions, facilitator notes and the pacing plan. This view is
 * operator-only and never rendered on the stage.
 *
 * Phase 2: read-only preview + validation. Editing arrives in phase 5.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el, svgIcon } = BK.dom;
  const c = BK.ui.c;
  const t = BK.t;

  const RELIABILITY = {
    confirmed: { tone: "ok", icon: "check" },
    unverified: { tone: "warn", icon: "info" },
    misleading: { tone: "danger", icon: "warning" },
    disputed: { tone: "info", icon: "cross" }
  };
  const SEVERITY = { info: "neutral", low: "neutral", medium: "info", high: "warn", critical: "danger" };

  let previewLang = null; // per-view toggle; defaults to the exercise language
  let previewFor = null; // exercise id the toggle belongs to

  function L(obj) {
    return BK.loc(obj, previewLang);
  }

  function section(title, ...children) {
    return c.card({ class: "card preview-section" }, el("h2", { text: title }), children);
  }

  function dl(rows) {
    return el(
      "dl",
      { class: "kv" },
      rows.filter(Boolean).map(([k, v]) => [el("dt", { text: k }), el("dd", null, v)])
    );
  }

  // ---- Header and validation -------------------------------------------------------------

  function header(ex, issues) {
    const p = ex.params;
    const stageCount = ex.stages.length;
    return el(
      "div",
      { class: "stack" },
      c.pageHeader(L(ex.title), t("editor.intro"), [
        c.segmented({
          label: t("editor.previewLang"),
          name: "pv-lang",
          value: previewLang,
          options: BK.i18n.LANGS.map((l) => ({ value: l, label: t("lang." + l) })),
          onChange: (v) => {
            previewLang = v;
            BK.router.refresh();
          }
        })
      ]),
      el(
        "div",
        { class: "badges" },
        c.badge(t("category." + ex.category), "accent"),
        c.badge(t("difficulty." + p.difficulty), "neutral"),
        c.badge(t("audience." + p.audience), "neutral", "users"),
        c.badge(t("editor.stagesCount", { n: stageCount }), "neutral", "timeline"),
        c.badge(t("common.minutes", { n: ex.pacing.totalMinutes }), "neutral", "clock"),
        c.badge(t("editor.slidesCount", { n: ex.slides.length }), "neutral"),
        c.badge(t("editor.seed", { seed: ex.seed }), "neutral", "dice")
      ),
      issues.length
        ? el(
            "div",
            { class: "notice notice--danger", role: "alert" },
            el("p", { class: "notice__title" }, svgIcon("warning", { size: 18 }), el("span", { text: t("editor.invalid") })),
            el("ul", { class: "bullets" }, issues.map((x) => el("li", { text: BK.engine.validator.format(x) })))
          )
        : el("p", { class: "notice notice--ok" }, svgIcon("check", { size: 18 }), el("span", { text: t("editor.valid") })),
      el(
        "div",
        { class: "actions" },
        c.button({
          label: t("editor.start"),
          icon: "play",
          kind: "primary",
          disabled: issues.length > 0,
          onClick: () => (BK.ui.startExercise ? BK.ui.startExercise(ex) : BK.ui.toast(t("editor.startSoon"), "info"))
        }),
        c.button({ label: t("editor.delete"), icon: "trash", kind: "danger", onClick: () => remove(ex) })
      )
    );
  }

  async function remove(ex) {
    const ok = await BK.ui.dialog.confirm({ title: t("editor.deleteTitle"), message: t("editor.deleteBody"), confirmLabel: t("common.delete"), danger: true });
    if (!ok) return;
    BK.store.removeItem("exercise", ex.id);
    BK.ui.toast(t("editor.deleted"), "ok");
    BK.router.navigate("#/");
  }

  // ---- Overview: organisation, people, actor, objectives, pacing -------------------------------

  function overview(ex) {
    const e = ex.entities;
    const org = e.org;
    const services = Object.values(org.services);

    const peopleTable = el(
      "table",
      { class: "table" },
      el("thead", null, el("tr", null, el("th", { text: t("editor.role") }), el("th", { text: t("editor.person") }), el("th", { text: t("editor.jobTitle") }), el("th", { text: t("editor.present") }))),
      el(
        "tbody",
        null,
        Object.values(e.people).map((p) =>
          el(
            "tr",
            null,
            el("td", { text: L(p.roleLabel) }),
            el("td", null, el("span", { class: "avatar", "aria-hidden": "true", text: p.initials }), " ", p.name),
            el("td", { text: L(p.title) }),
            el("td", null, p.present ? c.badge(t("editor.present"), "ok", "check") : c.badge(t("editor.absent"), "warn", "warning"))
          )
        )
      )
    );

    return el(
      "div",
      { class: "grid grid--overview" },
      section(
        t("editor.organisation"),
        dl([
          [t("wizard.orgName"), org.name],
          [t("wizard.sector"), t("sector." + org.sector)],
          [t("wizard.orgSize"), t("size." + org.size)],
          [t("editor.model"), L(org.model)],
          [t("editor.location"), org.city + " · " + org.domain],
          [t("editor.headcount"), t("editor.headcountValue", { n: BK.i18n.fmt.number(org.headcount, previewLang), sites: org.sites })]
        ]),
        el("h3", { class: "eyebrow", text: t("editor.services") }),
        el("ul", { class: "bullets" }, services.map((s) => el("li", null, L(s.name) + " — ", el("span", { class: "muted", text: t("editor.rtoRpo", { rto: s.rto, rpo: s.rpo }) })))),
        el("h3", { class: "eyebrow", text: t("editor.actor") }),
        el("p", null, el("strong", { text: e.actor.name }), " · " + L(e.actor.type) + " · " + L(e.actor.motivation))
      ),
      section(
        t("editor.pacing"),
        el(
          "ol",
          { class: "pacing" },
          el("li", null, el("span", { text: t("editor.briefing") }), el("span", { class: "tabular", text: t("editor.minutesShort", { n: ex.pacing.briefing }) })),
          ex.pacing.stages.map((s, i) =>
            el(
              "li",
              null,
              el("span", { text: t("editor.stageN", { n: i + 1 }) + " · " + L(ex.stages[i].title) }),
              el("span", { class: "tabular", text: t("editor.minutesShort", { n: s.minutes }) + " (" + t("editor.discussion", { n: s.discussion }) + ")" })
            )
          ),
          el("li", null, el("span", { text: t("editor.debrief") }), el("span", { class: "tabular", text: t("editor.minutesShort", { n: ex.pacing.debrief }) }))
        ),
        el("h3", { class: "eyebrow", text: t("editor.objectives") }),
        el("ul", { class: "bullets" }, ex.objectives.map((o) => el("li", { text: L(o.text) })))
      ),
      el("div", { class: "card--wide" }, section(t("editor.people"), el("div", { class: "table-wrap" }, peopleTable)))
    );
  }

  // ---- Ground truth and hidden facts --------------------------------------------------------------

  function stageNumber(ex, stageId) {
    const i = ex.stages.findIndex((s) => s.id === stageId);
    return i >= 0 ? i + 1 : null;
  }

  function truth(ex) {
    return el(
      "div",
      { class: "grid grid--overview" },
      section(
        t("editor.hiddenFacts"),
        el(
          "ul",
          { class: "fact-list" },
          ex.hiddenFacts.map((hf) =>
            el(
              "li",
              null,
              c.badge(hf.revealStage === "debrief" ? t("editor.revealDebrief") : t("editor.revealAt", { n: stageNumber(ex, hf.revealStage) }), "warn", "warning"),
              el("p", { text: L(hf.text) })
            )
          )
        )
      ),
      section(
        t("editor.groundTruth"),
        el("p", { text: L(ex.groundTruth.rootCause) }),
        el("h3", { class: "eyebrow", text: t("editor.attackerTimeline") }),
        el(
          "ol",
          { class: "timeline-list" },
          ex.groundTruth.attackerTimeline.map((e) => el("li", null, el("span", { class: "tabular muted", text: L(e.atLabel) }), el("span", { text: L(e.text) })))
        )
      )
    );
  }

  // ---- Stages ---------------------------------------------------------------------------------------

  function visibilityBadge(inj, ex) {
    if (inj.visibility === "public") return null;
    if (inj.visibility === "facilitator") return c.badge(t("visibility.facilitator"), "danger", "warning");
    const role = inj.visibility.slice(5);
    const person = ex.entities.people[role];
    return c.badge(t("visibility.role", { role: person ? L(person.roleLabel) : role }), "info", "user");
  }

  function injectItem(inj, ex) {
    const rel = RELIABILITY[inj.reliability] || RELIABILITY.confirmed;
    return el(
      "li",
      { class: "inject" },
      el(
        "div",
        { class: "inject__head" },
        el("span", { class: "inject__time tabular", text: L(inj.atLabel) }),
        c.badge(t("injectType." + inj.type), "neutral"),
        c.badge(t("severity." + inj.severity), SEVERITY[inj.severity]),
        c.badge(t("reliability." + inj.reliability), rel.tone, rel.icon),
        visibilityBadge(inj, ex),
        inj.optional ? c.badge(t("editor.optional"), "neutral") : null,
        inj.substituted ? c.badge(t("editor.substituted"), "info") : null,
        inj.roleNotPresent ? c.badge(t("editor.roleNotPresent"), "warn", "warning") : null,
        inj.retargeted ? c.badge(t("editor.retargeted"), "info") : null
      ),
      inj.sourceLabel ? el("p", { class: "muted small", text: L(inj.sourceLabel) }) : null,
      inj.headline ? el("p", { class: "inject__headline", text: L(inj.headline) }) : null,
      el("p", { text: L(inj.content) }),
      inj.expectedResponse ? el("p", { class: "facilitator-text" }, el("strong", { text: t("editor.expected") + ": " }), L(inj.expectedResponse)) : null,
      inj.facilitatorNote ? el("p", { class: "facilitator-text" }, el("strong", { text: t("editor.facilitatorNote") + ": " }), L(inj.facilitatorNote)) : null
    );
  }

  function decisionBlock(d, s) {
    if (!d) return el("p", { class: "muted", text: s.noDecision ? L(s.noDecision) : t("editor.noDecision") });
    return el(
      "div",
      { class: "decision-preview" },
      el("p", { class: "decision-preview__q", text: L(d.question) }),
      d.authorityName ? el("p", { class: "muted small", text: t("editor.authority", { name: d.authorityName }) }) : null,
      d.authorityNotPresent ? c.badge(t("editor.roleNotPresent"), "warn", "warning") : null,
      d.options.length ? el("ol", { class: "options", type: "A" }, d.options.map((o) => el("li", { text: L(o.text) }))) : null
    );
  }

  function stageCard(s, ex) {
    const n = s.index + 1;
    const fac = s.facilitator || {};
    return el(
      "details",
      { class: "card stage-preview", open: n === 1 },
      el(
        "summary",
        null,
        el("span", { class: "stage-preview__num tabular", text: String(n) }),
        el("span", { class: "stage-preview__title" }, el("strong", { text: L(s.title) }), el("span", { class: "muted small", text: L(s.clockLabel) })),
        s.twistKind ? c.badge(t("twistKind." + s.twistKind), s.twistKind === "cause" || s.twistKind === "scope" ? "warn" : "neutral") : null,
        svgIcon("chevron-down", { className: "advanced__chevron" })
      ),
      el(
        "div",
        { class: "stack" },
        el("p", { text: L(s.narrative) }),
        s.twist
          ? el(
              "div",
              { class: "twist-preview" },
              el("p", null, el("strong", { text: t("editor.twist") + ": " }), L(s.twist)),
              el("p", { class: "muted" }, el("strong", { text: t("editor.assumption") + ": " }), L(s.assumptionChallenged))
            )
          : null,
        el("h3", { class: "eyebrow", text: t("editor.injects") }),
        el("ul", { class: "inject-list" }, s.injects.map((x) => injectItem(x, ex))),
        s.branches.length
          ? el(
              "div",
              null,
              el("h3", { class: "eyebrow", text: t("editor.branchInjects") }),
              s.branches.map((b) =>
                el(
                  "div",
                  { class: "branch" },
                  el("p", { class: "muted small", text: t("editor.branchWhen", { decision: b.when.decision, option: b.when.option }) }),
                  el("ul", { class: "inject-list" }, s.branchInjects.filter((x) => b.addInjects.includes(x.id)).map((x) => injectItem(x, ex)))
                )
              )
            )
          : null,
        s.charts.length ? [el("h3", { class: "eyebrow", text: t("editor.charts") }), el("ul", { class: "bullets" }, s.charts.map((ch) => el("li", { text: L(ch.title) + " (" + ch.type + ")" })))] : null,
        el("h3", { class: "eyebrow", text: t("editor.questions") }),
        el(
          "ul",
          { class: "question-list" },
          s.questions.map((q) =>
            el(
              "li",
              null,
              el("p", { text: L(q.text) }),
              el(
                "div",
                { class: "badges" },
                c.badge(t("editor.audienceTag." + q.audience), "neutral"),
                q.targets.length ? c.badge(q.targets.join(", "), "neutral", "user") : null,
                q.roleNotPresent ? c.badge(t("editor.roleNotPresent"), "warn", "warning") : null,
                q.revisits ? c.badge(t("editor.revisits"), "accent") : null
              )
            )
          )
        ),
        el("h3", { class: "eyebrow", text: t("editor.challenges") }),
        el("ul", { class: "bullets" }, s.challenges.map((ch) => el("li", { text: L(ch.text) }))),
        el("h3", { class: "eyebrow", text: t("editor.decision") }),
        decisionBlock(s.decision, s),
        el("h3", { class: "eyebrow", text: t("editor.facilitator") }),
        el(
          "div",
          { class: "facilitator-text" },
          fac.notes ? el("p", { text: L(fac.notes) }) : null,
          fac.expected ? el("p", null, el("strong", { text: t("editor.expected") + ": " }), L(fac.expected)) : null,
          fac.hints && fac.hints.length
            ? [el("p", null, el("strong", { text: t("editor.hints") + " — " }), t("editor.hintPolicy." + fac.hintPolicy)), el("ul", { class: "bullets" }, fac.hints.map((h) => el("li", { text: L(h) })))]
            : null
        )
      )
    );
  }

  // ---- View -----------------------------------------------------------------------------------------

  BK.ui.editor = {
    title: (ctx) => {
      const ex = BK.store.getItem("exercise", ctx.params.instanceId);
      return ex ? BK.loc(ex.title) : t("editor.title");
    },
    render(root, ctx) {
      const ex = BK.store.getItem("exercise", ctx.params.instanceId);
      if (!ex) {
        root.append(c.pageHeader(t("editor.title")), c.card(null, c.emptyState("info", t("editor.notFound"), c.button({ label: t("notFound.home"), href: "#/" }))));
        return;
      }
      if (previewFor !== ex.id) {
        previewFor = ex.id;
        previewLang = ex.params.lang;
      }
      const issues = BK.engine.validator.validateInstance(ex);
      root.append(
        header(ex, issues),
        el("h2", { class: "section-title", text: t("editor.overview") }),
        overview(ex),
        truth(ex),
        el("div", { class: "stack" }, ex.stages.map((s) => stageCard(s, ex)))
      );
    }
  };
})();
