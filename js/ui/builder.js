/*
 * builder.js — Slide builder for custom exercises (#/builder/:deckId).
 *
 * A presentation-style editor: the slide list on the left (thumbnails, drag to
 * reorder), the slide large in the middle and edited in place, a toolbar above
 * that adapts to the selection (slide, block or artefact), and facilitator
 * notes below. "New slide" opens a gallery of every template as a live
 * thumbnail. Decks save automatically (debounced) and every change passes
 * through BK.engine.custom.normaliseDeck before it is stored.
 *
 * Typing never re-renders the canvas (the caret stays put); structural changes
 * (blocks added, moved, restyled; slides switched) re-render it.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el, svgIcon } = BK.dom;
  const c = BK.ui.c;
  const t = BK.t;
  const C = () => BK.engine.custom;

  const view = { deck: null, sel: 0, block: -1, root: null, saveTimer: null, thumbTimer: null, status: null, els: {} };

  const SENDER_KINDS = ["", "person", "media", "socialMedia", "employee", "customer", "attacker", "bank", "insurer", "police", "regulator", "supplier", "management", "facilities", "soc", "itOps"];
  const THREAD_KINDS = new Set(["chat", "executiveMessage", "sms", "phoneTranscript"]);
  const SEVERITY_KINDS = new Set(["siemAlert", "edrAlert", "authLog", "networkEvidence", "logExcerpt", "backupReport", "forensicFinding", "threatIntel", "advisory", "impactReport", "ticket"]);

  const NEW_BLOCK = {
    heading: () => ({ type: "heading", level: 2, runs: [] }),
    text: () => ({ type: "text", size: "m", align: "left", runs: [] }),
    bullets: () => ({ type: "bullets", items: [[]] }),
    numbered: () => ({ type: "numbered", items: [[]] }),
    quote: () => ({ type: "quote", align: "left", runs: [], by: "" }),
    callout: () => ({ type: "callout", tone: "info", runs: [] }),
    icon: () => ({ type: "icon", icon: "shield", label: "", tone: "info" }),
    kpi: () => ({ type: "kpi", tiles: [{ label: "", value: "", tone: "info" }, { label: "", value: "", tone: "warn" }, { label: "", value: "", tone: "danger" }] }),
    timeline: () => ({ type: "timeline", rows: [{ time: "", text: "" }, { time: "", text: "" }, { time: "", text: "" }] }),
    options: () => ({ type: "options", items: [[], [], []] }),
    image: () => ({ type: "image", src: "", alt: "" }),
    divider: () => ({ type: "divider" })
  };
  const INSERT_ICON = { heading: "text-t", text: "notes", bullets: "list-ul", numbered: "list-ol", quote: "quote-mark", callout: "warning", icon: "shield", kpi: "chart-bar", timeline: "timeline", options: "decision", image: "image", divider: "divider" };

  const deck = () => view.deck;
  const slide = () => view.deck.slides[view.sel] || null;
  const lang = () => view.deck.lang;

  // ---- Persistence -----------------------------------------------------------------------------------

  function save(now) {
    clearTimeout(view.saveTimer);
    // The live deck stays the same object (the canvas edits it in place); only the stored copy is normalised.
    const run = () => {
      if (!view.deck) return;
      view.deck.updatedAt = new Date().toISOString();
      BK.store.putItem("deck", C().normaliseDeck(JSON.parse(JSON.stringify(view.deck))));
      if (view.status) view.status.textContent = t("builder.saved", { time: BK.i18n.fmt.time(new Date(), BK.i18n.getLang()) });
    };
    if (now) run();
    else {
      if (view.status) view.status.textContent = t("builder.saving");
      view.saveTimer = setTimeout(run, 500);
    }
  }

  /** Content edits: save and refresh the slide's thumbnail, without touching the canvas. */
  function touched() {
    save();
    clearTimeout(view.thumbTimer);
    view.thumbTimer = setTimeout(() => refreshThumb(view.sel), 300);
  }

  function structural() {
    save();
    drawCanvas();
    drawToolbar();
    drawList();
  }

  // ---- Canvas -------------------------------------------------------------------------------------------

  function projectionFor(s, i, total) {
    const timer = s.timerMinutes || 0;
    return {
      lang: lang(),
      theme: BK.theme.resolved(deck().stageTheme),
      paused: false,
      ended: false,
      screen: "normal",
      progress: { custom: true, stageIndex: -1, stageCount: 0, slideNumber: i + 1, slideCount: total, clock: "" },
      timer: { remainingMs: timer * 60000, durationMs: timer * 60000, running: false, active: timer > 0 },
      meters: null,
      complication: null,
      slide: { type: "custom", id: s.id, step: 0, slide: s, timerMinutes: timer, variant: s.kind === "blocks" && s.layout === "twist" ? "twist" : null }
    };
  }

  function frame(s, i, total, cls) {
    const f = el("div", { class: ["stage-frame", cls] });
    const canvas = BK.ui.stageRenderer.renderCanvas(projectionFor(s, i, total), { preview: true });
    canvas.setAttribute("aria-hidden", "true");
    canvas.setAttribute("inert", "");
    f.appendChild(canvas);
    requestAnimationFrame(() => {
      BK.ui.stageRenderer.fit(f, canvas);
      BK.ui.stageRenderer.settle(canvas);
    });
    return f;
  }

  function drawCanvas() {
    const wrap = view.els.canvas;
    if (!wrap) return;
    wrap.textContent = "";
    const s = slide();
    if (!s) {
      wrap.appendChild(c.emptyState("notes", t("builder.noSlides"), c.button({ label: t("builder.newSlide"), icon: "plus", kind: "primary", onClick: openGallery })));
      return;
    }
    const f = el("div", { class: "stage-frame builder__frame" });
    const canvas = BK.ui.stageRenderer.renderCanvas(projectionFor(s, view.sel, deck().slides.length), { preview: true });
    const area = canvas.querySelector(".s-slide");
    const editor = BK.ui.customSlide.render(s, lang(), {
      edit: true,
      selected: view.block,
      select: (i) => {
        if (view.block === i) return;
        view.block = i;
        area.querySelectorAll(".cs-block").forEach((n) => n.classList.toggle("is-selected", Number(n.dataset.block) === i));
        drawToolbar();
      },
      change: (i, patch) => {
        Object.assign(s.blocks[i], patch);
        touched();
      },
      changeInject: (inj) => {
        s.inject = inj;
        touched();
      }
    });
    // Swap only the slide content for its editable twin; the timer block (if any) stays as the stage draws it.
    const box = area.querySelector(".s-custom");
    const shown = box && box.firstElementChild;
    if (shown && !shown.classList.contains("s-custom__timer")) box.replaceChild(editor, shown);
    else if (box) box.prepend(editor);
    else area.appendChild(el("div", { class: "s-custom" }, editor));
    f.appendChild(canvas);
    wrap.appendChild(f);
    requestAnimationFrame(() => BK.ui.stageRenderer.fit(f, canvas));
  }

  // ---- Slide list ---------------------------------------------------------------------------------------------

  function move(from, to) {
    const list = deck().slides;
    if (to < 0 || to >= list.length || from === to) return;
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
    view.sel = to;
    view.block = -1;
    structural();
  }

  function thumb(s, i) {
    const total = deck().slides.length;
    return el(
      "li",
      {
        class: ["builder__thumb", i === view.sel && "is-current"],
        draggable: "true",
        dataset: { index: String(i) },
        on: {
          dragstart: (e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(i));
          },
          dragover: (e) => {
            e.preventDefault();
            e.currentTarget.classList.add("is-drop");
          },
          dragleave: (e) => e.currentTarget.classList.remove("is-drop"),
          drop: (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("is-drop");
            const from = Number(e.dataTransfer.getData("text/plain"));
            if (Number.isInteger(from)) move(from, i);
          }
        }
      },
      el(
        "button",
        {
          type: "button",
          class: "builder__thumb-btn",
          "aria-current": i === view.sel ? "true" : null,
          "aria-label": t("builder.slideN", { n: i + 1, total }) + ": " + C().slideLabel(s, lang()),
          on: {
            click: () => select(i),
            keydown: (e) => {
              if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
                e.preventDefault();
                move(i, i + (e.key === "ArrowUp" ? -1 : 1));
                focusThumb(view.sel);
              } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
                select(Math.max(0, Math.min(total - 1, i + (e.key === "ArrowUp" ? -1 : 1))));
                focusThumb(view.sel);
              } else if (e.key === "Delete") {
                e.preventDefault();
                removeSlide();
              }
            }
          }
        },
        el("span", { class: "builder__thumb-num", text: String(i + 1) }),
        frame(s, i, total, "builder__mini"),
        s.notes ? el("span", { class: "builder__thumb-notes", title: t("builder.hasNotes") }, svgIcon("notes", { size: 14 })) : null
      )
    );
  }

  function focusThumb(i) {
    requestAnimationFrame(() => {
      const b = view.els.list && view.els.list.querySelector('[data-index="' + i + '"] .builder__thumb-btn');
      if (b) b.focus();
    });
  }

  function drawList() {
    const list = view.els.list;
    if (!list) return;
    list.textContent = "";
    deck().slides.forEach((s, i) => list.appendChild(thumb(s, i)));
  }

  function refreshThumb(i) {
    const li = view.els.list && view.els.list.querySelector('[data-index="' + i + '"]');
    const s = deck().slides[i];
    if (li && s) li.replaceWith(thumb(s, i));
  }

  function select(i) {
    view.sel = i;
    view.block = -1;
    drawList();
    drawCanvas();
    drawToolbar();
    drawNotes();
  }

  // ---- Slide commands ------------------------------------------------------------------------------------------

  function insertSlide(s) {
    const at = deck().slides.length ? view.sel + 1 : 0;
    deck().slides.splice(at, 0, s);
    view.sel = at;
    view.block = -1;
    structural();
    drawNotes();
  }

  function duplicateSlide() {
    const s = slide();
    if (!s) return;
    const copy = JSON.parse(JSON.stringify(s));
    copy.id = BK.dom.uid("sl");
    insertSlide(copy);
  }

  async function removeSlide() {
    const s = slide();
    if (!s) return;
    const ok = await BK.ui.dialog.confirm({ title: t("builder.deleteSlideTitle"), message: t("builder.deleteSlideBody", { n: view.sel + 1 }), confirmLabel: t("common.delete"), danger: true });
    if (!ok) return;
    deck().slides.splice(view.sel, 1);
    view.sel = Math.max(0, Math.min(view.sel, deck().slides.length - 1));
    view.block = -1;
    structural();
    drawNotes();
  }

  function openGallery() {
    const l = lang();
    const groups = C().GROUPS.map((g) =>
      el(
        "section",
        { class: "builder-gallery__group" },
        el("h3", { class: "eyebrow", text: t("builder.group." + g) }),
        el(
          "ul",
          { class: "builder-gallery__grid" },
          C()
            .TEMPLATES.filter((x) => x.group === g)
            .map((tpl) => {
              const sample = C().fromTemplate(tpl.id, l);
              return el(
                "li",
                null,
                el(
                  "button",
                  {
                    type: "button",
                    class: "builder-gallery__item",
                    on: {
                      click: () => {
                        const dlg = document.querySelector("dialog[open]");
                        if (dlg) dlg.querySelector(".dialog__header .btn").click();
                        insertSlide(C().fromTemplate(tpl.id, l));
                      }
                    }
                  },
                  frame(sample, 0, 1, "builder-gallery__frame"),
                  el("span", { text: BK.loc(tpl.name) })
                )
              );
            })
        )
      )
    );
    BK.ui.dialog.open({ title: t("builder.templates"), wide: true, body: el("div", { class: "builder-gallery" }, el("p", { class: "muted", text: t("builder.templatesIntro") }), groups), actions: [{ label: t("common.close"), value: null, kind: "secondary" }] });
  }

  // ---- Block commands ---------------------------------------------------------------------------------------

  function addBlock(type) {
    const s = slide();
    if (!s || s.kind !== "blocks") return;
    if (s.blocks.length >= 16) return BK.ui.toast(t("builder.tooManyBlocks"), "warn");
    const at = view.block >= 0 ? view.block + 1 : s.blocks.length;
    s.blocks.splice(at, 0, NEW_BLOCK[type]());
    view.block = at;
    structural();
    if (type === "image") pickImage();
    if (type === "icon") pickIcon();
  }

  function selectedBlock() {
    const s = slide();
    return s && s.kind === "blocks" && view.block >= 0 ? s.blocks[view.block] : null;
  }

  function moveBlock(dir) {
    const s = slide();
    const i = view.block;
    const j = i + dir;
    if (!s || i < 0 || j < 0 || j >= s.blocks.length) return;
    const [b] = s.blocks.splice(i, 1);
    s.blocks.splice(j, 0, b);
    view.block = j;
    structural();
  }

  function removeBlock() {
    const s = slide();
    if (!s || view.block < 0) return;
    s.blocks.splice(view.block, 1);
    view.block = Math.min(view.block, s.blocks.length - 1);
    structural();
  }

  function setBlock(patch) {
    const b = selectedBlock();
    if (!b) return;
    Object.assign(b, patch);
    structural();
  }

  function addItem(delta) {
    const b = selectedBlock();
    if (!b) return;
    const key = b.type === "kpi" ? "tiles" : b.type === "timeline" ? "rows" : "items";
    const max = { tiles: 4, rows: 8, items: b.type === "options" ? 4 : 12 }[key];
    const list = b[key];
    if (delta > 0 && list.length < max) list.push(b.type === "kpi" ? { label: "", value: "", tone: "info" } : b.type === "timeline" ? { time: "", text: "" } : []);
    if (delta < 0 && list.length > 1) list.pop();
    structural();
  }

  /** Bold/italic/underline on the current selection inside an editable field. */
  function format(cmd) {
    const active = document.activeElement;
    if (!active || !active.isContentEditable) return BK.ui.toast(t("builder.selectText"), "info");
    document.execCommand(cmd, false, null);
    active.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function pickIcon() {
    const grid = el(
      "ul",
      { class: "builder-icons" },
      BK.icons.names.map((name) =>
        el(
          "li",
          null,
          el(
            "button",
            {
              type: "button",
              class: "builder-icons__btn",
              "aria-label": name,
              "data-tip": name,
              on: {
                click: () => {
                  const dlg = document.querySelector("dialog[open]");
                  if (dlg) dlg.querySelector(".dialog__header .btn").click();
                  setBlock({ icon: name });
                }
              }
            },
            svgIcon(name, { size: 28 })
          )
        )
      )
    );
    BK.ui.dialog.open({ title: t("builder.chooseIcon"), wide: true, body: grid, actions: [{ label: t("common.close"), value: null, kind: "secondary" }] });
  }

  /** Read an image file, shrink it in the browser, and store it as a data URL on the selected image block. */
  function pickImage() {
    const input = el("input", { type: "file", accept: "image/png,image/jpeg,image/webp,image/gif", class: "sr-only" });
    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      input.remove();
      if (!file || !/^image\/(png|jpeg|webp|gif)$/.test(file.type)) return file && BK.ui.toast(t("builder.imageType"), "warn");
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * scale);
        cv.height = Math.round(img.height * scale);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        let data = cv.toDataURL("image/jpeg", 0.82);
        if (data.length > C().MAX_IMAGE) data = cv.toDataURL("image/jpeg", 0.6);
        if (data.length > C().MAX_IMAGE) return BK.ui.toast(t("builder.imageTooLarge"), "warn");
        setBlock({ src: data, alt: file.name.replace(/\.[^.]+$/, "") });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        BK.ui.toast(t("builder.imageType"), "warn");
      };
      img.src = url;
    });
    document.body.appendChild(input);
    input.click();
  }

  // ---- Artefact commands ----------------------------------------------------------------------------------------

  function setInject(patch) {
    const s = slide();
    if (!s || s.kind !== "artefact") return;
    s.inject = Object.assign({}, s.inject, patch);
    structural();
  }

  function threadOp(op) {
    const s = slide();
    if (!s || s.kind !== "artefact") return;
    const inj = JSON.parse(JSON.stringify(s.inject));
    inj.meta = inj.meta || {};
    const th = inj.meta.thread || [];
    if (op === "in" || op === "out") {
      if (!th.length && inj.content) th.push({ side: "in", name: inj.source || "", text: inj.content });
      th.push({ side: op, name: "", text: "" });
    }
    if (op === "pop") th.pop();
    if (th.length) inj.meta.thread = th.slice(0, 12);
    else delete inj.meta.thread;
    s.inject = inj;
    structural();
  }

  // ---- Toolbar --------------------------------------------------------------------------------------------------

  /** Toolbar button that keeps the text selection (mousedown does not take focus). */
  function tb(label, icon, onClick, opts) {
    const o = opts || {};
    return el(
      "button",
      {
        type: "button",
        class: ["btn", "btn--sm", o.text ? "builder__tb-text" : "btn--icon", o.active ? "btn--primary" : "btn--ghost"],
        "aria-label": label,
        "aria-pressed": o.active == null ? null : String(!!o.active),
        "data-tip": label,
        disabled: !!o.disabled,
        on: { mousedown: (e) => e.preventDefault(), click: onClick }
      },
      o.text ? el("span", { class: o.textClass || null, text: o.text }) : svgIcon(icon, { size: 18 })
    );
  }

  function group(label, ...items) {
    return el("div", { class: "builder__tb-group", role: "group", "aria-label": label }, el("span", { class: "builder__tb-label", text: label }), el("div", { class: "builder__tb-items" }, items));
  }

  function selectBox(label, options, value, onChange) {
    return c.select(options, value, onChange, { "aria-label": label, class: "input input--sm builder__select", title: label });
  }

  function drawToolbar() {
    const bar = view.els.toolbar;
    if (!bar) return;
    bar.textContent = "";
    const s = slide();
    bar.appendChild(
      group(
        t("builder.tb.slide"),
        c.button({ label: t("builder.newSlide"), icon: "plus", size: "sm", kind: "primary", onClick: openGallery }),
        tb(t("builder.duplicate"), "copy", duplicateSlide, { disabled: !s }),
        tb(t("builder.deleteSlide"), "trash", removeSlide, { disabled: !s }),
        s && s.kind === "blocks" ? selectBox(t("builder.layout"), C().LAYOUTS.map((x) => ({ value: x, label: t("builder.layout." + x) })), s.layout, (v) => ((s.layout = v), structural())) : null,
        s
          ? el(
              "label",
              { class: "builder__timer", "data-tip": t("builder.timerHint") },
              svgIcon("hourglass", { size: 16 }),
              el("input", { class: "input input--sm", type: "number", min: 0, max: 120, value: s.timerMinutes || 0, "aria-label": t("builder.timer"), on: { change: (e) => ((s.timerMinutes = Math.max(0, Math.min(120, Math.round(Number(e.target.value) || 0)))), structural()) } }),
              el("span", { class: "small muted", text: t("builder.min") })
            )
          : null
      )
    );
    if (!s) return;
    if (s.kind === "blocks") {
      bar.appendChild(group(t("builder.tb.insert"), Object.keys(NEW_BLOCK).map((type) => tb(t("builder.block." + type), INSERT_ICON[type], () => addBlock(type)))));
      const b = selectedBlock();
      const hasRuns = b && ["heading", "kicker", "text", "bullets", "numbered", "quote", "callout", "options"].includes(b.type);
      bar.appendChild(
        group(
          t("builder.tb.format"),
          tb(t("builder.bold"), null, () => format("bold"), { text: "B", textClass: "builder__b", disabled: !hasRuns }),
          tb(t("builder.italic"), null, () => format("italic"), { text: "I", textClass: "builder__i", disabled: !hasRuns }),
          tb(t("builder.underline"), null, () => format("underline"), { text: "U", textClass: "builder__u", disabled: !hasRuns }),
          b && b.type === "heading" ? [tb(t("builder.h1"), null, () => setBlock({ level: 1 }), { text: "H1", active: b.level === 1 }), tb(t("builder.h2"), null, () => setBlock({ level: 2 }), { text: "H2", active: b.level === 2 })] : null,
          b && b.type === "text" ? C().SIZES.map((x) => tb(t("builder.size." + x), null, () => setBlock({ size: x }), { text: x.toUpperCase(), active: b.size === x })) : null,
          b && (b.type === "text" || b.type === "quote") ? [tb(t("builder.alignLeft"), "align-left", () => setBlock({ align: "left" }), { active: b.align !== "center" }), tb(t("builder.alignCenter"), "align-center", () => setBlock({ align: "center" }), { active: b.align === "center" })] : null,
          b && (b.type === "callout" || b.type === "icon") ? selectBox(t("builder.tone"), C().TONES.map((x) => ({ value: x, label: t("builder.tone." + x) })), b.tone, (v) => setBlock({ tone: v })) : null,
          b && b.type === "icon" ? tb(t("builder.chooseIcon"), b.icon, pickIcon) : null,
          b && b.type === "image" ? tb(t("builder.chooseImage"), "image", pickImage) : null,
          b && ["kpi", "timeline", "options"].includes(b.type) ? [tb(t("builder.addItem"), "plus", () => addItem(1)), tb(t("builder.removeItem"), "cross", () => addItem(-1))] : null,
          b && b.type === "kpi" ? selectBox(t("builder.tone"), C().TONES.map((x) => ({ value: x, label: t("builder.tone." + x) })), b.tiles[b.tiles.length - 1].tone, (v) => ((b.tiles[b.tiles.length - 1].tone = v), structural())) : null
        )
      );
      bar.appendChild(
        group(
          t("builder.tb.block"),
          tb(t("builder.moveUp"), "arrow-up", () => moveBlock(-1), { disabled: !b || view.block === 0 }),
          tb(t("builder.moveDown"), "arrow-down", () => moveBlock(1), { disabled: !b || view.block >= s.blocks.length - 1 }),
          tb(t("builder.deleteBlock"), "trash", removeBlock, { disabled: !b })
        )
      );
    } else {
      const inj = s.inject;
      bar.appendChild(
        group(
          t("builder.tb.artefact"),
          selectBox(t("builder.artefactType"), BK.data.options.injectTypes.map((x) => ({ value: x, label: t("injectType." + x) })), inj.type, (v) => setInject({ type: v })),
          selectBox(t("builder.sender"), SENDER_KINDS.map((x) => ({ value: x, label: x ? t(x === "person" ? "builder.senderPerson" : "source." + x) : t("builder.senderNone") })), inj.sourceKind || "", (v) => setInject({ sourceKind: v || null })),
          SEVERITY_KINDS.has(inj.type) ? selectBox(t("builder.severity"), [{ value: "", label: "—" }].concat(BK.data.options.severities.map((x) => ({ value: x, label: t("severity." + x) }))), inj.severity || "", (v) => setInject({ severity: v || null })) : null,
          THREAD_KINDS.has(inj.type)
            ? [
                tb(t("builder.addIncoming"), "reply", () => threadOp("in")),
                tb(t("builder.addOutgoing"), "send", () => threadOp("out")),
                tb(t("builder.removeMessage"), "cross", () => threadOp("pop"), { disabled: !(inj.meta && inj.meta.thread && inj.meta.thread.length) })
              ]
            : null
        )
      );
    }
  }

  // ---- Notes and settings ----------------------------------------------------------------------------------------

  function drawNotes() {
    const box = view.els.notes;
    if (!box) return;
    box.textContent = "";
    const s = slide();
    if (!s) return;
    box.appendChild(
      c.field({
        id: "bd-notes",
        label: t("builder.notes"),
        hint: t("builder.notesHint"),
        control: el("textarea", { id: "bd-notes", class: "input textarea", rows: 3, maxlength: 4000, value: s.notes || "", on: { input: (e) => ((s.notes = e.target.value), save()), change: () => refreshThumb(view.sel) } })
      })
    );
  }

  function settingsDialog() {
    const d = deck();
    const draft = { title: d.title, summary: d.summary, lang: d.lang, minutes: d.minutes, stageTheme: d.stageTheme, meters: d.meters, complications: d.complications };
    const body = el(
      "div",
      { class: "stack" },
      c.field({ id: "bd-title", label: t("builder.title"), control: el("input", { id: "bd-title", class: "input", maxlength: 160, value: draft.title, on: { input: (e) => (draft.title = e.target.value) } }) }),
      c.field({ id: "bd-summary", label: t("builder.summary"), hint: t("builder.summaryHint"), control: el("textarea", { id: "bd-summary", class: "input textarea", rows: 3, maxlength: 1000, value: draft.summary, on: { input: (e) => (draft.summary = e.target.value) } }) }),
      c.segmented({ label: t("builder.deckLang"), name: "bd-lang", value: draft.lang, options: BK.i18n.LANGS.map((x) => ({ value: x, label: t("lang." + x) })), onChange: (v) => (draft.lang = v) }),
      c.field({ id: "bd-minutes", label: t("builder.minutes"), control: el("input", { id: "bd-minutes", class: "input", type: "number", min: 10, max: 480, value: draft.minutes, on: { input: (e) => (draft.minutes = Number(e.target.value)) } }) }),
      c.segmented({ label: t("wizard.stageTheme"), name: "bd-theme", value: draft.stageTheme, options: ["dark", "light", "system"].map((x) => ({ value: x, label: t("theme." + x) })), onChange: (v) => (draft.stageTheme = v) }),
      c.checkbox(t("wizard.meters"), draft.meters, (on) => (draft.meters = on)),
      c.segmented({ label: t("wizard.complications"), name: "bd-deck", value: draft.complications, options: ["off", "manual", "auto"].map((m) => ({ value: m, label: t("complication.mode." + m) })), onChange: (v) => (draft.complications = v) })
    );
    BK.ui.dialog.open({
      title: t("builder.settings"),
      body,
      actions: [
        { label: t("common.cancel"), value: null, kind: "secondary" },
        {
          label: t("common.save"),
          value: "save",
          kind: "primary",
          onClick: () => {
            // Settings go through the normaliser too (an empty title becomes "Untitled", minutes are clamped).
            const n = C().normaliseDeck(Object.assign({}, view.deck, draft, { slides: [] }));
            Object.keys(draft).forEach((k) => (view.deck[k] = n[k]));
            save(true);
            render(view.root);
            document.title = BK.ui.builder.title() + " · " + t("app.name");
          }
        }
      ]
    });
  }

  // ---- Start, export ----------------------------------------------------------------------------------------------

  function start() {
    if (!deck().slides.length) return BK.ui.toast(t("builder.noSlides"), "warn");
    save(true);
    const exercise = C().toExercise(deck());
    BK.store.putItem("exercise", exercise);
    BK.ui.startExercise(exercise);
  }

  function exportDeck() {
    save(true);
    const text = JSON.stringify({ schema: BK.config.schemaId, schemaVersion: BK.config.schemaVersion, kind: "deck", app: { name: "Beredskap", version: BK.version }, exportedAt: new Date().toISOString(), deck: deck() }, null, 2);
    const name = (deck().title || "deck").toLowerCase().replace(/[^a-z0-9åäö]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "deck";
    BK.dom.download("beredskap-deck-" + name + ".json", text, "application/json;charset=utf-8");
  }

  // ---- Page ---------------------------------------------------------------------------------------------------------

  function render(root) {
    view.root = root;
    root.textContent = "";
    view.status = el("span", { class: "muted small builder__status", role: "status", text: t("builder.autosave") });
    view.els.toolbar = el("div", { class: "builder__toolbar", role: "toolbar", "aria-label": t("builder.toolbar") });
    view.els.list = el("ol", { class: "builder__list", "aria-label": t("builder.slides") });
    view.els.canvas = el("div", { class: "builder__canvas" });
    view.els.notes = el("div", { class: "builder__notes" });
    root.appendChild(
      el(
        "div",
        { class: "builder" },
        el(
          "header",
          { class: "builder__head" },
          el("div", { class: "builder__titles" }, el("p", { class: "eyebrow", text: t("builder.eyebrow") }), el("h1", { class: "builder__title", text: deck().title })),
          view.status,
          el(
            "div",
            { class: "actions" },
            c.button({ label: t("builder.settings"), icon: "settings", size: "sm", onClick: settingsDialog }),
            c.button({ label: t("builder.export"), icon: "download", size: "sm", onClick: exportDeck }),
            c.button({ label: t("builder.start"), icon: "play", size: "sm", kind: "primary", onClick: start })
          )
        ),
        view.els.toolbar,
        el(
          "div",
          { class: "builder__body" },
          el("aside", { class: "builder__side" }, view.els.list, c.button({ label: t("builder.newSlide"), icon: "plus", size: "sm", onClick: openGallery })),
          el("section", { class: "builder__main" }, view.els.canvas, view.els.notes)
        )
      )
    );
    drawToolbar();
    drawList();
    drawCanvas();
    drawNotes();
  }

  function onResize() {
    const f = view.els.canvas && view.els.canvas.querySelector(".builder__frame");
    const canvas = f && f.querySelector(".stage");
    if (f && canvas) BK.ui.stageRenderer.fit(f, canvas);
  }

  BK.ui.builder = {
    title: () => (view.deck ? view.deck.title + " — " : "") + t("builder.eyebrow"),
    render(root, ctx) {
      const id = ctx.params.deckId;
      if (id === "new") {
        const d = C().newDeck(BK.i18n.getLang());
        BK.store.putItem("deck", d);
        window.location.replace("#/builder/" + encodeURIComponent(d.id)); // "new" must not stay in history

        return;
      }
      const stored = BK.store.getItem("deck", id);
      if (!stored) {
        root.append(c.pageHeader(t("builder.notFound"), ""), c.button({ label: t("nav.library"), href: "#/library" }));
        return;
      }
      view.deck = C().normaliseDeck(stored);
      view.sel = 0;
      view.block = -1;
      render(root);
      window.addEventListener("resize", onResize);
    },
    unmount() {
      if (view.deck && view.root) save(true);
      clearTimeout(view.saveTimer);
      clearTimeout(view.thumbTimer);
      window.removeEventListener("resize", onResize);
      view.deck = null;
      view.els = {};
      view.root = null;
    },
    /** Library helpers. */
    duplicate(id) {
      const d = BK.store.getItem("deck", id);
      if (!d) return null;
      const copy = C().normaliseDeck(Object.assign({}, JSON.parse(JSON.stringify(d)), { id: BK.dom.uid("deck"), title: d.title + " " + t("builder.copySuffix"), createdAt: new Date().toISOString() }));
      BK.store.putItem("deck", copy);
      return copy;
    },
    startDeck(id) {
      const d = BK.store.getItem("deck", id);
      if (!d) return;
      const n = C().normaliseDeck(d);
      if (!n.slides.length) return BK.ui.toast(t("builder.noSlides"), "warn");
      const exercise = C().toExercise(n);
      BK.store.putItem("exercise", exercise);
      BK.ui.startExercise(exercise);
    }
  };
})();
