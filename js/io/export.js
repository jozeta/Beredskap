/*
 * export.js — Report model and exports: JSON (archival), Markdown (readable
 * summary and after-action report) and CSV (inject log, decision log, action
 * items). Exports use the session language; å/ä/ö are preserved everywhere.
 *
 * report(session, lang) is the single source for the debrief view, Markdown,
 * CSV and the printable after-action report, so they always agree.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const t = (k, v, l) => BK.t(k, v, l);

  // ---- Filenames ------------------------------------------------------------------------------

  function isoDate(d) {
    const x = d || new Date();
    return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
  }

  /** beredskap-<scenario>-<seed>-<date>[-suffix].<ext> */
  function filename(instance, ext, suffix) {
    const seed = BK.data.names.slugify(instance.seed || "seed");
    return ["beredskap", instance.templateId, seed, isoDate()].concat(suffix ? [suffix] : []).join("-") + "." + ext;
  }

  // ---- JSON -------------------------------------------------------------------------------------

  /** Full instance (and optionally a session) in a schema-versioned envelope. */
  function toJSON(exercise, session) {
    const envelope = {
      schema: BK.config.schemaId,
      schemaVersion: BK.config.schemaVersion,
      kind: session ? "session" : "exercise",
      app: { name: "Beredskap", version: BK.version },
      exportedAt: new Date().toISOString(),
      exercise,
      session: session ? Object.assign({}, session, { instance: undefined }) : null
    };
    return JSON.stringify(envelope, null, 2);
  }

  // ---- Report model --------------------------------------------------------------------------------

  const L = (obj, lang) => BK.loc(obj, lang);

  function report(session, langArg) {
    const lang = langArg || session.lang;
    const inst = session.instance;
    const S = BK.engine.session;
    const stageNo = (id) => inst.stages.findIndex((s) => s.id === id) + 1;

    const objectives = inst.objectives.map((o) => {
      const st = session.objectives[o.id] || {};
      return { id: o.id, text: L(o.text, lang), status: st.status || "notAssessed", note: st.note || "" };
    });

    const branching = inst.format === "branching";
    const decisions = branching ? branchDecisions(session, lang) : inst.stages
      .filter((s) => s.decision)
      .map((s) => {
        const d = s.decision;
        const log = session.decisions[d.id] || null;
        const opt = log && log.option ? d.options.find((o) => o.key === log.option) : null;
        return {
          id: d.id,
          stage: stageNo(s.id),
          stageTitle: L(s.title, lang),
          question: L(d.question, lang),
          recorded: !!log,
          option: opt ? opt.key + " — " + L(opt.text, lang) : log && log.option ? log.option : "",
          text: log ? log.text || "" : "",
          rationale: log ? log.rationale || "" : "",
          dissent: log ? log.dissent || "" : "",
          openQuestions: log ? log.openQuestions || "" : "",
          owner: log && log.owner ? ownerName(inst, log.owner, lang) : d.authorityName || "",
          at: log ? log.at : null,
          scenarioAt: s.clock + (s.discussionMinutes || 0)
        };
      });

    const injects = [];
    const pageNo = (id) => {
      const i = session.route ? session.route.filter((r) => !r.auto).findIndex((r) => r.pageId === id) : -1;
      return i >= 0 ? i + 1 : "";
    };
    (branching ? inst.pages : inst.stages).forEach((s) =>
      s.injects.concat(s.branchInjects || []).forEach((i) => {
        const st = session.injects[i.id];
        if (!st) return;
        injects.push({
          id: i.id,
          stage: branching ? pageNo(s.id) : stageNo(st.stageId || s.id),
          time: L(i.atLabel, lang),
          at: i.at,
          type: t("injectType." + i.type, null, lang),
          severity: t("severity." + i.severity, null, lang),
          reliability: t("reliability." + i.reliability, null, lang),
          visibility: i.visibility === "public" ? t("visibility.public", null, lang) : i.visibility === "facilitator" ? t("visibility.facilitator", null, lang) : t("visibility.role", { role: i.visibility.slice(5) }, lang),
          state: t("presenter.state." + st.state, null, lang),
          stateId: st.state,
          releasedAt: st.releasedAt || "",
          headline: L(i.headline, lang) || L(i.content, lang)
        });
      })
    );

    const observations = (session.observations || []).map((o) => Object.assign({}, o, { stage: o.stageId ? stageNo(o.stageId) : "" }));

    const timeline = (branching ? [] : inst.groundTruth.attackerTimeline)
      .map((e) => ({ at: e.at, atLabel: L(e.atLabel, lang), label: L(e.text, lang), kind: "attacker" }))
      .concat(injects.filter((i) => i.stateId === "released").map((i) => ({ at: i.at, atLabel: i.time, label: i.headline, kind: "inject" })))
      .concat(decisions.filter((d) => d.recorded).map((d) => ({ at: d.scenarioAt, atLabel: branching ? "§ " + d.num : t("editor.stageN", { n: d.stage }, lang), label: d.option || d.text || d.question, kind: "decision" })))
      .sort((a, b) => a.at - b.at);

    const lastStage = branching ? 0 : S.locate(session).slide && S.locate(session).slide.stageId ? stageNo(S.locate(session).slide.stageId) : inst.stages.length;
    // "Never surfaced" only when that is actually true: the reveal belongs to the
    // debrief, or the exercise ended before reaching the reveal stage.
    const ended = session.status === "ended";
    const hiddenFacts = inst.hiddenFacts.map((hf) => {
      const stage = hf.revealStage === "debrief" ? null : stageNo(hf.revealStage);
      const surfaced = stage !== null && stage <= lastStage;
      return { text: L(hf.text, lang), stage, surfaced, state: surfaced ? "revealed" : stage === null || ended ? "never" : "pending" };
    });

    const unresolved = []
      .concat(decisions.filter((d) => d.openQuestions).map((d) => ({ source: t("editor.stageN", { n: d.stage }, lang), text: d.openQuestions })))
      .concat(observations.filter((o) => o.status !== "closed").map((o) => ({ source: t("obs.cat." + (o.category || "coordination"), null, lang), text: o.observation })))
      .concat(hiddenFacts.filter((h) => h.state === "never").map((h) => ({ source: t("report.neverSurfaced", null, lang), text: h.text })));

    // The improvement plan first; then observation actions and scenario suggestions not yet taken into it.
    const plan = session.actions || [];
    const adopted = (source, ref) => plan.some((a) => a.source === source && a.sourceRef === ref);
    const ownerText = (o) => (o && BK.data.roles.get(o) ? roleLabel(o, lang) : o || "");
    const actions = plan
      .map((a) => ({ id: a.id, text: a.text, owner: ownerText(a.owner), priority: a.priority, due: a.due, verify: a.verify, status: a.status, kind: "plan", overdue: !!(a.due && a.status !== "done" && a.status !== "dropped" && a.due < new Date().toISOString().slice(0, 10)) }))
      .concat(
        observations
          .filter((o) => o.action && !adopted("observation", o.id))
          .map((o) => ({ id: o.id, text: o.action, owner: o.owner ? roleLabel(o.owner, lang) : "", priority: o.priority || "medium", due: o.due || "", verify: "", status: "proposed", kind: "observation" }))
      )
      .concat(
        (inst.debrief.suggestedActions || [])
          .map((a, i) => ({ id: "suggested-" + i, text: L(a.text, lang), owner: roleLabel(a.ownerRole, lang), priority: a.priority || "medium", due: "", verify: "", status: "suggested", kind: "suggested" }))
          .filter((a) => !adopted("suggested", a.id))
      );

    const scorecard = S.criteria(inst, session).map((c) => {
      const sc = (session.scorecard || {})[c.id] || {};
      return { id: c.id, stage: branching ? pageNo(c.pageId) : stageNo(c.stageId), text: L(c.text, lang), rating: sc.rating || "", comment: sc.comment || "" };
    });

    const elapsedMin = Math.round(S.elapsedMs(session, Date.now()) / 60000);

    return {
      lang,
      title: L(inst.title, lang),
      scenarioTitle: L(inst.scenarioTitle, lang),
      summary: L(inst.summary, lang),
      orgName: inst.entities.org.name,
      sector: t("sector." + inst.entities.org.sector, null, lang),
      date: BK.i18n.fmt.date(new Date(session.createdAt), lang),
      plannedMin: inst.pacing.totalMinutes,
      actualMin: elapsedMin,
      stageCount: branching ? decisions.length : inst.stages.length,
      seed: inst.seed,
      templateId: inst.templateId,
      templateVersion: inst.templateVersion,
      objectives,
      rootCause: branching ? "" : L(inst.groundTruth.rootCause, lang),
      attackerTimeline: branching ? [] : inst.groundTruth.attackerTimeline.map((e) => ({ at: L(e.atLabel, lang), text: L(e.text, lang) })),
      branch: branching ? branchSummary(session, lang) : null,
      hiddenFacts,
      timeline,
      injects,
      decisions,
      assumptions: (inst.debrief.assumptionsVsReality || []).map((a) => ({ assumption: L(a.assumption, lang), reality: L(a.reality, lang), stage: a.stage ? stageNo(a.stage) || null : null })),
      lessons: (inst.debrief.keyLessons || []).map((x) => L(x, lang)),
      strengths: (inst.debrief.strengthsToLookFor || []).map((x) => L(x, lang)),
      gaps: (inst.debrief.commonGaps || []).map((x) => L(x, lang)),
      observations,
      unresolved,
      actions,
      meters: inst.settings.meters ? S.meterValues(session).map((m) => ({ id: m.id, label: t("meter." + m.id, null, lang), value: m.value })) : null,
      complications: (session.complications || [])
        .filter((x) => x.shownAt)
        .map((x) => {
          const card = BK.data.complications.get(x.id);
          return card ? { title: L(card.title, lang), text: L(card.text, lang), category: t("complication.cat." + card.cat, null, lang), shownAt: x.shownAt } : null;
        })
        .filter(Boolean),
      frameworks: inst.frameworks,
      scorecard,
      resolution: inst.resolution ? L(inst.resolution.text, lang) : "",
      notes: session.notes || ""
    };
  }

  // ---- Branching report parts ---------------------------------------------------------------------------

  /** One row per choice made: what was chosen, why it mattered, and what was not taken. */
  function branchDecisions(session, lang) {
    const B = BK.engine.branching;
    const inst = session.instance;
    return session.route
      .filter((r) => r.option)
      .map((r, i) => {
        const pg = B.page(inst, r.pageId);
        const flags = B.flagsAt(session, pg.id);
        const offered = B.offered(pg.choice, flags);
        const landingTitle = (o) => {
          const target = B.landing(inst, o.to, flags.concat(o.set || []));
          const lp = target && B.page(inst, target.pageId);
          return lp ? (lp.ending ? L(lp.ending.label, lang) : L(lp.title, lang)) : "";
        };
        const chosen = offered.find((o) => o.key === r.option) || pg.choice.options.find((o) => o.key === r.option);
        return {
          id: pg.id,
          stage: i + 1,
          num: B.seenNum(session, pg.id),
          stageTitle: L(pg.title, lang),
          question: L(pg.choice.question, lang),
          recorded: true,
          option: chosen ? chosen.key + " — " + L(chosen.text, lang) : r.option,
          why: chosen ? L(chosen.why, lang) : "",
          strong: L(pg.choice.strong, lang),
          notTaken: offered.filter((o) => o.key !== r.option).map((o) => ({ key: o.key, text: L(o.text, lang), leadsTo: landingTitle(o) })),
          text: "",
          rationale: "",
          dissent: "",
          openQuestions: "",
          owner: "",
          at: r.chosenAt || null,
          scenarioAt: pg.clock || 0
        };
      });
  }

  /** Ending reached, endings not reached and the map (with page titles, operator-only). */
  function branchSummary(session, lang) {
    const B = BK.engine.branching;
    const inst = session.instance;
    const last = B.page(inst, session.route[session.route.length - 1].pageId);
    const titles = {};
    const map = B.mapGraph(inst, session.route, lang, session);
    inst.pages.forEach((pg) => (titles[pg.num] = pg.ending ? L(pg.ending.label, lang) : L(pg.title, lang)));
    session.route.filter((r) => !r.auto).forEach((r) => (titles[B.seenNum(session, r.pageId)] = L(B.page(inst, r.pageId).title, lang)));
    const ending = (pg) => ({ num: pg.num, label: L(pg.ending.label, lang), summary: L(pg.ending.summary, lang), grade: pg.ending.grade, gradeLabel: B.gradeLabel(pg.ending.grade, lang) });
    // Decision points on the map: what was on the table, and what the room picked (operator debrief only).
    const onMap = new Set(map.nodes.map((n) => n.num));
    const points = {};
    inst.pages.forEach((pg) => {
      if (!pg.choice) return;
      const entry = session.route.find((r) => r.pageId === pg.id && !r.auto);
      const num = entry ? B.seenNum(session, pg.id) : pg.num;
      if (!onMap.has(num)) return;
      const flags = entry ? B.flagsAt(session, pg.id) : [];
      const leadsTo = (o) => {
        const target = B.landing(inst, o.to, flags.concat(o.set || []));
        const lp = target && B.page(inst, target.pageId);
        return lp ? (lp.ending ? L(lp.ending.label, lang) : L(lp.title, lang)) : "";
      };
      points[num] = {
        question: L(pg.choice.question, lang),
        reached: !!entry,
        chosen: entry && entry.option ? entry.option : null,
        options: (entry ? B.offered(pg.choice, flags) : pg.choice.options).map((o) => ({ key: o.key, text: L(o.text, lang), leadsTo: leadsTo(o) }))
      };
    });
    return {
      mode: inst.settings.mode,
      length: inst.settings.length,
      ending: last && last.ending ? ending(last) : null,
      otherEndings: inst.pages.filter((pg) => pg.ending && pg !== last).map(ending).sort((a, b) => a.grade - b.grade),
      route: session.route.filter((r) => !r.auto).map((r) => ({ num: B.seenNum(session, r.pageId), title: L(B.page(inst, r.pageId).title, lang), option: r.option || "" })),
      map,
      titles,
      points,
      flags: (session.flags || []).map((f) => B.flagLabel(inst, f, lang))
    };
  }

  function ownerName(inst, roleId, lang) {
    const p = inst.entities.people[roleId];
    return p ? p.name + " (" + L(p.roleLabel, lang) + ")" : roleId;
  }

  function roleLabel(roleId, lang) {
    const r = BK.data.roles.get(roleId);
    return r ? L(r.label, lang) : roleId || "";
  }

  // ---- Markdown ---------------------------------------------------------------------------------------

  function mdEscape(s) {
    return String(s == null ? "" : s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  }

  function markdown(session, langArg) {
    const r = report(session, langArg);
    const l = r.lang;
    const out = [];
    const h = (n, text) => out.push("", "#".repeat(n) + " " + text, "");
    const li = (text) => out.push("- " + String(text).replace(/\r?\n/g, " "));
    // Custom (builder) runs have no scenario model: only observations, extras, the plan and notes apply.
    const full = session.instance.format !== "custom";

    out.push("# " + r.title + " — " + t("report.title", null, l));
    out.push("", "*" + t("report.meta", { seed: r.seed, id: r.templateId, version: r.templateVersion, date: r.date }, l) + "*");
    out.push("", (full ? "**" + r.orgName + "** · " + r.sector + " · " : "") + t("report.duration", { planned: r.plannedMin, actual: r.actualMin }, l));
    if (r.summary) out.push("", r.summary);

    if (full) h(2, t("report.objectives", null, l));
    r.objectives.forEach((o) => li(o.text + " — **" + t("report.status." + o.status, null, l) + "**" + (o.note ? " (" + o.note + ")" : "")));

    if (r.branch) {
      h(2, t("report.endingReached", null, l));
      out.push(r.branch.ending ? "**" + r.branch.ending.label + "** (" + r.branch.ending.gradeLabel + ") — " + r.branch.ending.summary : t("report.noEnding", null, l));
      h(3, t("report.route", null, l));
      out.push(r.branch.route.map((x) => "§ " + x.num + (x.option ? " (" + x.option + ")" : "")).join(" → "));
      h(3, t("report.otherEndings", null, l));
      r.branch.otherEndings.forEach((e) => li(e.label + " (" + e.gradeLabel + ")"));
    } else if (full) {
      h(2, t("report.groundTruth", null, l));
      out.push(r.rootCause, "");
      r.attackerTimeline.forEach((e) => li(e.at + ": " + e.text));
    }

    if (full) h(2, t("report.decisions", null, l));
    r.decisions.forEach((d) => {
      h(3, (r.branch ? t("report.choiceN", { n: d.stage }, l) + " · § " + d.num : t("editor.stageN", { n: d.stage }, l)) + " · " + d.question);
      if (!d.recorded) return out.push(t("report.notRecorded", null, l));
      if (d.option) li(t("report.field.option", null, l) + ": " + d.option);
      if (d.text) li(t("report.field.text", null, l) + ": " + d.text);
      if (d.rationale) li(t("report.field.rationale", null, l) + ": " + d.rationale);
      if (d.dissent) li(t("report.field.dissent", null, l) + ": " + d.dissent);
      if (d.openQuestions) li(t("report.field.openQuestions", null, l) + ": " + d.openQuestions);
      if (d.owner) li(t("report.field.owner", null, l) + ": " + d.owner);
      if (d.why) li(t("presenter.choiceWhy", null, l) + ": " + d.why);
      (d.notTaken || []).forEach((n) => li(t("report.notTaken", null, l) + ": " + n.key + " — " + n.text + (n.leadsTo ? " → " + n.leadsTo : "")));
      return null;
    });

    if (full) {
      h(2, t("report.assumptions", null, l));
      out.push("| " + t("stage.assumed", null, l) + " | " + t("stage.reality", null, l) + " |", "|---|---|");
    }
    r.assumptions.forEach((a) => out.push("| " + mdEscape(a.assumption) + " | " + mdEscape(a.reality) + " |"));

    h(2, t("report.observations", null, l));
    if (!r.observations.length) out.push(t("report.noObservations", null, l));
    r.observations.forEach((o) => li("[" + t("obs.cat." + (o.category || "coordination"), null, l) + "] " + o.observation + (o.impact ? " — " + o.impact : "")));

    if (full) h(2, t("report.unresolved", null, l));
    r.unresolved.forEach((u) => li(u.source + ": " + u.text));

    if (r.complications.length) {
      h(2, t("report.complications", null, l));
      r.complications.forEach((x) => li(x.category + ": " + x.title + " — " + x.text));
    }
    if (r.meters) {
      h(2, t("report.meters", null, l));
      r.meters.forEach((m) => li(m.label + ": " + m.value + "/5"));
    }

    h(2, t("report.actions", null, l));
    out.push("| " + [t("plan.action", null, l), t("plan.owner", null, l), t("plan.priority", null, l), t("plan.due", null, l), t("plan.verify", null, l), t("plan.status", null, l)].join(" | ") + " |", "|---|---|---|---|---|---|");
    r.actions.forEach((a) => out.push("| " + [a.text, a.owner, t("obs.prio." + a.priority, null, l), a.due, a.verify || "", t("plan.st." + a.status, null, l)].map(mdEscape).join(" | ") + " |"));

    if (r.lessons.length) {
      h(2, t("report.lessons", null, l));
      r.lessons.forEach(li);
    }

    if (full) {
      h(2, t("report.scorecard", null, l));
      out.push("*" + t("report.scorecardNote", null, l) + "*", "");
    }
    r.scorecard.forEach((sc) => li((r.branch ? t("report.choiceN", { n: sc.stage }, l) : t("editor.stageN", { n: sc.stage }, l)) + " · " + sc.text + " — " + (sc.rating ? t("report.rating." + sc.rating, null, l) : t("report.rating.none", null, l)) + (sc.comment ? " (" + sc.comment + ")" : "")));

    if (full) h(2, t("report.frameworks", null, l));
    r.frameworks.mitre.forEach((m) => li("MITRE ATT&CK " + m.id + " — " + (m.name || "")));
    r.frameworks.nistCsf.forEach((m) => li("NIST CSF 2.0 " + m.id + " — " + (m.name || "")));
    r.frameworks.iso27001.forEach((m) => li("ISO/IEC 27001:2022 " + m.id + " — " + (m.name || "")));

    if (r.notes) {
      h(2, t("report.notes", null, l));
      out.push(r.notes);
    }
    return out.join("\n") + "\n";
  }

  // ---- CSV ----------------------------------------------------------------------------------------------

  /** Swedish Excel expects ";" (comma is the decimal separator there). */
  function separator(lang) {
    return lang === "sv" ? ";" : ",";
  }

  function csvCell(v, sep) {
    let s = String(v == null ? "" : v);
    // Spreadsheet formula injection guard: never let a cell start a formula.
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return new RegExp('["\\r\\n' + (sep === ";" ? ";" : ",") + "]").test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function csvTable(headers, rows, lang) {
    const sep = separator(lang);
    return "﻿" + [headers].concat(rows).map((r) => r.map((c) => csvCell(c, sep)).join(sep)).join("\r\n") + "\r\n";
  }

  /** kind: "injects" | "decisions" | "observations" */
  function csv(session, kind, langArg) {
    const r = report(session, langArg);
    const l = r.lang;
    if (kind === "injects") {
      return csvTable(
        ["id", t("csv.stage", null, l), t("csv.time", null, l), t("csv.type", null, l), t("csv.severity", null, l), t("csv.reliability", null, l), t("csv.visibility", null, l), t("csv.state", null, l), t("csv.releasedAt", null, l), t("csv.text", null, l)],
        r.injects.map((i) => [i.id, i.stage, i.time, i.type, i.severity, i.reliability, i.visibility, i.state, i.releasedAt, i.headline]),
        l
      );
    }
    if (kind === "decisions") {
      return csvTable(
        ["id", t("csv.stage", null, l), t("csv.question", null, l), t("report.field.option", null, l), t("report.field.text", null, l), t("report.field.rationale", null, l), t("report.field.dissent", null, l), t("report.field.openQuestions", null, l), t("report.field.owner", null, l), t("csv.recordedAt", null, l)],
        r.decisions.map((d) => [d.id, d.stage, d.question, d.option, d.text, d.rationale, d.dissent, d.openQuestions, d.owner, d.at || ""]),
        l
      );
    }
    if (kind === "actions") {
      return csvTable(
        [t("plan.action", null, l), t("plan.owner", null, l), t("plan.priority", null, l), t("plan.due", null, l), t("plan.verify", null, l), t("plan.status", null, l)],
        r.actions.map((a) => [a.text, a.owner, t("obs.prio." + a.priority, null, l), a.due, a.verify || "", t("plan.st." + a.status, null, l)]),
        l
      );
    }
    return csvTable(
      [t("obs.observation", null, l), t("obs.category", null, l), t("csv.stage", null, l), t("obs.impact", null, l), t("obs.action", null, l), t("obs.owner", null, l), t("obs.priority", null, l), t("obs.due", null, l), t("obs.status", null, l)],
      r.observations.map((o) => [o.observation, t("obs.cat." + (o.category || "coordination"), null, l), o.stage, o.impact || "", o.action || "", o.owner ? roleLabel(o.owner, l) : "", t("obs.prio." + (o.priority || "medium"), null, l), o.due || "", t("obs.st." + (o.status || "open"), null, l)]),
      l
    );
  }

  // ---- Download helpers ------------------------------------------------------------------------------------

  function downloadJSON(exercise, session) {
    BK.dom.download(filename(exercise, "json"), toJSON(exercise, session), "application/json;charset=utf-8");
  }

  function downloadMarkdown(session) {
    BK.dom.download(filename(session.instance, "md", "report"), markdown(session), "text/markdown;charset=utf-8");
  }

  function downloadCSV(session, kind) {
    BK.dom.download(filename(session.instance, "csv", kind), csv(session, kind), "text/csv;charset=utf-8");
  }

  BK.io.export = { filename, toJSON, report, markdown, csv, csvCell, separator, downloadJSON, downloadMarkdown, downloadCSV };
})();
