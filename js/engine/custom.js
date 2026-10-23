/*
 * custom.js — Custom exercises: a deck of slides the facilitator builds in the
 * slide builder (#/builder/:deckId), run through the same stage, presenter,
 * history and debrief as generated exercises.
 *
 * A deck holds two kinds of slide:
 *   "blocks"   — a layout plus content blocks (headings, rich text runs, lists,
 *                quotes, callouts, icons, key figures, timelines, options, images)
 *   "artefact" — one inject mock-up (email, chat, SMS, call, post, log, letter…),
 *                stored as the same public inject shape artefacts.js renders
 *
 * Rich text is stored as runs [{ t, b, i, u }], never as markup; every string is
 * rendered with textContent. normaliseDeck() is the single gate for anything
 * stored, edited or imported. TEMPLATES is the catalogue the builder offers.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const t = BK.t;

  const LAYOUTS = ["content", "title", "section", "center", "twist"];
  const BLOCK_TYPES = ["heading", "kicker", "text", "bullets", "numbered", "quote", "callout", "icon", "kpi", "timeline", "options", "image", "divider"];
  const TONES = ["info", "ok", "warn", "danger"];
  const SIZES = ["s", "m", "l"];
  const MAX_SLIDES = 120;
  const IMAGE_RE = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;
  const MAX_IMAGE = 600000; // characters of data URL, about 450 kB

  // ---- Runs (rich text without markup) ---------------------------------------------------------------

  function runs(text) {
    return [{ t: String(text || "") }];
  }

  function normaliseRuns(v) {
    const list = Array.isArray(v) ? v : typeof v === "string" ? runs(v) : [];
    const out = list
      .filter((r) => r && typeof r === "object")
      .map((r) => {
        const o = { t: String(r.t == null ? "" : r.t).slice(0, 4000) };
        if (r.b) o.b = 1;
        if (r.i) o.i = 1;
        if (r.u) o.u = 1;
        return o;
      })
      .filter((r) => r.t !== "");
    return out.length ? out.slice(0, 200) : [];
  }

  function runsText(list) {
    return (list || []).map((r) => r.t).join("");
  }

  const str = (v, max) => String(v == null ? "" : v).slice(0, max || 400);

  // ---- Normalisation ---------------------------------------------------------------------------------

  function normaliseBlock(b) {
    if (!b || !BLOCK_TYPES.includes(b.type)) return null;
    const o = { type: b.type };
    switch (b.type) {
      case "heading":
        o.level = b.level === 2 ? 2 : 1;
        o.runs = normaliseRuns(b.runs);
        break;
      case "kicker":
      case "quote":
      case "text":
      case "callout":
        o.runs = normaliseRuns(b.runs);
        if (b.type === "text") o.size = SIZES.includes(b.size) ? b.size : "m";
        if (b.type === "text" || b.type === "quote") o.align = b.align === "center" ? "center" : "left";
        if (b.type === "callout") o.tone = TONES.includes(b.tone) ? b.tone : "info";
        if (b.type === "quote") o.by = str(b.by, 200);
        break;
      case "bullets":
      case "numbered":
        o.items = (Array.isArray(b.items) ? b.items : []).slice(0, 12).map(normaliseRuns);
        if (!o.items.length) o.items = [[]];
        break;
      case "icon":
        o.icon = BK.icons && BK.icons.names && BK.icons.names.includes(b.icon) ? b.icon : "shield";
        o.label = str(b.label, 200);
        o.tone = TONES.includes(b.tone) ? b.tone : "info";
        break;
      case "kpi":
        o.tiles = (Array.isArray(b.tiles) ? b.tiles : []).slice(0, 4).map((x) => ({ label: str(x && x.label, 120), value: str(x && x.value, 24), tone: TONES.includes(x && x.tone) ? x.tone : "info" }));
        if (!o.tiles.length) o.tiles = [{ label: "", value: "", tone: "info" }];
        break;
      case "timeline":
        o.rows = (Array.isArray(b.rows) ? b.rows : []).slice(0, 8).map((x) => ({ time: str(x && x.time, 40), text: str(x && x.text, 400) }));
        if (!o.rows.length) o.rows = [{ time: "", text: "" }];
        break;
      case "options":
        o.items = (Array.isArray(b.items) ? b.items : []).slice(0, 4).map(normaliseRuns);
        if (!o.items.length) o.items = [[]];
        break;
      case "image":
        o.src = typeof b.src === "string" && b.src.length <= MAX_IMAGE && IMAGE_RE.test(b.src) ? b.src : "";
        o.alt = str(b.alt, 300);
        break;
      default:
        break;
    }
    return o;
  }

  const INJECT_TEXT = ["time", "source", "headline", "content", "typeLabel", "statedReliability"];
  const META_TEXT = ["from", "to", "subject", "attachment", "author", "handle", "replies", "shares", "likes", "views", "ticketId", "priority"];

  function normaliseInject(x) {
    const types = BK.data.options.injectTypes;
    const o = { type: types.includes(x && x.type) ? x.type : "email" };
    INJECT_TEXT.forEach((k) => (o[k] = str(x && x[k], k === "content" ? 4000 : 400)));
    o.severity = BK.data.options.severities.includes(x && x.severity) ? x.severity : null;
    o.sourceKind = typeof (x && x.sourceKind) === "string" && /^[a-zA-Z]{1,20}$/.test(x.sourceKind) ? x.sourceKind : null;
    const m = (x && x.meta) || {};
    o.meta = {};
    META_TEXT.forEach((k) => m[k] != null && (o.meta[k] = str(m[k], 400)));
    if (Array.isArray(m.thread)) {
      o.meta.thread = m.thread.slice(0, 12).map((turn) => ({ side: turn && turn.side === "out" ? "out" : "in", name: str(turn && turn.name, 120), text: str(turn && turn.text, 1000) }));
    }
    return o;
  }

  function normaliseSlide(s, i) {
    const id = typeof (s && s.id) === "string" && /^[\w-]{1,40}$/.test(s.id) ? s.id : "sl-" + (i + 1) + "-" + Math.random().toString(36).slice(2, 7);
    const base = { id, kind: s && s.kind === "artefact" ? "artefact" : "blocks", template: str(s && s.template, 40), notes: str(s && s.notes, 4000), timerMinutes: Math.max(0, Math.min(120, Math.round(Number(s && s.timerMinutes) || 0))) };
    if (base.kind === "artefact") return Object.assign(base, { inject: normaliseInject(s.inject || {}) });
    return Object.assign(base, { layout: LAYOUTS.includes(s && s.layout) ? s.layout : "content", blocks: (Array.isArray(s && s.blocks) ? s.blocks : []).slice(0, 16).map(normaliseBlock).filter(Boolean) });
  }

  /** The one gate for stored, edited and imported decks. Unknown fields are dropped. */
  function normaliseDeck(d) {
    const src = d || {};
    const seen = new Set();
    const slides = (Array.isArray(src.slides) ? src.slides : []).slice(0, MAX_SLIDES).map(normaliseSlide).map((s) => {
      while (seen.has(s.id)) s.id += "x";
      seen.add(s.id);
      return s;
    });
    return {
      id: typeof src.id === "string" && /^[\w-]{1,60}$/.test(src.id) ? src.id : BK.dom.uid("deck"),
      kind: "deck",
      version: 1,
      title: str(src.title, 160) || t("builder.untitled"),
      summary: str(src.summary, 1000),
      lang: src.lang === "sv" ? "sv" : "en",
      stageTheme: ["dark", "light", "system"].includes(src.stageTheme) ? src.stageTheme : "dark",
      minutes: Math.max(10, Math.min(480, Math.round(Number(src.minutes) || 60))),
      meters: src.meters === true,
      complications: ["off", "manual", "auto"].includes(src.complications) ? src.complications : "off",
      createdAt: str(src.createdAt, 40) || new Date().toISOString(),
      updatedAt: str(src.updatedAt, 40) || new Date().toISOString(),
      slides
    };
  }

  // ---- Deck → runnable exercise ---------------------------------------------------------------------

  /** A snapshot of the deck as an exercise instance (format "custom"), with empty scenario fields. */
  function toExercise(deckIn) {
    const deck = normaliseDeck(deckIn);
    const both = (s) => ({ en: s, sv: s });
    const now = new Date().toISOString();
    return {
      id: BK.dom.uid("ex"),
      createdAt: now,
      updatedAt: now,
      edited: false,
      schema: BK.config.schemaId,
      params: {},
      format: "custom",
      deckId: deck.id,
      templateId: "custom",
      templateVersion: deck.version,
      seed: BK.rng.newSeed(),
      category: "custom",
      emblem: "notes",
      title: both(deck.title),
      scenarioTitle: both(deck.title),
      summary: both(deck.summary),
      entities: { org: { name: "", shortName: "", sector: "technology", city: "", headcount: 0, sites: 0, services: {}, model: both("") }, people: {}, actor: null, clock: {} },
      objectives: [],
      frameworks: { mitre: [], nistCsf: [], iso27001: [] },
      stages: [],
      pages: [],
      hiddenFacts: [],
      groundTruth: { rootCause: null, attackerTimeline: [] },
      resolution: null,
      debrief: { keyLessons: [], assumptionsVsReality: [], strengthsToLookFor: [], commonGaps: [], suggestedActions: [] },
      settings: { audience: "mixed", difficulty: "intermediate", injectRelease: "manual", decisionMode: "options", stageTheme: deck.stageTheme, lang: deck.lang, meters: deck.meters, complications: deck.complications },
      pacing: { totalMinutes: deck.minutes, stages: [] },
      slides: deck.slides.map((s) => JSON.parse(JSON.stringify(s))),
      unresolved: []
    };
  }

  // ---- Templates ---------------------------------------------------------------------------------------

  const P = (en, sv) => ({ en, sv });
  const pick = (pair, lang) => (lang === "sv" ? pair.sv : pair.en);

  const blocks = (layout, list) => ({ kind: "blocks", layout, blocks: list });
  const H = (pair, level) => (lang) => ({ type: "heading", level: level || 1, runs: runs(pick(pair, lang)) });
  const K = (pair) => (lang) => ({ type: "kicker", runs: runs(pick(pair, lang)) });
  const TX = (pair, size, align) => (lang) => ({ type: "text", size: size || "m", align: align || "left", runs: runs(pick(pair, lang)) });
  const UL = (pairs, numbered) => (lang) => ({ type: numbered ? "numbered" : "bullets", items: pairs.map((p) => runs(pick(p, lang))) });
  const Q = (pair, by) => (lang) => ({ type: "quote", align: "left", runs: runs(pick(pair, lang)), by: by ? pick(by, lang) : "" });
  const CO = (pair, tone) => (lang) => ({ type: "callout", tone: tone || "info", runs: runs(pick(pair, lang)) });
  const IC = (icon, pair, tone) => (lang) => ({ type: "icon", icon, label: pick(pair, lang), tone: tone || "info" });
  const KPI = (tiles) => (lang) => ({ type: "kpi", tiles: tiles.map(([l, v, tone]) => ({ label: pick(l, lang), value: v, tone })) });
  const TL = (rows) => (lang) => ({ type: "timeline", rows: rows.map(([time, text]) => ({ time, text: pick(text, lang) })) });
  const OPT = (pairs) => (lang) => ({ type: "options", items: pairs.map((p) => runs(pick(p, lang))) });
  const IMG = () => () => ({ type: "image", src: "", alt: "" });
  const DIV = () => () => ({ type: "divider" });

  function bt(id, group, name, layout, parts, extra) {
    return { id, group, name, make: (lang) => Object.assign(blocks(layout, parts.map((f) => f(lang))), { template: id }, extra || {}) };
  }

  function art(id, group, name, inject) {
    return { id, group, name, make: (lang) => ({ kind: "artefact", template: id, inject: inject(lang) }) };
  }

  const msg = (type, fields) => (lang) => {
    const o = { type, time: fields.time || "09:12", source: pick(fields.source || P("", ""), lang), headline: fields.headline ? pick(fields.headline, lang) : "", content: pick(fields.content, lang), sourceKind: fields.kind || null, severity: fields.severity || null, meta: {} };
    Object.entries(fields.meta || {}).forEach(([k, v]) => (o.meta[k] = typeof v === "string" ? v : pick(v, lang)));
    if (fields.thread) o.meta.thread = fields.thread.map(([side, name, text]) => ({ side, name: name ? pick(name, lang) : "", text: pick(text, lang) }));
    return o;
  };

  const GROUPS = ["basics", "exercise", "messages", "media", "technical", "reports"];

  const TEMPLATES = [
    // ---- Basics ----
    bt("title", "basics", P("Title", "Titel"), "title", [K(P("Exercise", "Övning")), H(P("Exercise title", "Övningens titel")), TX(P("Organisation · date", "Organisation · datum"), "l")]),
    bt("section", "basics", P("Section header", "Avsnittsrubrik"), "section", [K(P("Part 2", "Del 2")), H(P("The next morning", "Nästa morgon"))]),
    bt("text", "basics", P("Heading and text", "Rubrik och text"), "content", [H(P("Heading", "Rubrik")), TX(P("Write the text the room should read here. Keep it short: two or three sentences work best on a big screen.", "Skriv texten som rummet ska läsa här. Håll den kort: två eller tre meningar fungerar bäst på en stor skärm."), "l")]),
    bt("bullets", "basics", P("Bullet list", "Punktlista"), "content", [H(P("Key points", "Viktiga punkter")), UL([P("First point", "Första punkten"), P("Second point", "Andra punkten"), P("Third point", "Tredje punkten")])]),
    bt("numbered", "basics", P("Numbered list", "Numrerad lista"), "content", [H(P("Steps", "Steg")), UL([P("First step", "Första steget"), P("Second step", "Andra steget"), P("Third step", "Tredje steget")], true)]),
    bt("quote", "basics", P("Quote", "Citat"), "center", [Q(P("“We can restore from backup.”", "”Vi kan återställa från backup.”"), P("Head of IT, 08:15", "IT-chefen, 08.15"))]),
    bt("statement", "basics", P("Big statement", "Stort budskap"), "center", [H(P("Nothing is encrypted. Everything is gone.", "Inget är krypterat. Allt är borta."))]),
    bt("image", "basics", P("Image with caption", "Bild med bildtext"), "content", [H(P("What the camera saw", "Vad kameran såg"), 2), IMG(), TX(P("Caption", "Bildtext"), "s")]),
    bt("icons", "basics", P("Three icons", "Tre ikoner"), "content", [H(P("Three things matter", "Tre saker spelar roll")), IC("users", P("People", "Människor")), IC("server", P("Systems", "System")), IC("megaphone", P("Communication", "Kommunikation"))]),
    bt("agenda", "basics", P("Agenda", "Agenda"), "content", [H(P("Today", "I dag")), UL([P("Briefing — 10 min", "Introduktion – 10 min"), P("Three rounds of the scenario — 60 min", "Tre omgångar av scenariot – 60 min"), P("Debrief — 20 min", "Utvärdering – 20 min")], true)]),
    bt("rules", "basics", P("Rules of engagement", "Spelregler"), "content", [H(P("How this works", "Så här fungerar det")), UL([P("No-fault: we test plans and ways of working, not people.", "Utan skuldbeläggning: vi prövar planer och arbetssätt, inte personer."), P("Act as you would in reality, and say your assumptions out loud.", "Agera som ni skulle göra i verkligheten och säg era antaganden högt."), P("Information arrives in stages, and not all of it is reliable.", "Information kommer i omgångar, och allt är inte tillförlitligt.")])]),
    bt("break", "basics", P("Break", "Paus"), "center", [IC("clock", P("Back at 10:30", "Tillbaka 10.30")), H(P("Short break", "Kort paus"))]),
    bt("closing", "basics", P("Closing", "Avslutning"), "center", [H(P("Thank you", "Tack")), TX(P("Your improvement plan follows within a week.", "Er förbättringsplan kommer inom en vecka."), "l", "center")]),

    // ---- Exercise ----
    bt("situation", "exercise", P("Situation", "Läget"), "content", [K(P("Stage 1 · Friday 16:55", "Skede 1 · fredag 16.55")), H(P("Something is wrong with the file servers", "Något är fel med filservrarna")), TX(P("Describe the scene: who notices what, where, and what it means for the business. Then say what is at stake.", "Beskriv scenen: vem märker vad, var, och vad det betyder för verksamheten. Säg sedan vad som står på spel."), "l")]),
    bt("questions", "exercise", P("Discussion questions", "Diskussionsfrågor"), "content", [K(P("Discuss", "Diskutera")), UL([P("What do you know, and what are you assuming?", "Vad vet ni, och vad antar ni?"), P("Who needs to know in the next hour?", "Vem behöver veta det inom en timme?"), P("What is your first decision?", "Vilket är ert första beslut?")], true)], { timerMinutes: 8 }),
    bt("decision", "exercise", P("Decision A–D", "Beslut A–D"), "content", [K(P("Decide", "Besluta")), H(P("What is your first move?", "Vad är ert första drag?"), 2), OPT([P("Isolate the affected systems now.", "Isolera de drabbade systemen nu."), P("Gather more information first.", "Samla mer information först."), P("Escalate to management and wait.", "Eskalera till ledningen och vänta.")])], { timerMinutes: 5 }),
    bt("twist", "exercise", P("Twist", "Vändning"), "twist", [K(P("New information", "Ny information")), H(P("The backups were encrypted two days ago.", "Säkerhetskopiorna krypterades för två dagar sedan.")), TX(P("Assumption challenged: we can restore from backup.", "Ifrågasatt antagande: vi kan återställa från backup."), "m")]),
    bt("complication", "exercise", P("Complication card", "Komplikationskort"), "center", [CO(P("Complication · People — your incident lead is unreachable for the next hour.", "Komplikation · Människor – er incidentledare går inte att nå den närmaste timmen."), "warn")]),
    bt("kpi", "exercise", P("Key figures", "Nyckeltal"), "content", [H(P("The situation in numbers", "Läget i siffror"), 2), KPI([[P("Systems affected", "Drabbade system"), "126", "danger"], [P("Hours since detection", "Timmar sedan upptäckt"), "3", "warn"], [P("Customers waiting", "Väntande kunder"), "4 200", "info"]])]),
    bt("timeline", "exercise", P("Timeline", "Tidslinje"), "content", [H(P("What happened when", "Vad som hände när"), 2), TL([["16:55", P("Service desk ticket: files cannot be opened", "Ärende till servicedesken: filer går inte att öppna")], ["17:10", P("Security alert: mass file changes", "Säkerhetslarm: massändring av filer")], ["17:30", P("The CEO calls", "Vd ringer")]])]),
    bt("roles", "exercise", P("Roles at the table", "Roller vid bordet"), "content", [H(P("At the table", "Vid bordet"), 2), UL([P("Incident lead", "Incidentledare"), P("IT operations", "IT-drift"), P("Communications", "Kommunikation"), P("Legal and data protection", "Juridik och dataskydd")])]),
    bt("lessons", "exercise", P("Lessons learned", "Lärdomar"), "content", [H(P("Lessons learned", "Lärdomar")), UL([P("Decide who may stop operations before you need to.", "Bestäm vem som får stoppa verksamheten innan ni behöver det."), P("Test restores, not only backups.", "Testa återställningar, inte bara säkerhetskopior."), P("The notification clock starts at awareness.", "Klockan för anmälan startar vid kännedom.")])]),
    bt("callout", "exercise", P("Warning callout", "Varningsruta"), "content", [H(P("Before you decide", "Innan ni beslutar"), 2), CO(P("The regulator expects an early warning within 24 hours of awareness.", "Tillsynsmyndigheten förväntar sig en tidig varning inom 24 timmar från kännedom."), "warn")]),

    // ---- Messages ----
    art("email", "messages", P("Email", "E-post"), msg("email", { source: P("Insurance", "Försäkringsbolaget"), kind: "insurer", content: P("The policy requires notification within 24 hours and our approval before you engage an incident response firm.", "Försäkringen kräver anmälan inom 24 timmar och vårt godkännande innan ni anlitar en incidentresponsfirma."), meta: { from: "claims@insurer.example", subject: P("Notification requirements", "Krav på anmälan") } })),
    art("phishing", "messages", P("Phishing email", "Nätfiskemejl"), msg("phishingEmail", { source: P("IT support", "IT-supporten"), kind: "attacker", content: P("Due to tonight's problem, please run the attached tool to restore access. Services will work again immediately.", "På grund av nattens problem, kör det bifogade verktyget för att få tillbaka åtkomsten. Tjänsterna fungerar igen direkt."), meta: { from: "it-support@company-help.example", subject: P("Fix for login errors", "Lösning på inloggningsfelen"), attachment: "fix-tool.zip" } })),
    art("chat", "messages", P("Team chat", "Teamchatt"), msg("chat", { source: P("Alex Berg, IT operations", "Alex Berg, IT-drift"), kind: "person", content: P("It's just the nightly sync job again. Please don't touch the network.", "Det är bara nattsynken igen. Rör inte nätverket."), headline: P("#incident", "#incident") })),
    art("chat-thread", "messages", P("Chat conversation", "Chattkonversation"), msg("chat", { source: P("Alex Berg", "Alex Berg"), kind: "person", content: P("", ""), headline: P("#incident", "#incident"), thread: [["in", P("Alex Berg", "Alex Berg"), P("Are the file servers down for you too?", "Är filservrarna nere för dig också?")], ["out", P("Kim Lund", "Kim Lund"), P("Yes, since five. I've opened a ticket.", "Ja, sedan fem. Jag har öppnat ett ärende.")], ["in", P("Alex Berg", "Alex Berg"), P("Don't restart anything until security has looked.", "Starta inte om något förrän säkerhet har tittat.")]] })),
    art("exec", "messages", P("Executive message", "Meddelande från ledningen"), msg("executiveMessage", { source: P("Sam Ek, Chief Executive", "Sam Ek, vd"), kind: "person", content: P("I have promised our biggest customers we will deliver on Monday. Tell me what it takes.", "Jag har lovat våra största kunder leverans på måndag. Säg vad som krävs.") })),
    art("sms", "messages", P("Text message", "Sms"), msg("sms", { source: P("Unknown number", "Okänt nummer"), content: P("This is your IT provider. Please re-enable our access so we can help you.", "Det här är er IT-leverantör. Aktivera vår åtkomst igen så att vi kan hjälpa er.") })),
    art("sms-thread", "messages", P("Text conversation", "Sms-konversation"), msg("sms", { source: P("Jo Nyberg", "Jo Nyberg"), kind: "person", content: P("", ""), thread: [["out", P("On call", "Jouren"), P("Your account approved 40 sign-in prompts tonight. Was that you?", "Ditt konto godkände 40 inloggningsförfrågningar i natt. Var det du?")], ["in", P("", ""), P("Sorry, my phone kept buzzing and I pressed yes. Is something wrong?", "Förlåt, telefonen surrade hela tiden och jag tryckte ja. Är något fel?")]] })),
    art("call", "messages", P("Phone call", "Telefonsamtal"), msg("phoneTranscript", { source: P("Sam Ek, Chief Executive", "Sam Ek, vd"), kind: "person", content: P("I'm hearing the file servers are down. Is this serious? I'm meeting the chair at eight.", "Jag hör att filservrarna ligger nere. Är det allvarligt? Jag träffar ordföranden klockan åtta.") })),
    art("call-thread", "messages", P("Call transcript", "Samtalsutskrift"), msg("phoneTranscript", { source: P("Bank fraud desk", "Bankens bedrägeriavdelning"), kind: "bank", content: P("", ""), thread: [["out", P("Finance", "Ekonomi"), P("We paid an invoice to a new account last week. We think it was fraud.", "Vi betalade en faktura till ett nytt konto förra veckan. Vi tror att det var bedrägeri.")], ["in", P("Fraud desk", "Bedrägeriavdelningen"), P("Report it today and we can ask the receiving bank to freeze what is left.", "Anmäl i dag så kan vi be mottagarbanken frysa det som finns kvar.")]] })),
    art("ransom", "messages", P("Ransom note", "Utpressningsbrev"), msg("ransomNote", { headline: P("YOUR FILES ARE ENCRYPTED", "ERA FILER ÄR KRYPTERADE"), content: P("We have your data. Contact us within 72 hours or it will be published.", "Vi har er data. Kontakta oss inom 72 timmar annars publiceras den.") })),

    // ---- Media and outside world ----
    art("social", "media", P("Social media post", "Inlägg i sociala medier"), msg("socialPost", { source: P("", ""), kind: "socialMedia", headline: P("Shared 4,000 times", "Delat 4 000 gånger"), content: P("Don't pay any invoice from them — they've been hacked and they're hiding it.", "Betala inga fakturor från dem – de har blivit hackade och mörkar det."), meta: { author: "Anonymous account", handle: "@anon_4421" } })),
    art("video", "media", P("Video post", "Videoinlägg"), msg("socialPost", { source: P("", ""), kind: "socialMedia", content: P("Video, 0:42: the CEO, in front of a familiar office wall, says: “We wanted to do something special for you.”", "Video, 0:42: vd framför en välbekant kontorsvägg säger: ”Vi ville göra något speciellt för er.”") })),
    art("news", "media", P("News headline", "Nyhetsrubrik"), msg("newsHeadline", { source: P("The Daily Ledger", "Dagbladet"), headline: P("Health details of thousands left open online", "Hälsouppgifter för tusentals låg öppet på nätet"), content: P("The file had been reachable for over a year, despite a warning.", "Filen hade varit nåbar i över ett år, trots en varning.") })),
    art("media", "media", P("Media enquiry", "Mediefråga"), msg("mediaEnquiry", { source: P("Media", "Media"), kind: "media", headline: P("Request for comment", "Begäran om kommentar"), content: P("A reporter: “Can you confirm you have been attacked, and whether customer data is affected? We publish at 14:00.”", "En reporter: ”Kan ni bekräfta att ni har blivit angripna, och om kunddata berörs? Vi publicerar klockan 14.”") })),
    art("complaint", "media", P("Customer complaint", "Kundklagomål"), msg("customerComplaint", { source: P("Customer", "Kund"), kind: "customer", content: P("“We have paid for premium support for three years. Were we ever getting it?”", "”Vi har betalat för premiumsupport i tre år. Fick vi den någonsin?”") })),
    art("employee", "media", P("Employee report", "Rapport från anställd"), msg("employeeReport", { source: P("Employee", "Medarbetare"), kind: "employee", content: P("A colleague mentions that the administrator has seemed frightened lately and takes calls outside.", "En kollega nämner att administratören verkat rädd på sistone och tar samtal utomhus.") })),
    art("regulator", "media", P("Regulator letter", "Brev från myndighet"), msg("regulatorLetter", { source: P("Supervisory authority", "Tillsynsmyndigheten"), headline: P("Request for information", "Begäran om information"), content: P("Please submit an early warning and incident notification without delay, regardless of the cause.", "Lämna en tidig varning och en incidentanmälan utan dröjsmål, oavsett orsak.") })),
    art("supplier", "media", P("Supplier notice", "Meddelande från leverantör"), msg("supplierNotice", { source: P("Supplier", "Leverantör"), headline: P("Service suspended", "Tjänsten avstängd"), content: P("Your connection is suspended until an independent assessor confirms the issue is resolved.", "Er anslutning är avstängd tills en oberoende granskare bekräftar att problemet är löst.") })),
    art("status", "media", P("Status page", "Statussida"), msg("statusPage", { source: P("Service status", "Driftstatus"), headline: P("Major outage", "Stort avbrott"), content: P("We are investigating increased error rates. Next update within 60 minutes.", "Vi undersöker ökade felfrekvenser. Nästa uppdatering inom 60 minuter.") })),

    // ---- Technical ----
    art("siem", "technical", P("Security alert", "Säkerhetslarm"), msg("siemAlert", { source: P("Log monitoring", "Loggövervakning"), severity: "critical", headline: P("Mass file changes", "Massändring av filer"), content: P("Over 2,000 files renamed in five minutes on SRV-FILE-02. Started 16:52.", "Över 2 000 filer bytte namn på fem minuter på SRV-FILE-02. Började 16.52.") })),
    art("edr", "technical", P("Endpoint alert", "Klientlarm"), msg("edrAlert", { source: P("Endpoint protection", "Klientskydd"), severity: "high", content: P("Suspicious process tried to delete shadow copies on WKS-FIN-114. Blocked.", "Misstänkt process försökte radera skuggkopior på WKS-FIN-114. Blockerad.") })),
    art("auth", "technical", P("Sign-in log", "Inloggningslogg"), msg("authLog", { source: P("Identity platform", "Identitetsplattformen"), severity: "high", content: P("Sign-in: user anna.l · device: unknown · location: abroad · method: refresh token · result: success.", "Inloggning: användare anna.l · enhet: okänd · plats: utlandet · metod: förnyelsetoken · resultat: lyckad.") })),
    art("log", "technical", P("Log excerpt", "Loggutdrag"), msg("logExcerpt", { source: P("IT operations", "IT-drift"), severity: "medium", content: P("Scheduled task created by svc-maint. Runs 03:00 daily. Script deletes payroll batch. Created six weeks ago.", "Schemalagd uppgift skapad av svc-maint. Körs 03.00 dagligen. Skriptet raderar lönekörningen. Skapad för sex veckor sedan.") })),
    art("network", "technical", P("Network evidence", "Nätverksbelägg"), msg("networkEvidence", { source: P("Security operations", "Säkerhetscentralen"), severity: "high", content: P("120 GB outbound to an unknown host over three nights, between 01:00 and 04:00.", "120 GB utgående till en okänd värd under tre nätter, mellan 01.00 och 04.00.") })),
    art("forensic", "reports", P("Forensic finding", "Forensiskt fynd"), msg("forensicFinding", { source: P("Forensic analysis", "Forensisk analys"), severity: "high", headline: P("Initial access", "Första intrånget"), content: P("Access through an unpatched VPN node using valid contractor credentials, five days before encryption.", "Åtkomst via en opatchad VPN-nod med giltiga konsultuppgifter, fem dagar före krypteringen.") })),
    art("intel", "reports", P("Threat intelligence", "Hotunderrättelse"), msg("threatIntel", { source: P("Threat intelligence", "Hotunderrättelser"), severity: "medium", content: P("The group typically disables backups first and publishes data within ten days.", "Gruppen slår vanligen ut säkerhetskopiorna först och publicerar data inom tio dagar.") })),
    art("advisory", "reports", P("Advisory", "Säkerhetsvarning"), msg("advisory", { source: P("National CSIRT", "Nationell CSIRT"), severity: "critical", headline: P("Actively exploited vulnerability", "Aktivt utnyttjad sårbarhet"), content: P("Patch internet-facing appliances immediately and check for signs of compromise.", "Patcha internetexponerade enheter omedelbart och leta efter tecken på intrång.") })),
    art("backup", "reports", P("Backup report", "Backuprapport"), msg("backupReport", { source: P("Backup system", "Backupsystemet"), severity: "high", content: P("Last successful full backup nine days ago. Nightly jobs since: failed.", "Senaste lyckade fullständiga säkerhetskopia för nio dagar sedan. Nattliga jobb sedan dess: misslyckade.") })),
    art("impact", "reports", P("Impact report", "Konsekvensrapport"), msg("impactReport", { source: P("Business continuity", "Kontinuitet"), severity: "medium", content: P("Orders waiting: 3,400. Shipment data held only by the supplier. Penalty from day 3.", "Väntande order: 3 400. Sändningsdata finns bara hos leverantören. Vite från dag 3.") })),
    art("ticket", "reports", P("Ticket", "Ärende"), msg("ticket", { source: P("Service desk", "Servicedesk"), severity: "low", headline: P("Files cannot be opened", "Filer går inte att öppna"), content: P("Several users in finance report files with a strange extension.", "Flera användare på ekonomi rapporterar filer med en konstig filändelse."), meta: { ticketId: "INC-20431", priority: "P2" } }))
  ];

  const BY_ID = {};
  TEMPLATES.forEach((x) => (BY_ID[x.id] = x));

  /** A fresh slide from a template, in the deck's language, with a new id. */
  function fromTemplate(id, lang) {
    const tpl = BY_ID[id] || BY_ID.text;
    return normaliseSlide(Object.assign({ id: BK.dom.uid("sl") }, tpl.make(lang || "en")), 0);
  }

  function newDeck(lang) {
    const l = lang === "sv" ? "sv" : "en";
    return normaliseDeck({ title: t("builder.untitled", null, l), lang: l, slides: [fromTemplate("title", l), fromTemplate("situation", l)] });
  }

  /** A short plain-text label for a slide (thumbnails, lists, presenter). */
  function slideLabel(s, lang) {
    if (!s) return "";
    if (s.kind === "artefact") return (s.inject.headline || s.inject.source || t("injectType." + s.inject.type, null, lang)).slice(0, 80);
    const h = (s.blocks || []).find((b) => b.type === "heading") || (s.blocks || []).find((b) => b.runs && runsText(b.runs));
    return h ? runsText(h.runs).slice(0, 80) : t("builder.slide", null, lang);
  }

  BK.engine.custom = { LAYOUTS, BLOCK_TYPES, TONES, SIZES, GROUPS, TEMPLATES, IMAGE_RE, MAX_IMAGE, runs, runsText, normaliseRuns, normaliseBlock, normaliseSlide, normaliseDeck, toExercise, fromTemplate, newDeck, slideLabel, templateById: (id) => BY_ID[id] || null };
})();
