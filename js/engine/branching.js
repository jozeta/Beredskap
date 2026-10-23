/*
 * branching.js — The gamebook format: a map of pages, each ending in a choice
 * of 2–4 options, a route rule or an ending (README: "Authoring a branching exercise").
 *
 *   cond / offered / resolveTarget   flag conditions, offered options, landing page
 *   analyse(pages, start, length)    path enumeration: choice counts, endings, dead ends
 *   validateTemplate(tpl)            map rules (reachability, 2–4 options, path lengths…)
 *   mapGraph(inst, route)            numbers-only route map for the stage debrief
 *   slides / slideContent / facilitatorView / choose / unchoose   session support
 *
 * Confidentiality: slideContent() is part of the audience projection. It carries
 * the current page's public text, the offered options with the page number they
 * land on, and (debrief only) the map as numbers and edges. It never carries
 * flags, `why`/`strong` notes, facilitator notes, route rules or the text of any
 * page the room has not visited.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const t = (key, vars, lang) => BK.t(key, vars, lang);
  const L = (obj, lang) => (obj == null ? "" : BK.loc(obj, lang));

  const GRADES = [1, 2, 3, 4, 5];
  const SHORT = [8, 12];
  const LONG = [12, 20];
  const MINUTES_PER_CHOICE = 2.5;

  // ---- Conditions and targets ----------------------------------------------------------------

  /** Condition: undefined (always), "flag", "!flag" or an array of those (all must hold). */
  function cond(c, flags) {
    if (c == null) return true;
    const has = flags instanceof Set ? (f) => flags.has(f) : (f) => flags.includes(f);
    return [].concat(c).every((term) => (term.charAt(0) === "!" ? !has(term.slice(1)) : has(term)));
  }

  function condFlags(c) {
    return c == null ? [] : [].concat(c).map((term) => term.replace(/^!/, ""));
  }

  /** Options actually offered under the current flags. */
  function offered(choice, flags) {
    return choice.options.filter((o) => cond(o.requires, flags) && (o.hides == null || !cond(o.hides, flags)));
  }

  function index(pages) {
    const m = {};
    pages.forEach((p) => (m[p.id] = p));
    return m;
  }

  /**
   * Follow an option's target to the page the room lands on: long pages are
   * skipped in a short run, route pages pass straight through by their rules.
   * Returns { pageId, through: [route page ids] } or null for a broken map.
   */
  function resolveTarget(byId, id, flags, length) {
    const through = [];
    let cur = id;
    for (let guard = 0; guard < 200; guard++) {
      const pg = byId[cur];
      if (!pg) return null;
      if (length === "short" && pg.long) {
        cur = pg.skipTo;
        continue;
      }
      if (pg.route) {
        const rule = pg.route.find((r) => cond(r.if, flags));
        if (!rule) return null;
        through.push(pg.id);
        cur = rule.to;
        continue;
      }
      return { pageId: cur, through };
    }
    return null;
  }

  function union(flags, add) {
    const out = flags.slice();
    (add || []).forEach((f) => out.includes(f) || out.push(f));
    return out;
  }

  // ---- Path analysis -----------------------------------------------------------------------------

  /**
   * Enumerate every complete path from the start under one length, memoised over
   * (page, flags). Returns { min, max, endings: Set, problems: [] }, where
   * problems lists dead ends, cycles, bad option counts and missing targets.
   */
  function analyse(pages, start, length) {
    const byId = index(pages);
    const memo = new Map();
    const problems = [];
    const stack = new Set();
    const report = (msg) => problems.includes(msg) || problems.push(msg);

    function visit(id, flags) {
      const pg = byId[id];
      const key = id + "|" + flags.slice().sort().join(",");
      if (memo.has(key)) return memo.get(key);
      if (stack.has(key)) {
        report("cycle at " + id);
        return null;
      }
      stack.add(key);
      let res = null;
      if (pg.ending) res = { min: 0, max: 0, endings: new Set([pg.id]), paths: 1 };
      else if (pg.choice) {
        const opts = offered(pg.choice, flags);
        if (opts.length < 2 || opts.length > 4) report(id + " offers " + opts.length + " options with flags [" + flags.join(",") + "]");
        opts.forEach((o) => {
          const f2 = union(flags, o.set);
          const target = resolveTarget(byId, o.to, f2, length);
          if (!target) return report(id + " option " + o.key + " leads nowhere");
          const sub = visit(target.pageId, f2);
          if (!sub) return;
          res = res || { min: Infinity, max: 0, endings: new Set(), paths: 0 };
          res.min = Math.min(res.min, sub.min + 1);
          res.max = Math.max(res.max, sub.max + 1);
          sub.endings.forEach((e) => res.endings.add(e));
          res.paths += sub.paths;
        });
      } else report(id + " has no choice, route or ending");
      stack.delete(key);
      memo.set(key, res);
      return res;
    }

    const first = resolveTarget(byId, start, [], length);
    const res = first ? visit(first.pageId, []) : null;
    if (!first) report("start leads nowhere");
    return { min: res ? res.min : 0, max: res ? res.max : 0, endings: res ? res.endings : new Set(), paths: res ? res.paths : 0, problems };
  }

  /** Pages reachable from a page, ignoring flags (both lengths). */
  function reachable(byId, id, seen) {
    const out = seen || new Set();
    if (!byId[id] || out.has(id)) return out;
    out.add(id);
    const pg = byId[id];
    if (pg.skipTo) reachable(byId, pg.skipTo, out);
    (pg.route || []).forEach((r) => reachable(byId, r.to, out));
    ((pg.choice && pg.choice.options) || []).forEach((o) => reachable(byId, o.to, out));
    return out;
  }

  // ---- Template validation -------------------------------------------------------------------------

  /**
   * Map rules (design §5.3). `issue(code, where, detail)` reports a problem; the
   * caller adds the shared checks (fields, roles, languages, frameworks).
   */
  function validateMap(tpl, issue) {
    const pages = tpl.pages || [];
    const byId = index(pages);
    const where = (s) => tpl.id + (s ? " › " + s : "");
    const ids = new Set();
    pages.forEach((p) => {
      if (ids.has(p.id)) issue("duplicateId", where(p.id), p.id);
      ids.add(p.id);
      const kinds = ["choice", "route", "ending"].filter((k) => p[k]);
      if (kinds.length !== 1) issue("branching", where(p.id), "needs exactly one of choice, route or ending (has " + (kinds.join(", ") || "none") + ")");
      if (p.long && !(p.skipTo in byId)) issue("branching", where(p.id), "long page needs a skipTo");
      if (p.long && p.skipTo === p.id) issue("branching", where(p.id), "skipTo points at itself");
      if (p.choice) {
        if (!p.choice.question) issue("branching", where(p.id), "choice without question");
        p.choice.options.forEach((o) => {
          if (!(o.to in byId)) issue("reference", where(p.id + " › " + o.key), o.to);
        });
      }
      (p.route || []).forEach((r) => r.to in byId || issue("reference", where(p.id + " › route"), r.to));
      if (p.ending && !GRADES.includes(p.ending.grade)) issue("branching", where(p.id), "ending grade must be 1–5");
    });
    if (!(tpl.start in byId)) {
      issue("reference", where("start"), tpl.start);
      return;
    }
    if (byId[tpl.start].long || byId[tpl.start].route) issue("branching", where(tpl.start), "the start page cannot be long or a route page");

    const all = reachable(byId, tpl.start);
    pages.forEach((p) => all.has(p.id) || issue("branching", where(p.id), "unreachable from the start"));

    // Flags: every checked flag is set somewhere and has a label for the presenter.
    const set = new Set();
    pages.forEach((p) => ((p.choice && p.choice.options) || []).forEach((o) => (o.set || []).forEach((f) => set.add(f))));
    const checked = new Set();
    pages.forEach((p) => {
      (p.variants || []).forEach((v) => condFlags(v.if).forEach((f) => checked.add(f)));
      (p.route || []).forEach((r) => condFlags(r.if).forEach((f) => checked.add(f)));
      ((p.choice && p.choice.options) || []).forEach((o) => condFlags(o.requires).concat(condFlags(o.hides)).forEach((f) => checked.add(f)));
    });
    checked.forEach((f) => set.has(f) || issue("branching", where("flags"), "flag " + f + " is checked but never set"));
    set.forEach((f) => (tpl.flags && tpl.flags[f]) || issue("branching", where("flags"), "flag " + f + " has no label"));

    // Endings.
    const endings = pages.filter((p) => p.ending);
    if (endings.length < 3 || endings.length > 5) issue("branching", where(), endings.length + " endings (3–5 needed)");
    const grades = endings.map((e) => e.ending.grade);
    if (!grades.includes(1) || !grades.some((g) => g >= 4)) issue("branching", where(), "needs a grade-1 ending and a grade 4 or 5 ending");

    // Paths, per length.
    const reached = new Set();
    [["short", SHORT], ["long", LONG]].forEach(([length, [lo, hi]]) => {
      const a = analyse(pages, tpl.start, length);
      a.problems.forEach((p) => issue("branching", where(length), p));
      if (!a.problems.length && (a.min < lo || a.max > hi)) issue("branching", where(length), "paths have " + a.min + "–" + a.max + " choices (" + lo + "–" + hi + " needed)");
      a.endings.forEach((e) => reached.add(e));
    });
    endings.forEach((e) => reached.has(e.id) || issue("branching", where(e.id), "ending never reached in either length"));

    // A break-away (an option whose whole subtree no sibling shares) and a rejoin.
    let breakaway = false;
    const incoming = {};
    pages.forEach((p) => {
      if (!p.choice) return;
      const subs = p.choice.options.map((o) => reachable(byId, o.to));
      subs.forEach((sub, i) => {
        if (subs.every((other, j) => j === i || ![...sub].some((id) => other.has(id)))) breakaway = true;
      });
      p.choice.options.forEach((o) => (incoming[o.to] = (incoming[o.to] || new Set()).add(p.id)));
    });
    if (!breakaway) issue("branching", where(), "no break-away path");
    if (!Object.values(incoming).some((s) => s.size >= 2)) issue("branching", where(), "no page where branches rejoin");
  }

  /**
   * Expected length of a run: { minutes, min, max } choices. Works on template
   * pages and instance pages alike (discussion stops: a non-empty `discuss`).
   */
  function estimate(pages, start, length, mode) {
    const a = analyse(pages, start, length);
    const hasDiscuss = (pg) => (Array.isArray(pg.discuss) ? pg.discuss.length > 0 : !!pg.discuss);
    const inRun = pages.filter((pg) => pg.choice && !(length === "short" && pg.long));
    const share = inRun.filter(hasDiscuss).length / Math.max(1, inRun.length);
    const avg = (a.min + a.max) / 2;
    const minutes = Math.round(5 + avg * MINUTES_PER_CHOICE + (mode === "hybrid" ? avg * share * 4 : 0));
    return { minutes, min: a.min, max: a.max };
  }

  /** Choice-count range and ending ids per length, for library cards and pacing. */
  function stats(pages, start) {
    const s = analyse(pages, start, "short");
    const l = analyse(pages, start, "long");
    return { short: [s.min, s.max], long: [l.min, l.max], endings: pages.filter((p) => p.ending).length };
  }

  // ---- Instance helpers ------------------------------------------------------------------------------

  function byIdOf(inst) {
    if (!inst._pageIndex || inst._pageIndex.length !== inst.pages.length) {
      Object.defineProperty(inst, "_pageIndex", { value: Object.assign(index(inst.pages), { length: inst.pages.length }), configurable: true, enumerable: false });
    }
    return inst._pageIndex;
  }

  function page(inst, id) {
    return byIdOf(inst)[id] || null;
  }

  function landing(inst, id, flags) {
    return resolveTarget(byIdOf(inst), id, flags, inst.settings.length);
  }

  /** The narrative variant in force, if any: { narrative, because }. */
  function variantFor(pg, flags) {
    return (pg.variants || []).find((v) => cond(v.if, flags)) || null;
  }

  /** The passage number a page shows under these flags: its matching variant's, else its own. */
  function passageNum(pg, flags) {
    const v = variantFor(pg, flags);
    return v && v.num ? v.num : pg.num;
  }

  /** Number the room saw for a visited page (stored on the route entry when it was reached). */
  function seenNum(sess, pageId) {
    const entry = sess.route.find((r) => r.pageId === pageId);
    const pg = page(sess.instance, pageId);
    return entry && entry.num ? entry.num : passageNum(pg, flagsAt(sess, pageId));
  }

  function choicesMade(sess) {
    return sess.route.filter((r) => r.option).length;
  }

  // ---- Session: slides ------------------------------------------------------------------------------

  function slides(sess) {
    const inst = sess.instance;
    const wanted = BK.engine.slides.injectSlideWanted;
    const out = [{ id: "title", type: "title" }, { id: "briefing", type: "briefing" }, { id: "context", type: "context" }];
    const visited = sess.route.filter((r) => !r.auto);
    visited.forEach((r) => {
      const pg = page(inst, r.pageId);
      out.push({ id: "page:" + pg.id, type: "page", pageId: pg.id });
      pg.injects.filter((i) => i.enabled !== false && wanted(i, inst.settings.audience)).forEach((i) => out.push({ id: "inject:" + pg.id + ":" + i.id, type: "inject", pageId: pg.id, injectId: i.id }));
      if (pg.chart) out.push({ id: "data:" + pg.id + ":" + pg.chart.id, type: "data", pageId: pg.id, chartId: pg.chart.id });
      if (inst.settings.mode === "hybrid" && pg.discuss && pg.discuss.questions.length) out.push({ id: "discussion:" + pg.id, type: "discussion", pageId: pg.id });
      if (pg.choice) out.push({ id: "choice:" + pg.id, type: "choice", pageId: pg.id });
      if (pg.ending) out.push({ id: "ending:" + pg.id, type: "ending", pageId: pg.id });
    });
    const last = visited.length && page(inst, visited[visited.length - 1].pageId);
    if (last && last.ending) out.push({ id: "debrief", type: "debrief" });
    return out.map((s, i) => Object.assign(s, { index: i }));
  }

  function stepCount(sess, slide) {
    if (slide && slide.type === "discussion") {
      const pg = page(sess.instance, slide.pageId);
      return pg && pg.discuss ? pg.discuss.questions.length : 0;
    }
    return 0;
  }

  // ---- Session: commands ----------------------------------------------------------------------------

  /** Record the option chosen on the current page and move to the page it lands on. */
  function choose(sess, key, at) {
    const inst = sess.instance;
    const cur = sess.route[sess.route.length - 1];
    const pg = page(inst, cur.pageId);
    if (!pg || !pg.choice || sess.status === "ended") return false;
    const opt = offered(pg.choice, sess.flags).find((o) => o.key === key);
    if (!opt) return false;
    const flags = union(sess.flags, opt.set);
    const target = landing(inst, opt.to, flags);
    if (!target) return false;
    const iso = new Date(at).toISOString();
    cur.option = key;
    cur.chosenAt = iso;
    target.through.forEach((id) => sess.route.push({ pageId: id, auto: true, at: iso }));
    sess.route.push({ pageId: target.pageId, at: iso, option: null, num: passageNum(page(inst, target.pageId), flags) });
    sess.flags = flags;
    sess.decisions[pg.id] = { option: key, text: "", at: iso };
    sess.log.push({ at: iso, type: "choice", pageId: pg.id, option: key });
    return "page:" + target.pageId;
  }

  /** Step back one choice (misclicks): restores route, flags and the pages' injects. */
  function unchoose(sess, at) {
    let i = sess.route.length - 2;
    while (i >= 0 && !sess.route[i].option) i--;
    if (i < 0) return false;
    const removed = sess.route.splice(i + 1);
    const entry = sess.route[i];
    delete sess.decisions[entry.pageId];
    entry.option = null;
    delete entry.chosenAt;
    removed.forEach((r) => {
      const pg = page(sess.instance, r.pageId);
      (pg.injects || []).forEach((inj) => sess.injects[inj.id] && (sess.injects[inj.id] = { state: "pending", stageId: pg.id, releasedAt: null }));
    });
    sess.flags = sess.route.reduce((flags, r) => {
      const pg = page(sess.instance, r.pageId);
      const opt = r.option && pg.choice.options.find((o) => o.key === r.option);
      return opt ? union(flags, opt.set) : flags;
    }, []);
    sess.log.push({ at: new Date(at).toISOString(), type: "unchoose", pageId: entry.pageId });
    return "choice:" + entry.pageId;
  }

  // ---- Session: audience projection -----------------------------------------------------------------

  /** Flags in force when the room was on a page (for variants and landings shown there). */
  function flagsAt(sess, pageId) {
    let flags = [];
    for (const r of sess.route) {
      if (r.pageId === pageId) return flags;
      const pg = page(sess.instance, r.pageId);
      const opt = r.option && pg.choice && pg.choice.options.find((o) => o.key === r.option);
      if (opt) flags = union(flags, opt.set);
    }
    return flags;
  }

  function gradeLabel(grade, lang) {
    return t("branch.grade." + grade, null, lang);
  }

  /** Slide content for branching-specific slides (and the shared ones that differ). */
  function slideContent(sess, slide, step, lang, base) {
    const inst = sess.instance;
    const pg = slide.pageId ? page(inst, slide.pageId) : null;
    switch (slide.type) {
      case "page": {
        const flags = flagsAt(sess, pg.id);
        const v = variantFor(pg, flags);
        return Object.assign(base, {
          num: seenNum(sess, pg.id),
          title: L(pg.title, lang),
          narrative: L(v && v.narrative ? v.narrative : pg.narrative, lang),
          because: v && v.because ? L(v.because, lang) : "",
          emblem: inst.emblem,
          isEnding: Boolean(pg.ending),
          choiceNumber: sess.route.filter((r) => !r.auto).findIndex((r) => r.pageId === pg.id) + 1
        });
      }
      case "choice": {
        const flags = flagsAt(sess, pg.id);
        const entry = sess.route.find((r) => r.pageId === pg.id);
        const options = offered(pg.choice, flags).map((o) => {
          const f2 = union(flags, o.set);
          const target = landing(inst, o.to, f2);
          return { key: o.key, text: L(o.text, lang), to: target ? passageNum(page(inst, target.pageId), f2) : null };
        });
        // "Turn to § N" only when the options lead to different passages; all alike would give the game away.
        const distinct = new Set(options.map((o) => o.to)).size > 1;
        options.forEach((o) => distinct || (o.to = null));
        return Object.assign(base, {
          num: seenNum(sess, pg.id),
          question: L(pg.choice.question, lang),
          options,
          chosen: entry && entry.option ? entry.option : null
        });
      }
      case "ending":
        return Object.assign(base, {
          num: seenNum(sess, pg.id),
          label: L(pg.ending.label, lang),
          summary: L(pg.ending.summary, lang),
          grade: pg.ending.grade,
          gradeLabel: gradeLabel(pg.ending.grade, lang),
          scale: GRADES.map((g) => ({ grade: g, label: gradeLabel(g, lang) })),
          choices: choicesMade(sess)
        });
      case "discussion": {
        const items = pg.discuss.questions.map((q) => ({ kind: "question", text: L(q.text, lang), targets: q.targets, roleNotPresent: q.roleNotPresent }));
        return Object.assign(base, { num: seenNum(sess, pg.id), title: L(pg.title, lang), items: items.slice(0, step), total: items.length });
      }
      case "debrief": {
        const last = page(inst, sess.route[sess.route.length - 1].pageId);
        return Object.assign(base, {
          format: "branching",
          ending: last.ending ? { label: L(last.ending.label, lang), grade: last.ending.grade, gradeLabel: gradeLabel(last.ending.grade, lang) } : null,
          choices: choicesMade(sess),
          lessons: (inst.debrief.keyLessons || []).map((x) => L(x, lang)),
          map: mapGraph(inst, sess.route, lang, sess),
          mitre: inst.frameworks.mitre,
          seedLine: t("stage.seedLine", { seed: inst.seed, id: inst.templateId, version: inst.templateVersion }, lang)
        });
      }
      default:
        return null;
    }
  }

  /** Progress rail data: the page number and the number of choices made. */
  function progress(sess, list, idx) {
    const slide = list[idx];
    const pg = slide && slide.pageId ? page(sess.instance, slide.pageId) : null;
    return {
      branching: true,
      stageIndex: -1,
      stageCount: 0,
      page: pg ? seenNum(sess, pg.id) : null,
      choices: choicesMade(sess),
      slideNumber: idx + 1,
      slideCount: list.length,
      clock: ""
    };
  }

  // ---- Route map ----------------------------------------------------------------------------------------

  /** Every page a target can land on under some flags (route pages expanded, long pages skipped in short). */
  function landings(byId, id, length, seen) {
    const out = new Set();
    const s = seen || new Set();
    if (s.has(id) || !byId[id]) return out;
    s.add(id);
    const pg = byId[id];
    if (length === "short" && pg.long) return landings(byId, pg.skipTo, length, s);
    if (pg.route) {
      pg.route.forEach((r) => landings(byId, r.to, length, s).forEach((x) => out.add(x)));
      return out;
    }
    out.add(id);
    return out;
  }

  /**
   * The map for the stage debrief: numbers, layers and edges only. Pages that are
   * visible in this length (no route pages, no long pages in a short run).
   */
  function mapGraph(inst, route, lang, sess) {
    const byId = byIdOf(inst);
    const length = inst.settings.length;
    const visible = inst.pages.filter((p) => !p.route && !(length === "short" && p.long));
    const edges = [];
    visible.forEach((p) => {
      if (!p.choice) return;
      const targets = new Set();
      p.choice.options.forEach((o) => landings(byId, o.to, length).forEach((x) => targets.add(x)));
      targets.forEach((to) => edges.push([p.id, to]));
    });
    // Layers: longest distance from the start, so every edge points right.
    const layer = {};
    const start = (landing(inst, inst.start, []) || { pageId: inst.start }).pageId;
    layer[start] = 0;
    for (let pass = 0; pass < visible.length; pass++) {
      let changed = false;
      edges.forEach(([a, b]) => {
        if (a in layer && (!(b in layer) || layer[b] < layer[a] + 1)) {
          layer[b] = layer[a] + 1;
          changed = true;
        }
      });
      if (!changed) break;
    }
    // Endings line up in the last column, like the back pages of a gamebook.
    const lastLayer = Math.max(0, ...Object.values(layer));
    visible.forEach((p) => p.ending && p.id in layer && (layer[p.id] = lastLayer));
    const walked = route.filter((r) => !r.auto).map((r) => r.pageId);
    const onRoute = new Set(walked);
    const routeEdges = new Set(walked.slice(1).map((id, i) => walked[i] + ">" + id));
    // Order within a layer: barycentre of predecessors, then id for stability.
    const order = {};
    const byLayer = {};
    visible.filter((p) => p.id in layer).forEach((p) => (byLayer[layer[p.id]] = byLayer[layer[p.id]] || []).push(p.id));
    Object.keys(byLayer)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach((l) => {
        const ids = byLayer[l];
        const bary = (id) => {
          const preds = edges.filter(([, b]) => b === id).map(([a]) => order[a]).filter((x) => x != null);
          return preds.length ? preds.reduce((s, x) => s + x, 0) / preds.length : 0;
        };
        ids.sort((a, b) => bary(a) - bary(b) || (onRoute.has(b) ? 1 : 0) - (onRoute.has(a) ? 1 : 0) || a.localeCompare(b));
        ids.forEach((id, i) => (order[id] = i - (ids.length - 1) / 2));
      });
    // Visited pages carry the number the room saw (a variant may have its own).
    const num = (id) => (sess && onRoute.has(id) ? seenNum(sess, id) : byId[id].num);
    return {
      nodes: visible
        .filter((p) => p.id in layer)
        .map((p) => ({
          num: num(p.id),
          layer: layer[p.id],
          order: order[p.id],
          visited: onRoute.has(p.id),
          current: walked[walked.length - 1] === p.id,
          ending: p.ending ? { grade: p.ending.grade, gradeLabel: gradeLabel(p.ending.grade, lang) } : null
        })),
      edges: edges.filter(([a, b]) => a in layer && b in layer).map(([a, b]) => ({ from: num(a), to: num(b), visited: routeEdges.has(a + ">" + b) })),
      layers: Math.max(0, ...Object.values(layer)) + 1
    };
  }

  // ---- Facilitator view ------------------------------------------------------------------------------------

  function flagLabel(inst, f, lang) {
    return inst.flagLabels && inst.flagLabels[f] ? L(inst.flagLabels[f], lang) : f;
  }

  function facilitatorView(sess, now, lang, list, idx, base) {
    const inst = sess.instance;
    const slide = list[idx];
    const pg = slide && slide.pageId ? page(inst, slide.pageId) : null;
    const flags = pg ? flagsAt(sess, pg.id) : sess.flags;
    const entry = pg ? sess.route.find((r) => r.pageId === pg.id) : null;
    const isCurrent = pg && sess.route[sess.route.length - 1].pageId === pg.id;
    const lastChoice = sess.route.slice().reverse().find((r) => r.option);
    const made = choicesMade(sess);
    const visitedDiscuss = sess.route.filter((r) => !r.auto && page(inst, r.pageId).discuss && inst.settings.mode === "hybrid").length;
    const expected = 3 + made * MINUTES_PER_CHOICE + visitedDiscuss * (inst.settings.discussMinutes || 4);
    const elapsedMin = BK.engine.session.elapsedMs(sess, now) / 60000;
    const delta = Math.round(elapsedMin - expected);

    return Object.assign(base, {
      branching: {
        page: pg
          ? {
              id: pg.id,
              num: seenNum(sess, pg.id),
              title: L(pg.title, lang),
              notes: pg.facilitator ? L(pg.facilitator.notes, lang) : "",
              expected: pg.facilitator ? L(pg.facilitator.expected, lang) : "",
              hints: pg.facilitator ? (pg.facilitator.hints || []).map((h) => L(h, lang)) : [],
              ending: pg.ending ? { label: L(pg.ending.label, lang), summary: L(pg.ending.summary, lang), grade: pg.ending.grade, gradeLabel: gradeLabel(pg.ending.grade, lang) } : null
            }
          : null,
        choice:
          pg && pg.choice
            ? {
                question: L(pg.choice.question, lang),
                strong: L(pg.choice.strong, lang),
                current: isCurrent && sess.status !== "ended",
                chosen: entry && entry.option ? entry.option : null,
                options: offered(pg.choice, flags).map((o) => {
                  const f2 = union(flags, o.set);
                  const target = landing(inst, o.to, f2);
                  const lp = target && page(inst, target.pageId);
                  return { key: o.key, text: L(o.text, lang), why: L(o.why, lang), to: lp ? passageNum(lp, f2) : null, toTitle: lp ? L(lp.title, lang) : "", ending: lp && lp.ending ? gradeLabel(lp.ending.grade, lang) : "", sets: (o.set || []).map((f) => flagLabel(inst, f, lang)) };
                })
              }
            : null,
        flags: sess.flags.map((f) => flagLabel(inst, f, lang)),
        route: sess.route.filter((r) => !r.auto).map((r) => ({ num: seenNum(sess, r.pageId), title: L(page(inst, r.pageId).title, lang), option: r.option || null })),
        canUndo: !!lastChoice && sess.status !== "ended",
        lastChoice: lastChoice ? { num: seenNum(sess, lastChoice.pageId), option: lastChoice.option } : null,
        choicesMade: made,
        range: inst.pacing.choiceRange
      },
      pacing: {
        elapsedMin,
        totalMin: inst.pacing.totalMinutes,
        state: delta > 3 ? "behind" : delta < -5 ? "ahead" : "onTime",
        delta: Math.abs(delta),
        suggestSkip: false
      },
      stages: []
    });
  }

  /** Scorecard criteria: one per choice made, from that choice's "strong" note. */
  function criteria(inst, sess) {
    if (!sess) return [];
    return sess.route
      .filter((r) => r.option)
      .map((r) => {
        const pg = page(inst, r.pageId);
        return { id: pg.id + "-strong", decisionId: pg.id, pageId: pg.id, num: pg.num, text: pg.choice.strong };
      })
      .filter((c) => c.text);
  }

  BK.engine.branching = {
    GRADES,
    SHORT,
    LONG,
    MINUTES_PER_CHOICE,
    cond,
    offered,
    resolveTarget,
    analyse,
    stats,
    estimate,
    validateMap,
    page,
    landing,
    variantFor,
    flagsAt,
    slides,
    stepCount,
    choose,
    unchoose,
    slideContent,
    progress,
    mapGraph,
    facilitatorView,
    criteria,
    gradeLabel,
    flagLabel,
    passageNum,
    seenNum
  };
})();
