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

    const decisions = inst.stages
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
    inst.stages.forEach((s) =>
      s.injects.concat(s.branchInjects).forEach((i) => {
        const st = session.injects[i.id];
        if (!st) return;
        injects.push({
          id: i.id,
          stage: stageNo(st.stageId || s.id),
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

    const timeline = inst.groundTruth.attackerTimeline
      .map((e) => ({ at: e.at, atLabel: L(e.atLabel, lang), label: L(e.text, lang), kind: "attacker" }))
      .concat(injects.filter((i) => i.stateId === "released").map((i) => ({ at: i.at, atLabel: i.time, label: i.headline, kind: "inject" })))
      .concat(decisions.filter((d) => d.recorded).map((d) => ({ at: d.scenarioAt, atLabel: t("editor.stageN", { n: d.stage }, lang), label: d.option || d.text || d.question, kind: "decision" })))
      .sort((a, b) => a.at - b.at);

    const lastStage = S.locate(session).slide && S.locate(session).slide.stageId ? stageNo(S.locate(session).slide.stageId) : inst.stages.length;
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

    const actions = observations
      .filter((o) => o.action)
      .map((o) => ({ text: o.action, owner: o.owner ? roleLabel(o.owner, lang) : "", priority: o.priority || "medium", due: o.due || "", status: o.status || "open", fromObservation: true }))
      .concat((inst.debrief.suggestedActions || []).map((a) => ({ text: L(a.text, lang), owner: roleLabel(a.ownerRole, lang), priority: a.priority || "medium", due: "", status: "suggested", fromObservation: false })));

    const scorecard = S.criteria(inst).map((c) => {
      const sc = (session.scorecard || {})[c.id] || {};
      return { id: c.id, stage: stageNo(c.stageId), text: L(c.text, lang), rating: sc.rating || "", comment: sc.comment || "" };
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
      stageCount: inst.stages.length,
      seed: inst.seed,
      templateId: inst.templateId,
      templateVersion: inst.templateVersion,
      objectives,
      rootCause: L(inst.groundTruth.rootCause, lang),
      attackerTimeline: inst.groundTruth.attackerTimeline.map((e) => ({ at: L(e.atLabel, lang), text: L(e.text, lang) })),
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
      frameworks: inst.frameworks,
      scorecard,
      resolution: inst.resolution ? L(inst.resolution.text, lang) : "",
      notes: session.notes || ""
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

    out.push("# " + r.title + " — " + t("report.title", null, l));
    out.push("", "*" + t("report.meta", { seed: r.seed, id: r.templateId, version: r.templateVersion, date: r.date }, l) + "*");
    out.push("", "**" + r.orgName + "** · " + r.sector + " · " + t("report.duration", { planned: r.plannedMin, actual: r.actualMin }, l));
    out.push("", r.summary);

    h(2, t("report.objectives", null, l));
    r.objectives.forEach((o) => li(o.text + " — **" + t("report.status." + o.status, null, l) + "**" + (o.note ? " (" + o.note + ")" : "")));

    h(2, t("report.groundTruth", null, l));
    out.push(r.rootCause, "");
    r.attackerTimeline.forEach((e) => li(e.at + ": " + e.text));

    h(2, t("report.decisions", null, l));
    r.decisions.forEach((d) => {
      h(3, t("editor.stageN", { n: d.stage }, l) + " · " + d.question);
      if (!d.recorded) return out.push(t("report.notRecorded", null, l));
      if (d.option) li(t("report.field.option", null, l) + ": " + d.option);
      if (d.text) li(t("report.field.text", null, l) + ": " + d.text);
      if (d.rationale) li(t("report.field.rationale", null, l) + ": " + d.rationale);
      if (d.dissent) li(t("report.field.dissent", null, l) + ": " + d.dissent);
      if (d.openQuestions) li(t("report.field.openQuestions", null, l) + ": " + d.openQuestions);
      if (d.owner) li(t("report.field.owner", null, l) + ": " + d.owner);
      return null;
    });

    h(2, t("report.assumptions", null, l));
    out.push("| " + t("stage.assumed", null, l) + " | " + t("stage.reality", null, l) + " |", "|---|---|");
    r.assumptions.forEach((a) => out.push("| " + mdEscape(a.assumption) + " | " + mdEscape(a.reality) + " |"));

    h(2, t("report.observations", null, l));
    if (!r.observations.length) out.push(t("report.noObservations", null, l));
    r.observations.forEach((o) => li("[" + t("obs.cat." + (o.category || "coordination"), null, l) + "] " + o.observation + (o.impact ? " — " + o.impact : "")));

    h(2, t("report.unresolved", null, l));
    r.unresolved.forEach((u) => li(u.source + ": " + u.text));

    h(2, t("report.actions", null, l));
    out.push("| " + [t("obs.action", null, l), t("obs.owner", null, l), t("obs.priority", null, l), t("obs.due", null, l)].join(" | ") + " |", "|---|---|---|---|");
    r.actions.forEach((a) => out.push("| " + [a.text, a.owner, t("obs.prio." + a.priority, null, l), a.due].map(mdEscape).join(" | ") + " |"));

    h(2, t("report.lessons", null, l));
    r.lessons.forEach(li);

    h(2, t("report.scorecard", null, l));
    out.push("*" + t("report.scorecardNote", null, l) + "*", "");
    r.scorecard.forEach((sc) => li(t("editor.stageN", { n: sc.stage }, l) + " · " + sc.text + " — " + (sc.rating ? t("report.rating." + sc.rating, null, l) : t("report.rating.none", null, l)) + (sc.comment ? " (" + sc.comment + ")" : "")));

    h(2, t("report.frameworks", null, l));
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
