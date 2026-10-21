/*
 * artefacts.js — Stylised, generic mock-ups for inject artefacts on the stage:
 * email card, SMS bubbles, chat message, phone transcript, news front page,
 * social post, console/log window, system report, official letterhead, ransom
 * note, status page. Fictional names only; no product UIs or brand imitation.
 *
 * Input is the PUBLIC inject from the audience projection (already localised).
 * Everything is built with textContent; nothing here can carry markup.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el, svgIcon } = BK.dom;
  const t = BK.t;

  const TYPE_KIND = {
    email: "email", phishingEmail: "email", mediaEnquiry: "email", customerComplaint: "email", employeeReport: "email",
    executiveMessage: "chat", chat: "chat",
    sms: "sms",
    phoneTranscript: "call",
    newsHeadline: "news",
    socialPost: "social",
    siemAlert: "console", edrAlert: "console", authLog: "console", networkEvidence: "console", logExcerpt: "console",
    backupReport: "report", forensicFinding: "report", threatIntel: "report", advisory: "report", impactReport: "report", ticket: "report",
    regulatorLetter: "letter", supplierNotice: "letter",
    ransomNote: "ransom",
    statusPage: "status"
  };

  const SEVERITY_ICON = { info: "info", low: "info", medium: "warning", high: "warning", critical: "warning" };

  function initials(name) {
    return BK.data.names.initials(String(name || "?").split(",")[0]);
  }

  function reliability(inj, lang) {
    return inj.statedReliability ? el("p", { class: "a-reliability" }, svgIcon("unverified", { size: 28 }), el("span", { text: t("stage.statedReliability", { value: inj.statedReliability }, lang) })) : null;
  }

  function severity(inj) {
    return inj.severity ? el("span", { class: ["s-sev", "s-sev--" + inj.severity] }, svgIcon(SEVERITY_ICON[inj.severity], { size: 28 }), el("span", { text: inj.severityLabel })) : null;
  }

  function roleMissing(inj, lang) {
    return inj.roleNotPresent ? el("p", { class: "a-missing" }, svgIcon("warning", { size: 28 }), el("span", { text: t("editor.roleNotPresent", null, lang) })) : null;
  }

  // ---- Renderers ---------------------------------------------------------------------------------

  function email(inj, lang) {
    const m = inj.meta || {};
    return el(
      "article",
      { class: "a-card a-email" },
      el("header", { class: "a-email__bar" }, svgIcon(inj.type === "phishingEmail" ? "mail-alert" : "mail", { size: 36 }), el("span", { text: inj.typeLabel }), el("span", { class: "a-time", text: inj.time })),
      el(
        "dl",
        { class: "a-email__head" },
        el("dt", { text: t("stage.from", null, lang) }), el("dd", { text: m.from || inj.source || "" }),
        m.to ? [el("dt", { text: t("stage.to", null, lang) }), el("dd", { text: m.to })] : null,
        el("dt", { text: t("stage.subject", null, lang) }), el("dd", { class: "a-email__subject", text: m.subject || inj.headline || inj.typeLabel })
      ),
      el("div", { class: "a-email__body" }, el("p", { text: inj.content })),
      reliability(inj, lang),
      roleMissing(inj, lang)
    );
  }

  function chat(inj, lang) {
    const who = inj.source || inj.typeLabel;
    return el(
      "article",
      { class: "a-chat" },
      el("p", { class: "a-kicker" }, svgIcon("sms", { size: 32 }), el("span", { text: inj.typeLabel })),
      el(
        "div",
        { class: "a-chat__msg" },
        el("span", { class: "a-avatar", "aria-hidden": "true", text: initials(who) }),
        el(
          "div",
          { class: "a-chat__bubble" },
          el("p", { class: "a-chat__who" }, el("strong", { text: who }), el("span", { class: "a-time", text: inj.time })),
          inj.headline ? el("p", { class: "a-chat__headline", text: inj.headline }) : null,
          el("p", { class: "a-chat__text", text: inj.content })
        )
      ),
      reliability(inj, lang),
      roleMissing(inj, lang)
    );
  }

  function sms(inj, lang) {
    return el(
      "article",
      { class: "a-sms" },
      el("header", { class: "a-sms__head" }, el("span", { class: "a-avatar", "aria-hidden": "true", text: initials(inj.source) }), el("strong", { text: inj.source || inj.typeLabel })),
      el("div", { class: "a-sms__thread" }, el("p", { class: "a-sms__bubble", text: inj.content }), el("span", { class: "a-time", text: inj.time })),
      reliability(inj, lang)
    );
  }

  function call(inj, lang) {
    return el(
      "article",
      { class: "a-card a-call" },
      el("header", { class: "a-call__head" }, el("span", { class: "a-call__icon" }, svgIcon("phone", { size: 40 })), el("span", null, el("strong", { text: inj.typeLabel }), el("span", { class: "a-time", text: " · " + inj.time }))),
      inj.source ? el("p", { class: "a-call__who", text: inj.source }) : null,
      el("blockquote", { class: "a-call__quote", text: inj.content }),
      reliability(inj, lang),
      roleMissing(inj, lang)
    );
  }

  function news(inj, lang) {
    return el(
      "article",
      { class: "a-news" },
      el("header", { class: "a-news__mast" }, el("span", { class: "a-news__name", text: inj.source || t("art.news", null, lang) }), el("span", { class: "a-time", text: inj.time })),
      el("h2", { class: "a-news__headline", text: inj.headline || inj.content }),
      inj.headline ? el("p", { class: "a-news__lead", text: inj.content }) : null,
      el("div", { class: "a-news__rules", "aria-hidden": "true" }, el("span"), el("span"), el("span"))
    );
  }

  function social(inj, lang) {
    const handle = inj.source || t("art.anonymous", null, lang);
    return el(
      "article",
      { class: "a-card a-social" },
      el("header", { class: "a-social__head" }, el("span", { class: "a-avatar", "aria-hidden": "true", text: initials(handle) }), el("span", null, el("strong", { text: handle }), el("small", { text: inj.time }))),
      el("p", { class: "a-social__text", text: inj.content }),
      el("footer", { class: "a-social__foot", "aria-hidden": "true" }, svgIcon("megaphone", { size: 28 }), svgIcon("link", { size: 28 }), svgIcon("eye", { size: 28 }))
    );
  }

  function consoleWin(inj, lang) {
    // Split into sentences so the console reads like log lines.
    const lines = String(inj.content || "").split(/(?<=\.)\s+(?=[A-ZÅÄÖ0-9])/);
    return el(
      "article",
      { class: "a-console" },
      el("header", { class: "a-console__bar" }, svgIcon("terminal", { size: 32 }), el("span", { text: inj.typeLabel + (inj.source ? " · " + inj.source : "") }), severity(inj), el("span", { class: "a-time", text: inj.time })),
      inj.headline ? el("h2", { class: "a-console__title", text: inj.headline }) : null,
      el("ol", { class: "a-console__lines" }, lines.map((ln) => el("li", null, el("span", { class: "a-console__ts", text: inj.time }), el("span", { text: ln })))),
      reliability(inj, lang)
    );
  }

  function report(inj, lang) {
    const m = inj.meta || {};
    const icon = { backupReport: "database", forensicFinding: "fingerprint", threatIntel: "eye", advisory: "shield-alert", impactReport: "chart-bar", ticket: "notes" }[inj.type] || "notes";
    return el(
      "article",
      { class: "a-card a-report" },
      el("header", { class: "a-report__band" }, svgIcon(icon, { size: 36 }), el("span", { text: inj.typeLabel }), severity(inj), el("span", { class: "a-time", text: inj.time })),
      inj.source ? el("p", { class: "a-report__source", text: inj.source }) : null,
      m.ticketId || m.priority ? el("p", { class: "a-report__meta", text: [m.ticketId, m.priority].filter(Boolean).join(" · ") }) : null,
      inj.headline ? el("h2", { class: "a-report__title", text: inj.headline }) : null,
      el("p", { class: "a-report__body", text: inj.content }),
      reliability(inj, lang),
      roleMissing(inj, lang)
    );
  }

  function letter(inj, lang) {
    return el(
      "article",
      { class: "a-letter" },
      el("header", { class: "a-letter__head" }, el("span", { class: "a-letter__crest" }, svgIcon(inj.type === "regulatorLetter" ? "scale" : "package", { size: 48 })), el("span", { class: "a-letter__from", text: inj.source || inj.typeLabel })),
      el("p", { class: "a-letter__date", text: inj.time }),
      inj.headline ? el("p", { class: "a-letter__re", text: t("art.re", null, lang) + " " + inj.headline }) : null,
      el("p", { class: "a-letter__body", text: inj.content }),
      el("p", { class: "a-letter__sign", "aria-hidden": "true" })
    );
  }

  function ransom(inj, lang) {
    return el(
      "article",
      { class: "a-ransom" },
      el("header", { class: "a-ransom__bar" }, svgIcon("skull-lock", { size: 32 }), el("span", { text: inj.headline || inj.typeLabel }), el("span", { class: "a-time", text: inj.time })),
      el("pre", { class: "a-ransom__text", text: inj.content })
    );
  }

  function status(inj, lang) {
    return el(
      "article",
      { class: "a-card a-status" },
      el("header", { class: "a-status__head" }, el("strong", { text: inj.source || t("art.status", null, lang) }), el("span", { class: "a-time", text: inj.time })),
      el("p", { class: "a-status__banner" }, svgIcon("warning", { size: 36 }), el("span", { text: inj.headline || t("art.incidentUpdate", null, lang) })),
      el("p", { class: "a-status__body", text: inj.content })
    );
  }

  const RENDERERS = { email, chat, sms, call, news, social, console: consoleWin, report, letter, ransom, status };

  /** Render a projected inject as an artefact, or null to use the generic card. */
  function artefact(inj, lang) {
    const kind = TYPE_KIND[inj.type];
    const fn = kind && RENDERERS[kind];
    return fn ? el("div", { class: ["a-wrap", "a-wrap--" + kind] }, fn(inj, lang)) : null;
  }

  BK.graphics.artefact = artefact;
  BK.graphics.artefactKinds = TYPE_KIND;
})();
