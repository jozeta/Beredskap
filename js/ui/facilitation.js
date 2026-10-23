/*
 * facilitation.js — Facilitation forms shared by the presenter and the debrief:
 * decision log, observation log, learning-objective status, scorecard, notes.
 *
 * Every form dispatches session commands (BK.sync); nothing writes storage
 * directly. Text inputs commit on "change" (not per keystroke) and keep drafts
 * in module state, so a re-render triggered by the other window never loses
 * what the facilitator is typing. Inputs carry stable ids for focus restore.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el } = BK.dom;
  const c = BK.ui.c;
  const t = BK.t;

  const OBS_CATEGORIES = ["detection", "escalation", "containment", "recovery", "continuity", "communication", "coordination", "authority", "legal", "thirdParty"];
  const PRIORITIES = ["high", "medium", "low"];
  const OBS_STATUS = ["open", "inProgress", "closed"];
  const OBJ_STATUS = ["addressed", "partial", "notAddressed"];
  const RATINGS = ["notObserved", "emerging", "partly", "demonstrated"];

  const drafts = {}; // formKey -> { field: value }

  function draft(key, initial) {
    if (!drafts[key]) drafts[key] = Object.assign({}, initial);
    return drafts[key];
  }

  function textArea(id, value, onChange, rows, label) {
    // `label` only for a textarea without a visible <label> (wrapped in c.field otherwise).
    return el("textarea", { id, class: "input textarea", rows: rows || 2, maxlength: 4000, value: value || "", "aria-label": label || null, on: { input: (e) => onChange(e.target.value, false), change: (e) => onChange(e.target.value, true) } });
  }

  function textInput(id, value, onChange, extra) {
    return el("input", Object.assign({ id, class: "input", value: value || "", maxlength: 400, on: { input: (e) => onChange(e.target.value, false), change: (e) => onChange(e.target.value, true) } }, extra || {}));
  }

  function roleOptions(inst, includeEmpty) {
    const opts = Object.values(inst.entities.people).map((p) => ({ value: p.role, label: BK.loc(p.roleLabel) + " — " + p.name }));
    return includeEmpty ? [{ value: "", label: "—" }].concat(opts) : opts;
  }

  // ---- Decision log --------------------------------------------------------------------------------

  function decisionForm(sess, dispatch, decision) {
    const d = decision;
    const log = sess.decisions[d.id] || {};
    const key = sess.id + ":dec:" + d.id;
    const dr = draft(key, { option: log.option || "", text: log.text || "", rationale: log.rationale || "", dissent: log.dissent || "", openQuestions: log.openQuestions || "", owner: log.owner || d.authority || "" });
    const set = (field) => (v) => (dr[field] = v);
    const save = () => {
      dispatch({ type: "decision", decisionId: d.id, entry: { option: dr.option || null, text: dr.text.trim(), rationale: dr.rationale.trim(), dissent: dr.dissent.trim(), openQuestions: dr.openQuestions.trim(), owner: dr.owner || null } });
      BK.ui.toast(t("presenter.decisionSaved"), "ok");
    };
    const f = (field, label, rows) => c.field({ id: "fx-" + d.id + "-" + field, label, control: textArea("fx-" + d.id + "-" + field, dr[field], set(field), rows) });
    return el(
      "div",
      { class: "fx-form" },
      el("p", { class: "pres-decision__q", text: BK.loc(d.question) }),
      d.options.length
        ? c.segmented({
            label: t("presenter.decisionOption"),
            name: "fx-opt-" + d.id,
            wrap: true,
            className: "pres-decision-options",
            value: dr.option,
            options: [{ value: "", label: t("presenter.noOption") }].concat(d.options.map((o) => ({ value: o.key, label: o.key + " — " + BK.loc(o.text) }))),
            onChange: (v) => (dr.option = v)
          })
        : null,
      f("text", t("presenter.decisionText"), 3),
      f("rationale", t("report.field.rationale")),
      f("dissent", t("report.field.dissent")),
      f("openQuestions", t("report.field.openQuestions")),
      c.field({ id: "fx-" + d.id + "-owner", label: t("report.field.owner"), control: c.select(roleOptions(sess.instance, true), dr.owner, (v) => (dr.owner = v)) }),
      el(
        "div",
        { class: "actions" },
        c.button({ label: t("presenter.saveDecision"), icon: "save", kind: "primary", size: "sm", onClick: save }),
        log.at ? el("span", { class: "muted small", text: t("presenter.decisionRecorded", { time: BK.i18n.fmt.time(new Date(log.at)) }) }) : null
      )
    );
  }

  // ---- Observations ------------------------------------------------------------------------------------

  function observationForm(sess, dispatch) {
    const key = sess.id + ":obs:new";
    const dr = draft(key, { observation: "", category: "coordination", impact: "", action: "", owner: "", priority: "medium", due: "", status: "open" });
    const add = () => {
      if (!dr.observation.trim()) {
        BK.ui.toast(t("obs.required"), "warn");
        const box = document.getElementById("fx-obs-text");
        if (box) box.focus();
        return;
      }
      dispatch({ type: "observationAdd", entry: { observation: dr.observation.trim(), category: dr.category, impact: dr.impact.trim(), action: dr.action.trim(), owner: dr.owner || "", priority: dr.priority, due: dr.due || "", status: dr.status } });
      delete drafts[key];
      BK.ui.toast(t("obs.added"), "ok");
    };
    return el(
      "div",
      { class: "fx-form" },
      c.field({ id: "fx-obs-text", label: t("obs.observation"), control: textArea("fx-obs-text", dr.observation, (v) => (dr.observation = v), 2) }),
      el(
        "div",
        { class: "form-grid form-grid--tight" },
        c.field({ id: "fx-obs-cat", label: t("obs.category"), control: c.select(OBS_CATEGORIES.map((k) => ({ value: k, label: t("obs.cat." + k) })), dr.category, (v) => (dr.category = v)) }),
        c.field({ id: "fx-obs-owner", label: t("obs.owner"), control: c.select(roleOptions(sess.instance, true), dr.owner, (v) => (dr.owner = v)) }),
        c.field({ id: "fx-obs-prio", label: t("obs.priority"), control: c.select(PRIORITIES.map((k) => ({ value: k, label: t("obs.prio." + k) })), dr.priority, (v) => (dr.priority = v)) }),
        c.field({ id: "fx-obs-due", label: t("obs.due"), control: el("input", { id: "fx-obs-due", class: "input", type: "date", value: dr.due, on: { change: (e) => (dr.due = e.target.value) } }) })
      ),
      c.field({ id: "fx-obs-impact", label: t("obs.impact"), control: textInput("fx-obs-impact", dr.impact, (v) => (dr.impact = v)) }),
      c.field({ id: "fx-obs-action", label: t("obs.action"), control: textInput("fx-obs-action", dr.action, (v) => (dr.action = v)) }),
      el("div", { class: "actions" }, c.button({ label: t("obs.add"), icon: "plus", kind: "primary", size: "sm", onClick: add }))
    );
  }

  function observationList(sess, dispatch) {
    const stageNo = (id) => sess.instance.stages.findIndex((s) => s.id === id) + 1;
    if (!sess.observations.length) return el("p", { class: "muted", text: t("report.noObservations") });
    return el(
      "ul",
      { class: "fx-obs-list" },
      sess.observations.map((o) =>
        el(
          "li",
          { class: "fx-obs" },
          el(
            "div",
            { class: "badges" },
            c.badge(t("obs.cat." + (o.category || "coordination")), "accent"),
            o.stageId ? c.badge(t("editor.stageN", { n: stageNo(o.stageId) }), "neutral") : null,
            c.badge(t("obs.prio." + (o.priority || "medium")), o.priority === "high" ? "warn" : "neutral"),
            o.owner ? c.badge(BK.loc((BK.data.roles.get(o.owner) || {}).label) || o.owner, "neutral", "user") : null,
            o.due ? c.badge(o.due, "neutral", "clock") : null
          ),
          el("p", { text: o.observation }),
          o.impact ? el("p", { class: "muted small", text: t("obs.impact") + ": " + o.impact }) : null,
          o.action ? el("p", { class: "small" }, el("strong", { text: t("obs.action") + ": " }), o.action) : null,
          el(
            "div",
            { class: "actions" },
            c.select(OBS_STATUS.map((k) => ({ value: k, label: t("obs.st." + k) })), o.status || "open", (v) => dispatch({ type: "observationUpdate", id: o.id, patch: { status: v } }), { "aria-label": t("obs.status") }),
            c.button({
              label: t("common.delete"),
              icon: "trash",
              kind: "ghost",
              size: "sm",
              onClick: async () => {
                const ok = await BK.ui.dialog.confirm({ title: t("obs.deleteTitle"), message: o.observation, confirmLabel: t("common.delete"), danger: true });
                if (ok) dispatch({ type: "observationRemove", id: o.id });
              }
            })
          )
        )
      )
    );
  }

  // ---- Improvement plan ----------------------------------------------------------------------------------------

  const PLAN_STATUS = ["open", "progress", "done", "dropped"];

  /** People in the exercise as owner suggestions; the owner field itself is free text. */
  function ownerList(inst, id) {
    return el("datalist", { id }, Object.values(inst.entities.people).map((p) => el("option", { value: p.name + " (" + BK.loc(p.roleLabel) + ")" })));
  }

  function planRow(sess, dispatch, a, lang) {
    const commit = (patch) => dispatch({ type: "actionUpdate", id: a.id, patch });
    const base = "fx-act-" + a.id;
    const overdue = a.due && a.status !== "done" && a.status !== "dropped" && a.due < new Date().toISOString().slice(0, 10);
    return el(
      "li",
      { class: ["fx-plan__item", "fx-plan__item--" + a.status, overdue && "is-overdue"] },
      el(
        "div",
        { class: "fx-plan__head" },
        textInput(base + "-text", a.text, (v, done) => done && v.trim() && commit({ text: v }), { "aria-label": t("plan.action", null, lang), class: "input fx-plan__text" }),
        c.button({ label: t("plan.remove", null, lang), icon: "trash", iconOnly: true, size: "sm", kind: "ghost", className: "btn--danger-hover", onClick: () => dispatch({ type: "actionRemove", id: a.id }) })
      ),
      el(
        "div",
        { class: "form-grid form-grid--tight fx-plan__grid" },
        c.field({ id: base + "-owner", label: t("plan.owner", null, lang), control: textInput(base + "-owner", a.owner, (v, done) => done && commit({ owner: v }), { list: base + "-people", placeholder: t("plan.ownerPlaceholder", null, lang) }) }),
        c.field({ id: base + "-due", label: t("plan.due", null, lang), control: el("input", { id: base + "-due", class: "input", type: "date", value: a.due || "", on: { change: (e) => commit({ due: e.target.value }) } }) }),
        c.field({ id: base + "-prio", label: t("plan.priority", null, lang), control: c.select(PRIORITIES.map((k) => ({ value: k, label: t("obs.prio." + k, null, lang) })), a.priority, (v) => commit({ priority: v }), { id: base + "-prio" }) }),
        c.field({ id: base + "-status", label: t("plan.status", null, lang), control: c.select(PLAN_STATUS.map((k) => ({ value: k, label: t("plan.st." + k, null, lang) })), a.status, (v) => commit({ status: v }), { id: base + "-status" }) })
      ),
      c.field({ id: base + "-verify", label: t("plan.verify", null, lang), control: textInput(base + "-verify", a.verify, (v, done) => done && commit({ verify: v }), { placeholder: t("plan.verifyPlaceholder", null, lang) }) }),
      overdue ? c.badge(t("plan.overdue", null, lang), "warn", "clock") : null,
      ownerList(sess.instance, base + "-people")
    );
  }

  /** The improvement plan: editable actions, a form for new ones, and suggestions to take in. */
  function actionPlanEditor(sess, dispatch, lang, report) {
    const plan = sess.actions || [];
    const key = sess.id + ":plan:new";
    const dr = draft(key, { text: "", owner: "", due: "", verify: "", priority: "medium" });
    const add = (entry) => {
      dispatch({ type: "actionAdd", entry });
      BK.ui.toast(t("plan.added", null, lang), "ok");
    };
    const addNew = () => {
      if (!dr.text.trim()) {
        BK.ui.toast(t("plan.required", null, lang), "warn");
        const box = document.getElementById("fx-plan-new-text");
        if (box) box.focus();
        return;
      }
      add({ text: dr.text.trim(), owner: dr.owner.trim(), due: dr.due, verify: dr.verify.trim(), priority: dr.priority, source: "manual" });
      delete drafts[key];
    };
    const suggestions = (report.actions || []).filter((a) => a.kind !== "plan");
    return el(
      "div",
      { class: "fx-plan" },
      el("p", { class: "muted", text: t("plan.intro", null, lang) }),
      plan.length ? el("ol", { class: "fx-plan__list" }, plan.map((a) => planRow(sess, dispatch, a, lang))) : el("p", { class: "muted", text: t("plan.empty", null, lang) }),
      el(
        "details",
        { class: "fx-plan__new", open: !plan.length },
        el("summary", { text: t("plan.newAction", null, lang) }),
        c.field({ id: "fx-plan-new-text", label: t("plan.action", null, lang), control: textInput("fx-plan-new-text", dr.text, (v) => (dr.text = v)) }),
        el(
          "div",
          { class: "form-grid form-grid--tight" },
          c.field({ id: "fx-plan-new-owner", label: t("plan.owner", null, lang), control: textInput("fx-plan-new-owner", dr.owner, (v) => (dr.owner = v), { list: "fx-plan-new-people", placeholder: t("plan.ownerPlaceholder", null, lang) }) }),
          c.field({ id: "fx-plan-new-due", label: t("plan.due", null, lang), control: el("input", { id: "fx-plan-new-due", class: "input", type: "date", value: dr.due, on: { change: (e) => (dr.due = e.target.value) } }) }),
          c.field({ id: "fx-plan-new-prio", label: t("plan.priority", null, lang), control: c.select(PRIORITIES.map((k) => ({ value: k, label: t("obs.prio." + k, null, lang) })), dr.priority, (v) => (dr.priority = v), { id: "fx-plan-new-prio" }) })
        ),
        c.field({ id: "fx-plan-new-verify", label: t("plan.verify", null, lang), control: textInput("fx-plan-new-verify", dr.verify, (v) => (dr.verify = v), { placeholder: t("plan.verifyPlaceholder", null, lang) }) }),
        ownerList(sess.instance, "fx-plan-new-people"),
        el("div", { class: "actions" }, c.button({ label: t("plan.add", null, lang), icon: "plus", kind: "primary", size: "sm", onClick: addNew }))
      ),
      suggestions.length
        ? [
            el("h3", { class: "eyebrow", text: t("plan.suggestions", null, lang) }),
            el(
              "ul",
              { class: "fx-plan__suggestions" },
              suggestions.map((s) =>
                el(
                  "li",
                  null,
                  el("span", { class: "fx-plan__suggestion" }, el("span", { text: s.text }), el("span", { class: "muted small", text: (s.kind === "observation" ? t("plan.fromObservation", null, lang) : t("plan.fromScenario", null, lang)) + (s.owner ? " · " + s.owner : "") })),
                  c.button({ label: t("plan.adopt", null, lang), icon: "plus", size: "sm", onClick: () => add({ text: s.text, owner: s.owner, due: s.due || "", priority: s.priority, source: s.kind, sourceRef: s.id }) })
                )
              )
            )
          ]
        : null
    );
  }

  // ---- Learning objectives ----------------------------------------------------------------------------------

  function objectivesEditor(sess, dispatch, lang) {
    return el(
      "ul",
      { class: "fx-objectives" },
      sess.instance.objectives.map((o) => {
        const st = sess.objectives[o.id] || {};
        const key = sess.id + ":obj:" + o.id;
        const dr = draft(key, { note: st.note || "" });
        const commit = (status, note) => dispatch({ type: "objective", objectiveId: o.id, status, note });
        return el(
          "li",
          { class: "fx-objective" },
          el("p", { class: "fx-objective__text", text: BK.loc(o.text, lang) }),
          o.teaser ? el("p", { class: "fx-objective__teaser muted small", text: t("objective.onScreen", { text: BK.loc(o.teaser, lang) }, lang) }) : null,
          c.segmented({
            label: t("obs.status"),
            name: "fx-objst-" + o.id,
            className: "segmented-field--inline",
            value: st.status || "",
            options: OBJ_STATUS.map((k) => ({ value: k, label: t("report.status." + k) })),
            onChange: (v) => commit(v, dr.note)
          }),
          textInput("fx-objnote-" + o.id, dr.note, (v, done) => {
            dr.note = v;
            if (done && st.status) commit(st.status, v);
          }, { placeholder: t("obs.note"), "aria-label": t("obs.note") + " — " + BK.loc(o.text, lang), class: "input input--sm" })
        );
      })
    );
  }

  // ---- Scorecard ------------------------------------------------------------------------------------------------

  function scorecardEditor(sess, dispatch, lang) {
    const stageNo = (id) => sess.instance.stages.findIndex((s) => s.id === id) + 1;
    const crit = BK.engine.session.criteria(sess.instance, sess);
    return el(
      "div",
      { class: "fx-scorecard" },
      el("p", { class: "notice small", text: t("report.scorecardNote") }),
      el(
        "ul",
        { class: "fx-objectives" },
        crit.map((cr) => {
          const sc = (sess.scorecard || {})[cr.id] || {};
          const key = sess.id + ":score:" + cr.id;
          const dr = draft(key, { comment: sc.comment || "" });
          return el(
            "li",
            { class: "fx-objective" },
            el("p", { class: "fx-objective__text" }, el("span", { class: "muted small", text: (cr.pageId ? "§ " + cr.num : t("editor.stageN", { n: stageNo(cr.stageId) })) + " · " }), BK.loc(cr.text, lang)),
            c.segmented({
              label: t("report.rating.label"),
              name: "fx-score-" + cr.id,
              className: "segmented-field--inline",
              value: sc.rating || "",
              options: RATINGS.map((k) => ({ value: k, label: t("report.rating." + k) })),
              onChange: (v) => dispatch({ type: "score", criterionId: cr.id, rating: v, comment: dr.comment })
            }),
            textInput("fx-scorenote-" + cr.id, dr.comment, (v, done) => {
              dr.comment = v;
              if (done && sc.rating) dispatch({ type: "score", criterionId: cr.id, rating: sc.rating, comment: v });
            }, { placeholder: t("obs.note"), "aria-label": t("obs.note"), class: "input input--sm" })
          );
        })
      )
    );
  }

  // ---- Session notes ------------------------------------------------------------------------------------------------

  function notesEditor(sess, dispatch) {
    const key = sess.id + ":notes";
    const dr = draft(key, { text: sess.notes || "" });
    return textArea("fx-notes", dr.text, (v, done) => {
      dr.text = v;
      if (done) dispatch({ type: "notes", text: v });
    }, 4, t("presenter.notesField"));
  }

  BK.ui.facilitation = { decisionForm, observationForm, observationList, objectivesEditor, scorecardEditor, notesEditor, actionPlanEditor, OBS_CATEGORIES, RATINGS };
})();
