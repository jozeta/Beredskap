/*
 * icons.js — Custom SVG icon sprite (24×24 grid, 1.5px stroke, round caps/joins,
 * currentColor) and the Beredskap mark.
 *
 * This is the ONE file allowed to use innerHTML: the markup below is static and
 * author-controlled, never derived from scenario, generated or imported content.
 * Icons are referenced with BK.dom.svgIcon(name) -> <use href="#i-name">.
 *
 * Phase 1 ships the operator-UI subset; the full set and the 20 scenario emblems
 * are added in phase 4.
 */
(function () {
  "use strict";

  const BK = window.BK;

  // name -> inner SVG markup (paths drawn on a 24×24 grid; stroke styles come from .icon in CSS)
  const ICONS = {
    mark:
      '<path d="M2.5 13h19"/><path d="M7.5 13a4.5 4.5 0 0 1 9 0"/>' +
      '<path d="M4 16.5c1.6-1 3.2 1 4.8 0s3.2 1 4.8 0 3.2 1 4.8 0"/><path d="M7.2 20c1.2-.8 2.4.8 3.6 0s2.4.8 3.6 0"/>',
    shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6L12 3z"/>',
    dice:
      '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/>' +
      '<circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none"/>' +
      '<circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>' +
      '<circle cx="8.5" cy="15.5" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor" stroke="none"/>',
    play: '<path d="M8 5.5v13l10.5-6.5L8 5.5z"/>',
    pause: '<path d="M9 5.5v13M15 5.5v13"/>',
    next: '<path d="M9 5l7 7-7 7"/>',
    prev: '<path d="M15 5l-7 7 7 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    settings:
      '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    sun:
      '<circle cx="12" cy="12" r="4"/>' +
      '<path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
    "theme-system": '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/>',
    "globe-lang":
      '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/>' +
      '<path d="M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.4-3.5-8.5s1.1-5.9 3.5-8.5z"/>',
    save:
      '<path d="M6 3.5h10l3.5 3.5v12a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z"/>' +
      '<path d="M8 3.5v4.5h7V3.5M8 20.5v-6h8v6"/>',
    download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
    print:
      '<path d="M7 8V3.5h10V8"/><path d="M7 16.5H4.5v-7A1.5 1.5 0 0 1 6 8h12a1.5 1.5 0 0 1 1.5 1.5v7H17"/>' +
      '<path d="M7 13.5h10v7H7z"/>',
    edit: '<path d="M4.5 19.5l1-4L15.8 5.2a2 2 0 0 1 2.9 0l.1.1a2 2 0 0 1 0 2.9L8.5 18.5l-4 1z"/><path d="M14 7l3 3"/>',
    trash:
      '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    cross: '<path d="M6 6l12 12M18 6L6 18"/>',
    warning: '<path d="M12 4l9 15.5H3L12 4z"/><path d="M12 10v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    timeline:
      '<path d="M3.5 12h17"/><circle cx="7" cy="12" r="1.75"/><circle cx="13" cy="12" r="1.75"/><circle cx="18" cy="12" r="1.75"/>' +
      '<path d="M7 6.5v3.5M13 14v3.5M18 6.5v3.5"/>',
    notes:
      '<path d="M14.5 3.5h-8A1.5 1.5 0 0 0 5 5v14a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V8l-4.5-4.5z"/>' +
      '<path d="M14.5 3.5V8H19M8.5 12.5h7M8.5 16h5"/>',
    user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
    users:
      '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5c.6-3 2.8-4.7 5.5-4.7s4.9 1.7 5.5 4.7"/>' +
      '<path d="M15.5 5.6a3 3 0 0 1 0 5.8M17 14.9c1.9.5 3.1 2 3.5 4.6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
    "chevron-down": '<path d="M6 9l6 6 6-6"/>',
    book:
      '<path d="M4.5 5.5c2.5-1 5-1 7.5.5v13c-2.5-1.5-5-1.5-7.5-.5z"/>' +
      '<path d="M19.5 5.5c-2.5-1-5-1-7.5.5v13c2.5-1.5 5-1.5 7.5-.5z"/>',
    gauge: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4-5M12 17h.01"/>',
    fullscreen: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>'
  };

  /** Build the sprite markup from the static table above. */
  function spriteMarkup() {
    return Object.keys(ICONS)
      .map((name) => '<symbol id="i-' + name + '" viewBox="0 0 24 24">' + ICONS[name] + "</symbol>")
      .join("");
  }

  /** Insert the sprite once at the top of <body>. Safe to call repeatedly. */
  function inject() {
    if (document.getElementById("bk-sprite")) return;
    const holder = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    holder.setAttribute("id", "bk-sprite");
    holder.setAttribute("aria-hidden", "true");
    holder.setAttribute("class", "sprite"); // hidden via app.css; no inline style (CSP)
    holder.innerHTML = spriteMarkup(); // static, author-controlled markup only
    document.body.insertBefore(holder, document.body.firstChild);
  }

  BK.icons = { names: Object.keys(ICONS), inject, has: (n) => n in ICONS };
})();
