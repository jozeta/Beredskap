/*
 * custom-slide.js — Renders a custom (builder) slide inside a stage canvas, for
 * the stage itself and, editable, for the slide builder.
 *
 * Block slides use cs-* classes sized for the 1920×1080 canvas and the stage's
 * --fit scale; artefact slides reuse artefacts.js. Rich text runs are drawn
 * with <b>/<i>/<u> elements built through el() — never markup strings — and in
 * edit mode they are read back by walking the DOM (readRuns), so formatting
 * from the browser's own editing commands round-trips without any HTML sink.
 * Pasting always inserts plain text.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el, svgIcon } = BK.dom;
  const t = BK.t;
  const C = () => BK.engine.custom;

  // ---- Runs ----------------------------------------------------------------------------------------------

  function runNodes(runs) {
    return (runs || []).map((r) => {
      const parts = String(r.t).split("\n");
      let node = parts.length === 1 ? document.createTextNode(r.t) : el("span", null, parts.map((p, i) => (i ? [el("br"), p] : p)));
      if (r.u) node = el("u", null, node);
      if (r.i) node = el("i", null, node);
      if (r.b) node = el("b", null, node);
      return node;
    });
  }

  /** Read formatted text back from an editable element as runs (B/STRONG, I/EM, U, BR, block breaks). */
  function readRuns(root) {
    const out = [];
    const push = (text, marks) => {
      if (!text) return;
      const last = out[out.length - 1];
      if (last && !!last.b === !!marks.b && !!last.i === !!marks.i && !!last.u === !!marks.u) last.t += text;
      else out.push(Object.assign({ t: text }, marks.b ? { b: 1 } : {}, marks.i ? { i: 1 } : {}, marks.u ? { u: 1 } : {}));
    };
    (function walk(node, marks, first) {
      node.childNodes.forEach((c, idx) => {
        if (c.nodeType === 3) push(c.nodeValue, marks);
        else if (c.nodeType === 1) {
          const tag = c.tagName;
          if (tag === "BR") return push("\n", marks);
          const m = Object.assign({}, marks);
          if (tag === "B" || tag === "STRONG") m.b = 1;
          if (tag === "I" || tag === "EM") m.i = 1;
          if (tag === "U") m.u = 1;
          if ((tag === "DIV" || tag === "P") && (out.length || idx > 0)) push("\n", marks);
          walk(c, m, false);
        }
      });
    })(root, {}, true);
    if (out.length) out[out.length - 1].t = out[out.length - 1].t.replace(/\n+$/, "");
    return out.filter((r) => r.t !== "");
  }

  function plainPaste(e) {
    e.preventDefault();
    const text = (e.clipboardData && e.clipboardData.getData("text/plain")) || "";
    document.execCommand("insertText", false, text);
  }

  // ---- Edit bindings ------------------------------------------------------------------------------------

  /** An element whose runs are editable in place; commit(runs) on every input. */
  function richField(tag, attrs, runs, edit, commit, placeholder) {
    if (!edit) return el(tag, attrs, runNodes(runs));
    const node = el(tag, Object.assign({}, attrs, { contenteditable: "true", spellcheck: "true", "data-placeholder": placeholder || "", class: [].concat(attrs.class || [], "cs-editable") }), runNodes(runs));
    node.addEventListener("input", () => commit(readRuns(node)));
    node.addEventListener("paste", plainPaste);
    return node;
  }

  /** Plain-text editable field (labels, values, times, artefact fields). */
  function plainField(tag, attrs, value, edit, commit, placeholder) {
    if (!edit) return el(tag, Object.assign({}, attrs, { text: value || "" }));
    const node = el(tag, Object.assign({}, attrs, { contenteditable: "true", spellcheck: "true", "data-placeholder": placeholder || "", class: [].concat(attrs.class || [], "cs-editable"), text: value || "" }));
    node.addEventListener("input", () => commit(node.innerText.replace(/\n+$/, "")));
    node.addEventListener("paste", plainPaste);
    return node;
  }

  /** A list whose items are editable together (Enter makes a new item); commit(items) as runs per item. */
  function listField(tag, attrs, items, edit, commit, placeholder) {
    const lis = (items.length ? items : [[]]).map((r) => el("li", null, runNodes(r)));
    if (!edit) return el(tag, attrs, lis);
    const node = el(tag, Object.assign({}, attrs, { contenteditable: "true", spellcheck: "true", "data-placeholder": placeholder || "", class: [].concat(attrs.class || [], "cs-editable") }), lis);
    node.addEventListener("input", () => {
      const li = Array.from(node.children).filter((c) => c.tagName === "LI");
      commit(li.length ? li.map(readRuns) : [readRuns(node)]);
    });
    node.addEventListener("paste", plainPaste);
    return node;
  }

  // ---- Blocks ---------------------------------------------------------------------------------------------

  const TONE_ICON = { info: "info", ok: "check", warn: "warning", danger: "shield-alert" };

  function block(b, i, ctx) {
    const { edit, lang } = ctx;
    const set = (patch) => ctx.change(i, patch);
    const ph = (key) => t("builder.ph." + key, null, lang);
    switch (b.type) {
      case "heading":
        return richField(b.level === 2 ? "h2" : "h1", { class: b.level === 2 ? "cs-h2" : "cs-h1" }, b.runs, edit, (runs) => set({ runs }), ph("heading"));
      case "kicker":
        return richField("p", { class: "cs-kicker" }, b.runs, edit, (runs) => set({ runs }), ph("kicker"));
      case "text":
        return richField("p", { class: ["cs-text", "cs-text--" + b.size, b.align === "center" && "cs-center"] }, b.runs, edit, (runs) => set({ runs }), ph("text"));
      case "bullets":
      case "numbered":
        return listField(b.type === "numbered" ? "ol" : "ul", { class: ["cs-list", b.type === "numbered" && "cs-list--numbered"] }, b.items, edit, (items) => set({ items }), ph("list"));
      case "quote":
        return el(
          "figure",
          { class: ["cs-quote", b.align === "center" && "cs-center"] },
          richField("blockquote", { class: "cs-quote__text" }, b.runs, edit, (runs) => set({ runs }), ph("quote")),
          b.by || edit ? plainField("figcaption", { class: "cs-quote__by" }, b.by, edit, (by) => set({ by }), ph("by")) : null
        );
      case "callout":
        return el("div", { class: ["cs-callout", "cs-callout--" + b.tone] }, svgIcon(TONE_ICON[b.tone] || "info", { size: 44 }), richField("p", { class: "cs-callout__text" }, b.runs, edit, (runs) => set({ runs }), ph("callout")));
      case "icon":
        return el("figure", { class: ["cs-icon", "cs-icon--" + b.tone] }, el("span", { class: "cs-icon__art" }, svgIcon(b.icon, { size: 96 })), plainField("figcaption", { class: "cs-icon__label" }, b.label, edit, (label) => set({ label }), ph("label")));
      case "kpi":
        return el(
          "div",
          { class: "cs-kpi" },
          b.tiles.map((tile, k) =>
            el(
              "div",
              { class: ["cs-kpi__tile", "cs-kpi__tile--" + tile.tone] },
              plainField("span", { class: "cs-kpi__value" }, tile.value, edit, (value) => set({ tiles: b.tiles.map((x, j) => (j === k ? Object.assign({}, x, { value }) : x)) }), "0"),
              plainField("span", { class: "cs-kpi__label" }, tile.label, edit, (label) => set({ tiles: b.tiles.map((x, j) => (j === k ? Object.assign({}, x, { label }) : x)) }), ph("label"))
            )
          )
        );
      case "timeline":
        return el(
          "ol",
          { class: "cs-timeline" },
          b.rows.map((row, k) =>
            el(
              "li",
              null,
              plainField("span", { class: "cs-timeline__time" }, row.time, edit, (time) => set({ rows: b.rows.map((x, j) => (j === k ? Object.assign({}, x, { time }) : x)) }), "00:00"),
              plainField("span", { class: "cs-timeline__text" }, row.text, edit, (text) => set({ rows: b.rows.map((x, j) => (j === k ? Object.assign({}, x, { text }) : x)) }), ph("text"))
            )
          )
        );
      case "options":
        return el(
          "ol",
          { class: "cs-options" },
          b.items.map((runs, k) =>
            el("li", null, el("span", { class: "cs-options__key", text: "ABCD"[k] }), richField("span", { class: "cs-options__text" }, runs, edit, (r) => set({ items: b.items.map((x, j) => (j === k ? r : x)) }), ph("option")))
          )
        );
      case "image":
        return b.src
          ? el("figure", { class: "cs-image" }, el("img", { src: b.src, alt: b.alt || "" }))
          : edit
            ? el("figure", { class: "cs-image cs-image--empty" }, svgIcon("plus", { size: 48 }), el("span", { text: t("builder.addImageHint", null, lang) }))
            : null;
      case "divider":
        return el("hr", { class: "cs-divider" });
      default:
        return null;
    }
  }

  /** Group consecutive icon blocks into one row; wrap every block so the builder can select it. */
  function blockList(slide, ctx) {
    const out = [];
    let row = null;
    slide.blocks.forEach((b, i) => {
      const node = block(b, i, ctx);
      if (!node) return;
      const wrapped = ctx.edit
        ? el("div", { class: ["cs-block", ctx.selected === i && "is-selected"], dataset: { block: String(i) }, on: { mousedown: () => ctx.select(i), focusin: () => ctx.select(i) } }, node)
        : node;
      if (b.type === "icon") {
        if (!row) {
          row = el("div", { class: "cs-icons" });
          out.push(row);
        }
        row.appendChild(wrapped);
      } else {
        row = null;
        out.push(wrapped);
      }
    });
    return out;
  }

  // ---- Artefact slides ------------------------------------------------------------------------------------

  function setPath(obj, path, value) {
    const keys = path.split(".");
    let cur = obj;
    keys.slice(0, -1).forEach((k, i) => {
      const nextIsIndex = /^\d+$/.test(keys[i + 1]);
      if (cur[k] == null) cur[k] = nextIsIndex ? [] : {};
      cur = cur[k];
    });
    cur[keys[keys.length - 1]] = value;
  }

  function artefactView(slide, ctx) {
    const inj = slide.inject;
    const view = Object.assign({}, inj, {
      typeLabel: inj.typeLabel || t("injectType." + inj.type, null, ctx.lang),
      severityLabel: inj.severity ? t("severity." + inj.severity, null, ctx.lang) : null,
      speaker: null,
      roleNotPresent: false
    });
    const edit = ctx.edit
      ? (tag, attrs, path, value) =>
          plainField(tag, attrs, value, true, (v) => {
            const next = JSON.parse(JSON.stringify(slide.inject));
            setPath(next, path, v);
            ctx.changeInject(next);
          }, t("builder.ph.field", null, ctx.lang))
      : null;
    const node = BK.graphics.artefact(view, ctx.lang, edit ? { edit } : null);
    return el("div", { class: "s-inject" }, node || el("p", { class: "s-lead", text: inj.content }));
  }

  // ---- Public ----------------------------------------------------------------------------------------------

  /**
   * Render one custom slide's content (goes inside .s-slide).
   * opts: { edit, selected, select(i), change(i, patch), changeInject(inject) } — edit mode only.
   */
  function render(slide, lang, opts) {
    const o = opts || {};
    const ctx = Object.assign({ lang, edit: false, selected: -1, select: () => {}, change: () => {}, changeInject: () => {} }, o);
    if (slide.kind === "artefact") return artefactView(slide, ctx);
    return el("div", { class: ["cs", "cs--" + (slide.layout || "content")] }, blockList(slide, ctx));
  }

  BK.ui.customSlide = { render, readRuns, runNodes };
})();
