/*
 * pacing.js — Stage timing derived from the total duration.
 *
 * Total = briefing + Σ stages + debrief. Briefing and debrief get a fixed share
 * (clamped); the rest is split across stages weighted by complexity: injects,
 * a decision point and any authored `complexity` bonus. Discussion time is a
 * share of each stage unless the operator overrides it.
 *
 * status() compares elapsed time with the plan so the presenter can show
 * "on time / behind by n min" and suggest skipping optional injects.
 */
(function () {
  "use strict";

  const BK = window.BK;

  const MIN_STAGE = 4; // minutes; a stage shorter than this cannot hold a discussion
  const DISCUSSION_SHARE = 0.6;

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function stageWeight(stage) {
    const publicInjects = (stage.injects || []).filter((i) => i.visibility === "public").length;
    return 1 + 0.15 * publicInjects + (stage.decision ? 0.4 : 0) + (stage.complexity || 0);
  }

  /**
   * Build a plan. `discussionOverride` (minutes) replaces the derived discussion time.
   * Returns { totalMinutes, briefing, debrief, stages: [{ stageId, start, minutes, discussion }] }.
   */
  function plan(instance, totalMinutes, discussionOverride) {
    const total = Math.max(15, Math.round(totalMinutes || 60));
    const briefing = clamp(Math.round(total * 0.1), 3, 15);
    const debrief = clamp(Math.round(total * 0.17), 5, 30);
    const stages = instance.stages || [];
    const available = Math.max(stages.length * MIN_STAGE, total - briefing - debrief);

    const weights = stages.map(stageWeight);
    const sum = weights.reduce((a, b) => a + b, 0) || 1;
    const minutes = weights.map((w) => Math.max(MIN_STAGE, Math.round((available * w) / sum)));

    // Absorb rounding drift in the longest stage so the plan adds up exactly.
    const drift = available - minutes.reduce((a, b) => a + b, 0);
    if (minutes.length && drift !== 0) {
      const longest = minutes.indexOf(Math.max(...minutes));
      minutes[longest] = Math.max(MIN_STAGE, minutes[longest] + drift);
    }

    let cursor = briefing;
    const out = stages.map((s, i) => {
      const authored = s.decision && s.decision.discussionMinutes;
      const derived = Math.max(2, Math.round(minutes[i] * DISCUSSION_SHARE));
      const discussion = discussionOverride
        ? Math.min(discussionOverride, minutes[i])
        : authored
          ? Math.min(authored, derived + 2)
          : derived;
      const entry = { stageId: s.id, start: cursor, minutes: minutes[i], discussion };
      cursor += minutes[i];
      return entry;
    });

    return { totalMinutes: briefing + available + debrief, briefing, debrief, stages: out };
  }

  /**
   * Schedule status at `elapsed` minutes while in stage `stageIndex`.
   * delta > 0 means behind schedule by delta minutes.
   */
  function status(p, stageIndex, elapsed) {
    const s = p.stages[stageIndex];
    if (!s) return { delta: 0, state: "onTime" };
    const plannedEnd = s.start + s.minutes;
    const behind = Math.max(0, Math.round(elapsed - plannedEnd));
    const ahead = Math.max(0, Math.round(s.start - elapsed));
    const state = behind > 1 ? "behind" : ahead > 5 ? "ahead" : "onTime";
    return { delta: behind || -ahead, state, suggestSkip: behind > 5 };
  }

  BK.engine.pacing = { plan, status, stageWeight };
})();
