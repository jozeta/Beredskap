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
  // Text goes through put(): plain text on the stage; in the slide builder (EDIT set) each field becomes an
  // editable element bound to its path in the inject, and empty optional fields are shown so they can be filled.

  let EDIT = null;

  function put(tag, attrs, path, value) {
    if (EDIT && path) return EDIT(tag, attrs || {}, path, value == null ? "" : String(value));
    return el(tag, Object.assign({}, attrs, { text: value == null ? "" : String(value) }));
  }

  const editing = () => !!EDIT;

  /** Mail window: subject first, then the sender row, then the body. */
  function email(inj, lang) {
    const m = inj.meta || {};
    const sp = editing() ? { lead: null, quote: inj.content } : speech(inj.content);
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
        put("span", {}, "typeLabel", inj.typeLabel),
        put("span", { class: "a-time" }, "time", inj.time)
      ),
      put("h2", { class: "a-mail__subject" }, "meta.subject", editing() ? m.subject : m.subject || inj.headline || inj.typeLabel),
      el(
        "div",
        { class: "a-mail__from" },
        avatar(inj, inj.speaker ? inj.speaker.name : null),
        el(
          "div",
          { class: "a-mail__sender" },
          editing() ? put("strong", {}, "source", inj.source) : el("strong", { text: sender }),
          editing() ? put("span", {}, "meta.from", m.from) : senderSub ? el("span", { text: senderSub }) : null,
          editing() ? el("span", null, t("stage.to", null, lang) + ": ", put("span", {}, "meta.to", m.to)) : m.to ? el("span", { text: t("stage.to", null, lang) + ": " + m.to }) : null
        )
      ),
      el("div", { class: "a-mail__body" }, put("p", {}, "content", sp.quote)),
      m.attachment || editing() ? el("p", { class: "a-mail__attachment" }, svgIcon("paperclip", { size: 28 }), put("span", {}, "meta.attachment", m.attachment)) : null,
      reliability(inj, lang),
      roleMissing(inj, lang)
    );
  }

  function message(inj, msg, first, paths) {
    const out = msg.side === "out";
    return el(
      "div",
      { class: ["a-msg", out ? "a-msg--out" : "a-msg--in"] },
      out ? null : avatar(inj, msg.name),
      el(
        "div",
        { class: "a-msg__col" },
        out && !msg.name && !editing() ? null : el("p", { class: "a-msg__who" }, put("strong", {}, paths.name, msg.name), msg.title ? el("span", { text: msg.title }) : null, first ? put("span", { class: "a-time" }, "time", inj.time) : null),
        put("p", { class: "a-msg__bubble" }, paths.text, msg.text)
      )
    );
  }

  /** Team chat window: channel bar, messages (one, or a two-way thread), and an idle composer. */
  function chat(inj, lang) {
    const sp = editing() ? { lead: null, quote: inj.content } : speech(inj.content);
    const w = editing() ? { name: inj.source, title: "" } : who(inj);
    const th = thread(inj);
    const msgs = th || [{ side: "in", name: w.name, title: w.title, text: sp.quote }];
    return el(
      "article",
      { class: "a-card a-chatwin" },
      el("header", { class: "a-chatwin__bar" }, svgIcon(inj.type === "executiveMessage" ? "megaphone" : "sms", { size: 30 }), put("span", {}, "headline", editing() ? inj.headline : inj.headline || inj.typeLabel), th ? put("span", { class: "a-time" }, "time", inj.time) : null),
      el(
        "div",
        { class: "a-chatwin__body" },
        sp.lead && !th ? el("p", { class: "a-sys", text: sp.lead }) : null,
        msgs.map((x, i) => message(inj, x, i === 0 && !th, th ? { name: "meta.thread." + i + ".name", text: "meta.thread." + i + ".text" } : { name: "source", text: "content" }))
      ),
      el("footer", { class: "a-chatwin__compose", "aria-hidden": "true" }, el("span", { text: t("art.composer", null, lang) }), svgIcon("send", { size: 30 })),
      reliability(inj, lang),
      roleMissing(inj, lang)
    );
  }

  /** Phone held upright: status bar, contact, bubbles, composer. */
  function sms(inj, lang) {
    const sp = editing() ? { lead: null, quote: inj.content } : speech(inj.content);
    const w = editing() ? { name: inj.source, title: "" } : who(inj);
    const th = thread(inj);
    const bubbles = th || [{ side: "in", text: sp.quote }];
    return el(
      "article",
      { class: "a-phone" },
      el("div", { class: "a-phone__status", "aria-hidden": "true" }, el("span", { text: inj.time }), el("span", { class: "a-phone__notch" }), el("span", { class: "a-phone__bars" }, el("span"), el("span"), el("span"), el("span"))),
      el("header", { class: "a-phone__contact" }, avatar(inj, inj.speaker ? w.name : null, "lg"), put("strong", {}, "source", w.name), el("span", { text: w.title || t("art.textMessage", null, lang) })),
      el(
        "div",
        { class: "a-phone__thread" },
        sp.lead && !th ? el("p", { class: "a-sys", text: sp.lead }) : null,
        bubbles.map((b, i) => put("p", { class: ["a-phone__bubble", b.side === "out" ? "a-phone__bubble--out" : "a-phone__bubble--in"] }, th ? "meta.thread." + i + ".text" : "content", b.text)),
        put("span", { class: "a-phone__stamp" }, "time", inj.time)
      ),
      el("footer", { class: "a-phone__compose", "aria-hidden": "true" }, el("span", { text: t("art.textMessage", null, lang) }), svgIcon("send", { size: 28 })),
      reliability(inj, lang)
    );
  }

  /** Call screen: the caller on the left, the transcript on the right. */
  function call(inj, lang) {
    const sp = editing() ? { lead: null, quote: inj.content } : speech(inj.content);
    const w = editing() ? { name: inj.source, title: "" } : who(inj);
    const th = thread(inj);
    return el(
      "article",
      { class: "a-card a-callscreen" },
      el(
        "div",
        { class: "a-callscreen__caller" },
        el("span", { class: "a-callscreen__ring" }, avatar(inj, inj.speaker ? w.name : null, "xl")),
        put("strong", { class: "a-callscreen__name" }, "source", w.name),
        w.title ? el("span", { class: "a-callscreen__title", text: w.title }) : null,
        el("p", { class: "a-callscreen__state" }, svgIcon("phone", { size: 28 }), el("span", null, inj.typeLabel + " · ", put("span", {}, "time", inj.time))),
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
          ? el("ol", { class: "a-callscreen__lines" }, th.map((x, i) => el("li", { class: x.side === "out" ? "is-out" : "is-in" }, put("strong", {}, "meta.thread." + i + ".name", x.name || (editing() ? "" : x.side === "out" ? "—" : w.name)), put("span", {}, "meta.thread." + i + ".text", x.text))))
          : put("blockquote", { class: "a-callscreen__quote" }, "content", sp.quote),
        reliability(inj, lang),
        roleMissing(inj, lang)
      )
    );
  }

  function news(inj, lang) {
    return el(
      "article",
      { class: "a-news" },
      el("header", { class: "a-news__mast" }, put("span", { class: "a-news__name" }, "source", editing() ? inj.source : inj.source || t("art.news", null, lang)), put("span", { class: "a-time" }, "time", inj.time)),
      put("h2", { class: "a-news__headline" }, "headline", editing() ? inj.headline : inj.headline || inj.content),
      inj.headline || editing() ? put("p", { class: "a-news__lead" }, "content", inj.content) : null,
      el("div", { class: "a-news__rules", "aria-hidden": "true" }, el("span"), el("span"), el("span"))
    );
  }

  /** Public post: optional context line, author, text (or a video frame with its caption), actions. */
  function social(inj, lang) {
    const sp = editing() ? { lead: null, quote: inj.content } : speech(inj.content);
    const m = inj.meta || {};
    const generic = inj.sourceKind === "socialMedia" || !inj.source;
    const author = m.author || (generic ? t("art.anonymous", null, lang) : inj.source);
    const handle = m.handle || (m.author ? "@" + String(m.author).toLowerCase().replace(/[^a-z0-9åäö]+/g, "_").replace(/^_|_$/g, "").slice(0, 24) : null);
    const video = sp.lead && sp.lead.match(/^(?:video|videoklipp|klipp|film)[,:\s]+(\d{1,2}:\d{2})[,:\s]*(.*)$/i);
    const context = [inj.headline, video ? null : sp.lead].filter(Boolean).join(" · ");
    return el(
      "article",
      { class: "a-card a-post" },
      editing()
        ? el("p", { class: "a-post__context" }, svgIcon("repost", { size: 26 }), put("span", {}, "headline", inj.headline))
        : context
          ? el("p", { class: "a-post__context" }, svgIcon("repost", { size: 26 }), el("span", { text: context }))
          : null,
      el(
        "header",
        { class: "a-post__head" },
        avatar(inj, m.author || null, "lg"),
        el(
          "span",
          { class: "a-post__author" },
          editing() ? put("strong", {}, "meta.author", m.author) : el("strong", { text: author }),
          editing() ? el("span", null, put("span", {}, "meta.handle", m.handle), " · ", put("span", {}, "time", inj.time)) : el("span", { text: [handle, inj.time].filter(Boolean).join(" · ") })
        ),
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
        : put("p", { class: "a-post__text" }, "content", sp.quote),
      el(
        "footer",
        // Decorative on the stage; in the builder the counts are editable fields.
        { class: "a-post__actions", "aria-hidden": editing() ? null : "true" },
        [["reply", "replies"], ["repost", "shares"], ["heart", "likes"], ["eye", "views"]].map(([icon, k]) => el("span", null, svgIcon(icon, { size: 30 }), editing() ? put("span", {}, "meta." + k, m[k]) : m[k] ? el("span", { text: m[k] }) : null))
      )
    );
  }

  function consoleWin(inj, lang) {
    // Split into sentences so the console reads like log lines (one editable block in the builder).
    const lines = editing() ? [inj.content] : String(inj.content || "").split(/(?<=\.)\s+(?=[A-ZÅÄÖ0-9])/);
    return el(
      "article",
      { class: "a-console" },
      el("header", { class: "a-console__bar" }, svgIcon("terminal", { size: 32 }), editing() ? el("span", null, inj.typeLabel + " · ", put("span", {}, "source", inj.source)) : el("span", { text: inj.typeLabel + (inj.source ? " · " + inj.source : "") }), severity(inj), put("span", { class: "a-time" }, "time", inj.time)),
      inj.headline || editing() ? put("h2", { class: "a-console__title" }, "headline", inj.headline) : null,
      el("ol", { class: "a-console__lines" }, lines.map((ln) => el("li", null, el("span", { class: "a-console__ts", text: inj.time }), put("span", {}, editing() ? "content" : null, ln)))),
      reliability(inj, lang)
    );
  }

  function report(inj, lang) {
    const m = inj.meta || {};
    const icon = { backupReport: "database", forensicFinding: "fingerprint", threatIntel: "eye", advisory: "shield-alert", impactReport: "chart-bar", ticket: "notes" }[inj.type] || "notes";
    return el(
      "article",
      { class: "a-card a-report" },
      el("header", { class: "a-report__band" }, svgIcon(icon, { size: 36 }), put("span", {}, "typeLabel", inj.typeLabel), severity(inj), put("span", { class: "a-time" }, "time", inj.time)),
      inj.source || editing() ? put("p", { class: "a-report__source" }, "source", inj.source) : null,
      m.ticketId || m.priority ? el("p", { class: "a-report__meta", text: [m.ticketId, m.priority].filter(Boolean).join(" · ") }) : null,
      inj.headline || editing() ? put("h2", { class: "a-report__title" }, "headline", inj.headline) : null,
      put("p", { class: "a-report__body" }, "content", inj.content),
      reliability(inj, lang),
      roleMissing(inj, lang)
    );
  }

  function letter(inj, lang) {
    return el(
      "article",
      { class: "a-letter" },
      el("header", { class: "a-letter__head" }, el("span", { class: "a-letter__crest" }, svgIcon(inj.type === "regulatorLetter" ? "scale" : "package", { size: 48 })), put("span", { class: "a-letter__from" }, "source", editing() ? inj.source : inj.source || inj.typeLabel)),
      put("p", { class: "a-letter__date" }, "time", inj.time),
      editing() ? el("p", { class: "a-letter__re" }, t("art.re", null, lang) + " ", put("span", {}, "headline", inj.headline)) : inj.headline ? el("p", { class: "a-letter__re", text: t("art.re", null, lang) + " " + inj.headline }) : null,
      put("p", { class: "a-letter__body" }, "content", inj.content),
      el("p", { class: "a-letter__sign", "aria-hidden": "true" })
    );
  }

  function ransom(inj, lang) {
    return el(
      "article",
      { class: "a-ransom" },
      el("header", { class: "a-ransom__bar" }, svgIcon("skull-lock", { size: 32 }), put("span", {}, "headline", editing() ? inj.headline : inj.headline || inj.typeLabel), put("span", { class: "a-time" }, "time", inj.time)),
      put("pre", { class: "a-ransom__text" }, "content", inj.content)
    );
  }

  function status(inj, lang) {
    return el(
      "article",
      { class: "a-card a-status" },
      el("header", { class: "a-status__head" }, put("strong", {}, "source", editing() ? inj.source : inj.source || t("art.status", null, lang)), put("span", { class: "a-time" }, "time", inj.time)),
      el("p", { class: "a-status__banner" }, svgIcon("warning", { size: 36 }), put("span", {}, "headline", editing() ? inj.headline : inj.headline || t("art.incidentUpdate", null, lang))),
      put("p", { class: "a-status__body" }, "content", inj.content)
    );
  }

  const RENDERERS = { email, chat, sms, call, news, social, console: consoleWin, report, letter, ransom, status };

  /**
   * Render a projected inject as an artefact, or null to use the generic card.
   * opts.edit(tag, attrs, path, value) makes each text field editable (slide builder only).
   */
  function artefact(inj, lang, opts) {
    const kind = TYPE_KIND[inj.type];
    const fn = kind && RENDERERS[kind];
    if (!fn) return null;
    EDIT = (opts && opts.edit) || null;
    try {
      return el("div", { class: ["a-wrap", "a-wrap--" + kind] }, fn(inj, lang));
    } finally {
      EDIT = null;
    }
  }

  BK.graphics.artefact = artefact;
  BK.graphics.artefactKinds = TYPE_KIND;
})();
