/*
 * print.js — Printable documents (Save as PDF from the print dialog):
 *   facilitator guide (exercise) · role cards (exercise) · after-action report (session)
 *
 * Documents are built as DOM (textContent only) into #print-root; print.css shows
 * only that node when printing. The guide is facilitator-confidential and says so
 * on every page; role cards carry only what each role should know.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el } = BK.dom;
  const t = (k, v, l) => BK.t(k, v, l);
  const L = (o, l) => BK.loc(o, l);

  function rootNode() {
    let r = document.getElementById("print-root");
    if (!r) {
      r = el("div", { id: "print-root" });
      document.body.appendChild(r);
    }
    return r;
  }

  function header(title, sub, confidential, lang) {
    return el(
      "header",
      { class: "p-head" },
      el("p", { class: "p-brand", text: "Beredskap" }),
      confidential ? el("p", { class: "p-confidential", text: t("guide.confidential", null, lang) }) : null,
      el("h1", { text: title }),
      sub ? el("p", { class: "p-sub", text: sub }) : null
    );
  }

  function table(headers, rows) {
    return el(
      "table",
      { class: "p-table" },
      el("thead", null, el("tr", null, headers.map((h) => el("th", { text: h })))),
      el("tbody", null, rows.map((r) => el("tr", null, r.map((c) => el("td", { text: c == null ? "" : String(c) })))))
    );
  }

  function list(items) {
    return el("ul", null, items.filter(Boolean).map((x) => el("li", { text: x })));
  }

  // ---- Facilitator guide --------------------------------------------------------------------------

  function guide(ex, lang) {
    if (ex.format === "branching") return branchingGuide(ex, lang);
    const e = ex.entities;
    const stageNo = (id) => ex.stages.findIndex((s) => s.id === id) + 1;
    const doc = el(
      "article",
      { class: "p-doc", lang },
      header(L(ex.title, lang) + " — " + t("guide.title", null, lang), e.org.name + " · " + t("report.meta", { seed: ex.seed, id: ex.templateId, version: ex.templateVersion, date: BK.i18n.fmt.date(new Date(), lang) }, lang), true, lang),
      el("p", { text: L(ex.summary, lang) }),
      el("h2", { text: t("report.objectives", null, lang) }),
      list(ex.objectives.map((o) => L(o.text, lang))),
      el("h2", { text: t("editor.pacing", null, lang) }),
      table(
        [t("editor.stageN", { n: "" }, lang).trim(), t("csv.text", null, lang), t("editor.minutesShort", { n: "" }, lang).trim()],
        [[t("editor.briefing", null, lang), "", ex.pacing.briefing]]
          .concat(ex.pacing.stages.map((p, i) => [String(i + 1), L(ex.stages[i].title, lang), p.minutes + " (" + p.discussion + ")"]))
          .concat([[t("editor.debrief", null, lang), "", ex.pacing.debrief]])
      ),
      el("h2", { text: t("editor.people", null, lang) }),
      table([t("editor.role", null, lang), t("editor.person", null, lang), t("editor.present", null, lang)], Object.values(e.people).map((p) => [L(p.roleLabel, lang), p.name, p.present ? "✓" : "—"])),
      el("h2", { text: t("report.groundTruth", null, lang) }),
      el("p", { text: L(ex.groundTruth.rootCause, lang) }),
      table([t("csv.time", null, lang), t("csv.text", null, lang)], ex.groundTruth.attackerTimeline.map((a) => [L(a.atLabel, lang), L(a.text, lang)])),
      el("h2", { text: t("editor.hiddenFacts", null, lang) }),
      table([t("editor.stageN", { n: "" }, lang).trim(), t("csv.text", null, lang)], ex.hiddenFacts.map((h) => [h.revealStage === "debrief" ? t("editor.debrief", null, lang) : String(stageNo(h.revealStage)), L(h.text, lang)]))
    );

    ex.stages.forEach((s, i) => {
      const fac = s.facilitator || {};
      const sec = el(
        "section",
        { class: "p-stage" },
        el("h2", { text: t("editor.stageN", { n: i + 1 }, lang) + " · " + L(s.title, lang) }),
        el("p", { class: "p-sub", text: L(s.clockLabel, lang) + " · " + t("editor.discussion", { n: s.discussionMinutes }, lang) }),
        el("p", { class: "p-story", text: L(s.narrative, lang) }),
        s.twist ? el("p", { class: "p-twist" }, el("strong", { text: t("editor.twist", null, lang) + ": " }), L(s.twist, lang), el("br"), el("em", { text: t("editor.assumption", null, lang) + ": " + L(s.assumptionChallenged, lang) })) : null,
        el("h3", { text: t("editor.injects", null, lang) }),
        table(
          [t("csv.time", null, lang), t("csv.type", null, lang), t("csv.reliability", null, lang), t("csv.visibility", null, lang), t("csv.text", null, lang), t("editor.facilitatorNote", null, lang)],
          s.injects.filter((x) => x.enabled !== false).map((x) => [
            L(x.atLabel, lang),
            t("injectType." + x.type, null, lang) + (x.optional ? " (" + t("editor.optional", null, lang) + ")" : ""),
            t("reliability." + x.reliability, null, lang),
            x.visibility === "public" ? t("visibility.public", null, lang) : x.visibility,
            (L(x.headline, lang) ? L(x.headline, lang) + " — " : "") + L(x.content, lang),
            [L(x.facilitatorNote, lang), L(x.expectedResponse, lang)].filter(Boolean).join(" · ")
          ])
        ),
        el("h3", { text: t("editor.questions", null, lang) }),
        list(s.questions.map((q) => L(q.text, lang) + (q.targets.length ? " (" + q.targets.join(", ") + ")" : ""))),
        el("h3", { text: t("editor.challenges", null, lang) }),
        list(s.challenges.map((c) => L(c.text, lang))),
        s.decision
          ? el(
              "div",
              { class: "p-decision" },
              el("h3", { text: t("editor.decision", null, lang) + ": " + L(s.decision.question, lang) }),
              s.decision.options.length ? el("ol", { type: "A" }, s.decision.options.map((o) => el("li", { text: L(o.text, lang) }))) : null,
              el("p", null, el("strong", { text: t("guide.knowns", null, lang) + ": " }), s.decision.knowns.map((k) => L(k, lang)).join(" · ")),
              el("p", null, el("strong", { text: t("guide.uncertainties", null, lang) + ": " }), s.decision.uncertainties.map((k) => L(k, lang)).join(" · ")),
              list(Object.keys(s.decision.tradeoffs).map((k) => t("guide.tradeoff." + k, null, lang) + ": " + L(s.decision.tradeoffs[k], lang))),
              el("p", null, el("strong", { text: t("guide.evaluation", null, lang) + ": " }), s.decision.evaluation.map((k) => L(k, lang)).join(" · "))
            )
          : el("p", { text: L(s.noDecision, lang) || t("editor.noDecision", null, lang) }),
        el("h3", { text: t("editor.facilitator", null, lang) }),
        el("p", { text: L(fac.notes, lang) }),
        fac.expected ? el("p", null, el("strong", { text: t("editor.expected", null, lang) + ": " }), L(fac.expected, lang)) : null,
        fac.hints && fac.hints.length ? list(fac.hints.map((h) => L(h, lang))) : null
      );
      doc.appendChild(sec);
    });

    doc.appendChild(
      el(
        "section",
        { class: "p-stage" },
        el("h2", { text: t("editor.debrief", null, lang) }),
        el("h3", { text: t("report.lessons", null, lang) }),
        list((ex.debrief.keyLessons || []).map((x) => L(x, lang))),
        el("h3", { text: t("report.assumptions", null, lang) }),
        table([t("stage.assumed", null, lang), t("stage.reality", null, lang)], (ex.debrief.assumptionsVsReality || []).map((a) => [L(a.assumption, lang), L(a.reality, lang)])),
        el("h3", { text: t("guide.strengths", null, lang) }),
        list((ex.debrief.strengthsToLookFor || []).map((x) => L(x, lang))),
        el("h3", { text: t("guide.gaps", null, lang) }),
        list((ex.debrief.commonGaps || []).map((x) => L(x, lang)))
      )
    );
    return doc;
  }

  /** Branching guide: the whole map, every page with its options, why each matters and where it leads. */
  function branchingGuide(ex, lang) {
    const B = BK.engine.branching;
    const e = ex.entities;
    const byId = {};
    ex.pages.forEach((pg) => (byId[pg.id] = pg));
    const where = (id) => {
      const pg = byId[id];
      if (!pg) return "?";
      if (pg.ending) return "§ " + pg.num + " · " + L(pg.ending.label, lang);
      if (pg.route) return "§ " + pg.num + " (" + t("editor.routePage", null, lang) + ")";
      return "§ " + pg.num + " · " + L(pg.title, lang);
    };
    const flags = (list) => list.map((f) => B.flagLabel(ex, f, lang)).join(", ");
    const cond = (c) => (c == null ? "" : [].concat(c).map((x) => (x.charAt(0) === "!" ? "¬ " : "") + B.flagLabel(ex, x.replace(/^!/, ""), lang)).join(" + "));
    const titles = {};
    ex.pages.forEach((pg) => (titles[pg.num] = pg.ending ? L(pg.ending.label, lang) : L(pg.title, lang)));
    const doc = el(
      "article",
      { class: "p-doc", lang },
      header(L(ex.title, lang) + " — " + t("guide.title", null, lang), e.org.name + " · " + t("report.meta", { seed: ex.seed, id: ex.templateId, version: ex.templateVersion, date: BK.i18n.fmt.date(new Date(), lang) }, lang), true, lang),
      el("p", { text: L(ex.summary, lang) }),
      el("p", { class: "p-sub", text: t("branch.length." + ex.settings.length, null, lang) + " · " + t("branch.mode." + ex.settings.mode, null, lang) + " · " + t("wizard.lengthOption", { n: ex.pacing.totalMinutes, min: ex.pacing.choiceRange[0], max: ex.pacing.choiceRange[1] }, lang) }),
      el("h2", { text: t("report.objectives", null, lang) }),
      list(ex.objectives.map((o) => L(o.text, lang))),
      el("h2", { text: t("editor.people", null, lang) }),
      table([t("editor.role", null, lang), t("editor.person", null, lang), t("editor.present", null, lang)], Object.values(e.people).map((p) => [L(p.roleLabel, lang), p.name, p.present ? "✓" : "—"])),
      el("h2", { text: t("editor.pageMap", null, lang) }),
      el("div", { class: "p-chart" }, BK.graphics.routeMap(B.mapGraph(ex, [], lang, null), { lang, title: t("editor.pageMap", null, lang), titles })),
      el("h2", { text: t("branch.endings", { n: ex.pages.filter((p) => p.ending).length }, lang) }),
      table(["§", t("csv.text", null, lang), ""], ex.pages.filter((p) => p.ending).sort((a, b) => a.ending.grade - b.ending.grade).map((p) => [p.num, L(p.ending.label, lang) + " — " + L(p.ending.summary, lang), B.gradeLabel(p.ending.grade, lang)]))
    );
    ex.pages
      .filter((pg) => !pg.ending && !(ex.settings.length === "short" && pg.long))
      .forEach((pg) => {
        const sec = el(
          "section",
          { class: "p-stage" },
          el("h2", { text: where(pg.id) + (pg.long ? " (" + t("editor.longOnly", null, lang) + ")" : "") }),
          pg.route
            ? table([t("presenter.flags", null, lang), "→"], pg.route.map((r) => [cond(r.if) || "—", where(r.to)]))
            : [
                el("p", { class: "p-story", text: L(pg.narrative, lang) }),
                pg.variants.map((v) => el("p", { class: "p-twist p-story" }, el("strong", { text: "§ " + v.num + " · " + cond(v.if) + ": " }), L(v.narrative, lang))),
                pg.injects.length
                  ? table(
                      [t("csv.type", null, lang), t("csv.reliability", null, lang), t("csv.text", null, lang), t("editor.facilitatorNote", null, lang)],
                      pg.injects.map((x) => [t("injectType." + x.type, null, lang), t("reliability." + x.reliability, null, lang), (L(x.headline, lang) ? L(x.headline, lang) + " — " : "") + L(x.content, lang), L(x.facilitatorNote, lang)])
                    )
                  : null,
                pg.discuss ? [el("h3", { text: t("editor.questions", null, lang) }), list(pg.discuss.questions.map((q) => L(q.text, lang)))] : null,
                pg.choice
                  ? el(
                      "div",
                      { class: "p-decision" },
                      el("h3", { text: t("presenter.choice", null, lang) + ": " + L(pg.choice.question, lang) }),
                      table(
                        ["", t("report.field.option", null, lang), t("presenter.choiceWhy", null, lang), "→"],
                        pg.choice.options.map((o) => [
                          o.key,
                          L(o.text, lang) + (o.requires ? " [" + cond(o.requires) + "]" : "") + (o.hides ? " [¬ " + cond(o.hides) + "]" : ""),
                          L(o.why, lang),
                          where(o.to) + (o.set.length ? " · " + t("presenter.setsFlags", { list: flags(o.set) }, lang) : "")
                        ])
                      ),
                      el("p", null, el("strong", { text: t("presenter.choiceStrong", null, lang) + ": " }), L(pg.choice.strong, lang))
                    )
                  : null,
                pg.facilitator && pg.facilitator.notes ? el("p", null, el("strong", { text: t("editor.facilitator", null, lang) + ": " }), L(pg.facilitator.notes, lang)) : null
              ]
        );
        doc.appendChild(sec);
      });
    doc.appendChild(
      el(
        "section",
        { class: "p-stage" },
        el("h2", { text: t("editor.debrief", null, lang) }),
        el("h3", { text: t("report.lessons", null, lang) }),
        list((ex.debrief.keyLessons || []).map((x) => L(x, lang))),
        el("h3", { text: t("guide.strengths", null, lang) }),
        list((ex.debrief.strengthsToLookFor || []).map((x) => L(x, lang))),
        el("h3", { text: t("guide.gaps", null, lang) }),
        list((ex.debrief.commonGaps || []).map((x) => L(x, lang)))
      )
    );
    return doc;
  }

  // ---- Role cards ---------------------------------------------------------------------------------

  /** Per-role content: questions aimed at the role, decisions it owns, role-only injects. */
  function roleCardData(ex, lang) {
    return Object.values(ex.entities.people)
      .filter((p) => p.present)
      .map((p) => {
        const questions = [];
        const decisions = [];
        const privateInfo = [];
        // Branching: discussion stops and role-only injects, labelled by page number.
        (ex.pages || []).forEach((pg) => {
          const at = "§ " + pg.num;
          ((pg.discuss && pg.discuss.questions) || []).filter((q) => q.roles.includes(p.role)).forEach((q) => questions.push(at + " · " + L(q.text, lang)));
          pg.injects.filter((x) => x.visibility === "role:" + p.role).forEach((x) => privateInfo.push({ stage: at, text: (L(x.headline, lang) ? L(x.headline, lang) + ": " : "") + L(x.content, lang) }));
        });
        ex.stages.forEach((s, i) => {
          s.questions.filter((q) => q.roles.includes(p.role)).forEach((q) => questions.push(t("roles.stage", { n: i + 1 }, lang) + " · " + L(q.text, lang)));
          if (s.decision && s.decision.authority === p.role) decisions.push(t("roles.stage", { n: i + 1 }, lang) + " · " + L(s.decision.question, lang));
          s.injects.filter((x) => x.visibility === "role:" + p.role && x.enabled !== false).forEach((x) => privateInfo.push({ stage: i + 1, text: (L(x.headline, lang) ? L(x.headline, lang) + ": " : "") + L(x.content, lang) }));
        });
        return { role: p.role, name: p.name, roleLabel: L(p.roleLabel, lang), title: L(p.title, lang), initials: p.initials, questions, decisions, privateInfo };
      });
  }

  function roleCards(ex, lang) {
    return el(
      "article",
      { class: "p-doc p-cards", lang },
      header(L(ex.title, lang) + " — " + t("roles.title", null, lang), ex.entities.org.name, false, lang),
      roleCardData(ex, lang).map((c) =>
        el(
          "section",
          { class: "p-card" },
          el("p", { class: "p-card__kicker", text: t("roles.yourRole", null, lang) }),
          el("h2", { text: c.roleLabel }),
          el("p", { class: "p-sub", text: c.name + " · " + c.title + " · " + ex.entities.org.name }),
          c.privateInfo.length
            ? el("div", { class: "p-private" }, el("h3", { text: t("roles.private", null, lang) }), c.privateInfo.map((x) => el("p", null, el("strong", { text: (typeof x.stage === "string" ? x.stage : t("roles.stage", { n: x.stage }, lang)) + ": " }), x.text)))
            : null,
          el("h3", { text: t("roles.decisions", null, lang) }),
          c.decisions.length ? list(c.decisions) : el("p", { class: "p-sub", text: t("roles.none", null, lang) }),
          el("h3", { text: t("roles.questions", null, lang) }),
          c.questions.length ? list(c.questions.slice(0, 8)) : el("p", { class: "p-sub", text: t("roles.none", null, lang) })
        )
      )
    );
  }

  // ---- After-action report ----------------------------------------------------------------------------

  function aar(session, langArg) {
    const r = BK.io.export.report(session, langArg);
    const l = r.lang;
    const timeline = BK.graphics.charts.timeline({ title: t("report.timeline", null, l), events: r.timeline }, l);
    return el(
      "article",
      { class: "p-doc", lang: l },
      header(r.title + " — " + t("report.title", null, l), r.orgName + " · " + r.date + " · " + t("report.duration", { planned: r.plannedMin, actual: r.actualMin }, l), false, l),
      el("p", { text: r.summary }),
      el("h2", { text: t("report.objectives", null, l) }),
      table([t("library.objectives", null, l), t("obs.status", null, l), t("obs.note", null, l)], r.objectives.map((o) => [o.text, t("report.status." + o.status, null, l), o.note])),
      r.branch
        ? [
            el("h2", { text: t("report.endingReached", null, l) }),
            el("p", { text: r.branch.ending ? r.branch.ending.label + " (" + r.branch.ending.gradeLabel + ") — " + r.branch.ending.summary : t("report.noEnding", null, l) }),
            el("h2", { text: t("report.route", null, l) }),
            el("div", { class: "p-chart" }, BK.graphics.routeMap(r.branch.map, { lang: l, title: t("report.route", null, l), choices: r.decisions.length, titles: r.branch.titles })),
            el("h2", { text: t("report.choices", null, l) }),
            table(
              ["#", "§", t("csv.question", null, l), t("report.field.option", null, l), t("presenter.choiceWhy", null, l), t("report.notTaken", null, l)],
              r.decisions.map((d) => [d.stage, d.num, d.question, d.option, d.why, d.notTaken.map((n) => n.key + " — " + n.text).join(" · ")])
            ),
            el("h3", { text: t("report.otherEndings", null, l) }),
            list(r.branch.otherEndings.map((e) => e.label + " (" + e.gradeLabel + ")"))
          ]
        : [
            el("h2", { text: t("report.groundTruth", null, l) }),
            el("p", { text: r.rootCause }),
            el("h2", { text: t("report.timeline", null, l) }),
            el("div", { class: "p-chart" }, timeline),
            el("h2", { text: t("report.decisions", null, l) }),
            table(
              [t("csv.stage", null, l), t("csv.question", null, l), t("report.field.option", null, l), t("report.field.text", null, l), t("report.field.rationale", null, l), t("report.field.dissent", null, l)],
              r.decisions.map((d) => [d.stage, d.question, d.recorded ? d.option : t("report.notRecorded", null, l), d.text, d.rationale, d.dissent])
            )
          ],
      el("h2", { text: t("report.assumptions", null, l) }),
      table([t("stage.assumed", null, l), t("stage.reality", null, l)], r.assumptions.map((a) => [a.assumption, a.reality])),
      el("h2", { text: t("report.observations", null, l) }),
      r.observations.length
        ? table([t("obs.category", null, l), t("obs.observation", null, l), t("obs.impact", null, l), t("obs.action", null, l)], r.observations.map((o) => [t("obs.cat." + (o.category || "coordination"), null, l), o.observation, o.impact || "", o.action || ""]))
        : el("p", { text: t("report.noObservations", null, l) }),
      el("h2", { text: t("report.unresolved", null, l) }),
      list(r.unresolved.map((u) => u.source + ": " + u.text)),
      r.complications.length ? [el("h2", { text: t("report.complications", null, l) }), list(r.complications.map((x) => x.category + ": " + x.title + " — " + x.text))] : null,
      r.meters ? [el("h2", { text: t("report.meters", null, l) }), list(r.meters.map((m) => m.label + ": " + m.value + "/5"))] : null,
      el("h2", { text: t("report.actions", null, l) }),
      table([t("plan.action", null, l), t("plan.owner", null, l), t("plan.priority", null, l), t("plan.due", null, l), t("plan.verify", null, l), t("plan.status", null, l)], r.actions.map((a) => [a.text, a.owner, t("obs.prio." + a.priority, null, l), a.due, a.verify || "", t("plan.st." + a.status, null, l)])),
      el("h2", { text: t("report.scorecard", null, l) }),
      el("p", { class: "p-sub", text: t("report.scorecardNote", null, l) }),
      table([t("csv.stage", null, l), t("guide.evaluation", null, l), t("report.rating.label", null, l), t("obs.note", null, l)], r.scorecard.map((s) => [s.stage, s.text, s.rating ? t("report.rating." + s.rating, null, l) : t("report.rating.none", null, l), s.comment])),
      el("h2", { text: t("report.frameworks", null, l) }),
      table(["", "", ""], [].concat(r.frameworks.mitre.map((m) => ["MITRE ATT&CK", m.id, m.name || ""]), r.frameworks.nistCsf.map((m) => ["NIST CSF 2.0", m.id, m.name || ""]), r.frameworks.iso27001.map((m) => ["ISO/IEC 27001:2022", m.id, m.name || ""]))),
      el("p", { class: "p-sub", text: t("report.meta", { seed: r.seed, id: r.templateId, version: r.templateVersion, date: r.date }, l) })
    );
  }

  // ---- Print --------------------------------------------------------------------------------------------

  /** Mount a document and open the print dialog; the document is removed afterwards. */
  function print(doc) {
    const root = BK.dom.mount(rootNode(), doc);
    document.body.classList.add("is-printing");
    const cleanup = () => {
      document.body.classList.remove("is-printing");
      BK.dom.clear(root);
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  }

  BK.io.print = {
    guide,
    roleCards,
    roleCardData,
    aar,
    printGuide: (ex, lang) => print(guide(ex, lang || ex.params.lang)),
    printRoleCards: (ex, lang) => print(roleCards(ex, lang || ex.params.lang)),
    printReport: (session, lang) => print(aar(session, lang))
  };
})();
