/*
 * dialog.js — Accessible dialogs, confirmations and toast notifications.
 *
 * Dialogs use the native <dialog> element with showModal(): the rest of the page
 * becomes inert (the focus trap), Esc cancels, and focus returns to the element
 * that opened it. Toasts are announced through an aria-live region.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el, svgIcon } = BK.dom;

  /**
   * Open a modal dialog. Resolves with the `value` of the action pressed,
   * or null when dismissed (Esc / close button).
   * actions: [{ label, value, kind: "primary" | "secondary" | "danger", onClick? }]
   */
  function open(opts) {
    return new Promise((resolve) => {
      const opener = document.activeElement;
      const titleId = BK.dom.uid("dlg");

      const dialog = el("dialog", { class: ["dialog", opts.wide && "dialog--wide"], "aria-labelledby": titleId });

      function close(value) {
        dialog.close();
        dialog.remove();
        if (opener && opener.focus && document.contains(opener)) opener.focus();
        resolve(value);
      }

      const header = el(
        "header",
        { class: "dialog__header" },
        el("h2", { id: titleId, class: "dialog__title", text: opts.title }),
        el(
          "button",
          { class: "btn btn--icon btn--ghost", type: "button", "aria-label": BK.t("common.close"), on: { click: () => close(null) } },
          svgIcon("cross")
        )
      );

      const body = el("div", { class: "dialog__body" }, opts.body || null);

      const footer = el(
        "footer",
        { class: "dialog__footer" },
        (opts.actions || []).map((a) =>
          el(
            "button",
            {
              class: ["btn", "btn--" + (a.kind || "secondary")],
              type: "button",
              dataset: { autofocus: a.autofocus ? "1" : null },
              on: {
                click: () => {
                  // An action may keep the dialog open by returning false.
                  if (a.onClick && a.onClick() === false) return;
                  close(a.value === undefined ? a.label : a.value);
                }
              }
            },
            a.label
          )
        )
      );

      dialog.append(header, body, footer);
      dialog.addEventListener("cancel", (e) => {
        e.preventDefault();
        close(null);
      });

      document.body.appendChild(dialog);
      dialog.showModal();
      const preferred = dialog.querySelector("[data-autofocus]") || footer.querySelector("button") || header.querySelector("button");
      if (preferred) preferred.focus();
    });
  }

  /** Yes/no confirmation. Resolves true only when the confirm action is chosen. */
  function confirm(opts) {
    return open({
      title: opts.title,
      body: el("p", { text: opts.message }),
      actions: [
        { label: BK.t("common.cancel"), value: false, kind: "secondary", autofocus: true },
        { label: opts.confirmLabel || BK.t("common.confirm"), value: true, kind: opts.danger ? "danger" : "primary" }
      ]
    }).then((v) => v === true);
  }

  // ---- Toasts -----------------------------------------------------------------

  function toastRegion() {
    let region = document.getElementById("bk-toasts");
    if (!region) {
      region = el("div", { id: "bk-toasts", class: "toasts", role: "status", "aria-live": "polite" });
      document.body.appendChild(region);
    }
    return region;
  }

  const KIND_ICON = { info: "info", ok: "check", warn: "warning", danger: "warning" };

  /** Show a transient message. kind: info | ok | warn | danger. */
  function toast(message, kind, ms) {
    const k = kind || "info";
    const node = el(
      "div",
      { class: ["toast", "toast--" + k] },
      svgIcon(KIND_ICON[k] || "info"),
      el("span", { text: message })
    );
    toastRegion().appendChild(node);
    setTimeout(() => {
      node.classList.add("is-leaving");
      setTimeout(() => node.remove(), 300);
    }, ms || (k === "danger" ? 8000 : 4000));
  }

  BK.ui.dialog = { open, confirm };
  BK.ui.toast = toast;
})();
