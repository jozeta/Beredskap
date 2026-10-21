# Claude Code Prompt — Beredskap: Cyber Crisis Exercise Generator (v2)

> Paste this whole file into Claude Code, or save it as `SPEC.md` in an empty repo and instruct: *"Build the app described in SPEC.md, following the phased plan in section 17. Stop and summarise after each phase."*

---

## 1. Mission

Build **Beredskap**, a single-page web application (HTML, CSS, vanilla JavaScript) that generates randomized, IT-security-focused tabletop crisis exercises and facilitates them full-screen, slide by slide, on a projector or large display.

An **operator/facilitator** creates an exercise, selects a scenario and parameters, privately previews and optionally edits the generated exercise, then starts it. The exercise is presented like a PowerPoint deck and unfolds in **3–10 stages**. Each stage reveals new information (injects on a timeline, evidence, charts, artefacts such as emails or ransom notes) and ends with **questions, challenges and decision points** for group discussion. Later stages deliberately add information that **challenges or invalidates earlier assumptions and decisions** — not merely increasing severity.

The app ships with **20 professionally authored scenario templates**. Each generation is **dynamic but coherent**: organisation, people, threat actor, numbers, times and selected inject variants change, while the scenario's causal logic stays intact.

Core principles, in priority order:
1. **Coherent incident logic** — every scenario has a fixed, hidden ground truth; the story never silently rewrites established history.
2. **Progressive disclosure** — the audience sees only what is known at the current point. Facilitator-only material is a **confidentiality boundary**, treated like a security control.
3. **Projector-grade presentation** — a real slide deck, not a dashboard shrunk to fit.
4. **Offline and private** — runs from `file://`, no backend, no network calls, no telemetry, no AI API. The app must never imply it uses AI to generate narratives; content comes from authored templates, structured variants and seeded randomization.

Mandatory cross-cutting requirements: English and Swedish throughout, light and dark themes, clean Nordic design, custom SVG icons, charts and graphics.

### Name and identity
- The product name is **Beredskap** (Swedish for *preparedness/readiness*). It is a proper noun and is **never translated**: the English UI also says "Beredskap". English UI may use the tagline "Cyber crisis exercises"; Swedish uses "Övningar i cyberkris".
- Use the name in the `<title>`, app header, title slides (small wordmark in a corner), printed reports, export filenames (`beredskap-<scenario>-<seed>-<date>.json`) and README.
- Design a simple custom SVG wordmark and app mark in the Nordic style: a minimal line symbol (e.g. a shield or a fjord line under a horizon) in `--accent`, with the wordmark set in the system font at medium weight with slight letter-spacing. Also provide it as an SVG favicon.
- Technical identifiers: global namespace `window.BK`, `localStorage` key prefix `beredskap:`, `BroadcastChannel` name `beredskap`, export schema id `beredskap.exercise`.

---

## 2. Technical constraints

| Area | Requirement |
|---|---|
| Stack | Plain HTML5, CSS3 (custom properties), vanilla ES2020 JavaScript. **No frameworks, no Bootstrap, no chart libraries, no bundler, no npm.** Custom CSS keeps the Nordic design consistent and avoids CDN dependencies that break offline use. |
| Loading | Classic `<script>` tags (not ES modules) so the app works from `file://`. Also works unchanged from any static host (`python -m http.server`, Azure Static Web Apps, GitHub Pages). Everything lives under one global namespace: `window.BK`. |
| Fonts | System font stack only: `"Inter", "Segoe UI Variable", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif`. `font-variant-numeric: tabular-nums` on timers and KPIs. |
| Persistence | `localStorage` for preferences, exercises and sessions (namespaced keys, schema-versioned). JSON export is the archival mechanism. Show a visible "Saved" status after autosave. |
| Browser APIs | Fullscreen API, `BroadcastChannel("beredskap")` (presenter ↔ stage sync), `Intl` for formatting, `crypto.getRandomValues` only to create new seeds. |
| Safe rendering | Build DOM with `createElement` / `textContent`. **Never** use `innerHTML` with scenario, generated or imported content; `innerHTML` is allowed only for static, author-controlled SVG icon markup. No `eval`, `new Function`, or string-based timers. |
| Code style | Clarity over cleverness, small named functions, a header comment per file stating its responsibility, inline comments explaining intent. Error handling is deliberately limited to the places listed in section 15. |

### File structure

```
beredskap/
├── index.html                    # App shell, script tags in dependency order
├── tests.html                    # In-browser test runner (section 16)
├── css/
│   ├── tokens.css                # Design tokens: colours, spacing, type scale, light/dark
│   ├── app.css                   # Operator UI
│   ├── stage.css                 # Full-screen audience stage (16:9)
│   ├── presenter.css             # Facilitator presenter view
│   └── print.css                 # Facilitator guide, role cards, after-action report
├── js/
│   ├── core/namespace.js         # window.BK bootstrap
│   ├── core/store.js             # localStorage wrapper, schema versions, autosave status
│   ├── core/rng.js               # Seeded PRNG (mulberry32) + helpers
│   ├── core/i18n.js              # UI strings EN/SV + t() helper + missing-key report
│   ├── core/theme.js             # Light/dark/system handling
│   ├── core/dom.js               # Safe element builders (el(), text(), svgIcon())
│   ├── data/names.js             # Curated name pools per locale
│   ├── data/roles.js             # Exercise roles EN/SV
│   ├── data/environments.js      # Technology-environment vocabularies (section 4)
│   ├── engine/template.js        # Placeholder resolver bound to structured entities
│   ├── engine/generator.js       # Template + params + seed → exercise instance
│   ├── engine/validator.js       # Template and instance validation (section 5.5)
│   ├── engine/session.js         # Live run state, inject release, decision & observation logs
│   ├── engine/pacing.js          # Stage timing derived from total duration
│   ├── graphics/icons.js         # Custom SVG icon sprite + scenario emblems
│   ├── graphics/charts.js        # SVG chart renderers
│   ├── graphics/artefacts.js     # Email, SMS, ransom note, news, ticket, log renderers
│   ├── scenarios/_registry.js    # BK.scenarios.register()
│   ├── scenarios/s01-*.js … s20-*.js
│   ├── io/export.js              # JSON, Markdown, CSV, printable HTML
│   ├── io/import.js              # Schema validation of imported JSON
│   ├── ui/router.js              # Hash router
│   ├── ui/dashboard.js
│   ├── ui/library.js
│   ├── ui/wizard.js
│   ├── ui/editor.js
│   ├── ui/presenter.js
│   ├── ui/stage.js
│   └── ui/debrief.js
└── README.md
```

---

## 3. Design system — "Nordic"

Calm, restrained, generous whitespace, soft neutrals, one strong accent, precise typography, thin-line iconography. Functional, legible from the back of a room, nothing decorative without purpose. No gradients-for-effect, glassmorphism, neon or "hacker" aesthetics.

### Colour tokens (`tokens.css`)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F5F6F3` | `#11161B` | Page / stage background |
| `--surface` | `#FFFFFF` | `#18222B` | Cards, panels |
| `--surface-2` | `#ECEDE8` | `#202D38` | Secondary panels, tracks |
| `--ink` | `#1C2833` | `#EEF2F5` | Primary text |
| `--ink-muted` | `#5E6B75` | `#A3B0BA` | Secondary text |
| `--line` | `#D8DDDC` | `#33424E` | Borders, gridlines |
| `--accent` | `#2F5B72` (fjord) | `#85B7CF` | Primary actions, highlights |
| `--ok` | `#2E6E4E` (moss) | `#8DC0A0` | Confirmed / resolved |
| `--warn` | `#94660A` (birch amber) | `#E0B160` | Warnings, unverified |
| `--danger` | `#A8362B` (lingon) | `#E8807A` | Critical injects, attacker artefacts |
| `--info` | `#5D6F96` (dusk) | `#A6B6D8` | Neutral info injects |

- Theme toggle `light | dark | system` via `:root[data-theme]` plus `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`.
- Operator UI theme and **stage theme are independent settings** (a dark stage suits dim rooms).
- Verify contrast: WCAG AA for the operator UI; aim for AAA on stage body text to survive projector washout.

### Typography and layout
- Operator UI scale: 14 / 16 / 20 / 28 / 40 px. 8px spacing grid. Radius 10px (cards), 999px (pills). Hairline borders, at most one soft shadow level.
- **Stage** is a fixed **1920×1080 logical canvas** scaled with `transform: scale()` to fit any viewport (centred, letterboxed). Stage body ≥ 32px, headings 56–88px, KPI numbers 96–140px, max ~7 lines of bullets. Test at 1280×720, 1920×1080, 2560×1440 and 3840×2160.
- Motion: 200–300ms fades/slides and staggered reveals; disabled under `prefers-reduced-motion`.

### Custom icon set (`icons.js`)
Inline SVG `<symbol>` sprite, 24×24 grid, 1.5px stroke, rounded caps/joins, `currentColor`. Minimum set:
`shield, shield-alert, bug, skull-lock, hook, mail, mail-alert, user, users, user-secret, server, database, cloud, cloud-off, network, wifi-off, globe, flood, key, lock, unlock, fingerprint, eye, eye-off, terminal, code-branch, package, factory, hospital, phone, sms, newspaper, megaphone, scale, coins, clock, hourglass, timeline, flag, decision, question, lightbulb, check, cross, warning, fire, power, thermometer, link, dns, chart-line, chart-bar, gauge, play, pause, next, prev, fullscreen, sun, moon, globe-lang, settings, dice, save, download, print, edit, notes, verified, unverified, misleading, disputed`.
Plus **20 scenario emblems** (64×64 compositions inside a circle) for library cards and title slides.

### Graphics
Title slides use a seeded abstract Nordic motif (layered fjord contour lines or a low-poly ridge), coloured by scenario category; same seed ⇒ same artwork. No photographs, no emoji, no real brand logos or product UIs.

---

## 4. Configuration (exercise wizard)

Quick path: pick scenario (or "Surprise me") → Generate → Preview → Start, under one minute with defaults. Advanced options sit in a collapsed "Advanced" section.

**Basic**
- Exercise title (defaults to scenario title).
- Scenario (or random within a category).
- Language: English / Svenska.
- Difficulty: **Introductory** (clear evidence, basic response) · **Intermediate** (cross-team coordination) · **Advanced** (ambiguous and misleading evidence, conflicting priorities) · **Executive** (continuity, legal, reputation, decision authority).
- Duration: 30 / 60 / 90 / 180 minutes (or custom).
- Number of stages (slider bound to the template's min/max, within 3–10).
- Audience: technical (SOC/IT/IR) · executive/crisis leadership · mixed. Audience selects which question set and slide density each stage uses (every stage authors both a technical and an executive question set; "mixed" draws from both).
- Stage theme: light / dark / system.

**Advanced**
- Sector (random or fixed) and organisation size (small/medium/large — scales numbers, number of sites, headcount).
- Fixed organisation name (optional).
- **Technology environment**: generic · Microsoft 365/Entra/Azure · Google Workspace/GCP · AWS · on-premises · hybrid · OT/ICS. Drives vocabulary through `environments.js` (e.g. a generic "EDR alert" becomes "Defender for Endpoint alert", "identity provider" becomes "Entra ID", "storage bucket" becomes "storage account container" or "S3 bucket"). Text references only; no vendor logos or UI imitations.
- Jurisdiction: Sweden · EU · generic (controls regulator and notification references).
- External pressure toggles: media, regulator, law enforcement, suppliers, customer escalation. Disabling one removes or substitutes the injects tagged with it.
- Inject density per stage: low / normal / high (selects among optional injects).
- Participating roles (checkboxes). Injects or questions aimed at an absent role are re-targeted or shown as "Role not present — who covers this?". Optionally map real participant names onto roles instead of random names.
- Learning objectives: pre-checked from the template, operator can deselect or add free-text objectives.
- Discussion time per stage (auto from pacing, overridable).
- Inject release: facilitator-controlled (default) or auto-suggested on timer.
- Decision recording: open-ended only · open-ended + options where authored.
- Seed (editable, human-readable like `FJORD-4821`) + Reroll.

Every control must change the generated exercise; no decorative settings.

---

## 5. Scenario engine

### 5.1 Three separate data layers
1. **Template** — authored, immutable, versioned (`id`, `version`). Lives in `scenarios/*.js`.
2. **Exercise instance** — output of `generate(template, params, seed)`: fully resolved entities, stages, slides, chart data, hidden facts. Stored with `templateId`, `templateVersion`, `params`, `seed`. Operator edits apply here, never to the template.
3. **Session** — live run state for one delivery of an instance: current stage/slide, released/postponed/skipped injects, timers, decision log, observations, notes, objectives addressed. Multiple sessions can run from one instance.

Same template version + params + seed ⇒ byte-identical instance (before edits).

### 5.2 Seeded RNG (`rng.js`)
`mulberry32(seed)` with `int, pick, pickN (no duplicates), shuffle, chance, weighted`. Use **named sub-streams** (`rng.fork("people")`, `rng.fork("numbers")`) so adding a new optional inject to a template does not reshuffle every name.

### 5.3 Structured entities, not string replacement
The generator first builds an **entity graph**, then renders text from it:
- `organisation` — name, short name, sector, size, sites, city, domain, business model, **critical services** (with dependencies and RTO/RPO), crown jewels.
- `people` — one person per role, with name, title, department, reporting line, contact style. Fixed for the entire exercise (the CISO stays the CISO).
- `actor` — fictional name, type (criminal, state-linked, hacktivist, insider, unknown), motivation, capability tier.
- `suppliers` — MSP, cloud provider, software vendor, ISP, as the template requires.
- `assets` — hostnames (`SRV-FILE-03`, `WKS-FIN-117`), applications, accounts, IPs, domains.
- `clock` — in-scenario start time honouring template constraints (e.g. Friday after 16:00, weekend, holiday eve).

Text uses placeholders bound to that graph: `{{org.name}}`, `{{org.service.primary}}`, `{{person.ciso.name}}`, `{{person.ceo.firstName}}`, `{{actor.name}}`, `{{supplier.msp}}`, `{{asset.fileServer}}`, `{{num.ransom|currency}}`, `{{num.hosts|number}}`, `{{time.T+45|clock}}`. Formatters respect locale (`sv-SE` / `en-GB`; SEK for Swedish, EUR for English unless jurisdiction overrides).

### 5.4 Name and value pools (`names.js`)
Curated, culturally appropriate, ≥ 60 entries where sensible:
- People: Swedish pool (diverse, reflecting modern Sweden) and an international English pool; mixed genders; no real public figures.
- Organisations: `prefix + core + suffix` per sector (`Norrsken Logistik AB`, `Fjällvik Energi`, `Polaris Health Group`); `AB` suffix for Swedish, `Ltd/Group` for English.
- Threat actors: pattern-generated fictional names ("Silent Lynx", "Grey Draugr", "NORDLOCK", "#OpNorthwind"). **Never real APT, ransomware or hacktivist group names.**
- Domains: only reserved names (`example.com`, `example.org`, `example.net`, subdomains of these, or `.example` TLD), e.g. `norrsken-logistik.example`. IPs only from RFC 5737 ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24).

### 5.5 Validation (`validator.js`)
Run on every template at load and on every instance before **Start** is enabled. Fail with an actionable message listing the problems:
- 3–10 stages; every stage has participant-facing content, ≥ 2 questions, and a decision point or explicit "no decision" reason.
- Every stage after the first has a `twist` and `assumptionChallenged`; the template has ≥ 2 stages whose twist changes the participants' understanding of the cause or scope.
- All placeholders resolve; all referenced roles, injects, decisions, services, hidden facts and branches exist; no duplicate IDs.
- Inject timestamps are monotonic within the timeline; dependencies precede dependants; no inject reveals a hidden fact before its `revealStage`.
- Both languages present for every text field.
- Branches converge back to the default progression.

---

## 6. Scenario template model

One file per scenario. All human-readable text is `{ en, sv }`. Swedish must be natural, idiomatic Swedish written at native level, not literal translation, using Swedish crisis vocabulary (*krisledningsgrupp, lägesbild, inriktningsbeslut, kontinuitetsplan, personuppgiftsincident, tjänsteman i beredskap*).

```js
BK.scenarios.register({
  id: "s01-ransomware-vpn",
  version: 1,
  category: "ransomware",
  archetype: "obvious-incident-hidden-secondary",   // see section 13
  emblem: "skull-lock",
  title:   { en: "Locked Out at Close of Business", sv: "Utelåsta vid arbetsdagens slut" },
  summary: { en: "...", sv: "..." },
  learningObjectives: [
    { id: "lo1", text: { en: "Decide containment scope under business pressure", sv: "..." } },
    { id: "lo2", text: { en: "Assess backup trustworthiness before recovery", sv: "..." } }
  ],
  mitre: ["T1133", "T1078", "T1490", "T1486", "T1567"],
  frameworks: { nistCsf: ["RS.MA", "RS.CO", "RC.RP"], iso27001: ["A.5.24", "A.5.26", "A.8.13"] },
  minStages: 4, maxStages: 8,
  constraints: { startWindow: "friday-evening", sectors: ["logistics", "retail", "manufacturing"] },
  variables: {
    ransom:  { min: 2000000, max: 25000000, step: 250000, scaleBy: "size" },
    hosts:   { min: 40, max: 900, scaleBy: "size" },
    gbExfil: { min: 20, max: 400 }
  },
  roles: ["incidentCommander", "ciso", "socLead", "itOps", "serviceOwner", "legal", "comms", "ceo", "dpo"],

  // The canonical truth of what actually happened. Never shown on stage before its reveal.
  groundTruth: {
    rootCause: { en: "Initial access via unpatched VPN appliance using credentials from an infostealer log; backup admin account compromised 3 days earlier.", sv: "..." },
    attackerTimeline: [ { at: -4320, text: {...} }, { at: -2880, text: {...} } ]  // minutes before T+0
  },
  hiddenFacts: [
    { id: "hf-backups", revealStage: "p3", text: { en: "Backup repositories were encrypted 48 hours before T+0.", sv: "..." } },
    { id: "hf-exfil",   revealStage: "p4", text: { en: "{{num.gbExfil}} GB was exfiltrated over three nights.", sv: "..." } }
  ],

  stages: [
    {
      id: "p1",
      mandatory: true,
      clock: 0,
      title:     { en: "Something is wrong with the file servers", sv: "Något är fel med filservrarna" },
      narrative: { en: "At {{time.T+0|clock}} the service desk receives ...", sv: "..." },
      injects: [
        {
          id: "i1-1", at: 0, type: "ticket", source: "serviceDesk",
          severity: "low", reliability: "confirmed", visibility: "public",
          headline: {...}, content: {...},
          tests: ["lo1"],
          expectedResponse: { en: "Recognise pattern; escalate to SOC; start incident log.", sv: "..." },
          facilitatorNote: {...},
          requires: [], pressure: null
        },
        {
          id: "i1-2", at: 25, type: "chat", source: "person.serviceOwner",
          severity: "medium", reliability: "misleading", visibility: "public",
          content: { en: "It's just the nightly sync job again, we've seen this before.", sv: "..." },
          facilitatorNote: { en: "Intentionally misleading reassurance from the business side. Watch whether the group verifies it.", sv: "..." },
          optional: true
        }
      ],
      charts: [ { type: "line", metric: "fileRenameRate", unit: "ops/min", from: "groundTruth" } ],
      questions: {
        technical: [ { text: {...}, roles: ["socLead", "itOps"] } ],
        executive: [ { text: {...}, roles: ["ceo", "incidentCommander"] } ]
      },
      challenges: [ { text: { en: "Shutting the VPN stops the warehouse night shift.", sv: "..." } } ],
      decision: {
        id: "d1",
        question: { en: "Do you disconnect the site from the network now?", sv: "..." },
        authority: "incidentCommander",
        options: [   // optional; open-ended is always allowed
          { key: "A", text: {...} }, { key: "B", text: {...} }, { key: "C", text: {...} }
        ],
        knowns: [ {...} ], uncertainties: [ {...} ],
        tradeoffs: { operational: {...}, security: {...}, legal: {...}, reputational: {...} },
        evaluation: [ { en: "Defines who has authority to accept business disruption", sv: "..." } ],
        discussionMinutes: 8
      },
      facilitator: { notes: {...}, expected: {...}, hints: [ {...} ] }
    },
    {
      id: "p2",
      mandatory: true,
      twist: { en: "Your backups were the attacker's first target.", sv: "..." },
      assumptionChallenged: { en: "Restore from backup is a viable plan.", sv: "..." },
      reveals: ["hf-backups"],
      branches: [   // facilitator-selected consequences of an earlier decision; must converge
        { when: { decision: "d1", option: "C" }, addInjects: ["i2-spread"], narrativeAppend: {...} }
      ]
      // ...narrative, injects, charts, questions, decision
    }
  ],

  resolution: { type: "resolved" | "partial" | "open", text: {...} },
  debrief: {
    keyLessons: [ {...} ],
    assumptionsVsReality: [ { assumption: {...}, reality: {...}, stage: "p3" } ],
    strengthsToLookFor: [ {...} ],
    commonGaps: [ {...} ],
    suggestedActions: [ { text: {...}, ownerRole: "ciso", priority: "high" } ]
  }
});
```

### Content rules
- **Ground truth is fixed.** Branches may add consequences, injects and narrative, but never contradict facts already shown.
- **Inject reliability** is one of `confirmed | unverified | misleading | disputed`. Misleading or disputed injects must be intentional and explained in the facilitator note. On stage, reliability is shown only if the source would realistically state it (e.g. "Unconfirmed report"); the true classification is facilitator-only until debrief.
- **Visibility** is `public | role:<roleId> | facilitator`. Role-specific injects are delivered as printable **role cards** or shown only on the presenter view for the facilitator to hand out verbally — never on the shared stage.
- Each stage: 2–4 questions per audience type, 1–2 challenges, ≥ 1 question that revisits an earlier decision ("Given what you know now, would you still…?").
- **Decisions are open-ended first.** Options are optional aids; the decision log always records free text.
- Every scenario debrief maps to MITRE ATT&CK technique IDs and names, NIST CSF 2.0 functions/categories and ISO/IEC 27001:2022 Annex A controls.
- Regulatory context follows jurisdiction: Sweden → GDPR 72-hour notification to IMY, CERT-SE, Polisen, obligations under the Swedish implementation of NIS2; EU → supervisory authority, national CSIRT, NIS2; generic → regulator, CSIRT, law enforcement.
- Inject types: SOC/SIEM alert, EDR alert, authentication log, network/DNS evidence, log excerpt, backup report, forensic finding, threat intelligence, vulnerability advisory, phishing email, employee report, executive message, chat thread, phone transcript, SMS, customer complaint, supplier notice, media enquiry, news headline, social post, regulator letter, ransom/extortion note, status page, operational impact report.

---

## 7. Slide model

Stages and slides are independent: a stage compiles to one or more slides.

| Type | Content |
|---|---|
| `title` | Scenario title, emblem, seeded artwork, organisation, date, banner "EXERCISE — fictional scenario" |
| `briefing` | Objectives, rules of engagement, duration, how rounds work |
| `context` | Organisation profile, critical services and dependencies diagram, role roster with names and initials avatars |
| `situation` | Stage x/y, in-scenario clock, narrative |
| `timeline` | Injects revealed so far; new injects animate in one per keypress |
| `inject` | One full-screen artefact (email, ransom note, news, alert…) |
| `data` | One or two charts with a caption and "Exercise data" label |
| `twist` | High-contrast "New information" slide with the assumption being challenged |
| `discussion` | Questions and challenges revealed progressively with a large countdown |
| `decision` | Decision question; options if authored; facilitator logs the answer on the presenter view |
| `recap` | What the room decided previously (from the session log) |
| `debrief` | Timeline incl. decisions, assumptions vs. reality, lessons, ATT&CK/NIST/ISO mapping, seed |

Typical stage: `situation → timeline/injects → [data] → twist (stage ≥ 2) → discussion → decision`.
A slim progress rail at the bottom shows stage segments, slide number and the in-scenario clock.

---

## 8. Charts and artefacts

Custom SVG renderers, theme-aware via CSS variables, large labels, draw-in animation (reduced-motion aware), each with an accessible text summary (`<title>`/`<desc>` and a visually hidden caption).

**Charts must be derived from scenario data**, not decoration: the template declares metrics tied to ground truth and inject times (e.g. affected hosts per stage, service availability, Gbps during DDoS, failed sign-ins). The generator scales them by the rolled variables and organisation size; seeded jitter is allowed only for visual realism of an otherwise defined curve. Every chart carries a discreet "Exercise data" label.

Renderers: line/area with inject markers, bar, gauge, donut, KPI tiles, **service-dependency diagram**, **blast-radius network map**, **RTO/RPO vs. estimated recovery chart**, incident **timeline** (also used in debrief with decision markers).

Artefact renderers produce stylised, generic mock-ups (email card, SMS bubbles, chat thread, news front page, social post, terminal/log window, official letterhead, ransom note, status page) with fictional names only.

---

## 9. Operator application

Hash routes: `#/` dashboard · `#/library` · `#/new` · `#/edit/:instanceId` · `#/presenter/:sessionId` · `#/stage/:sessionId` · `#/debrief/:sessionId` · `#/history` · `#/settings`.

1. **Dashboard** — resume active session, recent exercises, quick start, "Surprise me".
2. **Scenario library** — 20 cards (emblem, title, category, archetype, stage range, learning objectives, ATT&CK), search and filters, template preview.
3. **New exercise wizard** — section 4.
4. **Preview & editor** — private full outline of the instance: stages, all injects (with reliability and visibility badges), hidden facts with reveal stage, questions, decisions, facilitator notes, slide thumbnails. Editing in v1: edit any text, toggle optional injects, adjust inject timing within its stage, reorder slides within a stage, edit questions and notes, change stage count within bounds (re-runs generation with the same seed). Edits are re-validated. Actions: Reroll, Save, Duplicate, Print facilitator guide, Print role cards, Start.
5. **History** — past sessions, reopen debrief, export, duplicate, archive, delete (confirm destructive actions).
6. **Settings** — language, UI theme, default stage theme, default duration, clear all local data (double confirm).

---

## 10. Run mode: stage, presenter, pacing

- **Start** opens the stage and requests fullscreen; if denied, show a non-intrusive "Press F11" hint.
- **Presenter view** (recommended, not required) opens in a second window, synced through `BroadcastChannel`: current and next slide, facilitator notes, expected responses, hidden facts and their reveal stage, upcoming injects, timers, decision and observation entry, learning-objective checklist, jump-to-stage list.
- **Confidentiality boundary:** the stage renderer receives a **filtered audience projection** of the session (only released, public content). Facilitator fields are never placed in the stage DOM, not even hidden. Single-screen mode shows notes only in an explicit private overlay (N), which shows a red "PRIVATE — facilitator view" frame so the operator notices if it is projected.
- **Pacing (`pacing.js`):** stage discussion times are derived from total duration minus briefing and debrief allowance, weighted by stage complexity; the presenter shows "on time / behind by n min" and suggests skipping optional injects when behind.
- **Inject release controls:** release, postpone to next stage, skip (optional injects only), re-show.
- **Session recovery:** session state autosaves after every change; reloading the stage or presenter restores the exact slide, timers (paused) and logs.
- **Pause/resume** the whole exercise (freezes timers, shows a calm "Paused" slide).

### Keyboard controls (stage)
| Key | Action |
|---|---|
| → / Space / PageDown | Next step (reveal next item, or next slide) |
| ← / PageUp | Previous step |
| Home / End | First / last slide |
| 1–9, 0 | Jump to stage 1–10 |
| T / Shift+T | Start-pause / reset discussion timer |
| + / − | ±1 minute on timer |
| P | Pause/resume exercise |
| N | Private facilitator overlay (single-screen mode) |
| B or . / W | Black / white screen |
| F | Toggle fullscreen |
| L / D | Toggle language / stage theme live |
| Esc | Leave fullscreen; second Esc asks to exit to presenter (session kept) |
| ? | Shortcut help |

Shortcuts are disabled while a text input or dialog has focus. Presentation clickers (PageUp/PageDown, arrows, `.`/B) must fully operate a run.

---

## 11. Decision log, observations and debrief

**Decision log** (presenter view, per decision point): chosen option (if any), free-text decision, rationale, dissenting views, open questions, decision owner, timestamp. Used by `recap` slides, branches and debrief.

**Observation log**: observation, category (detection, escalation, containment, recovery, continuity, communication, coordination, decision authority, legal/privacy, third party), stage/evidence reference, impact, recommended corrective action, suggested owner, priority, due date, status.

**Learning objectives**: facilitator marks each as addressed / partially / not addressed with a note.

**Debrief view** (and printable after-action report): exercise summary, objectives and status, ground-truth reveal, full timeline with injects and decisions, assumptions vs. reality, observations, unresolved risks, improvement actions, framework mapping, seed and template version.

**Scorecard**: facilitator-entered ratings against the template's evaluation criteria, with comments. Clearly labelled as a facilitator assessment — never presented as a maturity or compliance score.

---

## 12. Import / export

- **JSON** — full instance + session (schema-versioned, includes template id/version and seed).
- **Markdown** — readable summary and after-action report.
- **CSV** — inject log, decision log, observations/action items (UTF-8 with BOM so Excel shows å/ä/ö correctly).
- **Printable HTML / Save as PDF** — after-action report with timeline and charts; facilitator guide; role cards.
- **Import** — validate schema version, types, string lengths, array sizes, IDs and references before accepting; reject with a clear message and never partially overwrite existing data. Imported text is rendered with `textContent` only.
- PowerPoint export is out of scope for v1.

---

## 13. The 20 scenarios

Scenarios must differ in **structure**, not only in threat type. Archetypes:
- **A** obvious incident with hidden secondary attack · **B** ambiguous start, unclear if it is an incident · **C** legitimate activity or operational fault that resembles (or hides) an attack · **D** third-party/external origin · **E** multi-incident / compound crisis · **F** human, legal or reputational crisis-first.

| # | ID | Category | Title (EN) | Arch. | Stages | Backbone and key twists |
|---|---|---|---|---|---|---|
| 1 | s01-ransomware-vpn | Ransomware | Locked Out at Close of Business | A | 4–8 | Friday-evening encryption via unpatched VPN → backups were encrypted 48h earlier → exfiltration revealed (double extortion) → leak-site countdown → CEO demands Monday restore while identity is not proven clean → recovery order and residual risk ownership. |
| 2 | s02-bec-invoice | Fraud / Phishing | The Invoice That Changed Bank Accounts | F | 3–6 | Supplier reports unpaid invoice → payment went to attacker account → CFO mailbox had hidden forwarding rules for months → customers received fraudulent invoices from your domain → bank recall window closing. |
| 3 | s03-ddos-smokescreen | DDoS / Availability | Black Friday Under Fire | A | 4–7 | Volumetric DDoS at peak sales → mitigation partly works → extortion demand → DDoS was cover for credential stuffing; customer accounts taken over → payment provider threatens suspension. |
| 4 | s04-insider-departing-admin | Insider threat | The Last Week of Employment | B | 4–8 | DLP alert on uploads by a departing admin, partly consistent with normal work → HR requests confidentiality, privacy limits on monitoring → account used while employee was on leave → coerced insider angle → backdoor service accounts. |
| 5 | s05-supply-chain-update | Supply chain | Trusted Update, Untrusted Code | D | 4–9 | Vendor update followed by EDR alerts → vendor denies (misleading) → national CSIRT advisory confirms → your environment used to pivot into a customer → suspend trusted software vs. business dependency. |
| 6 | s06-cloud-storage-leak | Cloud / Privacy | The Journalist's Question | F | 3–6 | Journalist asks for comment on leaked data → storage container public for 14 months, logs incomplete → more categories of personal data than believed → 72-hour clock has been running since first awareness → copycat downloads. |
| 7 | s07-mfa-fatigue-aitm | Phishing / Identity | Approve, Approve, Approve | A | 4–8 | Repeated MFA prompts → one user approved; AiTM token theft → mailbox and file access → internal phishing from trusted account → OAuth consent grants persist after password reset. |
| 8 | s08-wiper-disguised | Malware | Ransom Note Without a Way Back | A | 4–8 | Apparent ransomware → no working payment channel → it is a wiper, decryption impossible → geopolitical attribution pressure and authority contact → rebuild-from-scratch strategy. |
| 9 | s09-datacenter-outage | Availability / DR | When the Lights Stay On but Nothing Works | C | 3–7 | Cooling failure in primary data centre → failover fails (replication lag, undocumented dependency, expired licence) → RPO breached → evidence of tampering with building management system → sabotage or negligence? |
| 10 | s10-msp-compromise | Third party | The Keys Were With Someone Else | D | 4–8 | MSP's RMM tool deploys unknown script → MSP unreachable → MSP admin accounts used across customers → contract lacks incident clauses → cut the MSP off and establish independent access. |
| 11 | s11-ot-manufacturing | OT / ICS | The Line Stops at 03:00 | B | 4–9 | Controllers intermittently unreachable → IT suspects malware, operations warns disconnection threatens safe production → IT/OT boundary breach via engineering workstation → safety system impact → restart under uncertainty. |
| 12 | s12-benign-or-breach | EDR / SOC | Maintenance or Movement? | C | 3–7 | EDR flags lateral-movement behaviour on a critical server → application team confirms planned maintenance (true) → independent telemetry shows a second, unrelated actor hiding inside the maintenance window → alert fatigue and isolation decision on a business-critical system. |
| 13 | s13-deepfake-executive | Social engineering | The CEO Who Wasn't There | F | 3–6 | Urgent video call from "CEO" requests confidential transfer → partly executed → voice clone used on helpdesk for MFA reset → fabricated audio of CEO published → verification culture and comms. |
| 14 | s14-cicd-pipeline | DevSecOps | Secrets in the Pipeline | A | 4–8 | Cloud bill spike from crypto-mining → access keys leaked in a public repository → build pipeline modified; signed artefacts shipped to customers → which releases are trustworthy → restore trusted build capability. |
| 15 | s15-hacktivist-doxxing | Hacktivism | Defaced and Exposed | F | 3–7 | Website defacement tied to a public decision → DDoS on public services → employee personal data published, threats to staff → duty of care, police contact → second wave announced. |
| 16 | s16-three-fires | Multi-incident | Three Fires at Once | E | 4–8 | Phishing campaign, critical service outage and suspicious privileged access within one hour → too few responders, conflicting assessments → two are connected, one is coincidental → incident command and prioritisation. |
| 17 | s17-healthcare-ransomware | Healthcare | Patients Still Arriving | A | 5–10 | Clinical systems unavailable, paper downtime procedures → ambulance redirection decision → medical-device network affected → patient safety vs. forensic preservation → regional/national coordination. |
| 18 | s18-dns-hijack | Network / Identity | Your Domain, Their Server | B | 3–6 | Certificate warnings and resolution failures → looks like provider misconfiguration → registrar account takeover, records changed → MX redirected, reset emails intercepted → weekend, slow registrar support. |
| 19 | s19-zero-day-edge | Vulnerability | Patch Race at the Perimeter | B | 4–8 | Critical zero-day in internet-facing appliance under mass exploitation → vendor mitigation only → indicators predate advisory → mitigation bypassed → take the appliance offline and accept impact. |
| 20 | s20-perfect-storm | Executive / Compound | The Perfect Storm | E | 6–10 | Isolated outage → suspected identity compromise (global admin, federation trust added) → key supplier also down → break-glass accounts fail → journalist and regulator enquiries → uncertain data exposure; maintain a common operating picture and decision authority. |

Coverage must include DDoS, malware, intrusion, phishing, insider threat, availability, supply chain, cloud/identity, fraud, OT and multi-incident. Each scenario must test a different combination of detection, containment, recovery, governance, communication, third-party management and business continuity.

---

## 14. Internationalisation

- `i18n.js`: `t(key)` with English fallback; dev-mode warning listing missing keys.
- Every UI label, tooltip, dialog, error, report heading and all scenario content in both languages; no hard-coded strings in components.
- `Intl` formatting for numbers, currency, dates; 24-hour clock in both.
- Language can change anywhere, including live on stage, without changing facts or position. Exports use the session language; å/ä/ö preserved in all formats.

---

## 15. Robustness and accessibility

Error handling is intentionally limited to these cases, each with a clear, translated message and no silent data loss:
`localStorage` unavailable or quota exceeded · corrupted saved state (offer export of raw data, then reset) · invalid or incompatible import · fullscreen denied · validation failures before start.

Accessibility (WCAG 2.2 AA in the operator UI): semantic HTML, keyboard operation, visible focus, ARIA labels on icon buttons, accessible dialogs (focus trap, Esc), text alternatives for charts and diagrams, never colour alone for severity/reliability/status (icon + label), reduced-motion support, touch-friendly controls.

---

## 16. Testing

Provide `tests.html`, a dependency-free in-browser test runner that reports pass/fail. Report actual results; never claim tests passed without running them. Cover at minimum:
- All 20 templates load and pass validation in both languages.
- Same seed + params ⇒ identical instance (deep compare); different seeds change entities, numbers and at least one variant.
- Entity consistency: each role maps to exactly one person throughout.
- Timeline monotonic; dependencies respected; no hidden fact or future inject in the audience projection of any slide, for every scenario (iterate all slides and assert).
- No facilitator field text appears in the stage DOM after full playthrough.
- Navigation boundaries, timers pause/resume, session recovery after reload restores slide and logs.
- JSON export → import round-trip equality; malformed and hostile JSON (e.g. `<img onerror>` strings) rejected or rendered inert.
- CSV/Markdown exports contain expected records.
- `grep`-style self-check in the runner: no `eval(`, `new Function`, or `innerHTML =` outside `icons.js`.

Manually verify the presentation flow in Chrome, Edge and Firefox at projector resolutions.

---

## 17. Phased build plan (stop and summarise after each phase)

1. **Foundation** — structure, namespace, tokens/themes, i18n, safe DOM helpers, store, RNG, router, dashboard/library/wizard skeleton.
2. **Engine** — entity graph, pools, environments, template resolver, generator, validator, pacing, slide compiler. Author **scenario 1 completely** (both languages) as the reference implementation; run validation.
3. **Stage + presenter** — scaled 16:9 stage, all slide types, audience projection, presenter window sync, keyboard/clicker control, timers, inject release, session autosave and recovery.
4. **Graphics** — icon sprite, emblems, title artwork, charts, dependency/blast-radius diagrams, artefact renderers.
5. **Facilitation & debrief** — decision log, observations, objectives, branches, recap, debrief view, scorecard, exports/import, print styles (guide, role cards, report), editor.
6. **Content** — scenarios 2–10, then 11–20, one file each; run the validator and tests after each batch.
7. **Hardening** — tests.html complete, accessibility pass, confidentiality checks, README (setup, operator guide, shortcuts, architecture, data model, authoring guide for new scenarios, limitations).

### Definition of done
1. Runs from `file://` and a static server, no backend, no network requests.
2. Operator can configure, generate, preview, edit and start an exercise; all controls take effect.
3. All 20 templates are complete, bilingual and pass validation.
4. Randomized content is internally consistent and reproducible by seed.
5. Progressive disclosure holds; facilitator-only content never reaches the stage DOM.
6. Fullscreen presentation works with keyboard and presentation clicker; session survives reload.
7. Decisions, observations and objectives are recorded and drive recap and debrief.
8. JSON/Markdown/CSV/print exports work; import is validated and safe.
9. Light/dark themes and EN/SV work throughout, including live switching on stage.
10. tests.html passes, with results reported honestly.
