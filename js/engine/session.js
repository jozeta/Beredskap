/*
 * session.js — Live run state for one delivery of an exercise instance.
 *
 * Pure functions only: no DOM, no storage. ui/sync.js persists and broadcasts.
 *
 *   create(exercise)            new session (with a frozen snapshot of the instance)
 *   apply(session, cmd, now)    reducer: returns the next session state
 *   slides(session)             effective slide list (branches, skips, postpones applied)
 *   project(session, now)       AUDIENCE projection — the only thing the stage ever sees
 *   facilitatorView(...)        facilitator-only projection for the presenter / private overlay
 *
 * Confidentiality boundary: project() copies only public, released content of
 * the current slide, already localised to the session language. Facilitator
 * notes, true reliability, future injects and unrevealed hidden facts never
 * leave this module through it.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const t = (key, vars, lang) => BK.t(key, vars, lang);

  // Inject types that carry a system-assigned severity (shown on stage); human messages do not.
  const SYSTEM_TYPES = new Set(["siemAlert", "edrAlert", "authLog", "networkEvidence", "logExcerpt", "backupReport", "ticket", "forensicFinding", "threatIntel", "advisory", "statusPage"]);

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  // ---- Creation ---------------------------------------------------------------------------

  function create(exercise, now) {
    const t0 = now || Date.now();
    const instance = clone(exercise);
    const injects = {};
    instance.stages.forEach((s) =>
      s.injects.forEach((i) => {
        if (i.enabled !== false) injects[i.id] = { state: "pending", stageId: s.id, releasedAt: null };
      })
    );
    const first = instance.slides[0];
    return {
      id: BK.dom.uid("ses"),
      kind: "session",
      exerciseId: exercise.id,
      title: instance.title,
      createdAt: new Date(t0).toISOString(),
      updatedAt: new Date(t0).toISOString(),
      rev: 1,
      status: "running",
      lang: instance.settings.lang,
      stageTheme: instance.settings.stageTheme,
      position: { slideId: first.id, step: 0, index: 0 },
      injects,
      decisions: {},
      observations: [],
      objectives: {},
      notes: "",
      paused: false,
      pausedTimers: null,
      screen: "normal",
      clock: { elapsedMs: 0, runningSince: t0 },
      timer: { stageId: null, durationMs: 0, remainingMs: 0, runningSince: null },
      recoveredAt: null,
      log: [{ at: new Date(t0).toISOString(), type: "start" }],
      instance
    };
  }

  // ---- Clocks -----------------------------------------------------------------------------

  function elapsedMs(sess, now) {
    const c = sess.clock;
    return c.elapsedMs + (c.runningSince ? Math.max(0, now - c.runningSince) : 0);
  }

  function timerRemaining(sess, now) {
    const tm = sess.timer;
    return tm.runningSince ? tm.remainingMs - Math.max(0, now - tm.runningSince) : tm.remainingMs;
  }

  function stopClock(sess, now) {
    sess.clock.elapsedMs = elapsedMs(sess, now);
    sess.clock.runningSince = null;
  }

  function stopTimer(sess, now) {
    sess.timer.remainingMs = timerRemaining(sess, now);
    sess.timer.runningSince = null;
  }

  // ---- Effective slides -----------------------------------------------------------------------

  function stageById(sess, id) {
    return sess.instance.stages.find((s) => s.id === id) || null;
  }

  function branchActive(sess, cond) {
    const d = sess.decisions[cond.decision];
    return !!d && (!cond.option || d.option === cond.option);
  }

  /** Branch injects of a stage made active by recorded decisions. */
  function activeBranchInjects(sess, stage) {
    const ids = new Set();
    stage.branches.forEach((b) => {
      if (branchActive(sess, b.when)) b.addInjects.forEach((id) => ids.add(id));
    });
    return stage.branchInjects.filter((i) => ids.has(i.id));
  }

  function findInject(sess, id) {
    for (const s of sess.instance.stages) {
      const hit = s.injects.find((i) => i.id === id) || s.branchInjects.find((i) => i.id === id);
      if (hit) return hit;
    }
    return null;
  }

  /** Injects currently belonging to a stage (postpones moved in/out, skips removed, branches added), in time order. */
  function stageInjects(sess, stageId) {
    const out = [];
    sess.instance.stages.forEach((s) =>
      s.injects.forEach((i) => {
        const st = sess.injects[i.id];
        if (st && st.stageId === stageId && st.state !== "skipped") out.push(i);
      })
    );
    const stage = stageById(sess, stageId);
    if (stage) activeBranchInjects(sess, stage).forEach((i) => out.push(i));
    return out.sort((a, b) => a.at - b.at);
  }

  function publicStageInjects(sess, stageId) {
    return stageInjects(sess, stageId).filter((i) => i.visibility === "public");
  }

  const AFTER_INJECTS = new Set(["data", "twist", "discussion", "decision"]);

  /** Effective slide list with index. Recomputed from the instance and session state. */
  function slides(sess) {
    const audience = sess.instance.settings.audience;
    const wanted = BK.engine.slides.injectSlideWanted;
    const out = [];
    const insertedFor = new Set();

    const insertMoved = (stageId) => {
      if (insertedFor.has(stageId)) return;
      insertedFor.add(stageId);
      Object.keys(sess.injects).forEach((id) => {
        const st = sess.injects[id];
        const inj = findInject(sess, id);
        if (st.stageId === stageId && inj && inj.stageId !== stageId && st.state !== "skipped" && wanted(inj, audience)) {
          out.push({ id: "inject:" + stageId + ":" + id, type: "inject", stageId, injectId: id, moved: true });
        }
      });
    };

    sess.instance.slides.forEach((sl) => {
      if (sl.stageId && AFTER_INJECTS.has(sl.type)) insertMoved(sl.stageId);
      if (sl.type === "inject") {
        if (sl.condition && !branchActive(sess, sl.condition)) return;
        if (!sl.condition) {
          const st = sess.injects[sl.injectId];
          if (!st || st.state === "skipped" || st.stageId !== sl.stageId) return;
        }
      }
      out.push(sl);
    });
    return out.map((s, index) => Object.assign({}, s, { index }));
  }

  /** Number of reveal steps on a slide (0 = no steps). */
  function stepCount(sess, slide) {
    if (slide.type === "timeline") return publicStageInjects(sess, slide.stageId).length;
    if (slide.type === "discussion") {
      const s = stageById(sess, slide.stageId);
      return s ? s.questions.length + s.challenges.length : 0;
    }
    return 0;
  }

  function locate(sess) {
    const list = slides(sess);
    let idx = list.findIndex((s) => s.id === sess.position.slideId);
    if (idx < 0) idx = Math.min(sess.position.index || 0, list.length - 1);
    return { list, idx, slide: list[idx] };
  }

  // ---- Release bookkeeping ------------------------------------------------------------------------

  function release(sess, id, now) {
    const st = sess.injects[id] || (sess.injects[id] = { state: "pending", stageId: (findInject(sess, id) || {}).stageId, releasedAt: null });
    if (st.state !== "released") {
      st.state = "released";
      st.releasedAt = new Date(now).toISOString();
      st.releasedAtElapsed = elapsedMs(sess, now);
      sess.log.push({ at: st.releasedAt, type: "release", injectId: id });
    }
  }

  /** Landing on a slide releases what it shows; entering a discussion arms that stage's timer. */
  function onPosition(sess, now) {
    const { slide } = locate(sess);
    if (!slide) return;
    if (slide.type === "inject") release(sess, slide.injectId, now);
    if (slide.type === "timeline") publicStageInjects(sess, slide.stageId).slice(0, sess.position.step).forEach((i) => release(sess, i.id, now));
    if (slide.type === "discussion" && sess.timer.stageId !== slide.stageId) {
      const stage = stageById(sess, slide.stageId);
      const ms = (stage.discussionMinutes || 5) * 60000;
      sess.timer = { stageId: slide.stageId, durationMs: ms, remainingMs: ms, runningSince: null };
    }
  }

  function releasedCount(sess, stageId) {
    return publicStageInjects(sess, stageId).filter((i) => sess.injects[i.id] && sess.injects[i.id].state === "released").length;
  }

  function moveTo(sess, list, idx, forward) {
    const slide = list[Math.max(0, Math.min(list.length - 1, idx))];
    const n = stepCount(sess, slide);
    let step = 0;
    if (n > 0) step = forward ? Math.max(1, slide.type === "timeline" ? releasedCount(sess, slide.stageId) : 1) : n;
    sess.position = { slideId: slide.id, step: Math.min(step, n), index: slide.index };
  }

  // ---- Reducer ------------------------------------------------------------------------------------

  /**
   * Apply a command and return the next state. Commands:
   *  next | prev | first | last | gotoStage{index} | gotoSlide{slideId} | gotoInject{injectId}
   *  timerToggle | timerReset | timerAdd{ms} | pauseToggle | screen{value} | langToggle | lang{value}
   *  themeToggle | theme{value} | release{injectId} | postpone{injectId} | skip{injectId} | unskip{injectId}
   *  decision{decisionId, entry} | recover | end
   */
  function apply(prev, cmd, now) {
    const sess = clone(prev);
    const at = now || Date.now();
    const ended = sess.status === "ended";
    const { list, idx, slide } = locate(sess);

    switch (cmd.type) {
      case "next": {
        const n = stepCount(sess, slide);
        if (sess.position.step < n) sess.position.step++;
        else if (idx < list.length - 1) moveTo(sess, list, idx + 1, true);
        break;
      }
      case "prev": {
        const min = slide && slide.type === "timeline" ? 1 : slide && stepCount(sess, slide) ? 1 : 0;
        if (sess.position.step > min) sess.position.step--;
        else if (idx > 0) moveTo(sess, list, idx - 1, false);
        break;
      }
      case "first": moveTo(sess, list, 0, true); break;
      case "last": moveTo(sess, list, list.length - 1, true); break;
      case "gotoStage": {
        const stage = sess.instance.stages[cmd.index];
        if (!stage) break;
        const target = list.findIndex((s) => s.stageId === stage.id);
        if (target >= 0) moveTo(sess, list, target, true);
        break;
      }
      case "gotoSlide": {
        const target = list.findIndex((s) => s.id === cmd.slideId);
        if (target >= 0) moveTo(sess, list, target, true);
        break;
      }
      case "gotoInject": {
        const target = list.findIndex((s) => s.injectId === cmd.injectId);
        if (target >= 0) moveTo(sess, list, target, true);
        break;
      }
      case "timerToggle":
        if (sess.paused || ended) break;
        if (sess.timer.runningSince) stopTimer(sess, at);
        else if (timerRemaining(sess, at) > 0) sess.timer.runningSince = at;
        break;
      case "timerReset":
        stopTimer(sess, at);
        sess.timer.remainingMs = sess.timer.durationMs;
        break;
      case "timerAdd": {
        const running = !!sess.timer.runningSince;
        stopTimer(sess, at);
        sess.timer.remainingMs = Math.max(0, sess.timer.remainingMs + cmd.ms);
        sess.timer.durationMs = Math.max(sess.timer.durationMs, sess.timer.remainingMs);
        if (running && sess.timer.remainingMs > 0) sess.timer.runningSince = at;
        break;
      }
      case "pauseToggle":
        if (ended) break;
        if (!sess.paused) {
          sess.pausedTimers = { clock: !!sess.clock.runningSince, timer: !!sess.timer.runningSince };
          stopClock(sess, at);
          stopTimer(sess, at);
          sess.paused = true;
          sess.status = "paused";
        } else {
          const p = sess.pausedTimers || { clock: true, timer: false };
          if (p.clock) sess.clock.runningSince = at;
          if (p.timer && sess.timer.remainingMs > 0) sess.timer.runningSince = at;
          sess.paused = false;
          sess.pausedTimers = null;
          sess.status = "running";
        }
        sess.log.push({ at: new Date(at).toISOString(), type: sess.paused ? "pause" : "resume" });
        break;
      case "screen":
        sess.screen = sess.screen === cmd.value ? "normal" : cmd.value;
        break;
      case "langToggle":
        sess.lang = sess.lang === "sv" ? "en" : "sv";
        break;
      case "lang":
        sess.lang = cmd.value;
        break;
      case "themeToggle":
        sess.stageTheme = BK.theme.resolved(sess.stageTheme) === "dark" ? "light" : "dark";
        break;
      case "theme":
        sess.stageTheme = cmd.value;
        break;
      case "release": {
        release(sess, cmd.injectId, at);
        const target = list.findIndex((s) => s.injectId === cmd.injectId);
        if (target >= 0) moveTo(sess, list, target, true);
        break;
      }
      case "postpone": {
        const st = sess.injects[cmd.injectId];
        const stages = sess.instance.stages;
        const i = stages.findIndex((s) => s.id === (st && st.stageId));
        if (st && st.state !== "released" && i >= 0 && i < stages.length - 1) {
          st.stageId = stages[i + 1].id;
          st.state = "postponed";
          sess.log.push({ at: new Date(at).toISOString(), type: "postpone", injectId: cmd.injectId, to: st.stageId });
        }
        break;
      }
      case "skip": {
        const st = sess.injects[cmd.injectId];
        const inj = findInject(sess, cmd.injectId);
        if (st && inj && inj.optional && st.state !== "released") {
          st.state = "skipped";
          sess.log.push({ at: new Date(at).toISOString(), type: "skip", injectId: cmd.injectId });
        }
        break;
      }
      case "unskip": {
        const st = sess.injects[cmd.injectId];
        if (st && st.state === "skipped") st.state = "pending";
        break;
      }
      case "decision":
        sess.decisions[cmd.decisionId] = Object.assign({}, sess.decisions[cmd.decisionId] || {}, cmd.entry, { at: new Date(at).toISOString() });
        sess.log.push({ at: new Date(at).toISOString(), type: "decision", decisionId: cmd.decisionId });
        break;
      case "recover":
        // Nobody was running the exercise: restore everything but leave timers paused.
        stopClock(sess, at);
        stopTimer(sess, at);
        sess.recoveredAt = new Date(at).toISOString();
        break;
      case "end":
        stopClock(sess, at);
        stopTimer(sess, at);
        sess.paused = false;
        sess.status = "ended";
        sess.log.push({ at: new Date(at).toISOString(), type: "end" });
        break;
      default:
        return prev;
    }

    // Keep position valid if the slide list changed (skip, postpone, branch).
    const after = locate(sess);
    if (after.slide) {
      sess.position.slideId = after.slide.id;
      sess.position.index = after.slide.index;
      sess.position.step = Math.min(sess.position.step, stepCount(sess, after.slide));
    }
    onPosition(sess, at);
    sess.rev = (prev.rev || 0) + 1;
    sess.updatedAt = new Date(at).toISOString();
    return sess;
  }

  // ---- Audience projection (stage) ----------------------------------------------------------------

  function L(obj, lang) {
    return obj == null ? "" : BK.loc(obj, lang);
  }

  function localiseDeep(v, lang) {
    if (v == null || typeof v !== "object") return v;
    if (Array.isArray(v)) return v.map((x) => localiseDeep(x, lang));
    if (BK.engine.template.isText(v)) return BK.loc(v, lang);
    const out = {};
    Object.keys(v).forEach((k) => (out[k] = localiseDeep(v[k], lang)));
    return out;
  }

  /** Public view of one inject: never reliability classification, notes, expected responses or tests. */
  function publicInject(inj, lang) {
    return {
      id: inj.id,
      type: inj.type,
      typeLabel: t("injectType." + inj.type, null, lang),
      time: L(inj.atLabel, lang),
      source: L(inj.sourceLabel, lang),
      headline: L(inj.headline, lang),
      content: L(inj.content, lang),
      meta: localiseDeep(inj.meta, lang),
      statedReliability: L(inj.statedReliability, lang),
      severity: SYSTEM_TYPES.has(inj.type) ? inj.severity : null,
      severityLabel: SYSTEM_TYPES.has(inj.type) ? t("severity." + inj.severity, null, lang) : null,
      roleNotPresent: !!inj.roleNotPresent
    };
  }

  function stageNumber(sess, stageId) {
    return sess.instance.stages.findIndex((s) => s.id === stageId) + 1;
  }

  function slideContent(sess, slide, step, lang) {
    const inst = sess.instance;
    const e = inst.entities;
    const stage = slide.stageId ? stageById(sess, slide.stageId) : null;
    const base = { type: slide.type, id: slide.id, step };

    switch (slide.type) {
      case "title":
        return Object.assign(base, {
          title: L(inst.title, lang),
          scenarioTitle: L(inst.scenarioTitle, lang),
          orgName: e.org.name,
          category: t("category." + inst.category, null, lang),
          categoryId: inst.category,
          emblem: inst.emblem,
          seed: inst.seed,
          date: BK.i18n.fmt.date(new Date(sess.createdAt), lang),
          banner: t("app.exerciseBanner", null, lang)
        });
      case "briefing":
        return Object.assign(base, {
          objectives: inst.objectives.map((o) => L(o.text, lang)),
          minutes: inst.pacing.totalMinutes,
          stageCount: inst.stages.length,
          rules: [1, 2, 3, 4].map((n) => t("stage.rule" + n, null, lang)),
          rounds: [1, 2, 3, 4].map((n) => t("stage.round" + n, null, lang))
        });
      case "context": {
        const platform = BK.data.sectors.PLATFORM;
        return Object.assign(base, {
          orgName: e.org.name,
          sector: t("sector." + e.org.sector, null, lang),
          model: L(e.org.model, lang),
          city: e.org.city,
          headcount: BK.i18n.fmt.number(e.org.headcount, lang),
          sites: e.org.sites,
          services: Object.values(e.org.services).map((s) => ({ id: s.id, name: L(s.name, lang), deps: s.deps.map((d) => ({ id: d, label: L(platform[d], lang) })) })),
          roster: Object.values(e.people)
            .filter((p) => p.present)
            .map((p) => ({ initials: p.initials, name: p.name, role: L(p.roleLabel, lang) }))
        });
      }
      case "situation": {
        const appended = stage.branches.filter((b) => b.narrativeAppend && branchActive(sess, b.when)).map((b) => L(b.narrativeAppend, lang));
        return Object.assign(base, {
          stageNumber: stageNumber(sess, stage.id),
          stageCount: inst.stages.length,
          clock: L(stage.clockLabel, lang),
          title: L(stage.title, lang),
          narrative: [L(stage.narrative, lang)].concat(appended).join(" ")
        });
      }
      case "timeline": {
        const all = publicStageInjects(sess, stage.id);
        const earlier = inst.stages.slice(0, stage.index).reduce((n, s) => n + publicStageInjects(sess, s.id).filter((i) => sess.injects[i.id] && sess.injects[i.id].state === "released").length, 0);
        return Object.assign(base, {
          stageNumber: stageNumber(sess, stage.id),
          clock: L(stage.clockLabel, lang),
          // Only revealed items are projected; the stage cannot know what comes next.
          items: all.slice(0, step).map((i) => {
            const p = publicInject(i, lang);
            return { id: p.id, time: p.time, typeLabel: p.typeLabel, type: p.type, headline: p.headline || p.content, source: p.source };
          }),
          earlierCount: earlier
        });
      }
      case "inject": {
        const inj = findInject(sess, slide.injectId);
        return Object.assign(base, { stageNumber: stageNumber(sess, slide.stageId), inject: publicInject(inj, lang) });
      }
      case "data": {
        const chart = stage.charts.find((c) => c.id === slide.chartId);
        const released = (id) => sess.injects[id] && sess.injects[id].state === "released";
        return Object.assign(base, {
          stageNumber: stageNumber(sess, stage.id),
          label: t("stage.exerciseData", null, lang),
          chart: {
            id: chart.id,
            type: chart.type,
            title: L(chart.title, lang),
            caption: L(chart.caption, lang),
            unit: L(chart.unit, lang),
            data: localiseDeep(chart.data, lang),
            markers: chart.markers.filter((m) => released(m.injectId)).map((m) => ({ at: m.at, label: L(m.label, lang), severity: m.severity }))
          },
          currency: inst.currency,
          lang
        });
      }
      case "twist":
        return Object.assign(base, {
          stageNumber: stageNumber(sess, stage.id),
          heading: t("stage.newInformation", null, lang),
          twist: L(stage.twist, lang),
          assumption: L(stage.assumptionChallenged, lang)
        });
      case "discussion": {
        const items = stage.questions
          .map((q) => ({ kind: "question", text: L(q.text, lang), targets: q.targets, roleNotPresent: q.roleNotPresent }))
          .concat(stage.challenges.map((c) => ({ kind: "challenge", text: L(c.text, lang) })));
        return Object.assign(base, { stageNumber: stageNumber(sess, stage.id), title: L(stage.title, lang), items: items.slice(0, step), total: items.length });
      }
      case "decision": {
        const d = stage.decision;
        return Object.assign(base, {
          stageNumber: stageNumber(sess, stage.id),
          question: L(d.question, lang),
          options: d.options.map((o) => ({ key: o.key, text: L(o.text, lang) })),
          authority: d.authorityName,
          authorityNotPresent: d.authorityNotPresent
        });
      }
      case "recap": {
        const prevStage = inst.stages[stage.index - 1];
        const d = prevStage && prevStage.decision;
        const log = d && sess.decisions[d.id];
        const opt = log && log.option ? d.options.find((o) => o.key === log.option) : null;
        return Object.assign(base, {
          stageNumber: stageNumber(sess, stage.id),
          question: d ? L(d.question, lang) : "",
          recorded: !!log,
          option: opt ? { key: opt.key, text: L(opt.text, lang) } : null,
          text: log ? log.text || "" : ""
        });
      }
      case "debrief":
        return Object.assign(base, {
          rootCause: L(inst.groundTruth.rootCause, lang),
          resolution: inst.resolution ? L(inst.resolution.text, lang) : "",
          lessons: (inst.debrief.keyLessons || []).map((x) => L(x, lang)),
          assumptions: (inst.debrief.assumptionsVsReality || []).map((a) => ({ assumption: L(a.assumption, lang), reality: L(a.reality, lang) })),
          mitre: inst.frameworks.mitre,
          nistCsf: inst.frameworks.nistCsf,
          iso27001: inst.frameworks.iso27001,
          seedLine: t("stage.seedLine", { seed: inst.seed, id: inst.templateId, version: inst.templateVersion }, lang)
        });
      default:
        return base;
    }
  }

  function progress(sess, list, idx, lang) {
    const slide = list[idx];
    const stage = slide && slide.stageId ? stageById(sess, slide.stageId) : null;
    return {
      stageIndex: stage ? stage.index : -1,
      stageCount: sess.instance.stages.length,
      slideNumber: idx + 1,
      slideCount: list.length,
      clock: stage ? L(stage.clockLabel, lang) : ""
    };
  }

  /** The audience projection. Everything the stage renders comes from here. */
  function project(sess, now) {
    const lang = sess.lang;
    const { list, idx, slide } = locate(sess);
    return {
      sessionId: sess.id,
      rev: sess.rev,
      lang,
      theme: sess.stageTheme,
      paused: sess.paused,
      ended: sess.status === "ended",
      screen: sess.screen,
      progress: progress(sess, list, idx, lang),
      timer: { remainingMs: Math.max(0, timerRemaining(sess, now)), durationMs: sess.timer.durationMs, running: !!sess.timer.runningSince, active: slide && slide.type === "discussion" },
      slide: slideContent(sess, slide, sess.position.step, lang)
    };
  }

  /** Projection of an arbitrary slide/step (presenter "next slide" preview only). */
  function projectSlide(sess, slideId, step, now) {
    const list = slides(sess);
    const idx = list.findIndex((s) => s.id === slideId);
    if (idx < 0) return null;
    const p = project(sess, now);
    p.progress = progress(sess, list, idx, sess.lang);
    p.slide = slideContent(sess, list[idx], step, sess.lang);
    return p;
  }

  /** Where "next" would land, for the presenter preview. */
  function nextPosition(sess) {
    const { list, idx, slide } = locate(sess);
    const n = stepCount(sess, slide);
    if (sess.position.step < n) return { slideId: slide.id, step: sess.position.step + 1 };
    if (idx < list.length - 1) {
      const nx = list[idx + 1];
      const m = stepCount(sess, nx);
      return { slideId: nx.id, step: m ? 1 : 0 };
    }
    return null;
  }

  // ---- Facilitator view (presenter + private overlay) ------------------------------------------------

  function facilitatorView(sess, now, langArg) {
    const lang = langArg || sess.lang;
    const inst = sess.instance;
    const { slide, idx, list } = locate(sess);
    const stage = slide && slide.stageId ? stageById(sess, slide.stageId) : null;
    const stageIdx = stage ? stage.index : -1;
    const elapsedMin = elapsedMs(sess, now) / 60000;
    const plan = inst.pacing;
    const status = stage ? BK.engine.pacing.status(plan, stageIdx, elapsedMin) : { state: "onTime", delta: 0 };

    let slideNotes = null;
    if (slide && slide.type === "inject") {
      const inj = findInject(sess, slide.injectId);
      slideNotes = {
        reliability: inj.reliability,
        facilitatorNote: L(inj.facilitatorNote, lang),
        expectedResponse: L(inj.expectedResponse, lang),
        tests: inj.tests.map((id) => {
          const o = inst.objectives.find((x) => x.id === id);
          return o ? L(o.text, lang) : id;
        })
      };
    }

    const injects = stage
      ? stageInjects(sess, stage.id).map((i, n, arr) => {
          const st = sess.injects[i.id] || { state: "pending" };
          const planStage = plan.stages[stageIdx];
          const suggestedAt = planStage.start + ((n + 1) * planStage.minutes) / (arr.length + 1);
          return {
            id: i.id,
            time: L(i.atLabel, lang),
            label: L(i.headline, lang) || L(i.content, lang),
            type: i.type,
            visibility: i.visibility,
            reliability: i.reliability,
            optional: i.optional,
            state: st.state,
            moved: i.stageId !== stage.id,
            branch: stage.branchInjects.some((b) => b.id === i.id),
            hasSlide: list.some((s) => s.injectId === i.id),
            suggested: inst.settings.injectRelease === "timer" && st.state !== "released" && elapsedMin >= suggestedAt
          };
        })
      : [];

    const roleInjects = stage
      ? stageInjects(sess, stage.id)
          .filter((i) => i.visibility.startsWith("role:"))
          .map((i) => {
            const role = i.visibility.slice(5);
            const person = inst.entities.people[role];
            return { id: i.id, role: person ? L(person.roleLabel, lang) + " — " + person.name : role, content: L(i.content, lang) };
          })
      : [];

    return {
      lang,
      slideIndex: idx,
      slideCount: list.length,
      slideType: slide && slide.type,
      stage: stage
        ? {
            index: stageIdx,
            title: L(stage.title, lang),
            notes: L(stage.facilitator.notes, lang),
            expected: L(stage.facilitator.expected, lang),
            hints: (stage.facilitator.hints || []).map((h) => L(h, lang)),
            hintPolicy: stage.facilitator.hintPolicy
          }
        : null,
      slideNotes,
      decision: stage && stage.decision ? localiseDeep(stage.decision, lang) : null,
      decisionLog: stage && stage.decision ? sess.decisions[stage.decision.id] || null : null,
      hiddenFacts: inst.hiddenFacts.map((hf) => {
        const n = hf.revealStage === "debrief" ? null : stageNumber(sess, hf.revealStage);
        return { id: hf.id, text: L(hf.text, lang), stageNumber: n, revealed: n !== null && stageIdx + 1 >= n };
      }),
      injects,
      roleInjects,
      pacing: {
        elapsedMin,
        totalMin: plan.totalMinutes,
        state: status.state,
        delta: status.delta,
        suggestSkip: !!status.suggestSkip
      },
      stages: inst.stages.map((s, i) => ({ index: i, title: L(s.title, lang), current: i === stageIdx }))
    };
  }

  BK.engine.session = {
    create,
    apply,
    slides,
    stepCount,
    locate,
    project,
    projectSlide,
    nextPosition,
    facilitatorView,
    elapsedMs,
    timerRemaining,
    stageInjects,
    hasRunningTimers: (s) => !!(s.clock.runningSince || s.timer.runningSince)
  };
})();
