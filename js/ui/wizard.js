/*
 * wizard.js — New-exercise wizard (spec section 4).
 *
 * Every control writes into one `draft` params object. That object is the
 * contract with the generator (BK.engine.generator.generateFromParams).
 * The draft lives in module state so a language switch or a re-render caused
 * by a dependent control (e.g. changing scenario) never loses input.
 *
 * Quick path: scenario → Generate. Everything else has sensible defaults and
 * the advanced options sit in a collapsed <details>.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el, svgIcon } = BK.dom;
  const c = BK.ui.c;
  const t = BK.t;
  const opts = BK.data.options;

  let draft = null;
  let ui = { advancedOpen: false, stagesTouched: false, customDuration: false, jurisdictionTouched: false };
  let rootEl = null;

  // ---- Draft model ------------------------------------------------------------

  function defaultDraft(scenarioId) {
    const prefs = BK.store.prefs.get();
    const lang = BK.i18n.getLang();
    return {
      title: "",
      scenarioId: scenarioId || "random",
      randomCategory: "",
      lang,
      difficulty: "intermediate",
      durationMinutes: prefs.defaultDuration,
      stageCount: null,
      audience: "mixed",
      stageTheme: prefs.stageTheme,
      sector: "random",
      orgSize: "medium",
      orgName: "",
      environment: "generic",
      jurisdiction: lang === "sv" ? "se" : "eu",
      pressures: { media: true, regulator: true, lawEnforcement: true, suppliers: true, customers: true },
      injectDensity: "normal",
      roles: [],
      useRealNames: false,
      participantNames: {},
      objectives: { deselected: [], custom: [] },
      discussionMinutes: null,
      injectRelease: "manual",
      decisionMode: "options",
      mode: "pure",
      length: "short",
      meters: false,
      complications: "manual",
      seed: BK.rng.newSeed()
    };
  }

  function template() {
    return draft.scenarioId && draft.scenarioId !== "random" ? BK.scenarios.get(draft.scenarioId) : null;
  }

  /** Stage count that fits the duration (~15 min per stage), clamped to the template's bounds. */
  function suggestStages(tpl, minutes) {
    const raw = Math.round(minutes / 15);
    return Math.max(tpl.minStages, Math.min(tpl.maxStages, raw));
  }

  /** Reset fields that depend on the chosen scenario. */
  function applyScenarioDefaults() {
    const tpl = template();
    draft.roles = tpl ? tpl.roles.slice() : BK.data.roles.list.map((r) => r.id);
    draft.objectives.deselected = [];
    ui.stagesTouched = false;
    draft.stageCount = tpl ? suggestStages(tpl, draft.durationMinutes) : null;
  }

  // ---- Re-rendering with focus preservation ------------------------------------

  function rerender() {
    const activeId = document.activeElement && document.activeElement.id;
    BK.dom.clear(rootEl);
    build(rootEl);
    if (activeId) {
      const again = document.getElementById(activeId);
      if (again) again.focus();
    }
  }

  // ---- Controls -----------------------------------------------------------------

  function input(id, value, onInput, extra) {
    return el("input", Object.assign({ id, class: "input", value: value == null ? "" : value, on: { input: (e) => onInput(e.target.value) } }, extra || {}));
  }

  function scenarioSelect() {
    const options = [{ value: "random", label: t("wizard.scenarioSurprise") }].concat(
      BK.scenarios.list().map((tpl) => ({ value: tpl.id, label: BK.loc(tpl.title) + " — " + t("category." + tpl.category) }))
    );
    const sel = c.select(options, draft.scenarioId, (v) => {
      draft.scenarioId = v;
      applyScenarioDefaults();
      rerender();
    });
    sel.id = "wz-scenario";
    return sel;
  }

  function randomCategoryField() {
    const options = [{ value: "", label: t("common.any") }].concat(opts.categories.map((id) => ({ value: id, label: t("category." + id) })));
    return c.field({
      id: "wz-random-category",
      label: t("wizard.randomCategory"),
      control: c.select(options, draft.randomCategory, (v) => (draft.randomCategory = v))
    });
  }

  function durationField() {
    const options = opts.durations.map((m) => ({ value: String(m), label: t("common.minutes", { n: m }) }));
    options.push({ value: "custom", label: t("wizard.durationCustom") });
    const isCustom = ui.customDuration || !opts.durations.includes(draft.durationMinutes);

    const onDuration = (minutes) => {
      draft.durationMinutes = minutes;
      const tpl = template();
      if (tpl && !ui.stagesTouched) draft.stageCount = suggestStages(tpl, minutes);
    };

    return el(
      "div",
      { class: "field-group" },
      c.segmented({
        label: t("wizard.duration"),
        name: "wz-duration",
        value: isCustom ? "custom" : String(draft.durationMinutes),
        options,
        onChange: (v) => {
          ui.customDuration = v === "custom";
          if (!ui.customDuration) onDuration(Number(v));
          rerender();
        }
      }),
      isCustom
        ? c.field({
            id: "wz-duration-custom",
            label: t("wizard.durationCustomLabel"),
            control: input("wz-duration-custom", draft.durationMinutes, (v) => {
              const n = Math.round(Number(v));
              if (n >= 15 && n <= 600) {
                onDuration(n);
                syncStageSlider();
              }
            }, { type: "number", min: 15, max: 600, step: 5, inputmode: "numeric" })
          })
        : null
    );
  }

  // The stage slider is updated in place when duration changes without a full re-render.
  let stageSliderRefs = null;
  function syncStageSlider() {
    if (!stageSliderRefs || draft.stageCount == null) return;
    stageSliderRefs.range.value = draft.stageCount;
    stageSliderRefs.output.textContent = String(draft.stageCount);
  }

  function stagesField() {
    const tpl = template();
    if (!tpl) {
      stageSliderRefs = null;
      return el("div", { class: "field" }, el("span", { class: "field__label", text: t("wizard.stages") }), el("p", { class: "field__hint", text: t("wizard.stagesRandom") }));
    }
    const output = el("output", { class: "range-value", for: "wz-stages", text: String(draft.stageCount) });
    const range = el("input", {
      id: "wz-stages",
      type: "range",
      class: "range",
      min: tpl.minStages,
      max: tpl.maxStages,
      step: 1,
      value: draft.stageCount,
      on: {
        input: (e) => {
          draft.stageCount = Number(e.target.value);
          ui.stagesTouched = true;
          output.textContent = e.target.value;
        }
      }
    });
    stageSliderRefs = { range, output };
    return el(
      "div",
      { class: "field" },
      el("label", { class: "field__label", for: "wz-stages", text: t("wizard.stages") }),
      el("div", { class: "range-row" }, range, output),
      el("p", { class: "field__hint", text: t("wizard.stagesHint", { min: tpl.minStages, max: tpl.maxStages }) })
    );
  }

  /** Branching scenarios: run mode and length replace duration and stage count. */
  function branchingFields(tpl) {
    const B = BK.engine.branching;
    const est = (length, mode) => B.estimate(tpl.pages, tpl.start, length, mode);
    const now = est(draft.length, draft.mode);
    return el(
      "div",
      { class: "form-grid" },
      c.segmented({
        label: t("wizard.mode"),
        name: "wz-mode",
        value: draft.mode,
        wrap: true,
        options: ["pure", "hybrid"].map((m) => ({ value: m, label: t("branch.mode." + m) })),
        hint: t("wizard.modeHint"),
        onChange: (v) => {
          draft.mode = v;
          rerender();
        }
      }),
      c.segmented({
        label: t("wizard.length"),
        name: "wz-length",
        value: draft.length,
        wrap: true,
        options: ["short", "long"].map((l) => {
          const e = est(l, draft.mode);
          return { value: l, label: t("branch.length." + l), hint: t("wizard.lengthOption", { label: t("branch.length." + l), n: e.minutes, min: e.min, max: e.max }) };
        }),
        onChange: (v) => {
          draft.length = v;
          rerender();
        }
      }),
      el("p", { class: "field__hint", text: t("wizard.branchingDuration", { n: now.minutes }) })
    );
  }

  function themeOptions() {
    return BK.theme.MODES.map((m) => ({ value: m, label: t("theme." + m) }));
  }

  function basicSection() {
    const tpl = template();
    return c.card(
      { class: "card form-section" },
      el("h2", { text: t("wizard.basic") }),
      el(
        "div",
        { class: "form-grid" },
        c.field({
          id: "wz-title",
          label: t("wizard.exerciseTitle"),
          hint: t("wizard.exerciseTitleHint"),
          control: input("wz-title", draft.title, (v) => (draft.title = v), { placeholder: tpl ? BK.loc(tpl.title, draft.lang) : "", maxlength: 120 })
        }),
        c.field({ id: "wz-scenario", label: t("wizard.scenario"), control: scenarioSelect() }),
        tpl ? null : randomCategoryField(),
        c.segmented({
          label: t("wizard.language"),
          name: "wz-lang",
          value: draft.lang,
          options: BK.i18n.LANGS.map((l) => ({ value: l, label: t("lang." + l) })),
          onChange: (v) => {
            draft.lang = v;
            // Until the operator picks one, jurisdiction (and so currency and regulator) follows the language.
            if (!ui.jurisdictionTouched) draft.jurisdiction = v === "sv" ? "se" : "eu";
            rerender(); // title placeholder follows the exercise language
          }
        })
      ),
      c.segmented({
        label: t("wizard.difficulty"),
        name: "wz-difficulty",
        value: draft.difficulty,
        wrap: true,
        options: opts.difficulties.map((d) => ({ value: d, label: t("difficulty." + d), hint: t("difficulty." + d + ".hint") })),
        onChange: (v) => (draft.difficulty = v)
      }),
      tpl && tpl.format === "branching" ? branchingFields(tpl) : el("div", { class: "form-grid" }, durationField(), stagesField()),
      c.segmented({
        label: t("wizard.audience"),
        name: "wz-audience",
        value: draft.audience,
        wrap: true,
        options: opts.audiences.map((a) => ({ value: a, label: t("audience." + a), hint: t("audience." + a + ".hint") })),
        onChange: (v) => (draft.audience = v)
      }),
      c.segmented({
        label: t("wizard.stageTheme"),
        name: "wz-stage-theme",
        value: draft.stageTheme,
        options: themeOptions(),
        onChange: (v) => (draft.stageTheme = v)
      })
    );
  }

  function rolesField() {
    const tpl = template();
    const roleIds = tpl ? tpl.roles : BK.data.roles.list.map((r) => r.id);
    const toggleRole = (id, on) => {
      const set = new Set(draft.roles);
      if (on) set.add(id);
      else set.delete(id);
      draft.roles = roleIds.filter((r) => set.has(r)); // keep template order
      if (draft.useRealNames) rerender();
    };

    return el(
      "fieldset",
      { class: "fieldset" },
      el("legend", { class: "field__label", text: t("wizard.roles") }),
      el("p", { class: "field__hint", text: t("wizard.rolesHint") }),
      el(
        "div",
        { class: "role-grid" },
        roleIds.map((id) => {
          const role = BK.data.roles.get(id);
          const label = role ? BK.loc(role.label) : id;
          const checked = draft.roles.includes(id);
          const nameInput =
            draft.useRealNames && checked
              ? input("wz-name-" + id, draft.participantNames[id] || "", (v) => (draft.participantNames[id] = v), {
                  placeholder: t("wizard.participantPlaceholder"),
                  "aria-label": t("wizard.participantName", { role: label }),
                  maxlength: 80,
                  class: "input input--sm"
                })
              : null;
          return el("div", { class: "role-row" }, c.checkbox(label, checked, (on) => toggleRole(id, on)), nameInput);
        })
      ),
      el(
        "div",
        { class: "field" },
        (() => {
          const box = c.checkbox(t("wizard.useRealNames"), draft.useRealNames, (on) => {
            draft.useRealNames = on;
            rerender();
          });
          box.querySelector("input").id = "wz-real-names";
          return box;
        })()
      )
    );
  }

  function objectivesField() {
    const tpl = template();
    const deselected = new Set(draft.objectives.deselected);

    const customInput = input("wz-objective-new", "", () => {}, { placeholder: t("wizard.objectiveCustomPlaceholder"), maxlength: 200 });
    const addCustom = () => {
      const v = customInput.value.trim();
      if (!v) return;
      draft.objectives.custom.push(v);
      rerender();
      const again = document.getElementById("wz-objective-new");
      if (again) again.focus();
    };
    customInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addCustom();
      }
    });

    return el(
      "fieldset",
      { class: "fieldset" },
      el("legend", { class: "field__label", text: t("wizard.objectives") }),
      tpl
        ? el(
            "div",
            { class: "stack-sm" },
            tpl.learningObjectives.map((lo) =>
              c.checkbox(BK.loc(lo.text), !deselected.has(lo.id), (on) => {
                if (on) deselected.delete(lo.id);
                else deselected.add(lo.id);
                draft.objectives.deselected = Array.from(deselected);
              })
            )
          )
        : el("p", { class: "field__hint", text: t("wizard.objectivesEmpty") }),
      draft.objectives.custom.length
        ? el(
            "ul",
            { class: "chip-list" },
            draft.objectives.custom.map((text, i) =>
              el(
                "li",
                { class: "chip" },
                el("span", { text }),
                c.button({
                  label: t("common.remove") + ": " + text,
                  icon: "cross",
                  iconOnly: true,
                  kind: "ghost",
                  size: "sm",
                  onClick: () => {
                    draft.objectives.custom.splice(i, 1);
                    rerender();
                  }
                })
              )
            )
          )
        : null,
      el(
        "div",
        { class: "inline-add" },
        c.field({ id: "wz-objective-new", label: t("wizard.objectiveCustom"), control: customInput, className: "field--grow" }),
        c.button({ label: t("common.add"), icon: "plus", onClick: addCustom })
      )
    );
  }

  function seedField() {
    const seedInput = input("wz-seed", draft.seed, (v) => (draft.seed = v), { class: "input mono", maxlength: 40, autocomplete: "off", spellcheck: "false" });
    seedInput.addEventListener("blur", () => {
      draft.seed = BK.rng.normalizeSeed(draft.seed) || BK.rng.newSeed();
      seedInput.value = draft.seed;
    });
    return el(
      "div",
      { class: "field" },
      el("label", { class: "field__label", for: "wz-seed", text: t("wizard.seed") }),
      el(
        "div",
        { class: "inline-add" },
        seedInput,
        c.button({
          label: t("wizard.reroll"),
          icon: "dice",
          onClick: () => {
            draft.seed = BK.rng.newSeed();
            seedInput.value = draft.seed;
          }
        })
      ),
      el("p", { class: "field__hint", text: t("wizard.seedHint") })
    );
  }

  function advancedSection() {
    const sectorIds = opts.sectors;
    const sectorOptions = [{ value: "random", label: t("wizard.sectorRandom") }].concat(sectorIds.map((s) => ({ value: s, label: t("sector." + s) })));

    const details = el(
      "details",
      { class: "card form-section advanced", open: ui.advancedOpen, on: { toggle: (e) => (ui.advancedOpen = e.target.open) } },
      el("summary", null, el("h2", { text: t("wizard.advanced") }), svgIcon("chevron-down", { className: "advanced__chevron" })),
      el(
        "div",
        { class: "form-grid" },
        c.field({ id: "wz-sector", label: t("wizard.sector"), control: c.select(sectorOptions, draft.sector, (v) => (draft.sector = v)) }),
        c.segmented({
          label: t("wizard.orgSize"),
          name: "wz-size",
          value: draft.orgSize,
          options: opts.sizes.map((s) => ({ value: s, label: t("size." + s) })),
          onChange: (v) => (draft.orgSize = v)
        }),
        c.field({
          id: "wz-org-name",
          label: t("wizard.orgName"),
          hint: t("wizard.orgNameHint"),
          control: input("wz-org-name", draft.orgName, (v) => (draft.orgName = v), { maxlength: 80 })
        }),
        c.field({
          id: "wz-env",
          label: t("wizard.environment"),
          hint: t("wizard.environmentHint"),
          control: c.select(BK.data.environments.ids.map((e) => ({ value: e, label: t("env." + e) })), draft.environment, (v) => (draft.environment = v))
        }),
        c.segmented({
          label: t("wizard.jurisdiction"),
          name: "wz-jurisdiction",
          value: draft.jurisdiction,
          options: opts.jurisdictions.map((j) => ({ value: j, label: t("jurisdiction." + j) })),
          onChange: (v) => {
            draft.jurisdiction = v;
            ui.jurisdictionTouched = true;
          }
        }),
        c.segmented({
          label: t("wizard.density"),
          name: "wz-density",
          value: draft.injectDensity,
          options: opts.densities.map((d) => ({ value: d, label: t("density." + d) })),
          onChange: (v) => (draft.injectDensity = v)
        })
      ),
      el(
        "fieldset",
        { class: "fieldset" },
        el("legend", { class: "field__label", text: t("wizard.pressures") }),
        el("p", { class: "field__hint", text: t("wizard.pressuresHint") }),
        el(
          "div",
          { class: "check-row" },
          opts.pressures.map((p) => c.checkbox(t("pressure." + p), draft.pressures[p], (on) => (draft.pressures[p] = on)))
        )
      ),
      el(
        "fieldset",
        { class: "fieldset" },
        el("legend", { class: "field__label", text: t("wizard.extras") }),
        c.checkbox(t("wizard.meters"), draft.meters, (on) => (draft.meters = on)),
        el("p", { class: "field__hint", text: t("wizard.metersHint") }),
        c.segmented({
          label: t("wizard.complications"),
          name: "wz-complications",
          value: draft.complications,
          options: ["off", "manual", "auto"].map((m) => ({ value: m, label: t("complication.mode." + m) })),
          onChange: (v) => (draft.complications = v)
        }),
        el("p", { class: "field__hint", text: t("wizard.complicationsHint") })
      ),
      rolesField(),
      objectivesField(),
      template() && template().format === "branching" ? el("div", { class: "form-grid" }, seedField()) : el(
        "div",
        { class: "form-grid" },
        c.field({
          id: "wz-discussion",
          label: t("wizard.discussion"),
          hint: t("wizard.discussionHint"),
          control: input(
            "wz-discussion",
            draft.discussionMinutes,
            (v) => {
              const n = Math.round(Number(v));
              draft.discussionMinutes = v.trim() === "" || !(n > 0) ? null : Math.min(n, 120);
            },
            { type: "number", min: 1, max: 120, inputmode: "numeric" }
          )
        }),
        c.segmented({
          label: t("wizard.injectRelease"),
          name: "wz-release",
          value: draft.injectRelease,
          options: opts.injectRelease.map((r) => ({ value: r, label: t("release." + r) })),
          onChange: (v) => (draft.injectRelease = v)
        }),
        c.segmented({
          label: t("wizard.decisionMode"),
          name: "wz-decisions",
          value: draft.decisionMode,
          options: opts.decisionModes.map((d) => ({ value: d, label: t("decisionMode." + d) })),
          onChange: (v) => (draft.decisionMode = v)
        }),
        seedField()
      )
    );
    return details;
  }

  // ---- Submit -------------------------------------------------------------------

  /** Snapshot of the draft as plain params (what the generator receives). */
  function params() {
    const p = JSON.parse(JSON.stringify(draft));
    p.seed = BK.rng.normalizeSeed(p.seed) || BK.rng.newSeed();
    if (!p.useRealNames) p.participantNames = {};
    return p;
  }

  function generate() {
    if (BK.scenarios.count() === 0) {
      BK.ui.toast(t("wizard.noScenarios"), "warn");
      return;
    }
    const p = params();
    BK.store.set("wizardDraft", p);
    BK.engine.generator.generateFromParams(p);
  }

  function build(root) {
    root.append(
      c.pageHeader(t("wizard.title"), t("wizard.intro")),
      el(
        "form",
        { class: "wizard", novalidate: true, on: { submit: (e) => { e.preventDefault(); generate(); } } },
        basicSection(),
        advancedSection(),
        el(
          "div",
          { class: "wizard__footer" },
          c.button({ label: t("wizard.generate"), icon: "play", kind: "primary", type: "submit", size: "lg", id: "wz-generate" })
        )
      )
    );
  }

  BK.ui.wizard = {
    title: () => t("wizard.title"),
    render(root, ctx) {
      rootEl = root;
      const requested = ctx.query.scenario;
      // A fresh draft when arriving from a link with a (different) scenario, or the first time.
      if (!draft || (requested && requested !== draft.scenarioId)) {
        const id = requested && (requested === "random" || BK.scenarios.get(requested)) ? requested : "random";
        draft = defaultDraft(id);
        ui = { advancedOpen: false, stagesTouched: false, customDuration: false, jurisdictionTouched: false };
        applyScenarioDefaults();
      }
      build(root);
    },
    // Exposed for tests and the phase-2 generator hookup.
    getParams: params
  };
})();
