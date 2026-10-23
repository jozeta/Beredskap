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

  // ---- Shared pieces -------------------------------------------------------------------------------

  // Organisations and channels get an icon avatar; initials are for people only.
  const SOURCE_ICON = {
    media: "newspaper", socialMedia: "at", employee: "user", customer: "user", attacker: "skull-lock", bank: "coins",
    insurer: "shield", police: "shield", regulator: "scale", csirt: "shield", supplier: "package", vendor: "package",
    msp: "package", management: "users", facilities: "factory", soc: "shield-alert", itOps: "server", serviceDesk: "notes",
    irRetainer: "fingerprint", forensics: "fingerprint", threatIntel: "eye"
  };

  function avatar(inj, name, size) {
    const cls = ["a-avatar", size && "a-avatar--" + size, inj.sourceKind === "attacker" && "a-avatar--hostile"];
    const person = inj.sourceKind === "person" || (name && name !== inj.source);
    if (person || !inj.sourceKind) return el("span", { class: cls, "aria-hidden": "true", text: initials(name || inj.source) });
    return el("span", { class: cls, "aria-hidden": "true" }, svgIcon(SOURCE_ICON[inj.sourceKind] || "user", { size: size === "xl" ? 72 : size === "lg" ? 52 : 44 }));
  }

  /**
   * Split narration from speech: 'Jack calls from the car: "I'm hearing…"' → lead + quote, and a
   * fully quoted text → quote alone. A bubble or transcript shows the speech; the narration becomes
   * a caption, so the room reads who is talking and what they say as two things.
   */
  function speech(text) {
    const str = String(text || "").trim();
    let m = str.match(/^([^“”"]{2,200}?):\s*[“”"]([^“”"]+)[”"][.!]?$/);
    if (m) return { lead: m[1].trim(), quote: m[2].trim() };
    m = str.match(/^[“”"]([^“”"]+)[”"]$/);
    if (m) return { lead: null, quote: m[1].trim() };
    return { lead: null, quote: str };
  }

  /** Optional two-way thread (meta.thread: [{ side: "in" | "out", name, text }]); null when absent. */
  function thread(inj) {
    const th = inj.meta && Array.isArray(inj.meta.thread) ? inj.meta.thread.filter((x) => x && x.text) : [];
    return th.length ? th : null;
  }

  function who(inj) {
    return inj.speaker || { name: inj.source || inj.typeLabel, title: "" };
  }

  // ---- Renderers ---------------------------------------------------------------------------------

  /** Mail window: subject first, then the sender row, then the body. */
  function email(inj, lang) {
    const m = inj.meta || {};
    const sp = speech(inj.content);
    const addr = m.from && m.from.indexOf("@") > 0 ? m.from : null;
    const sender = inj.speaker ? inj.speaker.name : (m.from && !addr ? m.from : sp.lead || inj.source || inj.typeLabel);
    const senderSub = inj.speaker ? [inj.speaker.title, addr].filter(Boolean).join(" · ") : addr || (sp.lead && sender !== inj.source ? inj.source : "");
    return el(
      "article",
      { class: ["a-card", "a-mail", inj.type === "phishingEmail" && "a-mail--suspect"] },
      el(
        "header",
        { class: "a-mail__chrome" },
        el("span", { class: "a-mail__dots", "aria-hidden": "true" }, el("span"), el("span"), el("span")),
        svgIcon(inj.type === "phishingEmail" ? "mail-alert" : "mail", { size: 30 }),
        el("span", { text: inj.typeLabel }),
        el("span", { class: "a-time", text: inj.time })
      ),
      el("h2", { class: "a-mail__subject", text: m.subject || inj.headline || inj.typeLabel }),
      el(
        "div",
        { class: "a-mail__from" },
        avatar(inj, inj.speaker ? inj.speaker.name : null),
        el(
          "div",
          { class: "a-mail__sender" },
          el("strong", { text: sender }),
          senderSub ? el("span", { text: senderSub }) : null,
          m.to ? el("span", { text: t("stage.to", null, lang) + ": " + m.to }) : null
        )
      ),
      el("div", { class: "a-mail__body" }, el("p", { text: sp.quote })),
      m.attachment ? el("p", { class: "a-mail__attachment" }, svgIcon("paperclip", { size: 28 }), el("span", { text: m.attachment })) : null,
      reliability(inj, lang),
      roleMissing(inj, lang)
    );
  }

  function message(inj, msg, first) {
    const out = msg.side === "out";
    return el(
      "div",
      { class: ["a-msg", out ? "a-msg--out" : "a-msg--in"] },
      out ? null : avatar(inj, msg.name),
      el(
        "div",
        { class: "a-msg__col" },
        out && !msg.name ? null : el("p", { class: "a-msg__who" }, el("strong", { text: msg.name }), msg.title ? el("span", { text: msg.title }) : null, first ? el("span", { class: "a-time", text: inj.time }) : null),
        el("p", { class: "a-msg__bubble", text: msg.text })
      )
    );
  }

  /** Team chat window: channel bar, messages (one, or a two-way thread), and an idle composer. */
  function chat(inj, lang) {
    const sp = speech(inj.content);
    const w = who(inj);
    const msgs = thread(inj) || [{ side: "in", name: w.name, title: w.title, text: sp.quote }];
    return el(
      "article",
      { class: "a-card a-chatwin" },
      el("header", { class: "a-chatwin__bar" }, svgIcon(inj.type === "executiveMessage" ? "megaphone" : "sms", { size: 30 }), el("span", { text: inj.headline || inj.typeLabel }), thread(inj) ? el("span", { class: "a-time", text: inj.time }) : null),
      el("div", { class: "a-chatwin__body" }, sp.lead && !thread(inj) ? el("p", { class: "a-sys", text: sp.lead }) : null, msgs.map((x, i) => message(inj, x, i === 0 && !thread(inj)))),
      el("footer", { class: "a-chatwin__compose", "aria-hidden": "true" }, el("span", { text: t("art.composer", null, lang) }), svgIcon("send", { size: 30 })),
      reliability(inj, lang),
      roleMissing(inj, lang)
    );
  }

  /** Phone held upright: status bar, contact, bubbles, composer. */
  function sms(inj, lang) {
    const sp = speech(inj.content);
    const w = who(inj);
    const th = thread(inj);
    const bubbles = th || [{ side: "in", text: sp.quote }];
    return el(
      "article",
      { class: "a-phone" },
      el("div", { class: "a-phone__status", "aria-hidden": "true" }, el("span", { text: inj.time }), el("span", { class: "a-phone__notch" }), el("span", { class: "a-phone__bars" }, el("span"), el("span"), el("span"), el("span"))),
      el("header", { class: "a-phone__contact" }, avatar(inj, inj.speaker ? w.name : null, "lg"), el("strong", { text: w.name }), el("span", { text: w.title || t("art.textMessage", null, lang) })),
      el(
        "div",
        { class: "a-phone__thread" },
        sp.lead && !th ? el("p", { class: "a-sys", text: sp.lead }) : null,
        bubbles.map((b) => el("p", { class: ["a-phone__bubble", b.side === "out" ? "a-phone__bubble--out" : "a-phone__bubble--in"], text: b.text })),
        el("span", { class: "a-phone__stamp", text: inj.time })
      ),
      el("footer", { class: "a-phone__compose", "aria-hidden": "true" }, el("span", { text: t("art.textMessage", null, lang) }), svgIcon("send", { size: 28 })),
      reliability(inj, lang)
    );
  }

  /** Call screen: the caller on the left, the transcript on the right. */
  function call(inj, lang) {
    const sp = speech(inj.content);
    const w = who(inj);
    const th = thread(inj);
    return el(
      "article",
      { class: "a-card a-callscreen" },
      el(
        "div",
        { class: "a-callscreen__caller" },
        el("span", { class: "a-callscreen__ring" }, avatar(inj, inj.speaker ? w.name : null, "xl")),
        el("strong", { class: "a-callscreen__name", text: w.name }),
        w.title ? el("span", { class: "a-callscreen__title", text: w.title }) : null,
        el("p", { class: "a-callscreen__state" }, svgIcon("phone", { size: 28 }), el("span", { text: inj.typeLabel + " · " + inj.time })),
        el("span", { class: "a-callscreen__wave", "aria-hidden": "true" }, Array.from({ length: 14 }, () => el("span"))),
        el(
          "span",
          { class: "a-callscreen__controls", "aria-hidden": "true" },
          el("span", null, svgIcon("mic", { size: 32 })),
          el("span", null, svgIcon("volume", { size: 32 })),
          el("span", { class: "a-callscreen__end" }, svgIcon("phone-end", { size: 34 }))
        )
      ),
      el(
        "div",
        { class: "a-callscreen__transcript" },
        el("p", { class: "a-kicker", text: t("art.transcript", null, lang) }),
        sp.lead && !th ? el("p", { class: "a-sys a-sys--start", text: sp.lead }) : null,
        th
          ? el("ol", { class: "a-callscreen__lines" }, th.map((x) => el("li", { class: x.side === "out" ? "is-out" : "is-in" }, el("strong", { text: x.name || (x.side === "out" ? "—" : w.name) }), el("span", { text: x.text }))))
          : el("blockquote", { class: "a-callscreen__quote", text: sp.quote }),
        reliability(inj, lang),
        roleMissing(inj, lang)
      )
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

  /** Public post: optional context line, author, text (or a video frame with its caption), actions. */
  function social(inj, lang) {
    const sp = speech(inj.content);
    const m = inj.meta || {};
    const generic = inj.sourceKind === "socialMedia" || !inj.source;
    const author = m.author || (generic ? t("art.anonymous", null, lang) : inj.source);
    const handle = m.handle || (m.author ? "@" + String(m.author).toLowerCase().replace(/[^a-z0-9åäö]+/g, "_").replace(/^_|_$/g, "").slice(0, 24) : null);
    const video = sp.lead && sp.lead.match(/^(?:video|videoklipp|klipp|film)[,:\s]+(\d{1,2}:\d{2})[,:\s]*(.*)$/i);
    const context = [inj.headline, video ? null : sp.lead].filter(Boolean).join(" · ");
    return el(
      "article",
      { class: "a-card a-post" },
      context ? el("p", { class: "a-post__context" }, svgIcon("repost", { size: 26 }), el("span", { text: context })) : null,
      el(
        "header",
        { class: "a-post__head" },
        avatar(inj, m.author || null, "lg"),
        el("span", { class: "a-post__author" }, el("strong", { text: author }), el("span", { text: [handle, inj.time].filter(Boolean).join(" · ") })),
        el("span", { class: "a-post__more", "aria-hidden": "true" }, svgIcon("more", { size: 32 }))
      ),
      video
        ? el(
            "figure",
            { class: "a-post__video" },
            el("span", { class: "a-post__play", "aria-hidden": "true" }, svgIcon("play", { size: 56 })),
            el("span", { class: "a-post__duration", text: video[1] }),
            el(
              "figcaption",
              null,
              video[2] ? el("span", { class: "a-post__scene", text: video[2].charAt(0).toUpperCase() + video[2].slice(1) }) : null,
              el("span", { class: "a-post__caption", text: (lang === "sv" ? "”" : "“") + sp.quote + "”" })
            )
          )
        : el("p", { class: "a-post__text", text: sp.quote }),
      el(
        "footer",
        { class: "a-post__actions", "aria-hidden": "true" },
        [["reply", m.replies], ["repost", m.shares], ["heart", m.likes], ["eye", m.views]].map(([icon, n]) => el("span", null, svgIcon(icon, { size: 30 }), n ? el("span", { text: n }) : null))
      )
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
