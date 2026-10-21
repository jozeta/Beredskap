/*
 * icons.js — Custom SVG icon sprite (24×24 grid, 1.5px stroke, round caps/joins,
 * currentColor) and the Beredskap mark.
 *
 * This is the ONE file allowed to use innerHTML: the markup below is static and
 * author-controlled, never derived from scenario, generated or imported content.
 * Icons are referenced with BK.dom.svgIcon(name) -> <use href="#i-name">.
 *
 * Icons cover the full set in spec section 3; emblems are the 20 scenario marks.
 */
(function () {
  "use strict";

  const BK = window.BK;

  // name -> inner SVG markup (paths drawn on a 24×24 grid; stroke styles come from .icon in CSS)
  const ICONS = {
    "shield-alert": '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6L12 3z"/><path d="M12 8v4.5M12 15.5h.01"/>',
    bug:
      '<path d="M8 9.5h8v4.5a4 4 0 0 1-8 0V9.5z"/><path d="M9.5 9.5V8a2.5 2.5 0 0 1 5 0v1.5"/>' +
      '<path d="M4 12h4M16 12h4M4.5 17.5h4M15.5 17.5h4M5.5 6.5l3 3M18.5 6.5l-3 3"/>',
    "skull-lock":
      '<path d="M12 3.5a7 7 0 0 0-7 7c0 2.2 1 3.8 2.5 5v3h9v-3c1.5-1.2 2.5-2.8 2.5-5a7 7 0 0 0-7-7z"/>' +
      '<circle cx="9.5" cy="10.5" r="1.4"/><circle cx="14.5" cy="10.5" r="1.4"/><path d="M12 13.2v1.3M10.5 18.5V21M13.5 18.5V21"/>',
    hook: '<path d="M14.5 3.5v9.5a4.5 4.5 0 0 1-9 0v-1.5"/><path d="M5.5 11.5l-1.5 2.2M5.5 11.5l2 1.6M13 3.5h3"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="M4 7l8 6 8-6"/>',
    "mail-alert": '<rect x="3" y="7" width="13" height="11" rx="1.5"/><path d="M3.5 8.5l6 4.5 6-4.5"/><path d="M19.5 5.5v6M19.5 15h.01"/>',
    "user-secret":
      '<path d="M7 9.5h10M9 9.5l1-4.5h4l1 4.5"/><circle cx="9.5" cy="13" r="1.6"/><circle cx="14.5" cy="13" r="1.6"/>' +
      '<path d="M11.1 13h1.8M5.5 20.5c.8-2.6 3.3-4 6.5-4s5.7 1.4 6.5 4"/>',
    server:
      '<rect x="4.5" y="4.5" width="15" height="6" rx="1.5"/><rect x="4.5" y="13.5" width="15" height="6" rx="1.5"/>' +
      '<path d="M8 7.5h.01M8 16.5h.01M12 7.5h4M12 16.5h4"/>',
    database:
      '<ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6"/>' +
      '<path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>',
    cloud: '<path d="M7 18.5a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6-1.5A4.5 4.5 0 0 1 17 18.5z"/>',
    "cloud-off": '<path d="M7 18.5a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6-1.5A4.5 4.5 0 0 1 17 18.5z"/><path d="M4 4l16 16"/>',
    network:
      '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><circle cx="12" cy="12" r="1.5"/>' +
      '<path d="M12 7v3.5M10.8 13.2l-4.4 4.4M13.2 13.2l4.4 4.4"/>',
    "wifi-off": '<path d="M4 9.5a12 12 0 0 1 16 0M7 13a7.5 7.5 0 0 1 10 0M10 16.5a3 3 0 0 1 4 0M12 19.5h.01M4 4l16 16"/>',
    globe:
      '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M5 7.5h14M5 16.5h14"/>' +
      '<path d="M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.4-3.5-8.5s1.1-5.9 3.5-8.5z"/>',
    flood:
      '<path d="M12 3.5v7M9 7.5l3 3 3-3"/>' +
      '<path d="M3 15c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0M3 19c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0"/>',
    key: '<circle cx="8" cy="15" r="3.5"/><path d="M10.5 12.5L19 4M16 7l2 2M13.5 9.5l1.5 1.5"/>',
    lock:
      '<rect x="6" y="10.5" width="12" height="9.5" rx="1.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v2"/>',
    unlock:
      '<rect x="6" y="10.5" width="12" height="9.5" rx="1.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 6.8-1.2M12 14.5v2"/>',
    fingerprint:
      '<path d="M8 20c1-2 1.5-4 1.5-7a2.5 2.5 0 0 1 5 0c0 2.5-.3 4.5-1 6.5"/>' +
      '<path d="M5.5 16.5c.6-1.2 1-2.5 1-4a5.5 5.5 0 0 1 11 0c0 1-.1 2-.3 3M6.8 6.2A8 8 0 0 1 19.5 11M12 13c0 3-.7 5.3-2 7.5"/>',
    eye: '<path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    "eye-off": '<path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 4l16 16"/>',
    terminal: '<rect x="3.5" y="5" width="17" height="14" rx="1.5"/><path d="M7 10l3 2-3 2M12.5 14.5H17"/>',
    "code-branch": '<circle cx="7" cy="5" r="2"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="7" r="2"/><path d="M7 7v10M17 9c0 4-4 4-8.5 7.5"/>',
    package: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9M8 5.3l8 4.5"/>',
    factory: '<path d="M3.5 20.5V11l5 3.5V11l5 3.5V11l5 3.5V5h2v15.5zM7 17.5h2M12 17.5h2M17 17.5h1"/>',
    hospital: '<path d="M4.5 20.5V6.5h15v14M12 9v5M9.5 11.5h5M10 20.5v-3h4v3M3 20.5h18"/>',
    phone: '<path d="M6.5 3.5l3 .5 1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5.5 3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>',
    sms:
      '<path d="M4.5 5.5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4.5 3.5v-3.5h-1a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z"/>' +
      '<path d="M8 11h.01M12 11h.01M16 11h.01"/>',
    newspaper: '<path d="M4.5 5.5h12v13a2 2 0 0 0 2 2H6.5a2 2 0 0 1-2-2zM16.5 9.5h3v9a2 2 0 0 1-2 2M7.5 9h6M7.5 12.5h6M7.5 16h4"/>',
    megaphone: '<path d="M4 10v4h3l8 4.5v-13L7 10H4zM18 9.5a3.5 3.5 0 0 1 0 5M7.5 14l1.2 5h2.3l-1-4.5"/>',
    scale: '<path d="M12 4v16M8 20h8M5 7h14M5 7l-2.5 6a2.5 2.5 0 0 0 5 0L5 7zM19 7l-2.5 6a2.5 2.5 0 0 0 5 0L19 7z"/>',
    coins:
      '<ellipse cx="9" cy="7" rx="5" ry="2.5"/><path d="M4 7v4c0 1.4 2.2 2.5 5 2.5M4 11v4c0 1.4 2.2 2.5 5 2.5M14 7v2"/>' +
      '<ellipse cx="15" cy="13" rx="5" ry="2.5"/><path d="M10 13v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4"/>',
    decision: '<path d="M12 21v-9M12 12L6 6M12 12l6-6M6 6v3.5M6 6h3.5M18 6v3.5M18 6h-3.5"/>',
    question: '<circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
    lightbulb: '<path d="M9 18h6M10 21h4M12 3.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-.6c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z"/>',
    fire:
      '<path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-9-1 2-2.5 3-3.5 3 0-1.5-.5-3-1.5-4C7.5 8 6 10.5 6 15a6 6 0 0 0 6 6z"/>' +
      '<path d="M12 21a2.5 2.5 0 0 1-2.5-2.5c0-1.8 1.5-2.5 2.5-4 1 1.5 2.5 2.2 2.5 4A2.5 2.5 0 0 1 12 21z"/>',
    power: '<path d="M12 3.5v8M7 6.5a7 7 0 1 0 10 0"/>',
    thermometer: '<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0zM12 9v8"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    dns:
      '<path d="M3.5 6.5h5M3.5 12h5M3.5 17.5h5"/><circle cx="16" cy="12" r="4.5"/>' +
      '<path d="M11.5 12h9M16 7.5c1.2 1.3 1.8 2.8 1.8 4.5s-.6 3.2-1.8 4.5c-1.2-1.3-1.8-2.8-1.8-4.5s.6-3.2 1.8-4.5z"/>',
    "chart-line": '<path d="M4 4.5V20h16M7 15l4-5 3 3 5-6"/>',
    "chart-bar": '<path d="M4 4.5V20h16M8 16.5v-4M12 16.5v-8M16 16.5v-6"/>',
    verified: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6L12 3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    unverified: '<circle cx="12" cy="12" r="8.5" stroke-dasharray="3 3"/><path d="M12 8.5v4M12 15.5h.01"/>',
    misleading: '<path d="M5 20V11a4 4 0 0 1 4-4h9M15 4l3 3-3 3"/><path d="M5 4l3.5 3.5M8.5 4L5 7.5"/>',
    disputed: '<path d="M4 9h12M13 6l3 3-3 3M20 15H8M11 12l-3 3 3 3"/>',
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
    fullscreen: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
    flag: '<path d="M5.5 20.5V4M5.5 4.5h11l-2.5 4 2.5 4h-11"/>',
    hourglass:
      '<path d="M6.5 3.5h11M6.5 20.5h11"/>' +
      '<path d="M7.5 3.5c0 4 4.5 5.5 4.5 8.5s-4.5 4.5-4.5 8.5M16.5 3.5c0 4-4.5 5.5-4.5 8.5s4.5 4.5 4.5 8.5"/>'
  };


  /*
   * Scenario emblems: 64×64 compositions inside a circle. Each is a main icon at
   * 1.5× plus a small badge icon in the lower-right, so emblems stay consistent
   * with the icon set while still distinguishing all twenty scenarios.
   * name -> [mainIcon, badgeIcon]
   */
  const EMBLEMS = {
    "skull-lock": ["skull-lock", "lock"],
    invoice: ["coins", "mail"],
    ddos: ["flood", "key"],
    insider: ["user-secret", "package"],
    "supply-chain": ["package", "bug"],
    "cloud-leak": ["cloud", "eye"],
    mfa: ["fingerprint", "phone"],
    wiper: ["database", "fire"],
    datacenter: ["thermometer", "server"],
    msp: ["link", "users"],
    ot: ["factory", "power"],
    maintenance: ["terminal", "eye-off"],
    deepfake: ["user", "question"],
    pipeline: ["code-branch", "key"],
    hacktivist: ["megaphone", "user-secret"],
    "three-fires": ["fire", "decision"],
    hospital: ["hospital", "skull-lock"],
    dns: ["dns", "globe"],
    "zero-day": ["shield-alert", "clock"],
    storm: ["network", "cloud-off"]
  };

  function emblemMarkup(main, badge) {
    return (
      '<circle cx="32" cy="32" r="29" stroke-width="1.5"/>' +
      '<g transform="translate(12 12) scale(1.5)" stroke-width="1.5">' + ICONS[main] + "</g>" +
      '<circle class="emblem-badge" cx="48" cy="48" r="10" stroke-width="1.5"/>' +
      '<g transform="translate(40.8 40.8) scale(0.6)" stroke-width="2">' + ICONS[badge] + "</g>"
    );
  }

  /** Build the sprite markup from the static tables above. */
  function spriteMarkup() {
    return Object.keys(ICONS)
      .map((name) => '<symbol id="i-' + name + '" viewBox="0 0 24 24">' + ICONS[name] + "</symbol>")
      .concat(Object.keys(EMBLEMS).map((name) => '<symbol id="e-' + name + '" viewBox="0 0 64 64">' + emblemMarkup(EMBLEMS[name][0], EMBLEMS[name][1]) + "</symbol>"))
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

  BK.icons = {
    names: Object.keys(ICONS),
    emblems: Object.keys(EMBLEMS),
    inject,
    has: (n) => n in ICONS,
    hasEmblem: (n) => n in EMBLEMS
  };
})();
