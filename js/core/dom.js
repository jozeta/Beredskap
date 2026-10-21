/*
 * dom.js — Safe DOM builders.
 *
 * All dynamic text goes through textContent / text nodes. There is deliberately
 * no helper that accepts HTML strings: scenario, generated and imported content
 * can never become markup. (The only innerHTML in the app is the static icon
 * sprite in graphics/icons.js.)
 */
(function () {
  "use strict";

  const BK = window.BK;
  const SVG_NS = "http://www.w3.org/2000/svg";

  // Properties that must be set as DOM properties rather than attributes.
  const PROPS = new Set(["value", "checked", "disabled", "selected", "hidden", "indeterminate", "open", "tabIndex"]);

  function appendChildren(node, children) {
    children.forEach((child) => {
      if (child == null || child === false || child === true) return;
      if (Array.isArray(child)) {
        appendChildren(node, child);
      } else if (child instanceof Node) {
        node.appendChild(child);
      } else {
        node.appendChild(document.createTextNode(String(child)));
      }
    });
  }

  /**
   * Generic attribute application shared by HTML and SVG builders.
   * Supported keys: class, text, dataset, style (object), on (event map), props, attributes.
   */
  function applyAttrs(node, attrs, isSvg) {
    if (!attrs) return;
    Object.keys(attrs).forEach((key) => {
      const val = attrs[key];
      if (val == null || val === false) return;
      if (key === "class") {
        node.setAttribute("class", Array.isArray(val) ? val.filter(Boolean).join(" ") : val);
      } else if (key === "text") {
        node.textContent = String(val);
      } else if (key === "dataset") {
        Object.keys(val).forEach((d) => {
          if (val[d] != null) node.dataset[d] = String(val[d]);
        });
      } else if (key === "style") {
        Object.keys(val).forEach((s) => node.style.setProperty(s, val[s]));
      } else if (key === "on") {
        Object.keys(val).forEach((evt) => node.addEventListener(evt, val[evt]));
      } else if (!isSvg && PROPS.has(key)) {
        node[key] = val;
      } else if (/^on/i.test(key)) {
        // Refuse inline event-handler attributes entirely; use { on: { click } } instead.
        throw new Error("Inline handler attribute not allowed: " + key);
      } else {
        node.setAttribute(key, val === true ? "" : String(val));
      }
    });
  }

  /** Create an HTML element: el("button", { class: "btn", on: { click } }, "Label"). */
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    applyAttrs(node, attrs, false);
    appendChildren(node, children);
    return node;
  }

  /** Create an SVG element in the SVG namespace. */
  function svg(tag, attrs, ...children) {
    const node = document.createElementNS(SVG_NS, tag);
    applyAttrs(node, attrs, true);
    appendChildren(node, children);
    return node;
  }

  function text(str) {
    return document.createTextNode(str == null ? "" : String(str));
  }

  /**
   * Reference an icon from the sprite: <svg><use href="#i-name"/></svg>.
   * With `label` the icon is announced (role="img"); otherwise it is decorative.
   */
  function svgIcon(name, opts) {
    const o = opts || {};
    const size = o.size || 20;
    const node = svg("svg", {
      class: ["icon", o.className],
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      focusable: "false",
      "aria-hidden": o.label ? null : "true",
      role: o.label ? "img" : null,
      "aria-label": o.label || null
    });
    node.appendChild(svg("use", { href: "#i-" + name }));
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
    return node;
  }

  /** Replace a node's children with the given child/children. */
  function mount(node, ...children) {
    clear(node);
    appendChildren(node, children);
    return node;
  }

  // Unique-enough ids for exercises and sessions (not security relevant; not crypto).
  let counter = 0;
  function uid(prefix) {
    counter = (counter + 1) % 1296;
    return (prefix || "id") + "-" + Date.now().toString(36) + counter.toString(36).padStart(2, "0");
  }

  /** Offer text content as a file download (Blob + temporary anchor; no network). */
  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime || "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = el("a", { href: url, download: filename, hidden: true });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  BK.dom = { el, svg, text, svgIcon, clear, mount, uid, download, SVG_NS };
})();
