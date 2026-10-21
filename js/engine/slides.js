/*
 * slides.js — Slide compiler: exercise instance → ordered slide list.
 *
 * Stages and slides are independent (spec 7): a stage compiles to several
 * slides. Slides only hold references (stageId, injectId, chartId, decisionId);
 * the stage renderer looks content up through the audience projection at run
 * time, so facilitator-only material never travels inside a slide.
 *
 * Typical stage: [recap] → situation → timeline → injects → [data] → [twist] → discussion → [decision]
 * Audience sets density: executive audiences see fewer full-screen artefacts and charts.
 */
(function () {
  "use strict";

  const BK = window.BK;

  // Artefacts that matter to crisis leadership even at low severity.
  const EXECUTIVE_TYPES = new Set([
    "executiveMessage", "mediaEnquiry", "newsHeadline", "regulatorLetter", "ransomNote", "customerComplaint",
    "impactReport", "socialPost", "statusPage", "supplierNotice", "phoneTranscript"
  ]);
  const EXECUTIVE_CHARTS = new Set(["kpi", "rto", "gauge", "dependency"]);

  function injectSlideWanted(inj, audience) {
    if (inj.visibility !== "public") return false; // role cards / facilitator only — never on the shared stage
    if (audience !== "executive") return true;
    return EXECUTIVE_TYPES.has(inj.type) || BK.data.options.severityRank(inj.severity) >= BK.data.options.severityRank("high");
  }

  function chartsFor(stage, audience) {
    if (audience !== "executive") return stage.charts;
    const preferred = stage.charts.find((c) => EXECUTIVE_CHARTS.has(c.type));
    return preferred ? [preferred] : stage.charts.slice(0, 1);
  }

  function compile(instance) {
    const audience = instance.settings.audience;
    const slides = [];
    const add = (type, extra) => slides.push(Object.assign({ id: [type].concat(extra && extra.idParts ? extra.idParts : []).join(":"), type }, extra && extra.ref));

    add("title");
    add("briefing");
    add("context");

    instance.stages.forEach((stage, i) => {
      const sid = stage.id;
      const prev = instance.stages[i - 1];
      if (prev && prev.decision) add("recap", { idParts: [sid], ref: { stageId: sid, decisionId: prev.decision.id } });

      add("situation", { idParts: [sid], ref: { stageId: sid } });

      const publicInjects = stage.injects.filter((x) => x.visibility === "public");
      if (publicInjects.length) add("timeline", { idParts: [sid], ref: { stageId: sid } });

      stage.injects.filter((x) => injectSlideWanted(x, audience)).forEach((x) => add("inject", { idParts: [sid, x.id], ref: { stageId: sid, injectId: x.id } }));

      // Branch injects get conditional slides; the session shows them only when the branch is active.
      stage.branches.forEach((b) =>
        b.addInjects.forEach((injId) => {
          const inj = stage.branchInjects.find((x) => x.id === injId);
          if (inj && injectSlideWanted(inj, audience)) {
            add("inject", { idParts: [sid, injId], ref: { stageId: sid, injectId: injId, condition: { decision: b.when.decision, option: b.when.option } } });
          }
        })
      );

      chartsFor(stage, audience).forEach((c) => add("data", { idParts: [sid, c.id], ref: { stageId: sid, chartId: c.id } }));

      if (i > 0 && stage.twist) add("twist", { idParts: [sid], ref: { stageId: sid } });
      add("discussion", { idParts: [sid], ref: { stageId: sid } });
      if (stage.decision) add("decision", { idParts: [sid], ref: { stageId: sid, decisionId: stage.decision.id } });
    });

    add("debrief");
    return slides;
  }

  BK.engine.slides = { compile, injectSlideWanted };
})();
