/*
 * components.js — Small reusable operator-UI building blocks: page headers,
 * buttons/links, badges, empty states, form fields and segmented controls.
 *
 * Everything returns DOM nodes built with BK.dom.el (text via textContent only).
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el, svgIcon } = BK.dom;

  /** <header> with h1, optional intro paragraph and right-aligned actions. */
  function pageHeader(title, intro, actions) {
    return el(
      "header",
      { class: "page-header" },
      el("div", { class: "page-header__text" }, el("h1", { text: title }), intro ? el("p", { class: "lead", text: intro }) : null),
      actions && actions.length ? el("div", { class: "page-header__actions" }, actions) : null
    );
  }

  /**
   * Button or link styled as a button.
   * opts: { label, icon, kind: primary|secondary|ghost|danger, href, onClick, iconOnly, size, type, disabled }
   */
  function button(opts) {
    const cls = ["btn", "btn--" + (opts.kind || "secondary"), opts.iconOnly && "btn--icon", opts.size && "btn--" + opts.size, opts.className];
    const content = [opts.icon ? svgIcon(opts.icon) : null, opts.iconOnly ? null : el("span", { text: opts.label })];
    const common = {
      class: cls,
      "aria-label": opts.iconOnly ? opts.label : null,
      title: opts.iconOnly ? opts.label : null,
      id: opts.id || null
    };
    if (opts.href) {
      return el("a", Object.assign(common, { href: opts.href }), content);
    }
    return el(
      "button",
      Object.assign(common, {
        type: opts.type || "button",
        disabled: !!opts.disabled,
        on: opts.onClick ? { click: opts.onClick } : null
      }),
      content
    );
  }

  /** Small pill label. tone: neutral|accent|ok|warn|danger|info. Optional icon so meaning never relies on colour. */
  function badge(label, tone, icon) {
    return el("span", { class: ["badge", "badge--" + (tone || "neutral")] }, icon ? svgIcon(icon, { size: 14 }) : null, el("span", { text: label }));
  }

  function emptyState(icon, message, action) {
    return el("div", { class: "empty" }, svgIcon(icon, { size: 32 }), el("p", { text: message }), action || null);
  }

  function card(attrs, ...children) {
    return el("section", Object.assign({ class: "card" }, attrs || {}), children);
  }

  /** Label + control + optional hint, wired with for/aria-describedby. */
  function field(opts) {
    const id = opts.id || BK.dom.uid("f");
    const hintId = opts.hint ? id + "-hint" : null;
    const control = opts.control;
    control.id = id;
    if (hintId) control.setAttribute("aria-describedby", hintId);
    return el(
      "div",
      { class: ["field", opts.className] },
      el("label", { class: "field__label", for: id, text: opts.label }),
      control,
      opts.hint ? el("p", { class: "field__hint", id: hintId, text: opts.hint }) : null
    );
  }

  /**
   * <select> from [{ value, label }]. onChange receives the selected value.
   */
  function select(options, value, onChange, attrs) {
    return el(
      "select",
      Object.assign({ class: "input", on: { change: (e) => onChange(e.target.value) } }, attrs),
      options.map((o) => el("option", { value: o.value, selected: String(o.value) === String(value), text: o.label }))
    );
  }

  /**
   * Segmented control: a radiogroup of styled radio buttons (keyboard: arrows).
   * options: [{ value, label, hint? }]
   */
  function segmented(opts) {
    const name = opts.name || BK.dom.uid("seg");
    const legendId = name + "-legend";
    return el(
      "fieldset",
      { class: ["segmented-field", opts.className] },
      el("legend", { class: "field__label", id: legendId, text: opts.label }),
      el(
        "div",
        { class: ["segmented", opts.wrap && "segmented--wrap"] },
        opts.options.map((o) =>
          el(
            "label",
            { class: "segmented__option", title: o.hint || null },
            el("input", {
              type: "radio",
              name,
              value: o.value,
              checked: String(o.value) === String(opts.value),
              on: { change: (e) => e.target.checked && opts.onChange(o.value) }
            }),
            el("span", { class: "segmented__label" }, el("span", { text: o.label }), o.hint ? el("small", { text: o.hint }) : null)
          )
        )
      ),
      opts.hint ? el("p", { class: "field__hint", text: opts.hint }) : null
    );
  }

  /** Checkbox with label. */
  function checkbox(label, checked, onChange, extra) {
    return el(
      "label",
      { class: "check" },
      el("input", { type: "checkbox", checked: !!checked, on: { change: (e) => onChange(e.target.checked) } }),
      el("span", { text: label }),
      extra || null
    );
  }

  BK.ui.c = { pageHeader, button, badge, emptyState, card, field, select, segmented, checkbox };
})();
